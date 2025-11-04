/**
 * Server-only extractors (Node.js environment only)
 * This file should never be imported on the client-side
 */

import { ExtractedText } from '../types';

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Detect sections in CV text using common headings
 */
function detectSections(text: string) {
  const sections: any[] = [];

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
  let currentSection: any | null = null;

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
          confidence: 0.8,
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
 * Extract text from PDF on server-side using pdf2json
 */
export async function extractFromPDFServer(file: File): Promise<ExtractedText> {
  try {
    console.log('🔧 Starting server-side PDF extraction with pdf2json');

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📦 Buffer created, size:', buffer.length);

    // Dynamically import pdf2json (server-only)
    const PDFParser = (await import('pdf2json')).default;

    return new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, true); // Enable raw text mode

      // Set up event handlers
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('❌ PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          console.log('✅ PDF parsed successfully');

          // Extract text from all pages
          let fullText = '';
          let pageCount = 0;

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pageCount = pdfData.Pages.length;

            for (const page of pdfData.Pages) {
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const text of page.Texts) {
                  if (text.R && Array.isArray(text.R)) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decode URI-encoded text
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                fullText += '\n\n'; // Separate pages
              }
            }
          }

          console.log('📄 Extracted text length:', fullText.length, 'Pages:', pageCount);

          const sections = detectSections(fullText);

          resolve({
            fullText: fullText.trim(),
            sections,
            metadata: {
              pageCount,
              wordCount: countWords(fullText),
              hasImages: false,
            },
          });
        } catch (processingError) {
          console.error('❌ Error processing PDF data:', processingError);
          reject(new Error(`Failed to process PDF data: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error('❌ Server-side PDF extraction error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw new Error(`Failed to extract text from PDF on server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
