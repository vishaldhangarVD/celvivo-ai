'use server';
/**
 * @fileOverview AI flow for comparing user skills against role requirements using Resilient Gemini protocols.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const SkillGapInputSchema = z.object({
  targetRole: z.string(),
  userSkills: z.array(z.string()),
});
export type SkillGapInput = z.infer<typeof SkillGapInputSchema>;

const SkillGapOutputSchema = z.object({
  role: z.string(),
  skillMatchPercentage: z.number().min(0).max(100),
  existingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  criticalMissingSkills: z.array(z.string()),
  recommendedRoadmap: z.array(z.string()),
});
export type SkillGapOutput = z.infer<typeof SkillGapOutputSchema>;

export async function analyzeSkillGap(input: SkillGapInput): Promise<SkillGapOutput> {
  return skillGapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillGapPrompt',
  input: { schema: SkillGapInputSchema },
  output: { schema: SkillGapOutputSchema },
  prompt: `You are an expert recruiter and technical analyst.
Conduct a neural skill audit comparing the user's skills against standard requirements for a {{{targetRole}}}.

User Skills: {{#each userSkills}}{{{this}}}, {{/each}}

Tasks:
1. Identify required skills for {{{targetRole}}} in modern elite tech.
2. Determine which of those skills the user already possesses.
3. Identify the missing delta gaps.
4. Flag the 2 most critical missing nodes.
5. Calculate a match percentage.`,
});

const skillGapFlow = ai.defineFlow(
  {
    name: 'skillGapFlow',
    inputSchema: SkillGapInputSchema,
    outputSchema: SkillGapOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error("Skill gap calibration failure.");
    return output;
  }
);
