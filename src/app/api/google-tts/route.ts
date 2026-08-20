
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway.
 * Supports Service Account (OAuth2) and API Key authentication.
 * Optimized for Firebase Studio environments and resilient credential loading.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    // Try to find a valid API Key from various possible env vars as a primary or fallback
    const apiKey = (
      process.env.GOOGLE_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENAI_API_KEY || 
      ''
    ).trim();

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    let ttsUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let authMethod = 'NONE';

    // Protocol A: Service Account (OAuth2) - Preferred if configured
    if (serviceAccountJson) {
      try {
        let credentials = JSON.parse(serviceAccountJson);
        
        // Handle escaped newlines in the private key which often occur in environment variables
        if (credentials.private_key && typeof credentials.private_key === 'string') {
          credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }

        const auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
          authMethod = 'SERVICE_ACCOUNT';
        }
      } catch (authError: any) {
        console.warn('[Google TTS Auth] Service account authentication failed, attempting API Key fallback:', authError.message);
        // Continue to API Key fallback
      }
    }

    // Protocol B: API Key Fallback (Used in many Studio prototype environments)
    if (authMethod === 'NONE') {
      if (apiKey) {
        ttsUrl += `?key=${apiKey}`;
        authMethod = 'API_KEY';
      } else {
        console.error('[Google TTS Auth] No valid credentials found (JSON or Key).');
        return NextResponse.json({ 
          error: "Google Cloud TTS credentials are not configured.",
          details: "Please verify that GOOGLE_API_KEY or GOOGLE_SERVICE_ACCOUNT_JSON is set in the environment variables."
        }, { status: 401 });
      }
    }

    const response = await fetch(
      ttsUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-IN',
            name: 'en-IN-Wavenet-A',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0.0
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Google API rejected request" }));
      console.error('[Google TTS API Error]:', response.status, JSON.stringify(errorData));
      
      // Handle specific API Key or Service Account permission issues
      if (response.status === 403) {
        return NextResponse.json({ 
          error: "Text-to-Speech API access denied.", 
          details: "Ensure the Text-to-Speech API is enabled in your Google Cloud Console and the credentials have 'Cloud Text-to-Speech API' permissions."
        }, { status: 403 });
      }

      return NextResponse.json({ 
        error: "Google Cloud TTS request failed.", 
        status: response.status,
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error("Google API returned success but no audioContent field was found.");
    }

    // Return pure JSON to ensure stable parsing in client-side fetch
    return NextResponse.json({ 
      audioContent: data.audioContent,
      success: true,
      authMethodUsed: authMethod
    });

  } catch (error: any) {
    console.error('[Google TTS Gateway Internal Fault]:', error);
    return NextResponse.json({ 
      error: `Internal Gateway Fault: ${error.message || 'Unknown error'}`,
      success: false
    }, { status: 500 });
  }
}
