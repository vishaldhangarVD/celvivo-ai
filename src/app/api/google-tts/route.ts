import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway v15.0.
 * Implements dual-protocol authentication (API Key + OAuth2).
 * Ensures robust JSON responses for all success/error paths.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    // Load available keys
    const apiKey = (
      process.env.GOOGLE_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENAI_API_KEY || 
      ''
    ).trim();

    let audioContent = null;
    let diagnosticInfo = {
      methodUsed: 'NONE',
      googleStatus: 0
    };

    // PROTOCOL A: API Key (Primary for Prototype Stability)
    if (apiKey) {
      try {
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

        diagnosticInfo.googleStatus = response.status;
        
        if (response.ok) {
          const data = await response.json();
          audioContent = data.audioContent;
          diagnosticInfo.methodUsed = 'API_KEY';
        }
      } catch (err) {
        console.warn('[TTS Protocol A] Failed:', err);
      }
    }

    // PROTOCOL B: Service Account / ADC (Fallback)
    if (!audioContent) {
      try {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const client = await auth.getClient();
        const headers = await client.getRequestHeaders();

        const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: 'en-US',
              name: 'en-US-Neural2-F',
              ssmlGender: 'FEMALE'
            },
            audioConfig: {
              audioEncoding: 'MP3'
            }
          }),
        });

        diagnosticInfo.googleStatus = response.status;

        if (response.ok) {
          const data = await response.json();
          audioContent = data.audioContent;
          diagnosticInfo.methodUsed = 'SERVICE_ACCOUNT';
        } else {
          const errorData = await response.json().catch(() => ({ message: "API Rejected Request" }));
          return NextResponse.json({ 
            error: "Google Cloud TTS authentication failed.", 
            status: response.status,
            details: errorData,
            diagnostic: diagnosticInfo
          }, { status: response.status });
        }
      } catch (authError: any) {
        return NextResponse.json({ 
          error: "Google Cloud identity provider fault.",
          details: authError.message,
          diagnostic: diagnosticInfo
        }, { status: 401 });
      }
    }

    return NextResponse.json({ 
      audioContent,
      success: true,
      method: diagnosticInfo.methodUsed
    });

  } catch (error: any) {
    console.error('[TTS Gateway Fatal]:', error);
    return NextResponse.json({ 
      error: `Internal Gateway Fault: ${error.message}`,
      success: false
    }, { status: 500 });
  }
}
