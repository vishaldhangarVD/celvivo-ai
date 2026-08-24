import { NextResponse } from 'next/server';
import wav from 'wav';

/**
 * @fileOverview Resilient TTS Gateway v25.0.
 * Primary: ElevenLabs (High-fidelity).
 * Fallback: Google Gemini 2.5 Flash TTS (Unlimited reliability).
 * Optimized for seamless transition during quota exhaustion.
 */

let cachedVoiceId: null | string = null;
const BLOCKED_VOICE_IDS = ['4uN5YeBITFJsw8t45RIV'];

/**
 * Converts raw PCM audio data into a valid WAV buffer.
 * Gemini TTS returns raw PCM (24kHz, 16-bit, Mono).
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

/**
 * Fallback TTS implementation using Google Gemini.
 */
async function tryGeminiTTS(text: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const apiKey = (
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_GENAI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    ''
  ).trim();

  if (!apiKey) {
    console.warn("[TTS Fallback] Gemini API Key missing from environment.");
    return null;
  }

  try {
    console.log("[TTS] Attempting Gemini Fallback Protocol...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      console.error("[TTS Fallback] Gemini API rejected request:", await response.text());
      return null;
    }

    const data = await response.json();
    const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioBase64) {
      console.error("[TTS Fallback] Gemini response contains no audio nodes.");
      return null;
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = await pcmToWav(pcmBuffer);
    
    console.log("[TTS] Used provider: Gemini fallback (Success)");
    return { 
      buffer: wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength),
      contentType: 'audio/wav' 
    };

  } catch (error) {
    console.error("[TTS Fallback] Gemini synthesis fault:", error);
    return null;
  }
}

async function getAvailableVoice(apiKey: string): Promise<string> {
  if (cachedVoiceId) return cachedVoiceId;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    const voices = data.voices || [];

    const accessibleVoices = voices.filter((v: any) => 
      !BLOCKED_VOICE_IDS.includes(v.voice_id) && 
      v.category === 'premade'
    );

    if (accessibleVoices.length === 0) return 'Xb7hHahR8z74MCNeywV1';

    const femaleVoices = accessibleVoices.filter((v: any) => 
      v.labels?.gender === 'female' || v.name.toLowerCase().includes('female')
    );

    let eligibleVoice = femaleVoices.find((v: any) => {
      const name = v.name.toLowerCase();
      return name.includes('indian') || name.includes('rachel') || name.includes('alice');
    });

    if (!eligibleVoice) eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : accessibleVoices[0];

    cachedVoiceId = eligibleVoice.voice_id;
    return cachedVoiceId!;
  } catch (error) {
    console.error('[ElevenLabs] Voice discovery fault:', error);
    return 'Xb7hHahR8z74MCNeywV1'; 
  }
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text node missing.' }, { status: 400 });
    }
    text = body.text;

    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenApiKey) throw new Error("ElevenLabs Key Missing");

    const voiceId = await getAvailableVoice(elevenApiKey);
    const modelId = 'eleven_flash_v2_5';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenApiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
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
      console.warn(`[ElevenLabs] Error ${response.status}: ${errorText}`);
      
      // Trigger Gemini Fallback for auth/quota errors
      const fallback = await tryGeminiTTS(text);
      if (fallback) {
        return new NextResponse(fallback.buffer, {
          headers: { 'Content-Type': fallback.contentType },
        });
      }

      return NextResponse.json({ 
        error: 'TTS Failure',
        details: 'ElevenLabs failed and Gemini fallback is unavailable.'
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("[TTS] Used provider: ElevenLabs");

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[TTS Gateway] ElevenLabs Path Exception:', error.message);
    
    // Final attempt with Gemini fallback in case of exceptions
    const finalFallback = await tryGeminiTTS(text);
    if (finalFallback) {
      return new NextResponse(finalFallback.buffer, {
        headers: { 'Content-Type': finalFallback.contentType },
      });
    }

    return NextResponse.json({ error: 'Internal gateway error.' }, { status: 500 });
  }
}
