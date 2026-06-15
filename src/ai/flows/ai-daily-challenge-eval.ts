'use server';
/**
 * @fileOverview Genkit flow for evaluating daily interview challenge answers.
 */

import { ai, runWithResilience } from '@/ai/genkit';
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

const evaluationPrompt = ai.definePrompt({
  name: 'evaluationPrompt',
  input: { schema: EvaluationInputSchema },
  output: { schema: EvaluationOutputSchema },
  prompt: `You are an expert technical interviewer at a top-tier tech firm.
Evaluate the following candidate response to a daily challenge question.

Category: {{{category}}}
Question: {{{question}}}
Candidate Answer: {{{answer}}}

Guidelines:
1. Provide a score out of 100 based on accuracy, depth, and communication.
2. Provide constructive, professional feedback.
3. Suggest 3 specific improvement tips.`,
});

const evaluateDailyChallengeFlow = ai.defineFlow(
  {
    name: 'evaluateDailyChallengeFlow',
    inputSchema: EvaluationInputSchema,
    outputSchema: EvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(evaluationPrompt, input);
    if (!output) throw new Error("Daily intelligence audit failed.");
    return output;
  }
);
