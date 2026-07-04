import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);

  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);

  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}
export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Speak this naturally in clear Indian English with a professional female interviewer voice:

${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore",
            },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (!part?.inlineData?.data) {
      return Response.json(
        { error: "No audio returned from Gemini." },
        { status: 500 }
      );
    }
    console.log("Mime:", part.inlineData.mimeType);
    console.log("Length:", part.inlineData.data.length);
    
    const pcmBuffer = Buffer.from(part.inlineData.data, "base64");

    const wavBuffer = pcmToWav(pcmBuffer);
    
    return new Response(wavBuffer, {
      headers: {
        "Content-Type": "audio/wav",
      },
    })
  } catch (err: any) {
    console.error("FULL ERROR:", err);
  
    return Response.json(
      {
        error: String(err),
        stack: err?.message,
      },
      { status: 500 }
    );
  }
};