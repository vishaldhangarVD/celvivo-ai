import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway v16.0.
 * Implements resilient multi-tiered authentication (API Key -> Service Account).
 * Ensures JSON-only responses to prevent client-side parsing errors.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ 
        error: "Text payload missing.", 
        success: false 
      }, { status: 400 });
    }

    // Load available keys from environment
    const apiKey = (
      process.env.GOOGLE_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENAI_API_KEY || 
      ''
    ).trim();

    let audioContent = null;
    let diagnosticInfo = {
      method: 'NONE',
      googleStatus: 0,
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'unknown'
    };

    // --- PROTOCOL A: API Key (Fast & Reliable for Prototyping) ---
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
          diagnosticInfo.method = 'API_KEY';
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[TTS API Key Protocol] Rejected:', response.status, errorData);
        }
      } catch (err) {
        console.warn('[TTS API Key Protocol] Connection failed:', err);
      }
    }

    // --- PROTOCOL B: Service Account / OAuth2 (Enterprise Fallback) ---
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
          diagnosticInfo.method = 'SERVICE_ACCOUNT';
        } else {
          const errorText = await response.text();
          return NextResponse.json({ 
            error: "Google Cloud TTS access denied.", 
            details: "Ensure Cloud Text-to-Speech API is enabled and authentication is correctly configured.",
            googleStatus: response.status,
            googleResponse: errorText.substring(0, 200),
            diagnostic: diagnosticInfo,
            success: false
          }, { status: response.status });
        }
      } catch (authError: any) {
        return NextResponse.json({ 
          error: "Identity provider fault.",
          details: authError.message || "Failed to initialize Google identity client.",
          diagnostic: diagnosticInfo,
          success: false
        }, { status: 401 });
      }
    }

    if (!audioContent) {
      return NextResponse.json({
        error: "Neural synthesis node failed to produce audio.",
        diagnostic: diagnosticInfo,
        success: false
      }, { status: 500 });
    }

    return NextResponse.json({ 
      audioContent,
      success: true,
      methodUsed: diagnosticInfo.method
    });

  } catch (error: any) {
    console.error('[TTS Gateway Fatal Fault]:', error);
    return NextResponse.json({ 
      error: "Internal Gateway Error",
      details: error.message,
      success: false
    }, { status: 500 });
  }
}
