'use server';
/**
 * @fileOverview Nexvoro AI ATS Intelligence Flow.
 * Performs deep semantic comparison between a resume blueprint and a job description.
 * Calibrated for objective scoring and actionable remediation advice.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AtsCheckInputSchema = z.object({
  resumeData: z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    skills: z.array(z.string()),
    experience: z.array(z.any()),
    projects: z.array(z.any()),
    education: z.array(z.any()),
  }),
  jobDescription: z.string(),
});

const AtsCheckOutputSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string().describe("A short 2-4 word phrase like 'Strong Match' or 'Needs Alignment'."),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(z.string()).describe("2-4 short, specific, actionable tips to improve match."),
});

export async function runAtsCheck(input: z.infer<typeof AtsCheckInputSchema>) {
  return runAtsCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runAtsCheckPrompt',
  input: { schema: AtsCheckInputSchema },
  output: { schema: AtsCheckOutputSchema },
  prompt: `You are an ATS (Applicant Tracking System) resume screener. 
Compare the following resume against the job description. 

REQUISITION INTEL (Job Description):
{{{jobDescription}}}

CANDIDATE DOSSIER (Resume):
Name: {{{resumeData.name}}}
Target Role: {{{resumeData.role}}}
Summary: {{{resumeData.summary}}}
Skills: {{#each resumeData.skills}}{{{this}}}, {{/each}}

EXPERIENCE:
{{#each resumeData.experience}}
- {{{this.role}}} at {{{this.company}}} ({{{this.dates}}}): {{{this.bullets}}}
{{/each}}

PROJECTS:
{{#each resumeData.projects}}
- {{{this.name}}}: {{{this.desc}}}
{{/each}}

EDUCATION:
{{#each resumeData.education}}
- {{{this.degree}}} from {{{this.school}}} ({{{this.dates}}})
{{/each}}

### AUDIT REQUIREMENTS:
1. SCORE: Calculate a realistic 0-100 score based on keyword match, experience depth, and role alignment.
2. KEYWORDS: Identify specific technical and soft skills present in both, and critical ones missing from the resume.
3. SUGGESTIONS: Provide 2-4 highly specific tips (e.g., "Add 'Docker' to skills", "Quantify the Vaultly project impact").

Return ONLY a valid JSON object matching the schema.`,
});

const runAtsCheckFlow = ai.defineFlow(
  {
    name: 'runAtsCheckFlow',
    inputSchema: AtsCheckInputSchema,
    outputSchema: AtsCheckOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural auditor failed to respond.");
      return output;
    } catch (error) {
      console.error("[ATS Flow] Neural fault:", error);
      throw new Error("Couldn't complete the ATS check — please try again.");
    }
  }
);
