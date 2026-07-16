'use server';
/**
 * @fileOverview Nexvoro AI Coding Challenge Architect.
 * Synthesizes unique algorithmic challenges based on candidate profile and target company.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CodingProblemSchema = z.object({
  title: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  description: z.string(),
  constraints: z.array(z.string()),
  inputFormat: z.string(),
  outputFormat: z.string(),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  explanation: z.string(),
  starterCode: z.object({
    javascript: z.string(),
    python: z.string(),
    java: z.string(),
    cpp: z.string(),
  }),
});

const CodingInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  resumeSummary: z.string().optional(),
  aptitudePerformance: z.string().optional(),
});

export async function generateCodingChallenge(input: z.infer<typeof CodingInputSchema>) {
  return codingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codingGeneratorPrompt',
  input: { schema: CodingInputSchema },
  output: { schema: CodingProblemSchema },
  prompt: `You are an elite Software Engineering Architect at {{{company}}}.
Generate ONE unique, high-fidelity coding challenge for a {{{role}}} candidate ({{{experienceLevel}}} level).

CONTEXT:
- Candidate Resume: {{{resumeSummary}}}
- Aptitude Performance: {{{aptitudePerformance}}}

PROTOCOL:
1. FIRM STYLE: If Google, focus on complex algorithms/efficiency. If Amazon, focus on data structures/scale. If TCS, focus on implementation accuracy.
2. STARTER CODE: Provide clean starter functions for JS, Python, Java, and C++.
3. RETURN: ONLY valid JSON matching the schema.`,
});

const codingFlow = ai.defineFlow(
  {
    name: 'codingFlow',
    inputSchema: CodingInputSchema,
    outputSchema: CodingProblemSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Coding synthesis failed.");
      return output;
    } catch (error) {
      console.error("Coding Flow Error:", error);
      throw error;
    }
  }
);
