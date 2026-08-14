import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway (Optimized for Free Plan & API Accessibility).
 * strictly selects voices returned by the authenticated /v1/voices endpoint to avoid
 * "Library voice" access errors on Free accounts.
 */

// Cache the selected voice ID to reduce API overhead
let cachedVoiceId: string | null = null;

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

    if (voices.length === 0) {
      throw new Error('No voices available in this ElevenLabs account.');
    }

    // Filter for female voices available to the API key
    // We prioritize voices that are already "added" to the account or premade
    const femaleVoices = voices.filter((v: any) => 
      v.labels?.gender === 'female' || 
      v.category === 'premade' || 
      v.category === 'professional'
    );

    // Priority 1: Indian English / Indian Accent Match in account list
    let eligibleVoice = femaleVoices.find((v: any) => 
      v.labels?.accent?.toLowerCase().includes('indian') || 
      v.labels?.language?.toLowerCase() === 'en-in' ||
      v.labels?.description?.toLowerCase().includes('indian') ||
      v.name?.toLowerCase().includes('indian')
    );

    // Priority 2: Common Premade Professional Female voices (Alice, Rachel, Matilda) 
    // but ONLY if they are actually in the returned list
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.find((v: any) => 
        ['Alice', 'Rachel', 'Matilda', 'Nicole', 'Jessica'].includes(v.name)
      );
    }

    // Priority 3: Any female voice in the account list
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : voices[0];
    }

    if (!eligibleVoice) {
      throw new Error('No usable voices found in the authenticated list.');
    }

    cachedVoiceId = eligibleVoice.voice_id;
    console.log(`[TTS Gateway] Selected API-Accessible Voice: ${eligibleVoice.name} (${cachedVoiceId})`);
    return cachedVoiceId!;
  } catch (error) {
    console.error('[TTS Gateway] Voice discovery failed:', error);
    // Return a known standard premade ID as last resort if fetch fails, 
    // but ideally we throw to handle it in the POST handler
    throw error;
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
      console.error('[TTS Gateway] ELEVENLABS_API_KEY is not configured.');
      return NextResponse.json({ 
        error: 'Neural voice configuration missing on server.',
        code: 'MISSING_API_KEY'
      }, { status: 500 });
    }

    // 1. Get a voice ID that is GUARANTEED to be accessible by this API key
    let voiceId;
    try {
      voiceId = await getAvailableVoice(apiKey);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Voice discovery failed' }, { status: 500 });
    }

    const modelId = 'eleven_flash_v2_5';

    // 2. Execute synthesis with optimized settings
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
            stability: 0.55,        // Balanced professional tone
            similarity_boost: 0.80, // High integrity to voice character
            style: 0.10,            // Low expression for formal interview
            use_speaker_boost: true,
            speaking_rate: 0.90      // Slightly slower for clarity & professionalism
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
      
      console.error('[ElevenLabs API Error]', response.status, errorDetail);
      
      // If the cached voice ID somehow became invalid/unauthorized, clear it for next attempt
      if (response.status === 401 || response.status === 403) {
        cachedVoiceId = null;
      }

      return NextResponse.json({ 
        error: errorDetail?.detail?.message || errorDetail?.message || 'ElevenLabs synthesis failure.',
        status: response.status,
        code: 'API_ERROR'
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
    console.error('[TTS Gateway] Internal Fault:', error);
    return NextResponse.json({ 
      error: 'Internal server error occurred while processing TTS.',
      details: error.message 
    }, { status: 500 });
  }
}
