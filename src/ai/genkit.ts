import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance initialized with the Google AI plugin.
 * Optimized for Google AI Studio 'AQ' and 'AIza' keys.
 * Includes server-side diagnostics and resilient execution wrappers.
 */

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Global Model Protocol
export const PRIMARY_MODEL = 'googleai/gemini-2.5-flash';
export const FALLBACK_MODEL = 'googleai/gemini-2.0-flash';

// Runtime Diagnostic Sequence (Server-side only)
if (typeof window === 'undefined') {
  console.log('\n--- [Nexvoro AI] Authentication Diagnostic ---');
  console.log(`[Variable Presence]`);
  console.log(`- GOOGLE_GENAI_API_KEY: ${process.env.GOOGLE_GENAI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GEMINI_API_KEY:       ${process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GOOGLE_API_KEY:       ${process.env.GOOGLE_API_KEY ? 'EXISTS' : 'MISSING'}`);
  
  if (!apiKey) {
    console.error('[CRITICAL FAILURE] No authorization token found in .env. All AI simulations will fail with 401.');
  } else {
    const activeVar = process.env.GOOGLE_GENAI_API_KEY ? 'GOOGLE_GENAI_API_KEY' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY';
    console.log(`[Active Load] Loaded identity from: ${activeVar}`);
    console.log(`[STATUS] Resilient Neural Protocol v2.5 Live. Target Model: ${PRIMARY_MODEL}`);
  }
  console.log('-----------------------------------------------\n');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: PRIMARY_MODEL,
});

/**
 * Resilient execution wrapper for Genkit Prompts.
 * Implements exponential backoff and model fallback.
 */
export async function runWithResilience(promptFn: any, input: any) {
  const delays = [3000, 7000, 15000]; // Increased for hard quota hits
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        return await promptFn(input, { model });
      } catch (e: any) {
        const status = e.status || e.code;
        
        // Log the specific error for debugging
        if (status === 429) {
          console.warn(`[Neural Quota] Gemini ${model} is exhausted. Attempt ${i + 1}/3...`);
        } else {
          console.warn(`[Neural Resilience] Server Error ${status} from ${model}. Retrying...`);
        }

        if (i < 3 && retryableStatuses.includes(status)) {
          await new Promise(r => setTimeout(r, delays[i]));
          continue;
        }
        throw e;
      }
    }
  }

  try {
    return await attemptExecution(PRIMARY_MODEL);
  } catch (primaryError: any) {
    // If it's a 429, maybe try the fallback model immediately or after a short wait
    console.warn(`[Neural Fallback] Primary model failure (${primaryError.status || primaryError.code}). Trying ${FALLBACK_MODEL}...`);
    try {
      return await attemptExecution(FALLBACK_MODEL);
    } catch (finalError: any) {
      console.error("[Neural Critical] Resilience pipeline exhausted.");
      throw finalError;
    }
  }
}
