'use server';
/**
 * @fileOverview Genkit flow for generating professional AI cover letters.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CoverLetterInputSchema = z.object({
  companyName: z.string(),
  jobRole: z.string(),
  jobDescription: z.string().optional(),
  userSkills: z.array(z.string()).optional(),
  experienceHighlights: z.array(z.string()).optional(),
});
export type CoverLetterInput = z.infer<typeof CoverLetterInputSchema>;

const CoverLetterOutputSchema = z.object({
  generatedLetter: z.string(),
});
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput> {
  return coverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: { schema: CoverLetterInputSchema },
  output: { schema: CoverLetterOutputSchema },
  prompt: `You are an expert career coach and professional writer.
Synthesize a high-fidelity, ATS-friendly cover letter for the following role:

Company: {{{companyName}}}
Role: {{{jobRole}}}
Job Description Context: {{{jobDescription}}}

Use the following user intelligence nodes to personalize the letter:
Skills: {{#each userSkills}}{{{this}}}, {{/each}}
Experience Highlights: {{#each experienceHighlights}}{{{this}}} {{/each}}

Guidelines:
1. Professional, confident, and strategic tone.
2. Focus on quantifyable impact and technical mastery.
3. Align user skills with company goals.
4. Keep it concise (under 400 words).`,
});

const coverLetterFlow = ai.defineFlow(
  {
    name: 'coverLetterFlow',
    inputSchema: CoverLetterInputSchema,
    outputSchema: CoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error("Narrative synthesis failed.");
    return output;
  }
);
