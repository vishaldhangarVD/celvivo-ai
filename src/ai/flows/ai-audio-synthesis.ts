
'use server';
/**
 * @fileOverview Nexvoro AI Neural Voice Synthesis (TTS).
 * Unified with central PRIMARY_MODEL to ensure consistency.
 */

import { ai, PRIMARY_MODEL } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const AudioSynthesisInputSchema = z.object({
  text: z.string().describe("The text to be converted to speech."),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const AudioSynthesisOutputSchema = z.object({
  audioUri: z.string().describe("The generated audio as a data URI."),
});

export async function synthesizeAudio(text: string, userId?: string, sessionId?: string): Promise<string> {
  const result = await audioSynthesisFlow({ text, userId, sessionId });
  return result.audioUri;
}

const audioSynthesisFlow = ai.defineFlow(
  {
    name: 'audioSynthesisFlow',
    inputSchema: AudioSynthesisInputSchema,
    outputSchema: AudioSynthesisOutputSchema,
  },
  async (input) => {
    try {
      const { media } = await ai.generate({
        // Using central PRIMARY_MODEL for consistency
        model: PRIMARY_MODEL,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: input.text,
        metadata: {
          feature: 'tts',
          provider: 'gemini',
          userId: input.userId,
          sessionId: input.sessionId,
          characterCount: input.text.length
        }
      });

      if (!media) {
        throw new Error('Neural voice synthesis failed: No media returned.');
      }

      const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
      const audioBuffer = Buffer.from(pcmBase64, 'base64');
      const wavBase64 = await toWav(audioBuffer);

      return {
        audioUri: 'data:audio/wav;base64,' + wavBase64,
      };
    } catch (error) {
      console.error("Audio Synthesis Error:", error);
      throw error;
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
