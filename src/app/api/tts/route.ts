import { NextResponse } from 'next/server';
import wav from 'wav';

/**
 * @fileOverview Resilient TTS Gateway v26.2.
 * Primary: ElevenLabs (High-fidelity).
 * Fallback: Google Gemini 1.5 Flash TTS (Multi-modal Stability).
 * Fix: Explicit query param authentication for Gemini.
 */

let cachedVoiceId: null | string = null;
const BLOCKED_VOICE_IDS = ['4uN5YeBITFJsw8t45RIV'];

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

  // Diagnostic: Log key presence only
  console.log(`[TTS Fallback] GEMINI_API_KEY Present: ${!!apiKey}`);

  if (!apiKey) {
    return { buffer: new ArrayBuffer(0), contentType: "", error: "No Gemini/Google API Key found in environment." };
  }

  try {
    // Gemini 1.5 Flash supports AUDIO modality in v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
        // CRITICAL: Do NOT include Authorization headers here for Google REST API with key param
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
      console.error(`[TTS Fallback API Error] Status: ${response.status}`, errorBody);
      return { buffer: new ArrayBuffer(0), contentType: "", error: `Google API Error (${response.status}): ${errorBody}` };
    }

    const data = await response.json();
    const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioBase64) {
      console.error("[TTS Fallback] No inline audio data in Gemini response:", JSON.stringify(data).substring(0, 500));
      return { buffer: new ArrayBuffer(0), contentType: "", error: "Gemini response contained no audio data candidate." };
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = await pcmToWav(pcmBuffer);
    
    console.log("[TTS] Used provider: Gemini Fallback (Success)");
    return { 
      buffer: wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength),
      contentType: 'audio/wav' 
    };

  } catch (error: any) {
    console.error("[TTS Fallback Exception]:", error.message);
    return { buffer: new ArrayBuffer(0), contentType: "", error: error.message };
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

    let eligibleVoice = femaleVoices.length > 0 ? femaleVoices[0] : accessibleVoices[0];

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
    const text = body.text;
    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    
    if (elevenApiKey && elevenApiKey.length > 5) {
      try {
        const voiceId = await getAvailableVoice(elevenApiKey);
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
              model_id: 'eleven_flash_v2_5',
              voice_settings: { stability: 0.65, similarity_boost: 0.80, style: 0.05, use_speaker_boost: true, speed: 0.90 },
            }),
          }
        );

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          console.log("[TTS] Used provider: ElevenLabs (Success)");
          return new NextResponse(audioBuffer, {
            headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store, max-age=0' },
          });
        } else {
          const errorText = await response.text();
          console.warn(`[TTS] ElevenLabs failed (Status ${response.status}):`, errorText);
        }
      } catch (e: any) {
        console.warn("[TTS] ElevenLabs path exception:", e.message);
      }
    }

    console.log("[TTS] Transitioning to Gemini Fallback Protocol...");
    const fallbackResult = await tryGeminiTTS(text);
    if (fallbackResult && fallbackResult.buffer.byteLength > 0) {
      return new NextResponse(fallbackResult.buffer, {
        headers: { 'Content-Type': fallbackResult.contentType },
      });
    }

    return NextResponse.json({ 
      error: 'TTS Failure',
      details: `ElevenLabs failed and Gemini fallback is unavailable. Detail: ${fallbackResult?.error || 'Unknown Error'}`
    }, { status: 500 });

  } catch (error: any) {
    console.error('[TTS Gateway] Unhandled Exception:', error.message);
    return NextResponse.json({ error: 'Internal gateway error.', details: error.message }, { status: 500 });
  }
}
