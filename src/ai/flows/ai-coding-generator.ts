'use server';
/**
 * @fileOverview Nexvoro AI Coding Challenge Architect.
 * Dynamically synthesizes unique, high-fidelity algorithmic challenges based on 
 * candidate profile and target company using Google Gemini.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CodingProblemSchema = z.object({
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
    c: z.string(),
    csharp: z.string(),
    go: z.string(),
    rust: z.string(),
  }),
  hiddenTestCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })),
});

export type CodingProblem = z.infer<typeof CodingProblemSchema>;

const CodingGenerationInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const CodingGenerationOutputSchema = z.object({
  question: CodingProblemSchema,
});

export async function generateCodingQuestion(input: z.infer<typeof CodingGenerationInputSchema>) {
  return codingGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codingGenerationPrompt',
  input: { schema: CodingGenerationInputSchema },
  output: { schema: CodingGenerationOutputSchema },
  prompt: `You are an elite Senior Staff Software Engineer at {{{company}}}.
Your objective is to architect a UNIQUE, high-fidelity algorithmic coding challenge for a {{{role}}} candidate at the {{{experienceLevel}}} level.

CHALLENGE CALIBRATION:
1. DIFFICULTY: The question MUST be "{{{difficulty}}}" level.
2. FIRM PERSONA: Calibrate the problem style to {{{company}}}. (e.g., Google: Graphs/Trees, Amazon: Scale/Optimization).
3. STARTER CODE: Provide idiomatic starter templates for ALL 8 languages (Java, Python, JavaScript, C++, C, C#, Go, Rust).
4. HIDDEN VERIFICATION: Provide exactly 5 hidden test cases with expected outputs. Ensure the outputs are string-comparable.

Return a strictly structured JSON matching the output schema. No conversational text.`,
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
      if (!output || !output.question) throw new Error("Coding synthesis failed.");
      return output;
    } catch (error) {
      console.error("[Coding Generator] Neural Failure:", error);
      throw error;
    }
  }
);
