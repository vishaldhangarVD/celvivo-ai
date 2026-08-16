import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway (Test Only).
 * Implements a prioritized authentication chain:
 * 1. Application Default Credentials (ADC)
 * 2. GOOGLE_SERVICE_ACCOUNT_JSON environment variable
 * 
 * Target Voice: en-IN-Wavenet-A (Female, Indian English).
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    // Initialize Google Auth options
    const authOptions: any = {
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    };

    // Support for explicit service account JSON via environment variable
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (parseError) {
        console.error('[Google TTS] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON environment variable.');
      }
    }

    const auth = new GoogleAuth(authOptions);

    let accessToken: string | null = null;
    try {
      const client = await auth.getClient();
      const tokenResponse = await client.getAccessToken();
      accessToken = tokenResponse.token || null;
    } catch (authError: any) {
      console.error('[Google TTS Auth Error]:', authError.message);
      return NextResponse.json({ 
        error: "Google Cloud authentication failed. Configure ADC or GOOGLE_SERVICE_ACCOUNT_JSON.",
        status: "AUTH_ERROR"
      }, { status: 500 });
    }

    if (!accessToken) {
      return NextResponse.json({ 
        error: "Could not retrieve access token. Check project permissions.",
        status: "TOKEN_ERROR"
      }, { status: 500 });
    }

    console.log(`[Google TTS Test Request]
- Voice: en-IN-Wavenet-A
- Speed: 0.90
- Text length: ${text.length} chars`);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
      const errorData = await response.json().catch(() => ({ message: "Unknown Google API error" }));
      console.error('[Google TTS API Error Response]:', JSON.stringify(errorData, null, 2));

      return NextResponse.json({ 
        error: `Google API Error: ${errorData.error?.message || errorData.message || "Request rejected"}`,
        details: errorData,
        apiStatus: errorData.error?.status || "API_ERROR"
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
    return NextResponse.json({ 
      error: `Internal Gateway Fault: ${error.message || 'Unknown error'}`,
      status: 500 
    }, { status: 500 });
  }
}
