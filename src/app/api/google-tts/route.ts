import { NextResponse } from 'next/server';

/**
 * @fileOverview Temporary Google Cloud TTS Gateway for comparison tests.
 * Targeted at en-IN-Wavenet-A (Female, Indian English) for high-fidelity evaluation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    // Reuse existing Google keys if available, prioritizing a dedicated GOOGLE_API_KEY
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Google API Key missing.",
        setup: "Enable 'Cloud Text-to-Speech API' in Google Cloud Console and add GOOGLE_API_KEY to .env"
      }, { status: 500 });
    }

    console.log(`[Google TTS Test Request]
- Voice: en-IN-Wavenet-A (Female, Indian English)
- Speed: 0.90
- Text: "${text.substring(0, 40)}..."`);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-IN',
            name: 'en-IN-Wavenet-A',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.90,
            pitch: 0.0
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Google TTS API Error Response]:', errorData);
      return NextResponse.json({ 
        error: 'Google TTS API rejected the request.',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error("No audioContent in Google API response.");
    }

    // audioContent is returned as a base64 string
    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[Google TTS Gateway Internal Fault]:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
