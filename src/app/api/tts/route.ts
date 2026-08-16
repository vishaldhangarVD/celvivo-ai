import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway v19.0 (Optimized for Settings Delivery).
 * Strictly filters for 'premade' voices and ensures settings (speed) reach the API.
 */

// Cache the selected voice ID to reduce API overhead
let cachedVoiceId: null | string = null;
let isNativeIndianVoice = false;

// Blacklist of known IDs that trigger "Subscription Required" on Free Plan
const BLOCKED_VOICE_IDS = ['4uN5YeBITFJsw8t45RIV'];

async function getAvailableVoice(apiKey: string): Promise<string> {
  if (cachedVoiceId) return cachedVoiceId;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ElevenLabs voices: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const voices = data.voices || [];

    // CRITICAL: Only allow 'premade' voices for Free Tier API access.
    const accessibleVoices = voices.filter((v: any) => 
      !BLOCKED_VOICE_IDS.includes(v.voice_id) && 
      v.category === 'premade'
    );

    if (accessibleVoices.length === 0) {
      console.warn('[ElevenLabs] No premade voices found. Falling back to Alice.');
      return 'Xb7hHahR8z74MCNeywV1'; // Alice (Premade)
    }

    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    // Priority 1: Indian English / Native Indian Accent
    let eligibleVoice = femaleVoices.find((v: any) => {
      const labels = JSON.stringify(v.labels || {}).toLowerCase();
      const name = v.name.toLowerCase();
      return labels.includes('indian') || labels.includes('en-in') || labels.includes('india') ||
             name.includes('indian') || name.includes('india');
    });

    if (eligibleVoice) {
      isNativeIndianVoice = true;
    } else {
      isNativeIndianVoice = false;
      // Priority 2: Standard Reliable Premade English Female
      eligibleVoice = femaleVoices.find((v: any) => 
        ['Alice', 'Rachel', 'Nicole', 'Matilda'].includes(v.name)
      );
    }

    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : accessibleVoices[0];
    }

    cachedVoiceId = eligibleVoice.voice_id;
    return cachedVoiceId!;
  } catch (error) {
    console.error('[ElevenLabs] Voice discovery fault:', error);
    return 'Xb7hHahR8z74MCNeywV1'; 
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text node missing.' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing.' }, { status: 500 });
    }

    const voiceId = await getAvailableVoice(apiKey);
    const modelId = 'eleven_flash_v2_5';

    // LOGGING (SAFE DATA ONLY)
    console.log(`[ElevenLabs TTS Request]
- Voice ID: ${voiceId}
- Model: ${modelId}
- Settings: { stability: 0.65, similarity: 0.80, style: 0.05, speed: 0.82 }
- Text Length: ${body.text.length} chars
- Indian Accent Detected: ${isNativeIndianVoice}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: body.text,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.80,
            style: 0.05,
            use_speaker_boost: true,
            speed: 0.82
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs API Error Response]:', errorText);
      
      if (response.status === 400 || response.status === 403) {
        cachedVoiceId = null;
      }

      return NextResponse.json({ 
        error: 'ElevenLabs API rejected the request.',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('[ElevenLabs Internal Fault]:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
