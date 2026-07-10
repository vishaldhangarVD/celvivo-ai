'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Generator.
 * Dynamically synthesizes logic nodes for the screening phase using Gemini.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  question: z.string().describe("The text of the question."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options."),
  answer: z.string().describe("The exact text of the correct option."),
  category: z.enum(['Quantitative Aptitude', 'Logical Reasoning', 'English Communication']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const AptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  resumeSummary: z.string().optional(),
});

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema).length(15),
});

export async function generateAptitudeTest(input: z.infer<typeof AptitudeInputSchema>) {
  return aptitudeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aptitudeGeneratorPrompt',
  input: { schema: AptitudeInputSchema },
  output: { schema: AptitudeOutputSchema },
  prompt: `You are an elite Recruitment Architect at a global IT firm.
Generate a fresh set of exactly 15 aptitude questions for a candidate with the following profile:

Role: {{{role}}}
Target Company: {{{company}}}
Experience Level: {{{experienceLevel}}}
Resume Context: {{{resumeSummary}}}

Simulation Protocols:
1. QUANTITATIVE (5 Nodes): Focus on numerical logic, percentages, and speed-distance relative to the engineering level.
2. LOGICAL (5 Nodes): Focus on patterns, series, and analytical deductions.
3. VERBAL (5 Nodes): Focus on semantic accuracy, professional grammar, and executive communication.

Calibration Guidelines:
- Difficulty Distribution: 5 Easy, 5 Medium, 5 Hard.
- Seniority Alignment: If experience is 5+ years, nodes should focus on complex systems thinking and strategic logic. If Fresher, focus on core mathematical and reasoning speed.
- Firm Persona: Calibrate question style to the target company ({{{company}}}).
- Correct Answer Strategy: Ensure the 'answer' field matches exactly one of the entries in the 'options' array.
- Return ONLY valid JSON.`,
});

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlow',
    inputSchema: AptitudeInputSchema,
    outputSchema: AptitudeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Aptitude synthesis failed.");
      return output;
    } catch (error) {
      console.error("Aptitude Flow Error:", error);
      throw error;
    }
  }
);
