import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway (Free Plan Optimized).
 * Dynamically selects accessible premade voices for Free tier API usage.
 */

// Cache the selected voice ID to reduce API overhead
let cachedVoiceId: string | null = null;

async function getAvailableVoice(apiKey: string): Promise<string> {
  if (cachedVoiceId) return cachedVoiceId;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) throw new Error('Failed to fetch ElevenLabs voices');

    const data = await response.json();
    const voices = data.voices || [];

    // Filter for female voices that are "premade" (Standard voices accessible on Free plan)
    // Preference: 1. Conversational 2. Female 3. English
    const eligibleVoice = voices.find((v: any) => 
      v.category === 'premade' && 
      v.labels?.gender === 'female' && 
      (v.labels?.accent === 'indian' || v.labels?.description?.toLowerCase().includes('conversational'))
    ) || voices.find((v: any) => 
      v.category === 'premade' && 
      v.labels?.gender === 'female'
    ) || voices.find((v: any) => v.category === 'premade');

    if (!eligibleVoice) {
      // Fallback to a known stable premade ID if the list is empty/restricted
      return 'Xb7hHqWq15UaYAn73Jc0'; // Alice (Premade)
    }

    cachedVoiceId = eligibleVoice.voice_id;
    console.log(`[TTS Gateway] Selected API-accessible voice: ${eligibleVoice.name} (${cachedVoiceId})`);
    return cachedVoiceId!;
  } catch (error) {
    console.warn('[TTS Gateway] Voice discovery failed, using standard fallback.');
    return 'Xb7hHqWq15UaYAn73Jc0'; // Alice
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
      console.error('[TTS Gateway] ELEVENLABS_API_KEY is not configured on the server.');
      return NextResponse.json({ 
        error: 'Neural voice configuration missing. ELEVENLABS_API_KEY not found in environment.',
        code: 'MISSING_API_KEY'
      }, { status: 500 });
    }

    // Dynamic Voice Selection for Free Plan compatibility
    const voiceId = await getAvailableVoice(apiKey);
    const modelId = 'eleven_flash_v2_5';

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
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
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
      
      return NextResponse.json({ 
        error: errorDetail?.detail?.message || errorDetail?.message || 'ElevenLabs synthesis failure.',
        status: response.status,
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
    console.error('[TTS Gateway] Internal Fault:', error);
    return NextResponse.json({ 
      error: 'Internal server error occurred while processing TTS.',
      details: error.message 
    }, { status: 500 });
  }
}
