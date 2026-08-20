
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway.
 * Returns JSON with base64 audioContent to ensure stable client parsing.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    const authOptions: any = {
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    };

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (parseError) {
        console.error('[Google TTS] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
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
        error: "Google Cloud authentication failed. Verify service account.",
        details: authError.message
      }, { status: 401 });
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Access token retrieval failed." }, { status: 500 });
    }

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
      const errorData = await response.json().catch(() => ({ message: "Google API rejected request" }));
      return NextResponse.json({ error: "TTS Generation Failed", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // Explicitly return JSON to prevent client-side "Unexpected token <" parsing errors
    return NextResponse.json({ 
      audioContent: data.audioContent, // base64 string
      success: true 
    });

  } catch (error: any) {
    console.error('[Google TTS Gateway Internal Fault]:', error);
    return NextResponse.json({ 
      error: `Internal Gateway Fault: ${error.message || 'Unknown error'}`,
      success: false
    }, { status: 500 });
  }
}
