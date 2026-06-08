import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * It explicitly checks for common API key environment variables to ensure
 * compatibility with different deployment environments.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
