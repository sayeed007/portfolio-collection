/**
 * CV Ingestion Module
 *
 * Main export file for CV parsing and ingestion functionality
 */

// Main service
export { ingestCV, exportParsedCV, importParsedCV } from './services/cv-ingestion-service';
export type { CVIngestionOptions, CVIngestionResult } from './services/cv-ingestion-service';

// Entity resolver
export { DatabaseEntityResolver, createEntityResolver, fetchEntitiesFromFirestore } from './services/entity-resolver';

// Unmapped entity creator
export { createUnmappedEntities } from './services/unmapped-entity-creator';
export type { UnmappedEntities, EntityCreationResult } from './services/unmapped-entity-creator';

// Entity remapper
export { remapFormDataWithEntities } from './services/entity-remapper';
export type { RemapResult } from './services/entity-remapper';

// Parsers
export { DeterministicParser } from './parsers/deterministic-parser';
export { LLMParser, parseWithHybridApproach } from './parsers/llm-parser';

// Extractors
export {
  extractTextFromFile,
  extractEmails,
  extractPhoneNumbers,
  extractURLs,
  extractLinkedInProfile,
  extractGitHubProfile,
  extractDates,
} from './extractors';

// Normalizers
export { normalizeParsedCV, fuzzyMatch } from './normalizers';
export type { NormalizationResult, EntityResolver } from './normalizers';

// Types
export type {
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
  ExtractedText,
  ExtractedSection,
  CVMetadata,
  CVParsingResult,
  CVValidationResult,
  ValidationError,
  ValidationWarning,
  CVReviewState,
  ParserConfig,
  EntityMatch,
  SkillMatch,
  InstitutionMatch,
  DegreeMatch,
} from './types';
