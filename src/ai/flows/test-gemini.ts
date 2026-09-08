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
  const startTime = Date.now();
  try {
    console.log('[Diagnostic] Initializing Resilient Gemini Connectivity Test...');
    
    const response = await runWithResilience(testPrompt, {});
    // Defensive check to ensure startTime is a valid number before calculation
    const latency = typeof startTime === 'number' ? Date.now() - startTime : 0;
    
    console.log('[Diagnostic] SUCCESS. Response Received.');
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
      status: err.status || err.code || '500',
      details: err.details || 'N/A'
    };
  }
}
