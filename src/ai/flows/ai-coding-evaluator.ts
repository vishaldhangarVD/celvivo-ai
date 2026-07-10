'use server';
/**
 * @fileOverview Nexvoro AI Syntax Auditor.
 * Evaluates implementation code, time complexity, and architectural decisions.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CodingEvaluationInputSchema = z.object({
  problem: z.any(),
  code: z.string(),
  language: z.string(),
  executionOutput: z.string(),
  executionError: z.string().optional(),
});

const CodingEvaluationOutputSchema = z.object({
  score: z.number(),
  readabilityScore: z.number(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  optimizationTips: z.array(z.string()),
  bestPractices: z.array(z.string()),
  status: z.enum(['Pass', 'Fail']),
  finalRecommendation: z.string(),
});

export async function evaluateCodingSubmission(input: z.infer<typeof CodingEvaluationInputSchema>) {
  return codingEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codingEvaluationPrompt',
  input: { schema: CodingEvaluationInputSchema },
  output: { schema: CodingEvaluationOutputSchema },
  prompt: `You are an elite Senior Staff Engineer auditing a technical assessment submission.
Evaluate the following solution implementation.

PROBLEM:
{{{problem.title}}} - {{{problem.description}}}

CANDIDATE SOLUTION ({{{language}}}):
{{{code}}}

EXECUTION TELEMETRY:
{{{executionOutput}}}
{{#if executionError}}ERRORS: {{{executionError}}}{{/if}}

AUDIT REQUIREMENTS:
1. Logic Check: Does the code solve the problem efficiently?
2. Complexity: Provide Big-O for Time and Space.
3. Scalability: Would this code break at enterprise scale?
4. Quality: Rate readability and best practices.
5. Decision: 'Pass' requires clean logic and efficient complexity.

Return a structured audit report.`,
});

const codingEvaluationFlow = ai.defineFlow(
  {
    name: 'codingEvaluationFlow',
    inputSchema: CodingEvaluationInputSchema,
    outputSchema: CodingEvaluationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Syntax audit failed.");
      return output;
    } catch (error) {
      console.error("Coding Evaluation Error:", error);
      // Deterministic fallback if AI fails
      return {
        score: 70,
        readabilityScore: 75,
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        strengths: ["Solution implemented", "Language constraints handled"],
        weaknesses: ["Deep optimization audit unavailable"],
        optimizationTips: ["Review Big-O constraints"],
        bestPractices: ["Modularize logic further"],
        status: input.executionError ? 'Fail' : 'Pass',
        finalRecommendation: "Manual review recommended due to neural sync timeout."
      } as any;
    }
  }
);
