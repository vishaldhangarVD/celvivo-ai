import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway v18.0 (Optimized for Indian User Clarity).
 * Strictly filters for 'premade' voices to ensure Free Tier compatibility.
 * Calibrated for a calm, professional interview delivery with a clear, measured pace.
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
      console.warn('[ElevenLabs] No premade voices found in account. Using default fallback (Alice).');
      return 'Xb7hHahR8z74MCNeywV1'; // Alice (Premade)
    }

    // Filter for female voices within the 'premade' set
    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    // Priority 1: Indian English / Native Indian Accent within the 'premade' set
    // This looks for 'en-IN', 'India', or 'Indian' in labels or names
    let eligibleVoice = femaleVoices.find((v: any) => {
      const labels = JSON.stringify(v.labels || {}).toLowerCase();
      const name = v.name.toLowerCase();
      return labels.includes('indian') || labels.includes('en-in') || labels.includes('india') ||
             name.includes('indian') || name.includes('india');
    });

    if (eligibleVoice) {
      isNativeIndianVoice = true;
      console.log(`[ElevenLabs] Native Indian-English voice detected: ${eligibleVoice.name}`);
    } else {
      isNativeIndianVoice = false;
      console.log('[ElevenLabs] No native Indian-English premade voice found. Selecting clearest International female voice.');
      
      // Priority 2: Standard Reliable Premade English Female voices with neutral pronunciation
      eligibleVoice = femaleVoices.find((v: any) => 
        ['Alice', 'Rachel', 'Nicole', 'Matilda'].includes(v.name)
      );
    }

    // Final Fallback: First available female premade
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : accessibleVoices[0];
    }

    cachedVoiceId = eligibleVoice.voice_id;
    console.log(`[ElevenLabs] Successfully Tuned Voice: ${eligibleVoice.name} | ID: ${cachedVoiceId} | Native Indian: ${isNativeIndianVoice}`);
    
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

    // 2. Execute synthesis with settings optimized for clarity and Indian user comprehension
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
            stability: 0.65,          // Calm, consistent professional delivery
            similarity_boost: 0.80,   // High fidelity identity
            style: 0.05,              // Minimal, neutral interview tone
            use_speaker_boost: true,
            speaking_rate: 0.82       // Clear, slightly slow pace for comprehension
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

    console.log(`[ElevenLabs] Synthesis SUCCESS | model: ${modelId} | pace: 0.82 | status: 200`);

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
