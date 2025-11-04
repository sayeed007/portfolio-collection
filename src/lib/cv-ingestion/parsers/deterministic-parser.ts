/**
 * Deterministic CV Parser
 *
 * Uses pattern matching and heuristics to extract structured data
 * from CV text without relying on LLMs
 */

import {
  ExtractedText,
  ParsedCV,
  ParsedPersonalInfo,
  ParsedEducation,
  ParsedCertification,
  ParsedCourse,
  ParsedSkills,
  ParsedSkillCategory,
  ParsedSkill,
  ParsedWorkExperience,
  ParsedProject,
} from '../types';

import {
  extractEmails,
  extractPhoneNumbers,
  extractURLs,
  extractLinkedInProfile,
  extractGitHubProfile,
  extractDates,
} from '../extractors';

// Helper type for skill parsing
type CategoryBuffer = {
  categoryName: string;
  skills: ParsedSkill[];
};

export class DeterministicParser {
  private extractedText: ExtractedText;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(extractedText: ExtractedText) {
    this.extractedText = extractedText;
  }

  /**
   * Main parsing method
   */
  async parse(): Promise<ParsedCV> {
    const startTime = Date.now();

    try {
      const personalInfo = this.parsePersonalInfo();
      const education = this.parseEducation();
      const certifications = this.parseCertifications();
      const courses = this.parseCourses();
      const skills = this.parseSkills();
      const workExperience = this.parseWorkExperience();
      const projects = this.parseProjects();

      const parsedCV: ParsedCV = {
        personalInfo,
        education,
        certifications,
        courses,
        skills,
        workExperience,
        projects,
        metadata: {
          fileName: '',
          fileType: 'pdf',
          fileSize: 0,
          uploadedAt: new Date(),
          parsingMethod: 'deterministic',
          parsingDuration: Date.now() - startTime,
          totalConfidence: this.calculateAverageConfidence([
            ...education,
            ...certifications,
            ...courses,
            ...workExperience,
            ...projects,
          ]),
          warnings: this.warnings,
          errors: this.errors,
        },
      };

      return parsedCV;
    } catch (error) {
      this.errors.push(`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Parse personal information
   */
  private parsePersonalInfo(): ParsedPersonalInfo {
    const { fullText, sections } = this.extractedText;

    // Extract contact details
    const emails = extractEmails(fullText);
    const phones = extractPhoneNumbers(fullText);
    const linkedIn = extractLinkedInProfile(fullText);
    const github = extractGitHubProfile(fullText);

    // Extract name (usually first non-empty line or after "Name:")
    const name = this.extractName(fullText);

    // Extract summary
    const summarySection = sections.find(s =>
      s.heading.toLowerCase().includes('summary') ||
      s.heading.toLowerCase().includes('objective') ||
      s.heading.toLowerCase().includes('profile')
    );

    const summary = summarySection?.content.trim() || '';

    // Extract location/nationality
    const location = this.extractLocation(fullText);
    const nationality = this.extractNationality(fullText);

    return {
      fullName: name,
      email: emails[0] || '',
      phone: phones[0] || '',
      location,
      nationality,
      summary,
      linkedIn: linkedIn || undefined,
      github: github || undefined,
      website: this.extractWebsite(fullText),
    };
  }

  /**
   * Parse education section
   */
  private parseEducation(): ParsedEducation[] {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('education') ||
      s.heading.toLowerCase().includes('academic')
    );

    if (!section) {
      this.warnings.push('No education section found');
      return [];
    }

    const educationEntries: ParsedEducation[] = [];
    const lines = section.content.split('\n').filter(line => line.trim());

    // Pattern: Degree, Institution, Year
    const degreePatterns = [
      /\b(Bachelor|Master|PhD|Doctorate|Associate|BSc|MSc|MBA|BA|MA|B\.?Tech|M\.?Tech|B\.?E|M\.?E)\b/i,
    ];

    let currentEntry: Partial<ParsedEducation> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for degree
      const degreeMatch = degreePatterns.some(pattern => pattern.test(line));
      if (degreeMatch) {
        // Save previous entry
        if (currentEntry.degree && currentEntry.institution) {
          educationEntries.push(this.finalizeEducationEntry(currentEntry));
        }

        // Start new entry
        currentEntry = {
          degree: line,
          confidence: 0.7,
        };
      }
      // Check for institution (usually has "University", "College", "Institute")
      else if (/\b(University|College|Institute|School|Academy)\b/i.test(line)) {
        currentEntry.institution = line;
      }
      // Check for year
      else if (/\b(19|20)\d{2}\b/.test(line)) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          currentEntry.graduationYear = parseInt(yearMatch[0], 10);
        }
      }
      // Check for GPA/Grade
      else if (/GPA|Grade|CGPA/i.test(line)) {
        currentEntry.grade = line;
      }
    }

    // Add last entry
    if (currentEntry.degree && currentEntry.institution) {
      educationEntries.push(this.finalizeEducationEntry(currentEntry));
    }

    return educationEntries;
  }

  /**
   * Parse certifications
   */
  private parseCertifications(): ParsedCertification[] {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('certification') ||
      s.heading.toLowerCase().includes('license')
    );

    if (!section) {
      return [];
    }

    const certifications: ParsedCertification[] = [];
    const lines = section.content.split('\n').filter(line => line.trim());

    let currentCert: Partial<ParsedCertification> = {};

    lines.forEach(line => {
      const trimmed = line.trim();

      // If line has a year, it might be a certification name with date
      if (/\b(19|20)\d{2}\b/.test(trimmed)) {
        if (currentCert.name) {
          certifications.push({
            name: currentCert.name,
            issuer: currentCert.issuer || 'Unknown',
            issueDate: currentCert.issueDate,
            confidence: 0.6,
          });
        }

        const parts = trimmed.split(/[-–—,]/);
        currentCert = {
          name: parts[0].trim(),
          issueDate: this.extractDateFromString(trimmed),
        };
      }
      // Check for issuer (contains "by", "from", or organization name)
      else if (/(by|from|issued by)/i.test(trimmed)) {
        currentCert.issuer = trimmed.replace(/(by|from|issued by)/gi, '').trim();
      }
      // Otherwise, it might be part of the name
      else if (!currentCert.name) {
        currentCert.name = trimmed;
      }
    });

    // Add last cert
    if (currentCert.name) {
      certifications.push({
        name: currentCert.name,
        issuer: currentCert.issuer || 'Unknown',
        issueDate: currentCert.issueDate,
        confidence: 0.6,
      });
    }

    return certifications;
  }

  /**
   * Parse courses
   */
  private parseCourses(): ParsedCourse[] {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('course') ||
      s.heading.toLowerCase().includes('training')
    );

    if (!section) {
      return [];
    }

    const courses: ParsedCourse[] = [];
    const lines = section.content.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length < 5) return;

      const parts = trimmed.split(/[-–—,]/);
      courses.push({
        name: parts[0].trim(),
        provider: parts[1]?.trim() || 'Unknown',
        completionDate: this.extractDateFromString(trimmed),
        confidence: 0.5,
      });
    });

    return courses;
  }

  /**
   * Parse skills section
   */
  private parseSkills(): ParsedSkills {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('skill') ||
      s.heading.toLowerCase().includes('technical') ||
      s.heading.toLowerCase().includes('expertise')
    );

    if (!section) {
      this.warnings.push('No skills section found');
      return { categories: [], raw: [] };
    }

    const categories: ParsedSkillCategory[] = [];
    const rawSkills: string[] = [];

    // Try to detect categorized skills vs. flat list
    const lines = section.content.split('\n').filter(line => line.trim());

    let currentCategory: CategoryBuffer | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      // Check if line is a category (ends with colon, or is in title case)
      if (trimmed.endsWith(':') || this.isCategoryHeading(trimmed)) {
        // Save previous category
        if (currentCategory) {
          categories.push({
            categoryName: currentCategory.categoryName,
            skills: currentCategory.skills,
            confidence: 0.7,
          });
        }

        // Start new category
        const newCategory: CategoryBuffer = {
          categoryName: trimmed.replace(':', '').trim(),
          skills: [],
        };
        currentCategory = newCategory;
      }
      // Otherwise, parse as skills
      else {
        const skills = this.parseSkillsFromLine(trimmed);

        if (currentCategory) {
          currentCategory.skills.push(...skills);
        } else {
          // No category, add to raw
          rawSkills.push(...skills.map(s => s.name));
        }
      }
    });

    // Add last category
    if (currentCategory) {
      categories.push({
        categoryName: (currentCategory as CategoryBuffer).categoryName,
        skills: (currentCategory as CategoryBuffer).skills,
        confidence: 0.7,
      });
    }

    return { categories, raw: rawSkills };
  }

  /**
   * Parse work experience
   */
  private parseWorkExperience(): ParsedWorkExperience[] {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('experience') ||
      s.heading.toLowerCase().includes('employment') ||
      s.heading.toLowerCase().includes('work history')
    );

    if (!section) {
      this.warnings.push('No work experience section found');
      return [];
    }

    const experiences: ParsedWorkExperience[] = [];
    const lines = section.content.split('\n').filter(line => line.trim());

    let currentExp: Partial<ParsedWorkExperience> = {};
    let responsibilities: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Check for position title (usually first line or capitalized)
      if (
        this.isJobTitle(trimmed) &&
        !currentExp.position
      ) {
        // Save previous experience
        if (currentExp.company && currentExp.position) {
          experiences.push(this.finalizeWorkExperience(currentExp, responsibilities));
        }

        currentExp = {
          position: trimmed,
          responsibilities: [],
          technologies: [],
        };
        responsibilities = [];
      }
      // Check for company name (has "Inc", "Ltd", "Corp", "LLC", or @ symbol)
      else if (
        /\b(Inc|Ltd|Corp|LLC|Technologies|Solutions|Systems|Consulting|@)\b/i.test(trimmed) ||
        trimmed.startsWith('@')
      ) {
        currentExp.company = trimmed.replace('@', '').trim();
      }
      // Check for date range
      else if (this.isDateRange(trimmed)) {
        const { startDate, endDate, isCurrent } = this.parseDateRange(trimmed);
        currentExp.startDate = startDate;
        currentExp.endDate = endDate;
        currentExp.isCurrentRole = isCurrent;
      }
      // Check for bullet points (responsibilities)
      else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        responsibilities.push(trimmed.replace(/^[•\-*]\s*/, ''));
      }
      // Check for technologies (in parentheses or after "Technologies:")
      else if (/Technologies?:/i.test(trimmed) || /\(([^)]+)\)/.test(trimmed)) {
        const tech = this.extractTechnologies(trimmed);
        currentExp.technologies = tech;
      }
    });

    // Add last experience
    if (currentExp.company && currentExp.position) {
      experiences.push(this.finalizeWorkExperience(currentExp, responsibilities));
    }

    return experiences;
  }

  /**
   * Parse projects
   */
  private parseProjects(): ParsedProject[] {
    const section = this.extractedText.sections.find(s =>
      s.heading.toLowerCase().includes('project') ||
      s.heading.toLowerCase().includes('portfolio')
    );

    if (!section) {
      return [];
    }

    const projects: ParsedProject[] = [];
    const lines = section.content.split('\n').filter(line => line.trim());

    let currentProject: Partial<ParsedProject> = {};
    let description: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      // Project name (usually first line or in bold/caps)
      if (this.isProjectTitle(trimmed) && !currentProject.name) {
        // Save previous project
        if (currentProject.name) {
          projects.push(this.finalizeProject(currentProject, description));
        }

        currentProject = {
          name: trimmed,
          technologies: [],
        };
        description = [];
      }
      // Date range
      else if (this.isDateRange(trimmed)) {
        const { startDate, endDate, isCurrent } = this.parseDateRange(trimmed);
        currentProject.startDate = startDate;
        currentProject.endDate = endDate;
        currentProject.isOngoing = isCurrent;
      }
      // Technologies
      else if (/Technologies?:|Tech Stack:|Built with:/i.test(trimmed)) {
        currentProject.technologies = this.extractTechnologies(trimmed);
      }
      // URL
      else if (/https?:\/\//.test(trimmed)) {
        const urls = extractURLs(trimmed);
        if (urls.length > 0) {
          if (urls[0].includes('github')) {
            currentProject.repository = urls[0];
          } else {
            currentProject.url = urls[0];
          }
        }
      }
      // Description (everything else)
      else if (trimmed.length > 10) {
        description.push(trimmed);
      }
    });

    // Add last project
    if (currentProject.name) {
      projects.push(this.finalizeProject(currentProject, description));
    }

    return projects;
  }

  // ===== HELPER METHODS =====

  private extractName(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    // Name is usually the first line, unless it's a heading
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (
        trimmed.length > 2 &&
        trimmed.length < 50 &&
        !/\b(Resume|CV|Curriculum Vitae|Contact|Email|Phone)\b/i.test(trimmed)
      ) {
        return trimmed;
      }
    }
    return 'Unknown';
  }

  private extractLocation(text: string): string | undefined {
    const locationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)\b/;
    const match = text.match(locationPattern);
    return match ? match[0] : undefined;
  }

  private extractNationality(text: string): string | undefined {
    const nationalityPattern = /Nationality:\s*([A-Za-z\s]+)/i;
    const match = text.match(nationalityPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const urls = extractURLs(text);
    return urls.find(url =>
      !url.includes('linkedin') &&
      !url.includes('github') &&
      !url.includes('twitter')
    );
  }

  private isCategoryHeading(line: string): boolean {
    // Category headings are usually short and title-cased
    return (
      line.length < 40 &&
      /^[A-Z]/.test(line) &&
      !line.includes(',') &&
      !line.includes('.')
    );
  }

  private parseSkillsFromLine(line: string): { name: string; confidence: number }[] {
    // Skills are usually comma-separated or bullet-separated
    const separators = /[,;|•]/;
    const parts = line.split(separators).map(s => s.trim()).filter(s => s.length > 0);

    return parts.map(name => ({
      name,
      confidence: 0.6,
    }));
  }

  private isJobTitle(line: string): boolean {
    const titleKeywords = [
      'Engineer', 'Developer', 'Manager', 'Director', 'Analyst',
      'Consultant', 'Designer', 'Architect', 'Lead', 'Senior',
      'Junior', 'Intern', 'Specialist', 'Coordinator', 'Administrator',
    ];

    return titleKeywords.some(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(line)
    );
  }

  private isDateRange(line: string): boolean {
    return (
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line) &&
      (/\b(19|20)\d{2}\b/.test(line) || /Present|Current/i.test(line))
    );
  }

  private parseDateRange(line: string): {
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  } {
    const isCurrent = /Present|Current|Ongoing/i.test(line);

    const dates = extractDates(line);

    return {
      startDate: dates[0] || '',
      endDate: isCurrent ? undefined : dates[1],
      isCurrent,
    };
  }

  private extractTechnologies(line: string): string[] {
    // Remove "Technologies:" prefix
    let techString = line.replace(/Technologies?:|Tech Stack:|Built with:/i, '').trim();

    // Extract from parentheses if exists
    const parenMatch = techString.match(/\(([^)]+)\)/);
    if (parenMatch) {
      techString = parenMatch[1];
    }

    // Split by common separators
    return techString
      .split(/[,;|•]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  private isProjectTitle(line: string): boolean {
    return (
      line.length > 3 &&
      line.length < 100 &&
      !line.startsWith('-') &&
      !line.startsWith('•') &&
      /^[A-Z]/.test(line)
    );
  }

  private extractDateFromString(text: string): string | undefined {
    const dates = extractDates(text);
    return dates.length > 0 ? dates[0] : undefined;
  }

  private finalizeEducationEntry(entry: Partial<ParsedEducation>): ParsedEducation {
    return {
      degree: entry.degree || 'Unknown',
      institution: entry.institution || 'Unknown',
      graduationYear: entry.graduationYear || new Date().getFullYear(),
      grade: entry.grade,
      confidence: entry.confidence || 0.7,
    };
  }

  private finalizeWorkExperience(
    exp: Partial<ParsedWorkExperience>,
    responsibilities: string[]
  ): ParsedWorkExperience {
    return {
      company: exp.company || 'Unknown',
      position: exp.position || 'Unknown',
      startDate: exp.startDate || '',
      endDate: exp.endDate,
      isCurrentRole: exp.isCurrentRole || false,
      responsibilities,
      technologies: exp.technologies || [],
      confidence: 0.7,
    };
  }

  private finalizeProject(
    project: Partial<ParsedProject>,
    description: string[]
  ): ParsedProject {
    return {
      name: project.name || 'Unnamed Project',
      description: description.join(' '),
      contribution: description.length > 0 ? description[0] : '',
      technologies: project.technologies || [],
      startDate: project.startDate,
      endDate: project.endDate,
      isOngoing: project.isOngoing,
      url: project.url,
      repository: project.repository,
      confidence: 0.6,
    };
  }

  private calculateAverageConfidence(items: Array<{ confidence: number }>): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.confidence, 0);
    return sum / items.length;
  }
}
