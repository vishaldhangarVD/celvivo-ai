import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * Optimized for Google AI Studio 'AQ' and 'AIza' keys.
 * Includes server-side diagnostics to verify environment variable ingestion.
 */

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Runtime Diagnostic Sequence (Server-side only)
if (typeof window === 'undefined') {
  console.log('\n--- [Nexvoro AI] Runtime Identity Audit ---');
  console.log(`[Variable Status]`);
  console.log(`- GOOGLE_GENAI_API_KEY: ${process.env.GOOGLE_GENAI_API_KEY ? 'DETECTED (Prefix: ' + process.env.GOOGLE_GENAI_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  console.log(`- GEMINI_API_KEY:       ${process.env.GEMINI_API_KEY ? 'DETECTED (Prefix: ' + process.env.GEMINI_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  console.log(`- GOOGLE_API_KEY:       ${process.env.GOOGLE_API_KEY ? 'DETECTED (Prefix: ' + process.env.GOOGLE_API_KEY.substring(0, 2) + ')' : 'MISSING'}`);
  
  if (!apiKey) {
    console.error('[CRITICAL] No authorization token found. AI protocols will fail (401).');
  } else {
    const activeVar = process.env.GOOGLE_GENAI_API_KEY ? 'GOOGLE_GENAI_API_KEY' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY';
    console.log(`[Active Protocol] Ingesting token from: ${activeVar}`);
  }
  console.log('-------------------------------------------\n');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
