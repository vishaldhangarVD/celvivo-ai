
import { NextResponse } from 'next/server';

/**
 * @fileOverview Gemini Model Discovery Protocol.
 * Fetches the definitive list of available models directly from the live API.
 */

export async function GET() {
  const apiKey = (
    process.env.GOOGLE_GENAI_API_KEY || 
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    ''
  ).trim();

  if (!apiKey) {
    return NextResponse.json({ error: "API Key missing from environment." }, { status: 500 });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Filter for models that support content generation
    const validModels = (data.models || []).filter((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent')
    ).map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      version: m.version
    }));

    return NextResponse.json({
      groundTruth: validModels,
      rawResponse: data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
