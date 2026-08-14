import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway v15.0 (Free Tier Hardened).
 * Strictly excludes Library voices that trigger "Subscription Required" errors.
 * Prioritizes Premade and Professional categories for 100% API availability.
 */

// Cache the selected voice ID to reduce API overhead
let cachedVoiceId: string | null = null;

// Blacklist of known Library IDs that fail on Free Plan
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

    // DIAGNOSTIC LOG (Server Console Only)
    console.log('[TTS Diagnostic] Discovering API-accessible voices...');
    
    // Filter out blacklisted IDs and prioritize 'premade' or 'professional' categories
    // Free plan users usually can ONLY use 'premade' voices via API if they are library-sourced
    const accessibleVoices = voices.filter((v: any) => 
      !BLOCKED_VOICE_IDS.includes(v.voice_id) && 
      (v.category === 'premade' || v.category === 'professional')
    );

    if (accessibleVoices.length === 0) {
      console.warn('[TTS Warning] No standard premade voices found. Falling back to default ID.');
      return 'Xb7hHahR8z74MCNeywV1'; // Alice (Premade)
    }

    // Filter for female voices
    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    // Priority 1: Indian English / Indian Accent Match
    let eligibleVoice = femaleVoices.find((v: any) => 
      v.labels?.accent?.toLowerCase().includes('indian') || 
      v.labels?.language?.toLowerCase() === 'en-in' ||
      v.name?.toLowerCase().includes('indian')
    );

    // Priority 2: High-quality Premade English Female voices
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
    console.log(`[TTS Gateway] Successfully Selected: ${eligibleVoice.name} (${cachedVoiceId}) | Category: ${eligibleVoice.category}`);
    return cachedVoiceId!;
  } catch (error) {
    console.error('[TTS Gateway] Voice discovery failed:', error);
    return 'Xb7hHahR8z74MCNeywV1'; // Emergency fallback to Rachel
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

    // 1. Force dynamic discovery to avoid stale IDs from env
    const voiceId = await getAvailableVoice(apiKey);

    const modelId = 'eleven_flash_v2_5';

    // 2. Execute synthesis
    console.log(`[ElevenLabs Request] model: ${modelId} | voice: ${voiceId}`);
    
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

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch (e) {
        errorDetail = { message: errorText };
      }
      
      console.error('[ElevenLabs API Error Response]', response.status, errorDetail);
      
      // If selected voice is rejected, clear cache for next attempt
      if (response.status === 401 || response.status === 403) {
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
    console.error('[TTS Gateway] Fatal Internal Fault:', error);
    return NextResponse.json({ 
      error: 'Internal server error during TTS processing.',
      details: error.message 
    }, { status: 500 });
  }
}
