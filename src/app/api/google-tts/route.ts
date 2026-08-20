
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

/**
 * @fileOverview Secure Google Cloud TTS Gateway v12.0.
 * Fixed 401 Authentication Error by implementing robust token management.
 * Supports Service Account (OAuth2) with automatic discovery and API Key fallback.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "Text payload missing." }, { status: 400 });
    }

    // Load API Key as fallback
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
    let authErrorDetails = '';

    // Protocol A: Service Account (OAuth2) - High Priority
    try {
      const authOptions: any = {
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      };

      if (serviceAccountJson) {
        let credentials = JSON.parse(serviceAccountJson);
        if (credentials.private_key && typeof credentials.private_key === 'string') {
          credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        authOptions.credentials = credentials;
        authOptions.projectId = credentials.project_id;
      }

      const auth = new GoogleAuth(authOptions);
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      if (accessToken && accessToken.token) {
        headers['Authorization'] = `Bearer ${accessToken.token}`;
        authMethod = 'SERVICE_ACCOUNT';
        console.log(`[TTS Auth] Protocol A Success. Project: ${authOptions.projectId || 'Detected'}`);
      } else {
        throw new Error("Failed to retrieve access token from service account.");
      }
    } catch (authError: any) {
      authErrorDetails = authError.message;
      console.warn('[TTS Auth] Protocol A Failed:', authErrorDetails);
      // Fallback to Protocol B (API Key)
    }

    // Protocol B: API Key Fallback
    if (authMethod === 'NONE') {
      if (apiKey) {
        ttsUrl += `?key=${apiKey}`;
        authMethod = 'API_KEY';
        console.log('[TTS Auth] Protocol B Initiated (API Key).');
      } else {
        console.error('[TTS Auth] Identity Exhausted. No valid credentials found.');
        return NextResponse.json({ 
          error: "Google Cloud TTS credentials are not configured.",
          details: "Verify that GOOGLE_API_KEY or GOOGLE_SERVICE_ACCOUNT_JSON is set."
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
            languageCode: 'en-US',
            name: 'en-US-Neural2-F', // Professional, high-fidelity voice
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Google API rejected request" }));
      console.error(`[TTS API Error] Status: ${response.status}`, JSON.stringify(errorData));
      
      return NextResponse.json({ 
        error: "Google Cloud TTS request failed.", 
        status: response.status,
        details: errorData,
        authMethodUsed: authMethod
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error("Google API returned success but no audioContent field was found.");
    }

    return NextResponse.json({ 
      audioContent: data.audioContent,
      success: true,
      authMethodUsed: authMethod
    });

  } catch (error: any) {
    console.error('[TTS Gateway Internal Fault]:', error);
    return NextResponse.json({ 
      error: `Internal Gateway Fault: ${error.message || 'Unknown error'}`,
      success: false
    }, { status: 500 });
  }
}
