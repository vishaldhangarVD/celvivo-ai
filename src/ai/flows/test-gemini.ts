'use server';
/**
 * @fileOverview Resilient diagnostic flow to verify Gemini API connectivity.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const testPrompt = ai.definePrompt({
  name: 'testSignalPrompt',
  input: { schema: z.any() },
  prompt: "Reply with only these words: GEMINI WORKING"
});

export async function runGeminiTest() {
  try {
    console.log('[Diagnostic] Initializing Resilient Gemini Connectivity Test...');
    
    const response = await runWithResilience(testPrompt, {});
    
    console.log('[Diagnostic] SUCCESS. Response Received.');
    return { 
      success: true, 
      data: response.text 
    };
  } catch (err: any) {
    console.error('[Diagnostic] CRITICAL FAILURE:', err);
    return { 
      success: false, 
      error: err.message || 'Unknown Neural Error',
      details: err.status || err.code || 'N/A'
    };
  }
}
