
'use server';
/**
 * @fileOverview Resilient diagnostic flow to verify Gemini API connectivity.
 */

import { ai, runWithResilience, PRIMARY_MODEL } from '@/ai/genkit';
import { z } from 'genkit';

const testPrompt = ai.definePrompt({
  name: 'testSignalPrompt',
  input: { schema: z.any() },
  prompt: "Reply with exactly this text: GEMINI CONNECTION SUCCESSFUL"
});

export async function runGeminiTest() {
  // Defensive initialization of startTime to prevent "undefined" reading in global performance utilities
  const startTime = typeof Date !== 'undefined' ? Date.now() : 0;
  
  try {
    const response = await runWithResilience(testPrompt, {});
    
    // Safety check for startTime calculation
    const current = Date.now();
    const latency = current - (startTime || current);
    
    return { 
      success: true, 
      data: response.text,
      model: PRIMARY_MODEL,
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    console.error('[Diagnostic] CRITICAL FAILURE:', err);
    return { 
      success: false, 
      error: err.message || 'Unknown Neural Error',
      status: err.status || err.code || '500'
    };
  }
}
