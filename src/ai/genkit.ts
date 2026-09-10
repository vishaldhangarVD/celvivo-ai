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
 * Using 'gemini-1.5-flash' as the verified stable model.
 */
export const PRIMARY_MODEL = 'googleai/gemini-1.5-flash';
export const FALLBACK_MODEL = 'googleai/gemini-1.5-flash';

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
      provider: data.provider || 'gemini',
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
 * Optimized for gemini-1.5-flash execution with exponential backoff for 503/Overload and 429/RateLimit errors.
 */
export async function runWithResilience(promptFn: any, input: any, metadata?: any) {
  const delays = [1000, 2000, 4000]; // Standard backoff for internal server errors
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        console.log(`[Neural] Executing: ${model} (Attempt ${i + 1}/4)`);
        const result = await promptFn(input, { model, metadata });
        
        if (result?.usage) {
          // Add metadata intelligence: Extract feature, userId, and sessionId if not explicitly provided
          const feature = metadata?.feature || promptFn.name || 'unknown';
          const userId = metadata?.userId || input?.userId;
          const sessionId = metadata?.sessionId || input?.sessionId;

          logGeminiUsage({
            userId,
            sessionId,
            feature,
            model: model,
            inputTokens: result.usage.promptTokenCount,
            outputTokens: result.usage.candidatesTokenCount
          });
        }
        
        return result;
      } catch (e: any) {
        const status = e.status || e.code;
        const message = e.message || "";
        
        // 429 Rate Limit Logic
        if (status === 429 && i < 3) {
          const match = message.match(/retry in (\d+\.?\d*)s/i);
          let delay = match ? parseFloat(match[1]) * 1000 : 20000; // Parse Google's suggested wait or default to 20s
          
          console.warn(`[Gemini] 429 Rate Limit Hit. Free-tier quota exceeded. Waiting ${Math.ceil(delay/1000)}s before attempt ${i + 2}/4...`);
          await new Promise(r => setTimeout(r, delay + 500)); // Add 500ms safety buffer
          continue;
        }

        const isOverloaded = status === 503 || message.includes("UNAVAILABLE") || message.includes("high demand");

        console.warn(`[Neural] Attempt ${i + 1} Failed for ${model}:`, e.message);

        if ((isOverloaded || retryableStatuses.includes(status)) && i < 3) {
          const delay = delays[i];
          console.log(`[Gemini] Retry attempt ${i + 2} after ${isOverloaded ? 'overload' : status}, waiting ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw e;
      }
    }
  }

  return await attemptExecution(PRIMARY_MODEL);
}