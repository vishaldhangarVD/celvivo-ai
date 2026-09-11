import { NextResponse } from 'next/server';
import { logUsage } from '@/services/usage-logger';

/**
 * @fileOverview Resilient Google Cloud TTS Gateway.
 * Directly utilizes the project's API key for maximum reliability in prototype environments.
 * Returns audio as base64 JSON payload and logs character consumption.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, userId, sessionId } = body;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    const apiKey = (
      process.env.GOOGLE_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENAI_API_KEY || 
      ''
    ).trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Neural vocal matrix not configured (API Key missing)." }, { status: 500 });
    }

    // Record technical usage telemetry for Google Cloud TTS billing
    // Fire and forget, don't block the audio return
    logUsage({
      userId,
      sessionId,
      feature: 'tts_google_cloud',
      provider: 'google',
      characterCount: text.length
    }).catch(e => console.error("[Google TTS Gateway] Logging Fault:", e));

    // Use REST API with API Key - most reliable path
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-F',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        error: "Google Cloud TTS rejected the request.",
        details: errorData.error?.message || "Check API Key and Quota."
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      audioContent: data.audioContent,
      success: true 
    });

  } catch (error: any) {
    console.error('[TTS Gateway Fatal Error]:', error);
    return NextResponse.json({ 
      error: "Internal Gateway Error",
      details: error.message
    }, { status: 500 });
  }
}
