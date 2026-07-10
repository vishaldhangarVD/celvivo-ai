import { config } from 'dotenv';
config();

import '@/ai/flows/ai-interview-feedback.ts';
import '@/ai/flows/ai-learning-roadmap.ts';
import '@/ai/flows/ai-resume-analysis.ts';
import '@/ai/flows/ai-mock-interview-v2.ts';
import '@/ai/flows/ai-skill-gap-analysis.ts';
import '@/ai/flows/ai-cover-letter.ts';
import '@/ai/flows/ai-resume-deep-audit.ts';
import '@/ai/flows/ai-aptitude-generator.ts';
import '@/ai/flows/ai-aptitude-evaluator.ts';
import '@/ai/flows/ai-audio-synthesis.ts';
import '@/ai/flows/test-gemini.ts';
import { ai } from '@/ai/genkit';

// Neural Sanity Check on Startup
(async () => {
  if (process.env.NODE_ENV === 'development' && (process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY)) {
    try {
      console.log('[Sanity Check] Verifying Neural Connection...');
      const response = await ai.generate({
        prompt: 'Identify the main objective of Nexvoro AI in one sentence.',
      });
      console.log('[Sanity Check] SUCCESS. Response:', response.text);
    } catch (e: any) {
      console.error('[Sanity Check] FAILED. Model could not be reached.');
      console.error('[Error Detail]', e.message || e);
    }
  }
})();
