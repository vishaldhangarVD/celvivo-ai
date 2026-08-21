import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway v20.0.
 * Optimized for error propagation and quota transparency.
 */

let cachedVoiceId: null | string = null;
const BLOCKED_VOICE_IDS = ['4uN5YeBITFJsw8t45RIV'];

async function getAvailableVoice(apiKey: string): Promise<string> {
  if (cachedVoiceId) return cachedVoiceId;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ElevenLabs voices: ${response.status}`);
    }

    const data = await response.json();
    const voices = data.voices || [];

    const accessibleVoices = voices.filter((v: any) => 
      !BLOCKED_VOICE_IDS.includes(v.voice_id) && 
      v.category === 'premade'
    );

    if (accessibleVoices.length === 0) {
      return 'Xb7hHahR8z74MCNeywV1'; // Alice (Premade Fallback)
    }

    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    let eligibleVoice = femaleVoices.find((v: any) => {
      const name = v.name.toLowerCase();
      return name.includes('indian') || name.includes(' rachel') || name.includes('alice');
    });

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
      return NextResponse.json({ error: 'ElevenLabs API Key missing in environment.' }, { status: 500 });
    }

    const voiceId = await getAvailableVoice(apiKey);
    const modelId = 'eleven_flash_v2_5'; // Fast, cost-efficient model

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
            speed: 0.90
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs API Error Response]:', errorText);
      
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        parsedError = { details: errorText };
      }

      // Propagate specific quota errors
      return NextResponse.json({ 
        error: 'ElevenLabs API Error',
        details: parsedError.detail?.message || parsedError.detail?.status || errorText,
        status: response.status
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[ElevenLabs Gateway Fatal]:', error);
    return NextResponse.json({ error: 'Internal gateway error.' }, { status: 500 });
  }
}