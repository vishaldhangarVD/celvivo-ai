import { NextResponse } from 'next/server';
import wav from 'wav';

/**
 * @fileOverview Resilient TTS Gateway v26.2.
 * Primary: Gemini 1.5 Flash TTS (Multi-modal Stability).
 * ElevenLabs integration is permanently disabled.
 */

async function pcmToWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs)));

    writer.write(pcmData);
    writer.end();
  });
}

async function tryGeminiTTS(text: string): Promise<{ buffer: ArrayBuffer; contentType: string; error?: string } | null> {
  const apiKey = (
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_GENAI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    ''
  ).trim();

  if (!apiKey) {
    return { buffer: new ArrayBuffer(0), contentType: "", error: "No Gemini/Google API Key found in environment." };
  }

  try {
    // FIX: Pass API Key as query parameter to avoid "ACCESS_TOKEN_TYPE_UNSUPPORTED" error
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" } 
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[TTS API Error] Status: ${response.status}`, errorBody);
      return { buffer: new ArrayBuffer(0), contentType: "", error: `Google API Error (${response.status}): ${errorBody}` };
    }

    const data = await response.json();
    const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioBase64) {
      console.error("[TTS Fallback] No inline audio data in Gemini response");
      return { buffer: new ArrayBuffer(0), contentType: "", error: "Gemini response contained no audio data candidate." };
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = await pcmToWav(pcmBuffer);
    
    console.log("[TTS] Successfully generated neural audio via Gemini");
    return { 
      buffer: wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength),
      contentType: 'audio/wav' 
    };

  } catch (error: any) {
    console.error("[TTS Fallback Exception]:", error.message);
    return { buffer: new ArrayBuffer(0), contentType: "", error: error.message };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text node missing.' }, { status: 400 });
    }
    const text = body.text;
    
    const ttsResult = await tryGeminiTTS(text);
    if (ttsResult && ttsResult.buffer.byteLength > 0) {
      return new NextResponse(ttsResult.buffer, {
        headers: { 'Content-Type': ttsResult.contentType },
      });
    }

    return NextResponse.json({ 
      error: 'TTS Failure',
      details: `Gemini vocalization protocol failed. Detail: ${ttsResult?.error || 'Unknown Error'}`
    }, { status: 500 });

  } catch (error: any) {
    console.error('[TTS Gateway] Unhandled Exception:', error.message);
    return NextResponse.json({ error: 'Internal gateway error.', details: error.message }, { status: 500 });
  }
}
