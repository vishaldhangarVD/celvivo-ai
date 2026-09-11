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
 * Optimized for gemini-3.6-flash execution with exponential backoff for 503/Overload and 429/RateLimit errors.
 */
export async function runWithResilience(promptFn: any, input: any, metadata?: any) {
  const delays = [1000, 2000, 4000]; // Standard backoff for internal server errors
  const retryableStatuses = [429, 500, 502, 503, 504];

  async function attemptExecution(model: string) {
    for (let i = 0; i <= 3; i++) {
      try {
        console.log(`[Neural] Executing Turn: ${model} (Attempt ${i + 1}/4)`);
        const result = await promptFn(input, { model, metadata });
        
        if (result?.usage) {
          // Standardize metadata extraction
          const feature = metadata?.feature || 'unspecified_flow';
          const userId = metadata?.userId || input?.userId;
          const sessionId = metadata?.sessionId || input?.sessionId;

          const tokens = getTokens(result.usage);

          // LOGGING PROTOCOL: Record the interaction telemetry
          await logUsage({
            userId,
            sessionId,
            feature,
            model: model,
            inputTokens: tokens.input,
            outputTokens: tokens.output,
            provider: 'gemini'
          });
        }
        
        return result;
      } catch (e: any) {
        const status = e.status || e.code;
        const message = e.message || "";
        
        if (status === 429 && i < 3) {
          const match = message.match(/retry in (\d+\.?\d*)s/i);
          let delay = match ? parseFloat(match[1]) * 1000 : 20000;
          console.warn(`[Gemini] 429 Rate Limit. Waiting ${Math.ceil(delay/1000)}s...`);
          await new Promise(r => setTimeout(r, delay + 500));
          continue;
        }

        const isOverloaded = status === 503 || message.includes("UNAVAILABLE") || message.includes("high demand");
        console.warn(`[Neural] Attempt ${i + 1} Failed:`, e.message);

        if ((isOverloaded || retryableStatuses.includes(status)) && i < 3) {
          const delay = delays[i];
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw e;
      }
    }
  }

  return await attemptExecution(PRIMARY_MODEL);
}
