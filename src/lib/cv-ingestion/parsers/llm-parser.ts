/**
 * LLM-based CV Parser
 *
 * Uses OpenAI GPT to parse CV text into structured data
 * Falls back to deterministic parser if API fails
 */

import { ExtractedText, ParsedCV, ParserConfig } from '../types';

interface LLMResponse {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location?: string;
    nationality?: string;
    summary?: string;
    linkedIn?: string;
    github?: string;
    website?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number | string;
    grade?: string;
    fieldOfStudy?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  courses: Array<{
    name: string;
    provider: string;
    completionDate?: string;
    duration?: string;
  }>;
  skills: {
    categories: Array<{
      categoryName: string;
      skills: Array<{
        name: string;
        proficiency?: string;
        yearsOfExperience?: number;
      }>;
    }>;
    raw?: string[];
  };
  workExperience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrentRole: boolean;
    responsibilities: string[];
    achievements?: string[];
    technologies: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    role?: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    repository?: string;
  }>;
}

export class LLMParser {
  private extractedText: ExtractedText;
  private config: ParserConfig;

  constructor(extractedText: ExtractedText, config: ParserConfig) {
    this.extractedText = extractedText;
    this.config = config;
  }

  /**
   * Parse CV using LLM
   */
  async parse(): Promise<ParsedCV> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt();
      const response = await this.callLLM(prompt);
      const parsedData = this.transformLLMResponse(response);

      return {
        ...parsedData,
        metadata: {
          fileName: '',
          fileType: 'pdf',
          fileSize: 0,
          uploadedAt: new Date(),
          parsingMethod: 'llm',
          parsingDuration: Date.now() - startTime,
          totalConfidence: 0.85, // LLM generally has higher confidence
          warnings: [],
          errors: [],
        },
      };
    } catch (error) {
      console.error('LLM parsing error:', error);
      throw new Error(
        `LLM parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build the prompt for LLM
   */
  private buildPrompt(): string {
    return `You are an expert CV/Resume parser. Extract structured information from the following CV text and return it in JSON format.

CV Text:
${this.extractedText.fullText}

Please extract the following information in valid JSON format:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string (optional)",
    "nationality": "string (optional)",
    "summary": "string (optional, professional summary/objective)",
    "linkedIn": "string (optional, URL)",
    "github": "string (optional, URL)",
    "website": "string (optional, URL)"
  },
  "education": [
    {
      "degree": "string (e.g., Bachelor of Science, MSc, etc.)",
      "institution": "string",
      "graduationYear": "number or string",
      "grade": "string (optional)",
      "fieldOfStudy": "string (optional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string (optional, ISO format)",
      "expiryDate": "string (optional, ISO format)",
      "credentialId": "string (optional)"
    }
  ],
  "courses": [
    {
      "name": "string",
      "provider": "string",
      "completionDate": "string (optional, ISO format)",
      "duration": "string (optional)"
    }
  ],
  "skills": {
    "categories": [
      {
        "categoryName": "string (e.g., Frontend, Backend, etc.)",
        "skills": [
          {
            "name": "string",
            "proficiency": "Beginner | Intermediate | Advanced | Expert (optional)",
            "yearsOfExperience": "number (optional)"
          }
        ]
      }
    ],
    "raw": ["string array of uncategorized skills (optional)"]
  },
  "workExperience": [
    {
      "company": "string",
      "position": "string",
      "location": "string (optional)",
      "startDate": "string (ISO format or 'MMM YYYY')",
      "endDate": "string (optional, ISO format or 'MMM YYYY')",
      "isCurrentRole": "boolean",
      "responsibilities": ["string array"],
      "achievements": ["string array (optional)"],
      "technologies": ["string array"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "role": "string (optional)",
      "technologies": ["string array"],
      "startDate": "string (optional, ISO format)",
      "endDate": "string (optional, ISO format)",
      "url": "string (optional)",
      "repository": "string (optional, GitHub URL)"
    }
  ]
}

Important instructions:
1. Return ONLY valid JSON, no markdown or code blocks
2. Extract all available information accurately
3. If information is missing, omit the optional fields
4. For dates, prefer ISO format (YYYY-MM-DD) or at least 'MMM YYYY'
5. Categorize skills logically (Frontend, Backend, DevOps, Databases, etc.)
6. Split work responsibilities into clear bullet points
7. Extract technologies mentioned in experience and projects
8. Ensure all required fields are present
9. If unclear, make reasonable inferences based on context`;
  }

  /**
   * Call the LLM API
   */
  private async callLLM(prompt: string): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key is required for LLM parsing');
    }

    const provider = this.config.llmProvider || 'openai';

    if (provider === 'openai') {
      return this.callOpenAI(prompt);
    } else if (provider === 'anthropic') {
      return this.callAnthropic(prompt);
    } else if (provider === 'gemini') {
      return this.callGemini(prompt);
    }

    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model for parsing
        messages: [
          {
            role: 'system',
            content:
              'You are an expert CV parser. Extract structured data from CVs and return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent results
        response_format: { type: 'json_object' }, // Force JSON output
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(prompt: string): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and cost-effective
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    try {
      // Claude might wrap JSON in markdown, extract it
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(prompt: string): Promise<LLMResponse> {
    // Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert CV parser. Extract structured data from CVs and return valid JSON only.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json', // Force JSON output
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown error';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

    // Extract text from Gemini's response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    try {
      // Gemini might wrap JSON in markdown, extract it
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content, parseError);
      throw new Error('Failed to parse Gemini response as JSON');
    }
  }

  /**
   * Transform LLM response to ParsedCV format
   */
  private transformLLMResponse(response: LLMResponse): Omit<ParsedCV, 'metadata'> {
    return {
      personalInfo: {
        fullName: response.personalInfo.fullName || '',
        email: response.personalInfo.email || '',
        phone: response.personalInfo.phone || '',
        location: response.personalInfo.location,
        nationality: response.personalInfo.nationality,
        summary: response.personalInfo.summary,
        linkedIn: response.personalInfo.linkedIn,
        github: response.personalInfo.github,
        website: response.personalInfo.website,
      },
      education: (response.education || []).map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        graduationYear: edu.graduationYear,
        grade: edu.grade,
        fieldOfStudy: edu.fieldOfStudy,
        confidence: 0.85,
      })),
      certifications: (response.certifications || []).map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        credentialId: cert.credentialId,
        confidence: 0.8,
      })),
      courses: (response.courses || []).map(course => ({
        name: course.name,
        provider: course.provider,
        completionDate: course.completionDate,
        duration: course.duration,
        confidence: 0.8,
      })),
      skills: {
        categories: (response.skills?.categories || []).map(cat => ({
          categoryName: cat.categoryName,
          skills: cat.skills.map(skill => ({
            name: skill.name,
            proficiency: skill.proficiency as any,
            yearsOfExperience: skill.yearsOfExperience,
            confidence: 0.85,
          })),
          confidence: 0.85,
        })),
        raw: response.skills?.raw || [],
      },
      workExperience: (response.workExperience || []).map(exp => ({
        company: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrentRole: exp.isCurrentRole || false,
        responsibilities: exp.responsibilities || [],
        achievements: exp.achievements,
        technologies: exp.technologies || [],
        confidence: 0.85,
      })),
      projects: (response.projects || []).map(proj => ({
        name: proj.name,
        description: proj.description,
        role: proj.role,
        contribution: proj.description, // Use description as contribution
        technologies: proj.technologies || [],
        startDate: proj.startDate,
        endDate: proj.endDate,
        url: proj.url,
        repository: proj.repository,
        confidence: 0.8,
      })),
    };
  }
}

/**
 * Hybrid parser - tries deterministic first, falls back to LLM if confidence is low
 */
export async function parseWithHybridApproach(
  extractedText: ExtractedText,
  config: ParserConfig
): Promise<ParsedCV> {
  // Import deterministic parser dynamically to avoid circular dependency
  const { DeterministicParser } = await import('./deterministic-parser');

  // Try deterministic parsing first
  const deterministicParser = new DeterministicParser(extractedText);
  const deterministicResult = await deterministicParser.parse();

  // Check if confidence is acceptable
  if (
    !config.useLLM ||
    deterministicResult.metadata.totalConfidence >= config.confidenceThreshold
  ) {
    return deterministicResult;
  }

  // If low confidence and LLM is enabled, use LLM
  if (config.useLLM && config.apiKey) {
    try {
      const llmParser = new LLMParser(extractedText, config);
      const llmResult = await llmParser.parse();

      // Merge results - prefer LLM where it has data, keep deterministic as fallback
      return mergeParsedCVs(llmResult, deterministicResult);
    } catch (error) {
      console.warn('LLM parsing failed, using deterministic result:', error);

      if (config.fallbackToDeterministic) {
        return deterministicResult;
      }

      throw error;
    }
  }

  return deterministicResult;
}

/**
 * Merge two ParsedCV objects, preferring primary where it has data
 */
function mergeParsedCVs(primary: ParsedCV, fallback: ParsedCV): ParsedCV {
  return {
    personalInfo: {
      ...fallback.personalInfo,
      ...primary.personalInfo,
      // Prefer non-empty values from primary
      email: primary.personalInfo.email || fallback.personalInfo.email,
      phone: primary.personalInfo.phone || fallback.personalInfo.phone,
    },
    education: primary.education.length > 0 ? primary.education : fallback.education,
    certifications:
      primary.certifications.length > 0 ? primary.certifications : fallback.certifications,
    courses: primary.courses.length > 0 ? primary.courses : fallback.courses,
    skills:
      primary.skills.categories.length > 0 || primary.skills.raw.length > 0
        ? primary.skills
        : fallback.skills,
    workExperience:
      primary.workExperience.length > 0 ? primary.workExperience : fallback.workExperience,
    projects: primary.projects.length > 0 ? primary.projects : fallback.projects,
    metadata: {
      ...primary.metadata,
      parsingMethod: 'hybrid',
      warnings: [...primary.metadata.warnings, ...fallback.metadata.warnings],
    },
  };
}
