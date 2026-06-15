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
    console.log(`[STATUS] Resilient Neural Protocol v2.0 Live.`);
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
  const delays = [2000, 5000, 10000];
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        // Genkit 1.x prompt calling with model override
        return await promptFn(input, { model });
      } catch (e: any) {
        const status = e.status || e.code;
        if (i < 3 && retryableStatuses.includes(status)) {
          console.warn(`[Neural Resilience] AI server is busy, retrying attempt ${i + 1} with ${model}...`);
          await new Promise(r => setTimeout(r, delays[i]));
          continue;
        }
        throw e;
      }
    }
  }

  try {
    return await attemptExecution(PRIMARY_MODEL);
  } catch (primaryError) {
    console.warn(`[Neural Fallback] Primary model failed. Initiating fallback to ${FALLBACK_MODEL}...`);
    try {
      return await attemptExecution(FALLBACK_MODEL);
    } catch (finalError) {
      console.error("[Neural Critical] Resilience pipeline exhausted.");
      throw new Error("Gemini is currently overloaded. Please try again in a few minutes.");
    }
  }
}
