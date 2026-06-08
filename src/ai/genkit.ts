import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * It pulls the API key from environment variables (GOOGLE_GENAI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY).
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
