/**
 * File Extractors for CV Ingestion
 *
 * Extracts raw text from different file formats (PDF, DOCX, TXT)
 */

import { ExtractedText, ExtractedSection } from '../types';

// Track if PDF.js worker has been configured to avoid re-initialization
let pdfWorkerConfigured = false;

/**
 * Main extraction orchestrator
 */
export async function extractTextFromFile(
  file: File
): Promise<ExtractedText> {
  const fileType = getFileType(file);

  switch (fileType) {
    case 'pdf':
      // For PDFs, use server-side processing when on client
      // This avoids pdfjs-dist bundling issues in Next.js
      if (typeof window !== 'undefined') {
        return extractFromPDFViaAPI(file);
      }
      return extractFromPDF(file);
    case 'docx':
    case 'doc':
      return extractFromDOCX(file);
    case 'txt':
      return extractFromTXT(file);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Get file type from extension
 */
function getFileType(file: File): 'pdf' | 'docx' | 'doc' | 'txt' {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx') return 'docx';
  if (extension === 'doc') return 'doc';
  if (extension === 'txt') return 'txt';

  throw new Error(`Unknown file extension: ${extension}`);
}

/**
 * Extract PDF text via API route (client-side only)
 * Uses server-side pdf-parse to avoid bundling issues
 */
async function extractFromPDFViaAPI(file: File): Promise<ExtractedText> {
  try {
    console.log('📤 Extracting PDF via API (server-side processing)');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useLLM', 'false'); // Just extraction, no LLM needed

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

    if (!data.success || !data.extractedText) {
      throw new Error(data.error?.message || 'Failed to extract text from PDF');
    }

    console.log('✅ PDF extraction successful via API');

    // Return the extracted text directly from the API response
    return data.extractedText;
  } catch (error) {
    console.error('API PDF extraction error:', error);
    throw new Error(
      `Failed to extract PDF via API: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Configure PDF.js worker (only once per session)
 */
async function configurePdfWorker(pdfjsLib: any): Promise<void> {
  if (pdfWorkerConfigured || typeof window === 'undefined') {
    return;
  }

  try {
    const version = pdfjsLib.version || '5.4.394';

    console.log('Configuring PDF worker...');
    console.log('pdfjsLib:', pdfjsLib);
    console.log('pdfjsLib.GlobalWorkerOptions:', pdfjsLib.GlobalWorkerOptions);

    // Ensure GlobalWorkerOptions exists
    if (!pdfjsLib.GlobalWorkerOptions) {
      console.error('GlobalWorkerOptions is not available on pdfjsLib');
      console.error('Available properties:', Object.keys(pdfjsLib));
      throw new Error('GlobalWorkerOptions is not available. pdfjs-dist may not have loaded correctly.');
    }

    // Try different worker sources for pdfjs-dist v5.x compatibility
    // Option 1: jsdelivr CDN (most reliable)
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    pdfWorkerConfigured = true;
    console.log('✅ PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  } catch (error) {
    console.error('❌ Failed to configure PDF worker:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    // Don't set pdfWorkerConfigured = true, so we can retry with different approach
    throw error; // Re-throw to see the full error
  }
}

/**
 * Extract text from PDF using pdf.js (client-side) or pdf2json (server-side)
 */
async function extractFromPDF(file: File): Promise<ExtractedText> {
  // Check if we're in a server environment (Node.js)
  if (typeof window === 'undefined') {
    // Dynamically import server-only code to avoid bundling in client
    const { extractFromPDFServer } = await import('./server');
    return extractFromPDFServer(file);
  }

  // Client-side extraction using pdf.js
  try {
    // Dynamically import pdf.js v5.x with better error handling
    let pdfjsLib;

    try {
      const pdfjsModule = await import('pdfjs-dist');
      console.log('pdfjs-dist module loaded:', pdfjsModule);

      // Try to get the library from different possible export locations
      pdfjsLib = (pdfjsModule as any).default || pdfjsModule;

      // If it's wrapped in another layer, unwrap it
      if (pdfjsLib && (pdfjsLib as any).default) {
        pdfjsLib = (pdfjsLib as any).default;
      }

      console.log('pdfjsLib extracted:', pdfjsLib);
      console.log('pdfjsLib type:', typeof pdfjsLib);
      console.log('pdfjsLib has getDocument?', pdfjsLib?.getDocument);

    } catch (importError) {
      console.error('Failed to import pdfjs-dist:', importError);
      throw new Error(`Failed to import pdfjs-dist: ${importError instanceof Error ? importError.message : 'Unknown error'}`);
    }

    // Additional validation to ensure we got a valid module
    if (!pdfjsLib || typeof pdfjsLib !== 'object' || !pdfjsLib.getDocument) {
      console.error('Invalid pdfjs-dist module. Module contents:', pdfjsLib);
      console.error('Available keys:', pdfjsLib ? Object.keys(pdfjsLib) : 'pdfjsLib is null/undefined');
      throw new Error(
        'Failed to load pdfjs-dist module correctly. ' +
        'The module may not be compatible with your environment. ' +
        `Module type: ${typeof pdfjsLib}, has getDocument: ${!!pdfjsLib?.getDocument}`
      );
    }

    // Configure worker once
    await configurePdfWorker(pdfjsLib);

    const arrayBuffer = await file.arrayBuffer();

    // Create loading task with fallback options
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable worker fetch to avoid CORS issues
      useWorkerFetch: false,
      // Disable eval for security
      isEvalSupported: false,
      // Add verbosity for debugging (remove in production)
      verbosity: 0, // 0 = errors only, 5 = all messages
    });

    const pdf = await loadingTask.promise;

    let fullText = '';
    const pageTexts: string[] = [];

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      pageTexts.push(pageText);
      fullText += pageText + '\n\n';
    }

    // Detect sections
    const sections = detectSections(fullText);

    return {
      fullText: fullText.trim(),
      sections,
      metadata: {
        pageCount: pdf.numPages,
        wordCount: countWords(fullText),
        hasImages: false, // TODO: Detect images if needed
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from DOCX using mammoth
 */
async function extractFromDOCX(file: File): Promise<ExtractedText> {
  try {
    // Dynamically import mammoth
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    const fullText = result.value;
    const sections = detectSections(fullText);

    return {
      fullText: fullText.trim(),
      sections,
      metadata: {
        wordCount: countWords(fullText),
        hasImages: false,
      },
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from plain text file
 */
async function extractFromTXT(file: File): Promise<ExtractedText> {
  try {
    const text = await file.text();
    const sections = detectSections(text);

    return {
      fullText: text.trim(),
      sections,
      metadata: {
        wordCount: countWords(text),
        hasImages: false,
      },
    };
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error(`Failed to extract text from TXT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect sections in CV text using common headings
 */
function detectSections(text: string): ExtractedSection[] {
  const sections: ExtractedSection[] = [];

  // Common section headings (case-insensitive patterns)
  const sectionPatterns = [
    { heading: 'Personal Information', patterns: [/personal\s+info/i, /contact\s+info/i, /about\s+me/i] },
    { heading: 'Summary', patterns: [/summary/i, /objective/i, /profile/i, /professional\s+summary/i] },
    { heading: 'Education', patterns: [/education/i, /academic/i, /qualifications/i] },
    { heading: 'Experience', patterns: [/experience/i, /employment/i, /work\s+history/i, /professional\s+experience/i] },
    { heading: 'Skills', patterns: [/skills/i, /technical\s+skills/i, /competencies/i, /expertise/i] },
    { heading: 'Projects', patterns: [/projects/i, /portfolio/i] },
    { heading: 'Certifications', patterns: [/certifications?/i, /licenses?/i] },
    { heading: 'Courses', patterns: [/courses?/i, /training/i] },
    { heading: 'References', patterns: [/references/i] },
  ];

  const lines = text.split('\n');
  let currentSection: ExtractedSection | null = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check if line matches any section heading
    for (const { heading, patterns } of sectionPatterns) {
      if (patterns.some(pattern => pattern.test(trimmedLine))) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          heading,
          content: '',
          confidence: 0.8, // High confidence for pattern-matched sections
          startIndex: index,
          endIndex: index,
        };
        break;
      }
    }

    // Add content to current section
    if (currentSection && trimmedLine) {
      currentSection.content += line + '\n';
      currentSection.endIndex = index;
    }
  });

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text: string): string[] {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.match(emailPattern) || [];
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\(\d{3}\)\s*\d{3}-\d{4}/g,
    /\d{3}-\d{3}-\d{4}/g,
  ];

  const matches: string[] = [];
  phonePatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) matches.push(...found);
  });

  return Array.from(new Set(matches)); // Remove duplicates
}

/**
 * Extract URLs from text
 */
export function extractURLs(text: string): string[] {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.match(urlPattern) || [];
}

/**
 * Extract LinkedIn profile URL
 */
export function extractLinkedInProfile(text: string): string | null {
  const linkedInPattern = /https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/i;
  const match = text.match(linkedInPattern);
  return match ? match[0] : null;
}

/**
 * Extract GitHub profile URL
 */
export function extractGitHubProfile(text: string): string | null {
  const githubPattern = /https?:\/\/(www\.)?github\.com\/[\w-]+/i;
  const match = text.match(githubPattern);
  return match ? match[0] : null;
}

/**
 * Extract dates from text (multiple formats)
 */
export function extractDates(text: string): string[] {
  const datePatterns = [
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{4}\b/g, // Years
  ];

  const matches: string[] = [];
  datePatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) matches.push(...found);
  });

  return Array.from(new Set(matches));
}
