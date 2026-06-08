'use server';
/**
 * @fileOverview An AI agent for analyzing resumes with detailed extraction and ATS scoring.
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
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }),
  atsScore: z.number().min(0).max(100),
  resumeQualityScore: z.number().min(0).max(100),
  technicalSkillsScore: z.number().min(0).max(100),
  keywordOptimizationScore: z.number().min(0).max(100),
  skillAnalysis: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    })
  ),
  sections: z.object({
    education: z.array(z.string()),
    projects: z.array(z.string()),
    experience: z.array(z.string()),
    certifications: z.array(z.string()),
    achievements: z.array(z.string()),
  }),
  missingSkills: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  roleMatches: z.array(
    z.object({
      role: z.string(),
      matchPercentage: z.number().min(0).max(100),
    })
  ).describe('Percentage match for various industry roles.'),
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
  prompt: `You are an expert HR recruiter and an Applicant Tracking System (ATS) specializing in analyzing resumes for high-stakes technical roles.
Your task is to analyze the provided resume against the requirements for a "{{targetRole}}" position.

Provide a high-fidelity audit including:
1. Extraction of personal info, education, projects, experience, certifications, and achievements.
2. ATS compatibility score and specific scores for quality, technical depth, and keyword density.
3. Detailed skill analysis and identification of missing nodes for the "{{targetRole}}".
4. Role match percentages for standard IT roles (Frontend, Backend, Full Stack, Data Scientist, DevOps, AI Engineer, Cyber Security).
5. Actionable optimization strategies.

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
