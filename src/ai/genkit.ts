import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';
import { logUsage } from '@/services/usage-logger';

// Ensure environment variables are loaded for server-side AI initialization
if (typeof window === 'undefined') {
  config();
}

/**
 * Global Model Protocol.
 * Using 'gemini-3.6-flash' as the verified stable model for this environment.
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

export const ai = genkit({
  plugins: [
    googleAI(apiKey ? { apiKey } : {}),
  ],
  model: PRIMARY_MODEL,
});

/**
 * Robust token extraction helper.
 * Handles various field name permutations in Genkit/SDK response objects.
 */
function getTokens(usage: any): { input: number; output: number } {
  if (!usage) return { input: 0, output: 0 };
  
  const input = 
    usage.inputTokens ?? 
    usage.promptTokens ?? 
    usage.promptTokenCount ?? 
    usage.prompt_tokens ?? 
    0;
    
  const output = 
    usage.outputTokens ?? 
    usage.completionTokens ?? 
    usage.candidatesTokens ?? 
    usage.candidatesTokenCount ?? 
    usage.completion_tokens ?? 
    0;
    
  return { input, output };
}

/**
 * Resilient execution wrapper.
 * Reduced retry complexity to prevent Gateway Timeouts.
 * Decouples usage logging from AI retries.
 */
export async function runWithResilience(promptFn: any, input: any, metadata?: any) {
  // Reduced to 2 attempts (1 retry) to stay within Firebase Studio gateway limits
  const MAX_ATTEMPTS = 2;
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        console.log(`[Neural] Executing Turn: ${model} (Attempt ${i + 1}/${MAX_ATTEMPTS})`);
        const startTime = Date.now();
        const result = await promptFn(input, { model, metadata });
        const duration = Date.now() - startTime;
        
        console.log(`[Neural] Success: ${metadata?.feature || 'turn'} completed in ${duration}ms`);

        // Asynchronous non-blocking usage logging
        if (result?.usage) {
          const feature = metadata?.feature || 'unspecified_flow';
          const userId = metadata?.userId || input?.userId || 'anonymous';
          const sessionId = metadata?.sessionId || input?.sessionId || 'unknown';
          const tokens = getTokens(result.usage);

          // FIRE-AND-FORGET: No await, catch errors internally to prevent AI retries
          logUsage({
            userId,
            sessionId,
            feature,
            model: model,
            inputTokens: tokens.input,
            outputTokens: tokens.output,
            provider: 'gemini'
          }).catch(logError => {
            // Log only, do not throw. 403s here should not break the user flow.
            console.warn(`[UsageLogger] Telemetry suppressed (Code ${logError.code || 'unknown'}).`);
          });
        }
        
        return result;
      } catch (e: any) {
        const status = e.status || e.code || 500;
        const message = e.message || "Unknown Provider Error";
        const isLastAttempt = i === MAX_ATTEMPTS - 1;

        console.warn(`[Neural Warning] Batch ${metadata?.batch || ''} Attempt ${i + 1} Failed. Status: ${status}`);

        if (!isLastAttempt) {
          // If it's a 429, wait briefly. If it's a 504, it's likely we've already lost the client connection.
          if (status === 429) {
            const delay = 2000; 
            console.log(`[Gemini] Rate Limit hit. Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }

          if (retryableStatuses.includes(status)) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
        }

        // Final failure log
        console.error(`[Neural Critical] Final attempt failed for ${metadata?.feature || 'unknown'}. Status: ${status} | Msg: ${message}`);
        throw e;
      }
    }
  }

  return await attemptExecution(PRIMARY_MODEL);
}
