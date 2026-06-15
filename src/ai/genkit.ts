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
  console.log('\n--- [Nexvoro AI] Authentication Diagnostic ---');
  console.log(`[Variable Presence]`);
  console.log(`- GOOGLE_GENAI_API_KEY: ${process.env.GOOGLE_GENAI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GEMINI_API_KEY:       ${process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GOOGLE_API_KEY:       ${process.env.GOOGLE_API_KEY ? 'EXISTS' : 'MISSING'}`);
  
  if (!apiKey) {
    console.error('[CRITICAL FAILURE] No authorization token found in .env. All AI simulations will fail with 401.');
    console.log('[ACTION REQUIRED] Please add GOOGLE_GENAI_API_KEY="your_key_here" to your .env file.');
  } else {
    const activeVar = process.env.GOOGLE_GENAI_API_KEY ? 'GOOGLE_GENAI_API_KEY' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY';
    console.log(`[Active Load] Loaded identity from: ${activeVar}`);
    console.log(`[Key Format] Detected prefix: ${apiKey.substring(0, 2)}...`);
    
    if (!apiKey.startsWith('AQ') && !apiKey.startsWith('AIza')) {
      console.warn('[WARNING] Key does not match standard AQ or AIza formats. Verification may fail.');
    } else {
      console.log('[STATUS] Valid key format detected. Ready for neural simulation.');
    }
  }
  console.log('-----------------------------------------------\n');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash', // Updated to supported high-performance model
});
