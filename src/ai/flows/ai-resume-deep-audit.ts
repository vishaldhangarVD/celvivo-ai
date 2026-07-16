'use server';
/**
 * @fileOverview Nexvoro AI Master Resume Intelligence Engine (v6.0).
 * Conducts a multi-dimensional high-fidelity audit of professional documents.
 * Calibrated for strict adherence to actual resume data and job role requirements.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeDeepAuditOutputSchema = z.object({
  candidateIdentity: z.object({
    name: z.string(),
    yearsOfExperience: z.number(),
    education: z.array(z.string()),
  }),
  overallScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  roleMatch: z.object({
    percentage: z.number().min(0).max(100),
    recommendation: z.enum(['Excellent Match', 'Good Match', 'Needs Improvement']),
  }),
  summary: z.string().describe("Professional summary based on resume content."),
  technicalSkills: z.array(z.object({
    skill: z.string(),
    proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  })),
  strengths: z.array(z.string()),
  missingSkills: z.array(z.string()),
  resumeProblems: z.array(z.string()).describe("Issues like missing metrics, poor formatting, etc."),
  improvementSuggestions: z.array(z.string()),
  keywordAnalysis: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  sectionScores: z.object({
    education: z.number(),
    skills: z.number(),
    projects: z.number(),
    experience: z.number(),
    certifications: z.number(),
    achievements: z.number(),
  }),
  recommendedRoles: z.array(z.string()),
  finalVerdict: z.string().describe("Recruiter-style conclusion and final strategic advice."),
  isOffline: z.boolean().optional().default(false),
});

export type ResumeDeepAuditOutput = z.infer<typeof ResumeDeepAuditOutputSchema>;

const ResumeDeepAuditInputSchema = z.object({
  resumeDataUri: z.string().describe("Base64 encoded resume file data URI."),
  targetRole: z.string().optional().default("Software Engineer"),
});

export async function deepAuditResume(input: z.infer<typeof ResumeDeepAuditInputSchema>): Promise<ResumeDeepAuditOutput> {
  return resumeDeepAuditFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeDeepAuditPrompt',
  input: { schema: ResumeDeepAuditInputSchema },
  output: { schema: ResumeDeepAuditOutputSchema },
  prompt: `You are the Nexvoro AI Master Recruiter and ATS Auditor.
Your objective is to perform a high-fidelity audit of the uploaded resume relative to the target role: "{{{targetRole}}}".

CORE PROTOCOL:
- Analyze ONLY the provided resume content.
- Do NOT generate fake or placeholder values. 
- Scores must be calculated realistically based on industry standards.
- Compare the resume skills and experience against the standard requirements of the "{{{targetRole}}}".

DATA VECTORS TO EXTRACT:
1. OVERALL SCORE: A weighted average of clarity, impact, and role alignment.
2. ATS SCORE: Evaluate formatting, keyword density, and scanability.
3. ROLE MATCH: Direct comparison with "{{{targetRole}}}".
4. TECHNICAL SKILLS: Identify every detected tech node and assign a proficiency level.
5. MISSING SKILLS: Identify critical gaps relative to the target role.
6. RESUME PROBLEMS: Flag specific issues like "No quantified metrics", "Missing LinkedIn", or "Weak project descriptions".
7. KEYWORD ANALYSIS: List specific industry keywords present and those missing.
8. SECTION SCORES: Score individual segments (Education, Skills, Projects, Experience, Certifications, Achievements) from 0-100.
9. FINAL VERDICT: A high-impact, professional recruiter summary.

RETURN ONLY VALID JSON matching the schema.

Resume:
{{media url=resumeDataUri}}`,
});

function getFallbackAudit(targetRole: string): ResumeDeepAuditOutput {
  return {
    candidateIdentity: {
      name: "IDENTIFIED_OPERATOR",
      yearsOfExperience: 3,
      education: ["B.S. in Computer Science"],
    },
    overallScore: 65,
    atsScore: 70,
    roleMatch: {
      percentage: 60,
      recommendation: "Needs Improvement",
    },
    summary: "A developing professional with core technical foundations. (Detailed AI synthesis unavailable in fallback mode).",
    technicalSkills: [
      { skill: "Core Engineering", proficiency: "Intermediate" },
      { skill: "Strategic Logic", proficiency: "Advanced" }
    ],
    strengths: ["Clear Project Descriptions", "Standard Academic Background"],
    missingSkills: ["Cloud Architecture", "Advanced System Design"],
    resumeProblems: ["Missing quantifiable achievements", "Low keyword density for target role"],
    improvementSuggestions: ["Add performance metrics to project nodes", "Integrate more ATS keywords"],
    keywordAnalysis: {
      matched: ["Development", "Project Management"],
      missing: ["AWS", "Microservices", "Docker"]
    },
    sectionScores: {
      education: 80,
      skills: 60,
      projects: 55,
      experience: 50,
      certifications: 30,
      achievements: 20
    },
    recommendedRoles: ["Junior Software Engineer", "Quality Analyst"],
    finalVerdict: "The resume shows potential but lacks the quantifiable impact required for elite tier placements. Focus on metrics and missing technical nodes.",
    isOffline: true
  };
}

const resumeDeepAuditFlow = ai.defineFlow(
  {
    name: 'resumeDeepAuditFlow',
    inputSchema: ResumeDeepAuditInputSchema,
    outputSchema: ResumeDeepAuditOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (output) return { ...output, isOffline: false };
      return getFallbackAudit(input.targetRole);
    } catch (error) {
      console.error('[Engine] Critical Fault:', error);
      return getFallbackAudit(input.targetRole);
    }
  }
);
