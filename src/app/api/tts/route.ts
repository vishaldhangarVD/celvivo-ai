import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway (Optimized for Professional Indian English).
 * Dynamically selects the best available female Indian English voice for the current API account.
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

    // Filter for female voices that are "premade" or professional clones
    const femaleVoices = voices.filter((v: any) => 
      v.labels?.gender === 'female'
    );

    // Priority 1: Direct accent match in labels (Indian English, en-IN)
    let eligibleVoice = femaleVoices.find((v: any) => 
      v.labels?.accent?.toLowerCase().includes('indian') || 
      v.labels?.language?.toLowerCase() === 'en-in' ||
      v.labels?.description?.toLowerCase().includes('indian english')
    );

    // Priority 2: Indian identifier in name or description
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.find((v: any) => 
        v.name?.toLowerCase().includes('indian') || 
        v.description?.toLowerCase().includes('indian')
      );
    }

    // Priority 3: Professional/Conversational fallback with neutral accent capability
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices.find((v: any) => 
        v.name === 'Alice' || v.name === 'Rachel' || v.name === 'Matilda'
      );
    }

    // Priority 4: Closest available female premade
    if (!eligibleVoice) {
      eligibleVoice = femaleVoices[0];
    }

    if (!eligibleVoice) {
      console.warn('[TTS Gateway] No ideal voices found, using system fallback.');
      return 'Xb7hHqWq15UaYAn73Jc0'; // Alice (Premade)
    }

    cachedVoiceId = eligibleVoice.voice_id;
    console.log(`[TTS Gateway] Selected optimized voice: ${eligibleVoice.name} (${cachedVoiceId})`);
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

    // Dynamic Voice Selection for Indian English professional tone
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
            stability: 0.55, // Calibrated for clear, professional interview speech
            similarity_boost: 0.80, // Maintains voice character integrity
            style: 0.10, // Neutral professional style
            use_speaker_boost: true,
            speaking_rate: 0.90 // Reduced speed for professional clarity
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
