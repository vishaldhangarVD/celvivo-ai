'use server';
/**
 * @fileOverview An AI agent for analyzing resumes.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AiResumeAnalysisInput - The input type for the analyzeResume function.
 * - AiResumeAnalysisOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiResumeAnalysisInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type (e.g., application/pdf, text/plain) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetRole: z
    .string()
    .describe(
      "The target job role for which the resume is being analyzed (e.g., 'Frontend Developer', 'Data Scientist')."
    ),
});
export type AiResumeAnalysisInput = z.infer<
  typeof AiResumeAnalysisInputSchema
>;

const AiResumeAnalysisOutputSchema = z.object({
  atsScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'An ATS (Applicant Tracking System) compatibility score for the resume, from 0 to 100.'
    ),
  skillAnalysis: z
    .array(
      z.object({
        skill: z.string().describe('The name of the skill.'),
        proficiency: z
          .string()
          .describe(
            'The assessed proficiency level for the skill (e.g., "Beginner", "Intermediate", "Advanced", "Expert").'
          ),
      })
    )
    .describe('A detailed analysis of skills present in the resume.'),
  missingSkills: z
    .array(z.string())
    .describe(
      'A list of essential skills for the target role that are missing or under-represented in the resume.'
    ),
  improvementSuggestions: z
    .array(z.string())
    .describe(
      'Actionable suggestions to improve the resume for the specified target role.'
    ),
});
export type AiResumeAnalysisOutput = z.infer<
  typeof AiResumeAnalysisOutputSchema
>;

export async function analyzeResume(
  input: AiResumeAnalysisInput
): Promise<AiResumeAnalysisOutput> {
  return aiResumeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiResumeAnalysisPrompt',
  input: {schema: AiResumeAnalysisInputSchema},
  output: {schema: AiResumeAnalysisOutputSchema},
  prompt: `You are an expert HR recruiter and an Applicant Tracking System (ATS) specializing in analyzing resumes for specific job roles.
Your task is to analyze the provided resume against the requirements for a "{{targetRole}}" position.

Based on the resume content and the target role, provide the following:
1.  An ATS compatibility score (0-100), indicating how well the resume is optimized for Applicant Tracking Systems and the specified role.
2.  A detailed skill analysis, listing key skills found and their assessed proficiency levels.
3.  A list of crucial skills that are typically expected for a "{{targetRole}}" but appear to be missing or under-represented in the resume.
4.  Actionable suggestions for improving the resume to better match the "{{targetRole}}" and increase its ATS score.

Resume: {{media url=resumeDataUri}}`,
});

const aiResumeAnalysisFlow = ai.defineFlow(
  {
    name: 'aiResumeAnalysisFlow',
    inputSchema: AiResumeAnalysisInputSchema,
    outputSchema: AiResumeAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate resume analysis output.');
    }
    return output;
  }
);
