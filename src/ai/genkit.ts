import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Ensure environment variables are loaded for server-side AI initialization
if (typeof window === 'undefined') {
  config();
}

/**
 * Genkit instance initialized with the Google AI plugin.
 * Optimized for current Gemini 2.5 production models.
 * Includes server-side diagnostics and resilient execution wrappers.
 */

const apiKey = (
  process.env.GOOGLE_GENAI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  ''
).trim();

// Global Model Protocol - Updated to currently supported stable IDs (2.5 Tier)
export const PRIMARY_MODEL = 'googleai/gemini-2.5-flash';
export const FALLBACK_MODEL = 'googleai/gemini-2.5-pro';

// Runtime Diagnostic Sequence (Server-side only)
if (typeof window === 'undefined') {
  console.log('\n--- [Nexvoro AI] Authentication Diagnostic ---');
  if (!apiKey) {
    console.warn('[WARNING] No API key found. AI flows will fail.');
  } else {
    console.log(`[STATUS] Resilient Neural Protocol Live. Target Model: ${PRIMARY_MODEL}`);
  }
  console.log('-----------------------------------------------\n');
}

/**
 * Helper to log Gemini usage data asynchronously.
 */
async function logGeminiUsage(data: any) {
  try {
    const { firestore } = initializeFirebase();
    await addDoc(collection(firestore, 'usage_logs'), {
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error("[Usage Middleware] Error:", e);
  }
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
export async function runWithResilience(promptFn: any, input: any, metadata?: any) {
  const delays = [3000, 10000, 20000];
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        const result = await promptFn(input, { model, metadata });
        
        // Log successful usage
        if (result?.usage) {
          logGeminiUsage({
            userId: metadata?.userId,
            sessionId: metadata?.sessionId,
            feature: metadata?.feature || 'unknown',
            model: model,
            inputTokens: result.usage.promptTokenCount,
            outputTokens: result.usage.candidatesTokenCount
          });
        }
        
        return result;
      } catch (e: any) {
        const status = e.status || e.code;
        if (status === 429) {
          const quotaDelay = i === 0 ? 5000 : 15000;
          if (i < 3) {
            await new Promise(r => setTimeout(r, quotaDelay));
            continue;
          }
        } else if (i < 3 && retryableStatuses.includes(status)) {
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
    console.warn(`[Neural Fallback] Primary model failure (${primaryError.status}). Trying ${FALLBACK_MODEL}...`);
    try {
      return await attemptExecution(FALLBACK_MODEL);
    } catch (finalError: any) {
      console.error("[Neural Critical] Resilience pipeline exhausted.");
      throw finalError;
    }
  }
}
