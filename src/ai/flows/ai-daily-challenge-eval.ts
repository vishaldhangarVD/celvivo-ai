
'use server';
/**
 * @fileOverview Genkit flow for evaluating daily interview challenge answers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluationInputSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
});
export type EvaluationInput = z.infer<typeof EvaluationInputSchema>;

const EvaluationOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  improvementTips: z.array(z.string()),
});
export type EvaluationOutput = z.infer<typeof EvaluationOutputSchema>;

export async function evaluateDailyChallenge(input: EvaluationInput): Promise<EvaluationOutput> {
  return evaluateDailyChallengeFlow(input);
}

const evaluateDailyChallengeFlow = ai.defineFlow(
  {
    name: 'evaluateDailyChallengeFlow',
    inputSchema: EvaluationInputSchema,
    outputSchema: EvaluationOutputSchema,
  },
  async (input) => {
    // In a real scenario, we would call a Genkit prompt here.
    // Mocking for testing consistent with other flows.
    
    const wordCount = input.answer.trim().split(/\s+/).length;
    let score = Math.min(40 + wordCount * 2, 95);
    
    if (wordCount < 10) score = 30;

    return {
      score,
      feedback: "Your response demonstrates a good understanding of the core concept. You maintained professional terminology throughout.",
      improvementTips: [
        "Include more specific real-world examples to substantiate your claims.",
        "Focus on quantifyable impact when describing outcomes.",
        "Ensure a more structured introduction-body-conclusion format."
      ]
    };
  }
);
