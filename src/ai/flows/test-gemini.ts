'use server';
/**
 * @fileOverview Emergency diagnostic flow to verify Gemini API connectivity.
 */

import { ai } from '@/ai/genkit';

export async function runGeminiTest() {
  try {
    console.log('[Diagnostic] Initializing Gemini Connectivity Test...');
    const response = await ai.generate({
      prompt: "Reply with only these words: GEMINI WORKING",
    });
    
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
