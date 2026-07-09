
'use server';
/**
 * @fileOverview Nexvoro AI Deep Resume Auditor.
 * Conducts a multi-dimensional high-fidelity audit of professional documents.
 * Produces structured intelligence for scoring, rewriting, and predictive matching.
 * Includes automatic retry on validation failure and a deterministic fallback engine.
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
  isOffline: z.boolean().optional().default(false),
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
6. Predict match percentages for major companies (Google, Amazon, Microsoft, Meta, IBM, etc.).
7. Generate an "improvedResume" object that contains rewritten, ATS-optimized content.

REWRITE RULES:
- Focus on IMPACT, not just tasks.
- Include metrics (%, $, time) where implied.
- Use professional engineering terminology.

Resume Document: {{media url=resumeDataUri}}`,
});

function getFallbackAudit(targetRole: string): ResumeDeepAuditOutput {
  console.warn('[AUDIT FALLBACK] Generating deterministic intelligence nodes.');
  return {
    atsScore: 68,
    strengths: ["Strong technical core detected", "Effective section hierarchy"],
    weaknesses: ["Missing quantified impact metrics", "Keyword density below Tier-1 threshold"],
    missingKeywords: ["Distributed Systems", "Cloud-Native Architecture", "Kubernetes", "CI/CD Pipelines"],
    skillsScore: {
      technical: 75,
      soft: 80,
      projects: 60,
      experience: 65,
      education: 90,
      atsFormatting: 85
    },
    summaryImprovement: {
      current: "Experienced professional seeking opportunities in tech.",
      improved: "Strategic Software Engineer specialized in architecting scalable distributed systems and optimizing high-throughput API layers for global enterprise applications."
    },
    experienceSuggestions: [
      {
        original: "Responsible for developing the frontend using React.",
        improved: "Engineered 12+ modular React components using TypeScript, achieving a 40% reduction in client-side bundle size and improving lighthouse scores by 25 points.",
        reasons: "Added measurable KPIs and specific technology depth."
      }
    ],
    projectSuggestions: [
      {
        name: "Cloud Project",
        original: "Built a deployment tool.",
        improved: "Architected an automated CI/CD pipeline using GitHub Actions and AWS Lambda, reducing deployment lead time from 2 hours to 8 minutes.",
        metricsAdded: "93% reduction in deployment latency"
      }
    ],
    skillsSuggestions: {
      technical: ["Next.js", "Redis", "Kafka", "Docker"],
      soft: ["Cross-functional Leadership", "Architectural Decision Making"],
      certifications: ["AWS Solutions Architect", "CKAD"]
    },
    formattingIssues: ["Consider increasing line spacing in experience sections for readability."],
    companyPrediction: {
      "Google": 45,
      "Amazon": 62,
      "Microsoft": 58,
      "Accenture": 82,
      "TCS": 88
    },
    finalFeedback: "Your profile is solid for mid-market firms but requires significant quantification of achievements to pass elite Big Tech filters. Focus on adding exact percentages to your impact nodes.",
    improvedResume: {
      summary: "High-performance engineer focused on cloud-native excellence.",
      experience: ["Lead Developer at Tech Hub: Optimized database indexing, resulting in a 50% faster query execution time across 1M+ records."],
      projects: ["Neural Pulse: AI-driven telemetry dashboard built with Genkit and Gemini."],
      skills: ["React", "TypeScript", "Go", "AWS", "Terraform"]
    },
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
    console.log('[Flow] Initializing Deep Audit for:', input.targetRole);
    
    // Internal Retry Logic for Validation/Model Flakiness
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Flow] Execution Attempt ${attempt}/2...`);
        const { output } = await runWithResilience(prompt, input);
        
        if (output) {
          console.log('[Flow] Neural Synthesis Successful.');
          return {
            ...output,
            isOffline: false
          };
        }
      } catch (error: any) {
        console.warn(`[Flow] Attempt ${attempt} failed:`, error.message || error);
        if (attempt === 2) break;
      }
    }

    console.error('[Flow] All attempts exhausted. Reverting to fallback protocol.');
    return getFallbackAudit(input.targetRole || "Software Engineer");
  }
);
