import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

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
    console.log("Mime Type:", part.inlineData.mimeType);
    console.log("Data Length:", part.inlineData.data.length);
    return Response.json({
      mimeType: part.inlineData.mimeType,
      dataLength: part.inlineData.data.length,
    });

    //const audioBuffer = Buffer.from(part.inlineData.data, "base64");

    //return new Response(audioBuffer, {
      //headers: {
        //"Content-Type": "audio/wav",
      //},
    //});
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "TTS failed" },
      { status: 500 }
    );
  }
}