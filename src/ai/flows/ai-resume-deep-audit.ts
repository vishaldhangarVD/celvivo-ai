
'use server';
/**
 * @fileOverview Nexvoro AI Master Resume Intelligence Engine.
 * Conducts a multi-dimensional high-fidelity audit of professional documents.
 * Produces structured intelligence for scoring, risk assessment, and prep.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectDeepAnalysisSchema = z.object({
  name: z.string(),
  technologiesUsed: z.array(z.string()),
  purpose: z.string(),
  complexity: z.enum(['Low', 'Medium', 'High', 'Expert']),
  realWorldImpact: z.string(),
  possibleInterviewQuestions: z.array(z.string()),
  weakAreas: z.array(z.string()),
  strongAreas: z.array(z.string()),
  confidenceLevel: z.number().min(0).max(100),
});

const ResumeDeepAuditOutputSchema = z.object({
  candidateIdentity: z.object({
    name: z.string(),
    yearsOfExperience: z.number(),
    education: z.array(z.string()),
    leadershipExperience: z.array(z.string()),
    links: z.object({
      github: z.string().optional(),
      portfolio: z.string().optional(),
      linkedin: z.string().optional(),
    }),
  }),
  projectAnalysis: z.array(ProjectDeepAnalysisSchema),
  skillAudit: z.object({
    strong: z.array(z.string()),
    intermediate: z.array(z.string()),
    beginner: z.array(z.string()),
    missing: z.array(z.string()),
    outdated: z.array(z.string()),
    mostValuable: z.array(z.string()),
  }),
  atsAnalysis: z.object({
    overallScore: z.number().min(0).max(100),
    formattingScore: z.number(),
    keywordScore: z.number(),
    achievementScore: z.number(),
    actionVerbScore: z.number(),
    deductions: z.array(z.object({
      category: z.string(),
      deduction: z.number(),
      explanation: z.string(),
    })),
  }),
  roleMatch: z.object({
    matchPercentage: z.number(),
    missingTechnologies: z.array(z.string()),
    recommendedTechnologies: z.array(z.string()),
  }),
  interviewPreparation: z.object({
    technicalQuestions: z.array(z.string()).length(10),
    hrQuestions: z.array(z.string()).length(5),
    projectQuestions: z.array(z.string()).length(5),
    scenarioQuestions: z.array(z.string()).length(5),
  }),
  hiringRisk: z.object({
    weakSections: z.array(z.string()),
    questionableClaims: z.array(z.string()),
    unclearProjects: z.array(z.string()),
    missingNumbers: z.boolean(),
    missingAchievements: z.boolean(),
    riskSummary: z.string(),
  }),
  improvementRoadmap: z.object({
    resume: z.array(z.string()),
    projects: z.array(z.string()),
    skills: z.array(z.string()),
    certifications: z.array(z.string()),
    portfolio: z.array(z.string()),
  }),
  careerEvolution: z.array(z.object({
    topic: z.string(),
    priority: z.enum(['P0', 'P1', 'P2']),
    estimatedTime: z.string(),
    expectedImpact: z.string(),
  })),
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
  prompt: `You are the Nexvoro AI Resume Intelligence Engine. 
You are NOT an ATS scanner; you are a Senior Technical Recruiter, Engineering Manager, and Career Coach.
Deeply analyze the resume against the target role: "{{{targetRole}}}".

CORE PROTOCOL:
- Never guess. If information is missing, state it clearly in the Hiring Risk or Identity nodes.
- Audits must be rigorous. Deduct ATS points for missing metrics (%, $, time) or weak action verbs.
- Identify "Outdated Skills" based on current 2024+ industry standards.
- Generate interview questions anchored ONLY in the resume content.

PROJECT ANALYSIS:
- For every project, determine its architectural complexity and real-world impact.
- Provide a confidence level for each project based on the detail provided.

SKILL AUDIT:
- Segment skills by proficiency.
- Identify "Most Valuable Skills" relative to the target role.

RETURN ONLY VALID JSON.`,
});

function getFallbackAudit(targetRole: string): ResumeDeepAuditOutput {
  return {
    candidateIdentity: {
      name: "DETERMINISTIC_ENTITY",
      yearsOfExperience: 5,
      education: ["B.S. Computer Science"],
      leadershipExperience: ["Team Lead Node"],
      links: {}
    },
    projectAnalysis: [{
      name: "Core Scaling Engine",
      technologiesUsed: ["React", "Go"],
      purpose: "Infrastructure optimization",
      complexity: "High",
      realWorldImpact: "Reduced latency by 40%",
      possibleInterviewQuestions: ["How did you handle the state transition?"],
      weakAreas: ["Security documentation"],
      strongAreas: ["Concurrency logic"],
      confidenceLevel: 85
    }],
    skillAudit: {
      strong: ["TypeScript", "React"],
      intermediate: ["Docker"],
      beginner: ["Rust"],
      missing: ["AWS", "CI/CD"],
      outdated: ["jQuery"],
      mostValuable: ["System Design"]
    },
    atsAnalysis: {
      overallScore: 68,
      formattingScore: 80,
      keywordScore: 65,
      achievementScore: 60,
      actionVerbScore: 70,
      deductions: [{ category: "Achievements", deduction: 15, explanation: "Missing quantifiable metrics in 3/4 projects." }]
    },
    roleMatch: {
      matchPercentage: 72,
      missingTechnologies: ["Cloud Native"],
      recommendedTechnologies: ["Terraform"]
    },
    interviewPreparation: {
      technicalQuestions: Array(10).fill("Tell me about your approach to architecture."),
      hrQuestions: Array(5).fill("Why this role?"),
      projectQuestions: Array(5).fill("Walk me through your scaling project."),
      scenarioQuestions: Array(5).fill("How do you handle a production crash?")
    },
    hiringRisk: {
      weakSections: ["Certifications"],
      questionableClaims: ["None detected"],
      unclearProjects: ["Minor project 2"],
      missingNumbers: true,
      missingAchievements: false,
      riskSummary: "Profile is strong but lacks quantifiable evidence of impact."
    },
    improvementRoadmap: {
      resume: ["Add metrics"],
      projects: ["Open source the core"],
      skills: ["Learn AWS"],
      certifications: ["Solutions Architect"],
      portfolio: ["Add live demos"]
    },
    careerEvolution: [{
      topic: "Cloud Architecture",
      priority: "P0",
      estimatedTime: "30 days",
      expectedImpact: "High"
    }],
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
