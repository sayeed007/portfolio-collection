/**
 * CV Ingestion Service
 *
 * Main orchestrator for CV parsing and normalization
 */

import { extractTextFromFile } from '../extractors';
import { NormalizationResult, normalizeParsedCV } from '../normalizers';
import { DeterministicParser } from '../parsers/deterministic-parser';
import { parseWithHybridApproach } from '../parsers/llm-parser';
import {
  CVValidationResult,
  ParsedCV,
  ParserConfig,
} from '../types';
import { DatabaseEntityResolver } from './entity-resolver';

export interface CVIngestionOptions {
  file: File;
  config?: Partial<ParserConfig>;
  entityResolver?: DatabaseEntityResolver;
}

export interface CVIngestionResult {
  success: boolean;
  parsedCV?: ParsedCV;
  normalizationResult?: NormalizationResult;
  validation?: CVValidationResult;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

/**
 * Main CV ingestion function
 */
export async function ingestCV(
  options: CVIngestionOptions
): Promise<CVIngestionResult> {
  const { file, config, entityResolver } = options;

  try {
    const parserConfig: ParserConfig = {
      useLLM: false,
      fallbackToDeterministic: true,
      enableOCR: false,
      confidenceThreshold: 0.7,
      debugMode: false,
      ...config,
    };

    // If it's a PDF with LLM enabled and we're on the client, use API for complete parsing
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isClient = typeof window !== 'undefined';

    if (isPDF && isClient && parserConfig.useLLM && parserConfig.apiKey) {
      console.log('🚀 Using API for PDF + LLM parsing');
      return await ingestCVViaAPI(file, parserConfig, entityResolver);
    }

    // Step 1: Extract text from file
    const extractedText = await extractTextFromFile(file);

    // Step 2: Parse CV
    let parsedCV: ParsedCV;

    if (parserConfig.useLLM && parserConfig.apiKey) {
      // Use hybrid approach (deterministic + LLM)
      parsedCV = await parseWithHybridApproach(extractedText, parserConfig);
    } else {
      // Use deterministic parser only
      const parser = new DeterministicParser(extractedText);
      parsedCV = await parser.parse();
    }

    // Update metadata with file info
    parsedCV.metadata.fileName = file.name;
    parsedCV.metadata.fileType = getFileType(file);
    parsedCV.metadata.fileSize = file.size;

    // Step 3: Normalize to PortfolioFormData
    const normalizationResult = await normalizeParsedCV(parsedCV, entityResolver);

    // Step 4: Validate
    const validation = validateParsedCV(parsedCV, normalizationResult);

    return {
      success: true,
      parsedCV,
      normalizationResult,
      validation,
    };
  } catch (error) {
    console.error('CV ingestion error:', error);

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'INGESTION_ERROR',
        details: error,
      },
    };
  }
}

/**
 * Validate parsed CV data
 */
function validateParsedCV(
  parsedCV: ParsedCV,
  normalizationResult: NormalizationResult
): CVValidationResult {
  const errors: CVValidationResult['errors'] = [];
  const warnings: CVValidationResult['warnings'] = [];

  // Check required fields
  if (!parsedCV.personalInfo.email) {
    errors.push({
      field: 'personalInfo.email',
      message: 'Email is required',
      severity: 'critical',
    });
  }

  if (!parsedCV.personalInfo.phone) {
    warnings.push({
      field: 'personalInfo.phone',
      message: 'Phone number is missing',
      suggestion: 'Add contact information manually',
    });
  }

  if (!parsedCV.personalInfo.fullName || parsedCV.personalInfo.fullName === 'Unknown') {
    errors.push({
      field: 'personalInfo.fullName',
      message: 'Name could not be extracted',
      severity: 'error',
    });
  }

  if (parsedCV.education.length === 0) {
    warnings.push({
      field: 'education',
      message: 'No education entries found',
      suggestion: 'Add education history manually',
    });
  }

  if (parsedCV.skills.categories.length === 0 && parsedCV.skills.raw.length === 0) {
    warnings.push({
      field: 'skills',
      message: 'No skills found',
      suggestion: 'Add technical skills manually',
    });
  }

  if (parsedCV.workExperience.length === 0) {
    warnings.push({
      field: 'workExperience',
      message: 'No work experience found',
      suggestion: 'Add work history manually',
    });
  }

  // Add normalization warnings
  normalizationResult.warnings.forEach(warning => {
    warnings.push({
      field: 'normalization',
      message: warning,
    });
  });

  // Check for unmapped entities
  if (normalizationResult.unmappedFields.skills.length > 0) {
    warnings.push({
      field: 'skills',
      message: `${normalizationResult.unmappedFields.skills.length} skills could not be mapped`,
      suggestion: 'Review and map skills manually',
    });
  }

  if (normalizationResult.unmappedFields.degrees.length > 0) {
    warnings.push({
      field: 'education',
      message: `${normalizationResult.unmappedFields.degrees.length} degrees could not be mapped`,
      suggestion: 'Review and map degrees manually',
    });
  }

  if (normalizationResult.unmappedFields.institutions.length > 0) {
    warnings.push({
      field: 'education',
      message: `${normalizationResult.unmappedFields.institutions.length} institutions could not be mapped`,
      suggestion: 'Review and map institutions manually',
    });
  }

  // Calculate completeness
  const totalFields = 7; // Personal info, education, skills, experience, projects, certifications, courses
  let filledFields = 0;

  if (parsedCV.personalInfo.email && parsedCV.personalInfo.phone) filledFields++;
  if (parsedCV.education.length > 0) filledFields++;
  if (parsedCV.skills.categories.length > 0 || parsedCV.skills.raw.length > 0) filledFields++;
  if (parsedCV.workExperience.length > 0) filledFields++;
  if (parsedCV.projects.length > 0) filledFields++;
  if (parsedCV.certifications.length > 0) filledFields++;
  if (parsedCV.courses.length > 0) filledFields++;

  const completeness = Math.round((filledFields / totalFields) * 100);

  // Calculate quality score
  const qualityScore = calculateQualityScore(parsedCV, errors, warnings);

  return {
    isValid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    completeness,
    qualityScore,
  };
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(
  parsedCV: ParsedCV,
  errors: CVValidationResult['errors'],
  warnings: CVValidationResult['warnings']
): number {
  let score = 100;

  // Deduct for errors
  score -= errors.filter(e => e.severity === 'critical').length * 20;
  score -= errors.filter(e => e.severity === 'error').length * 10;
  score -= warnings.length * 2;

  // Deduct for low confidence
  if (parsedCV.metadata.totalConfidence < 0.5) {
    score -= 20;
  } else if (parsedCV.metadata.totalConfidence < 0.7) {
    score -= 10;
  }

  // Bonus for completeness
  const hasAllSections =
    parsedCV.personalInfo.email &&
    parsedCV.education.length > 0 &&
    parsedCV.skills.categories.length > 0 &&
    parsedCV.workExperience.length > 0;

  if (hasAllSections) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get file type helper
 */
function getFileType(file: File): 'pdf' | 'docx' | 'doc' | 'txt' {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx') return 'docx';
  if (extension === 'doc') return 'doc';
  if (extension === 'txt') return 'txt';

  return 'pdf'; // Default
}

/**
 * Export parsed CV as JSON
 */
export function exportParsedCV(parsedCV: ParsedCV): string {
  return JSON.stringify(parsedCV, null, 2);
}

/**
 * Import parsed CV from JSON
 */
export function importParsedCV(json: string): ParsedCV {
  return JSON.parse(json);
}

/**
 * Process CV via API (for PDF + LLM on client)
 * Sends complete config to the server for full parsing
 */
async function ingestCVViaAPI(
  file: File,
  config: ParserConfig,
  entityResolver: any
): Promise<CVIngestionResult> {
  try {
    console.log(entityResolver);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useLLM', config.useLLM ? 'true' : 'false');

    if (config.apiKey) {
      formData.append('apiKey', config.apiKey);
    }

    if (config.llmProvider) {
      formData.append('llmProvider', config.llmProvider);
    }

    console.log('📤 Sending to API with config:', {
      useLLM: config.useLLM,
      llmProvider: config.llmProvider,
      hasApiKey: !!config.apiKey,
    });

    const response = await fetch('/api/cv-parse', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to process CV via API');
    }

    console.log('✅ API processing successful');

    // The API already returns parsedCV and normalizationResult
    // We need to create validation here
    const validation = validateParsedCV(data.parsedCV, data.normalizationResult);

    return {
      success: true,
      parsedCV: data.parsedCV,
      normalizationResult: data.normalizationResult,
      validation,
    };
  } catch (error) {
    console.error('API CV ingestion error:', error);

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'API_ERROR',
        details: error,
      },
    };
  }
}
