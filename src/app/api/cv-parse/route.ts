/**
 * CV Parsing API Route
 *
 * Server-side endpoint for parsing CVs
 * Useful for larger files or when client-side parsing fails
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/cv-ingestion/extractors';
import { DeterministicParser } from '@/lib/cv-ingestion/parsers/deterministic-parser';
import { LLMParser } from '@/lib/cv-ingestion/parsers/llm-parser';
import { normalizeParsedCV } from '@/lib/cv-ingestion/normalizers';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const useLLM = formData.get('useLLM') === 'true';
    const apiKey = formData.get('apiKey') as string | null;
    const llmProvider = (formData.get('llmProvider') as 'openai' | 'anthropic' | 'gemini') || 'openai';

    console.log('📥 API received request:', {
      fileName: file?.name,
      useLLM,
      llmProvider,
      hasApiKey: !!apiKey,
    });

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Extract text
    const extractedText = await extractTextFromFile(file);

    // Parse CV
    let parsedCV;

    if (useLLM && apiKey) {
      console.log(`🤖 Using LLM parser: ${llmProvider}`);
      const llmParser = new LLMParser(extractedText, {
        useLLM: true,
        apiKey,
        llmProvider,
        fallbackToDeterministic: true,
        enableOCR: false,
        confidenceThreshold: 0.7,
        debugMode: false,
      });
      parsedCV = await llmParser.parse();
    } else {
      console.log('📋 Using deterministic parser');
      const deterministicParser = new DeterministicParser(extractedText);
      parsedCV = await deterministicParser.parse();
    }

    // Update metadata
    parsedCV.metadata.fileName = file.name;
    parsedCV.metadata.fileSize = file.size;

    // Normalize (without entity resolver for now)
    const normalizationResult = await normalizeParsedCV(parsedCV);

    return NextResponse.json({
      success: true,
      extractedText, // Include the raw extracted text
      parsedCV,
      normalizationResult,
    });
  } catch (error) {
    console.error('CV parsing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'PARSING_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
