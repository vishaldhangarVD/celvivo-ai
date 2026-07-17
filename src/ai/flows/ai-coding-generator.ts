'use server';
/**
 * @fileOverview Nexvoro AI Coding Challenge Architect.
 * Dynamically synthesizes 5 unique, high-fidelity algorithmic challenges based on 
 * candidate profile and target company using Google Gemini.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CodingProblemSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.string(),
  problemStatement: z.string(),
  constraints: z.array(z.string()),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  explanation: z.string(),
  starterCode: z.object({
    java: z.string(),
    python: z.string(),
    javascript: z.string(),
    cpp: z.string(),
  }),
  hiddenTestCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })),
  timeLimit: z.string(),
  memoryLimit: z.string(),
});

export type CodingProblem = z.infer<typeof CodingProblemSchema>;

const CodingGenerationInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
});

const CodingGenerationOutputSchema = z.object({
  questions: z.array(CodingProblemSchema).length(5),
});

export async function generateCodingQuestions(input: z.infer<typeof CodingGenerationInputSchema>) {
  return codingGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codingGenerationPrompt',
  input: { schema: CodingGenerationInputSchema },
  output: { schema: CodingGenerationOutputSchema },
  prompt: `You are an elite Senior Staff Software Engineer at {{{company}}}.
Your objective is to architect EXACTLY 5 unique, HARD algorithmic coding challenges for a {{{role}}} candidate at the {{{experienceLevel}}} level.

Simulation Protocol:
1. FIRM CALIBRATION: If the company is Google, focus on complex trees/graphs and O(n) efficiency. If Amazon, focus on data structures, scale, and multi-variable constraints. If a startup, focus on practical logic and edge-case resilience.
2. DIFFICULTY: All 5 questions MUST be "Hard" (LeetCode Hard style).
3. VARIETY: Ensure questions cover different topics (e.g., Dynamic Programming, Graph Theory, Advanced Heaps, Sliding Window, Matrix Math).
4. STARTER CODE: Provide clean, industry-standard starter templates for Java, Python, JavaScript, and C++.
5. HIDDEN TEST CASES: Provide at least 3 hidden test cases per question to validate implementation logic.

Format: Return a strictly structured JSON matching the output schema. No conversational text.`,
});

const codingGenerationFlow = ai.defineFlow(
  {
    name: 'codingGenerationFlow',
    inputSchema: CodingGenerationInputSchema,
    outputSchema: CodingGenerationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output || !output.questions) throw new Error("Coding synthesis failed.");
      return output;
    } catch (error) {
      console.error("[Coding Generator] Neural Failure. Fallback mechanism required.", error);
      throw error;
    }
  }
);
