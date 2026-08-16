import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway v16.0 (Strict Free Tier).
 * Strictly excludes 'Library' and 'Professional' voices to prevent subscription errors.
 * Uses ONLY 'premade' voices which are 100% accessible on Free accounts.
 */

// Cache the selected voice ID to reduce API overhead
let cachedVoiceId: string | null = null;

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

    // CRITICAL FIX: Only allow 'premade' voices for Free Tier API access.
    // Professional and Library voices added to the account are restricted on Free plan API.
    const accessibleVoices = voices.filter((v: any) => 
      !BLOCKED_VOICE_IDS.includes(v.voice_id) && 
      v.category === 'premade'
    );

    if (accessibleVoices.length === 0) {
      console.warn('[ElevenLabs] No premade voices found in account. Using default fallback.');
      return 'Xb7hHahR8z74MCNeywV1'; // Alice (Premade)
    }

    // Filter for female voices within the 'premade' set
    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    // Priority 1: Indian English / Indian Accent within the 'premade' set
    let eligibleVoice = femaleVoices.find((v: any) => 
      v.labels?.accent?.toLowerCase().includes('indian') || 
      v.labels?.language?.toLowerCase() === 'en-in' ||
      v.name?.toLowerCase().includes('indian')
    );

    // Priority 2: Standard Premade English Female voices
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.find((v: any) => 
        ['Alice', 'Rachel', 'Matilda', 'Nicole'].includes(v.name)
      );
    }

    // Priority 3: First available female premade
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : accessibleVoices[0];
    }

    cachedVoiceId = eligibleVoice.voice_id;
    console.log(`[ElevenLabs] Selected Voice: ${eligibleVoice.name} | ID: ${cachedVoiceId} | Category: ${eligibleVoice.category}`);
    return cachedVoiceId!;
  } catch (error) {
    console.error('[ElevenLabs] Voice discovery fault:', error);
    return 'Xb7hHahR8z74MCNeywV1'; // Emergency fallback to Alice (Premade)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text node missing from payload.' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Neural voice configuration missing (API Key).' }, { status: 500 });
    }

    // 1. Get a guaranteed API-accessible premade voice
    const voiceId = await getAvailableVoice(apiKey);
    const modelId = 'eleven_flash_v2_5';

    // 2. Execute synthesis
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
            stability: 0.55,
            similarity_boost: 0.80,
            style: 0.10,
            use_speaker_boost: true,
            speaking_rate: 0.90
          },
        }),
      }
    );

    console.log(`[ElevenLabs] Request status: ${response.status} | model: ${modelId} | category: premade`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch (e) {
        errorDetail = { message: errorText };
      }
      
      console.error('[ElevenLabs] API Synthesis Failure:', errorDetail);
      
      // If the selected voice is still rejected, invalidate cache for next attempt
      if (response.status === 400 || response.status === 403) {
        cachedVoiceId = null;
      }

      return NextResponse.json({ 
        error: errorDetail?.detail?.message || errorDetail?.message || 'ElevenLabs synthesis failure.',
        code: errorDetail?.detail?.status || 'API_ERROR'
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error: any) {
    console.error('[ElevenLabs] Internal Protocol Fault:', error);
    return NextResponse.json({ 
      error: 'Internal server error during TTS processing.',
      details: error.message 
    }, { status: 500 });
  }
}
