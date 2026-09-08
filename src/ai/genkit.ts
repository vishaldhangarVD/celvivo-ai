
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
 * Global Model Protocol.
 * Using 'gemini-3.6-flash' as the verified ground-truth model.
 */
export const PRIMARY_MODEL = 'googleai/gemini-3.6-flash';
export const FALLBACK_MODEL = 'googleai/gemini-3.6-flash';

const apiKey = (
  process.env.GOOGLE_GENAI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  ''
).trim();

if (typeof window === 'undefined') {
  console.log('\n--- [Nexvoro AI] Authentication Diagnostic ---');
  if (!apiKey) {
    console.warn('[WARNING] No API key found. AI flows will fail.');
  } else {
    console.log(`[STATUS] Resilient Neural Protocol Live. Target: ${PRIMARY_MODEL}`);
  }
  console.log('-----------------------------------------------\n');
}

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
 * Resilient execution wrapper.
 * Optimized for gemini-3.6-flash execution.
 */
export async function runWithResilience(promptFn: any, input: any, metadata?: any) {
  const delays = [2000, 5000, 10000];
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        console.log(`[Neural] Executing: ${model} (Attempt ${i + 1}/4)`);
        const result = await promptFn(input, { model, metadata });
        
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
        console.warn(`[Neural] Attempt ${i + 1} Failed for ${model}:`, e.message);

        if (status === 429 && i < 3) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        } else if (retryableStatuses.includes(status) && i < 3) {
          await new Promise(r => setTimeout(r, delays[i]));
          continue;
        }
        throw e;
      }
    }
  }

  return await attemptExecution(PRIMARY_MODEL);
}
