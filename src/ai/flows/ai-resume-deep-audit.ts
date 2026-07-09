
'use server';
/**
 * @fileOverview Nexvoro AI Deep Resume Auditor.
 * Conducts a multi-dimensional high-fidelity audit of professional documents.
 * Produces structured intelligence for scoring, rewriting, and predictive matching.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeDeepAuditInputSchema = z.object({
  resumeDataUri: z.string().describe("Base64 encoded resume file data URI."),
  targetRole: z.string().optional().default("Software Engineer"),
});
export type ResumeDeepAuditInput = z.infer<typeof ResumeDeepAuditInputSchema>;

const ResumeDeepAuditOutputSchema = z.object({
  atsScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  skillsScore: z.object({
    technical: z.number().min(0).max(100),
    soft: z.number().min(0).max(100),
    projects: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    education: z.number().min(0).max(100),
    atsFormatting: z.number().min(0).max(100),
  }),
  summaryImprovement: z.object({
    current: z.string(),
    improved: z.string(),
  }),
  experienceSuggestions: z.array(z.object({
    original: z.string(),
    improved: z.string(),
    reasons: z.string(),
  })),
  projectSuggestions: z.array(z.object({
    name: z.string(),
    original: z.string(),
    improved: z.string(),
    metricsAdded: z.string(),
  })),
  skillsSuggestions: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    certifications: z.array(z.string()),
  }),
  formattingIssues: z.array(z.string()),
  companyPrediction: z.record(z.string(), z.number()),
  finalFeedback: z.string(),
  improvedResume: z.object({
    summary: z.string(),
    experience: z.array(z.string()),
    projects: z.array(z.string()),
    skills: z.array(z.string()),
  }),
});
export type ResumeDeepAuditOutput = z.infer<typeof ResumeDeepAuditOutputSchema>;

export async function deepAuditResume(input: ResumeDeepAuditInput): Promise<ResumeDeepAuditOutput> {
  return resumeDeepAuditFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeDeepAuditPrompt',
  input: { schema: ResumeDeepAuditInputSchema },
  output: { schema: ResumeDeepAuditOutputSchema },
  prompt: `You are an elite AI HR Auditor and ATS Expert at a Tier-1 Tech Firm.
Your mission is to conduct a multi-dimensional neural audit of the provided resume against the requirements for a "{{{targetRole}}}".

INSTRUCTIONS:
1. Deeply analyze the resume content provided in the media part.
2. Calculate a precise ATS Score (0-100).
3. Identify exactly which keywords are missing for a top-tier "{{{targetRole}}}".
4. Provide comprehensive improvements for every experience node and project node. 
5. Use measurable achievements and action verbs in improved versions.
6. Predict match percentages for major companies (Google, Amazon, Microsoft, etc.).
7. Generate an "Improved Resume" object that contains rewritten, ATS-optimized content.

REWRITE RULES:
- Focus on IMPACT, not just tasks.
- Include metrics (%, $, time) where implied.
- Use professional engineering terminology.

Resume Document: {{media url=resumeDataUri}}`,
});

const resumeDeepAuditFlow = ai.defineFlow(
  {
    name: 'resumeDeepAuditFlow',
    inputSchema: ResumeDeepAuditInputSchema,
    outputSchema: ResumeDeepAuditOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural synthesis of deep audit failed.");
      return output;
    } catch (error) {
      console.error("Deep Audit Flow Error:", error);
      throw error;
    }
  }
);
