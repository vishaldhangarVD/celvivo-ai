import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * Standard Google AI Studio keys (starting with AIza or AQ) are supported.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});

// Server-side check for API Key presence
if (typeof window === 'undefined') {
  const hasKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    console.warn(' [Nexvoro AI] WARNING: No Gemini API Key detected. AI features will use mock fallbacks. Ensure GOOGLE_GENAI_API_KEY is set in your .env file.');
  }
}
