import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * Optimized for Google AI Studio 'AQ' and 'AIza' keys.
 */

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Server-side diagnostic check for environment variables
if (typeof window === 'undefined') {
  console.log('--- [Nexvoro AI] Authentication Diagnostic ---');
  console.log(`GOOGLE_GENAI_API_KEY: ${process.env.GOOGLE_GENAI_API_KEY ? 'DETECTED (starts with ' + process.env.GOOGLE_GENAI_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'DETECTED (starts with ' + process.env.GEMINI_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  console.log(`GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? 'DETECTED (starts with ' + process.env.GOOGLE_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  
  if (!apiKey) {
    console.error('CRITICAL ERROR: No API Key found in environment variables. Gemini calls will fail with 401.');
  } else {
    console.log('Active Protocol: Using ' + (process.env.GOOGLE_GENAI_API_KEY ? 'GOOGLE_GENAI_API_KEY' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY'));
  }
  console.log('--------------------------------------------');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
