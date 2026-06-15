'use server';
/**
 * @fileOverview An AI agent for analyzing resumes with detailed extraction and ATS scoring.
 * This flow uses Google AI Gemini 2.5 Flash to conduct a high-fidelity audit of professional documents.
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
  prompt: `You are an elite HR auditor and ATS (Applicant Tracking System) expert. 
Your mission is to conduct a multi-dimensional neural audit of the provided resume against the requirements for a "{{targetRole}}".

Instructions:
1. Extract personal identifiers and professional history.
2. Calculate a precise ATS Compatibility Index (0-100) based on modern hiring benchmarks.
3. Identify exactly which technical nodes are missing for a top-tier "{{targetRole}}".
4. Analyze existing skills and assign proficiency tiers (Beginner to Expert).
5. Provide high-impact optimization suggestions to improve market leveling.

Resume Document: {{media url=resumeDataUri}}`,
});

const aiResumeAnalysisFlow = ai.defineFlow(
  {
    name: 'aiResumeAnalysisFlow',
    inputSchema: AiResumeAnalysisInputSchema,
    outputSchema: AiResumeAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      
      if (!output) {
        throw new Error('Neural core failed to synthesize analysis. Verify API key and document format.');
      }
    
      return output;
    } catch (error: any) {
      console.error('\n--- [Genkit Critical Failure] ---');
      console.error('[Error Type]', error.name || 'UNKNOWN_ERROR');
      console.error('[Status Code]', error.status || error.code || 'UNKNOWN');
      console.error('[Detailed message]', error.message);
      
      if (error.message?.includes('401')) {
        console.error('[Diagnostic] AUTHENTICATION_FAILURE: Check your API Key.');
      } else if (error.message?.includes('404')) {
        console.error('[Diagnostic] MODEL_NOT_FOUND: Verify model identifier in genkit.ts');
      }
      
      console.error('---------------------------------\n');
      throw error;
    }
  }
);
