import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Ensure environment variables are loaded for server-side AI initialization
if (typeof window === 'undefined') {
  config();
}

/**
 * Genkit instance initialized with the Google AI plugin.
 * Optimized for Google AI Studio 'AQ.' prefix keys and legacy 'AIza' keys.
 * Includes server-side diagnostics and resilient execution wrappers.
 */

const apiKey = (
  process.env.GOOGLE_GENAI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  ''
).trim();

// Global Model Protocol
export const PRIMARY_MODEL = 'googleai/gemini-3.1-flash-lite';
export const FALLBACK_MODEL = 'googleai/gemini-3.5-flash';

// Runtime Diagnostic Sequence (Server-side only)
if (typeof window === 'undefined') {
  console.log('\n--- [Nexvoro AI] Authentication Diagnostic ---');
  console.log(`[Variable Presence]`);
  console.log(`- GOOGLE_GENAI_API_KEY: ${process.env.GOOGLE_GENAI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GEMINI_API_KEY:       ${process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING'}`);
  console.log(`- GOOGLE_API_KEY:       ${process.env.GOOGLE_API_KEY ? 'EXISTS' : 'MISSING'}`);
  
  if (!apiKey) {
    console.warn('[WARNING] No API key found in environment variables. Genkit will attempt to use default credentials.');
  } else {
    const isAQKey = apiKey.startsWith('AQ');
    const activeVar = process.env.GOOGLE_GENAI_API_KEY ? 'GOOGLE_GENAI_API_KEY' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY';
    const keyPreview = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'INVALID_LENGTH';
    
    console.log(`[Active Load] Loaded identity from: ${activeVar}`);
    console.log(`[Key Preview] ${keyPreview}`);
    console.log(`[Key Type] ${isAQKey ? 'New-Gen (AQ. prefix)' : 'Legacy (AIza prefix)'} detected.`);
    console.log(`[STATUS] Resilient Neural Protocol Live. Target Model: ${PRIMARY_MODEL}`);
  }
  console.log('-----------------------------------------------\n');
}

export const ai = genkit({
  plugins: [
    googleAI(apiKey ? { apiKey } : {}),
  ],
  model: PRIMARY_MODEL,
});

/**
 * Resilient execution wrapper for Genkit Prompts.
 * Implements exponential backoff and model fallback.
 */
export async function runWithResilience(promptFn: any, input: any) {
  const delays = [5000, 15000, 30000]; // Increased delays for better quota recovery
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        return await promptFn(input, { model });
      } catch (e: any) {
        const status = e.status || e.code;
        const message = e.message || String(e);
        
        // Detailed error logging for auth failures
        if (status === 400 || status === 401) {
          console.error(`[Neural Auth Failure] Model: ${model}, Status: ${status}, Message: ${message}`);
          throw e;
        }

        if (status === 429) {
          console.warn(`[Neural Quota] Gemini ${model} is exhausted. Attempt ${i + 1}/3...`);
          // For quota issues, we wait specifically longer
          const quotaDelay = i === 0 ? 10000 : i === 1 ? 25000 : 45000;
          if (i < 3) {
            await new Promise(r => setTimeout(r, quotaDelay));
            continue;
          }
        } else {
          console.warn(`[Neural Resilience] Server Error ${status} from ${model}. Retrying...`);
          if (i < 3 && retryableStatuses.includes(status)) {
            await new Promise(r => setTimeout(r, delays[i]));
            continue;
          }
        }
        throw e;
      }
    }
  }

  try {
    return await attemptExecution(PRIMARY_MODEL);
  } catch (primaryError: any) {
    // If primary was 429, wait a bit before trying fallback to avoid instant secondary throttle
    if (primaryError.status === 429) {
      await new Promise(r => setTimeout(r, 2000));
    }
    console.warn(`[Neural Fallback] Primary model failure. Trying ${FALLBACK_MODEL}...`);
    try {
      return await attemptExecution(FALLBACK_MODEL);
    } catch (finalError: any) {
      console.error("[Neural Critical] Resilience pipeline exhausted.");
      throw finalError;
    }
  }
}
