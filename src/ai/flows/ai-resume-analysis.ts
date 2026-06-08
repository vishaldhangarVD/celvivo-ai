'use server';
/**
 * @fileOverview An AI agent for analyzing resumes with detailed extraction and ATS scoring.
 * (MOCKED for testing)
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

// Keeping the prompt defined for future use but not calling it in the flow
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
    // MOCKED RESPONSE to avoid 403 Forbidden errors
    return {
      personalInfo: {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 555-0123"
      },
      atsScore: 85,
      resumeQualityScore: 90,
      technicalSkillsScore: 82,
      keywordOptimizationScore: 75,
      skillAnalysis: [
        { skill: "React", proficiency: "Expert" },
        { skill: "TypeScript", proficiency: "Advanced" },
        { skill: "Next.js", proficiency: "Advanced" },
        { skill: "Node.js", proficiency: "Intermediate" }
      ],
      sections: {
        education: ["B.S. Computer Science, University of Nexus"],
        projects: ["Nexvoro AI - Full-stack technical interview simulation platform"],
        experience: ["Senior Developer at TechGlobal (2021-Present)", "Software Engineer at StartupInc (2018-2021)"],
        certifications: ["AWS Certified Solutions Architect"],
        achievements: ["Reduced system latency by 40% using edge caching"]
      },
      missingSkills: ["GraphQL", "Docker", "Kubernetes"],
      improvementSuggestions: [
        "Quantify achievements with more specific metrics.",
        "Add more cloud-native deployment details.",
        "Include a stronger professional summary."
      ],
      roleMatches: [
        { role: input.targetRole, matchPercentage: 88 },
        { role: "Full Stack Developer", matchPercentage: 82 },
        { role: "Frontend Lead", matchPercentage: 91 }
      ]
    };
  }
);
