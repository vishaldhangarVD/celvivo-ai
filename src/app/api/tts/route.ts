import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure ElevenLabs TTS Gateway.
 * Receives text and returns high-fidelity audio data using the Navya Kannan voice.
 * Keeps the API key protected on the server.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text node missing from payload.' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('[TTS Gateway] ELEVENLABS_API_KEY is not configured.');
      return NextResponse.json({ error: 'Neural voice configuration missing.' }, { status: 500 });
    }

    // ElevenLabs Configuration
    const voiceId = '4uN5YeBITFJsw8t45RIV'; // Navya Kannan - Conversational
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
      console.error('[ElevenLabs API Error]', response.status, errorText);
      return NextResponse.json({ error: 'Neural synthesis failure.' }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error) {
    console.error('[TTS Gateway] Internal Fault:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
