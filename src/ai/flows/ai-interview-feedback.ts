'use server';
/**
 * @fileOverview Nexvoro AI Master Performance Auditor (Elite v15.0).
 * Synthesizes the final comprehensive report from all interview rounds.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  interviewTranscript: z.string(),
  resumeContext: z.object({
    atsScore: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    missingSkills: z.array(z.string()),
  }).optional(),
  aptitudeContext: z.object({
    overallScore: z.number(),
    quantitative: z.number(),
    logical: z.number(),
    english: z.number(),
    status: z.string(),
  }).optional(),
  codingContext: z.object({
    score: z.number(),
    readability: z.number(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
    status: z.string(),
  }).optional(),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

const InterviewFeedbackOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  interviewReadiness: z.number().min(0).max(100),
  hiringRecommendation: z.enum(['Excellent', 'Good', 'Average', 'Needs Improvement']),
  
  virtualInterviewResult: z.object({
    technicalKnowledge: z.number(),
    communication: z.number(),
    confidence: z.number(),
    hrSkills: z.number(),
    problemSolving: z.number(),
    professionalism: z.number(),
  }),

  aiFeedback: z.object({
    performanceSummary: z.string(),
    strongSkills: z.array(z.string()),
    weakSkills: z.array(z.string()),
    mistakesMade: z.array(z.string()),
    suggestedImprovements: z.array(z.string()),
  }),

  skillGap: z.object({
    missingSkills: z.array(z.string()),
    criticalGaps: z.array(z.string()),
  }),

  learningPlan: z.object({
    topicsToStudy: z.array(z.string()),
    codingPractice: z.array(z.string()),
    interviewPractice: z.array(z.string()),
    resumeImprovements: z.array(z.string()),
  }),
  isOffline: z.boolean().optional(),
});
export type InterviewFeedbackOutput = z.infer<typeof InterviewFeedbackOutputSchema>;

export async function generateInterviewFeedback(
  input: InterviewFeedbackInput
): Promise<InterviewFeedbackOutput> {
  return interviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewFeedbackPrompt',
  input: { schema: InterviewFeedbackInputSchema },
  output: { schema: InterviewFeedbackOutputSchema },
  prompt: `You are an elite AI Performance Auditor at a Tier-1 Tech Firm. 
Your mission is to synthesize a high-fidelity Final AI Report for a {{{role}}} candidate at {{{company}}} ({{{experienceLevel}}}).

FULL CANDIDATE DOSSIER:

1. RESUME AUDIT:
- ATS Score: {{{resumeContext.atsScore}}}%
- Missing Skills: {{#each resumeContext.missingSkills}}{{{this}}}, {{/each}}

2. APTITUDE PERFORMANCE:
- Score: {{{aptitudeContext.overallScore}}}%
- Status: {{{aptitudeContext.status}}}

3. CODING ROUND (SYNTAX MATRIX):
- Score: {{{codingContext.score}}}%
- Status: {{{codingContext.status}}}

4. VIRTUAL INTERVIEW TRANSCRIPT:
{{{interviewTranscript}}}

AUDIT REQUIREMENTS:
1. OVERALL SCORE: Weighted average of all rounds.
2. HIRING RECOMMENDATION: Use Excellent (>85), Good (70-85), Average (50-70), Needs Improvement (<50).
3. DETAILED ANALYTICS: Provide 0-100 scores for Technical Knowledge, Communication, Confidence, and Problem Solving based on the transcript.
4. SKILL GAP: Identify missing nodes based on the target role/company benchmarks.
5. LEARNING PLAN: Create a high-fidelity 30-day roadmap for remediation.

Return a structured intelligence report.`,
});

function generateFallbackFeedback(input: InterviewFeedbackInput): InterviewFeedbackOutput {
  return {
    overallScore: 72,
    interviewReadiness: 75,
    hiringRecommendation: "Good",
    virtualInterviewResult: {
      technicalKnowledge: 70,
      communication: 75,
      confidence: 80,
      hrSkills: 75,
      problemSolving: 65,
      professionalism: 85,
    },
    aiFeedback: {
      performanceSummary: "Candidate demonstrates strong professional presence but requires deeper architectural logic scaling.",
      strongSkills: ["Communication", "Professionalism", "Basic Concepts"],
      weakSkills: ["System Design", "Scalability", "Big-O Analysis"],
      mistakesMade: ["Generalizing technical answers", "Delayed response on edge cases"],
      suggestedImprovements: ["Practice STAR method", "Deep dive into distributed systems"],
    },
    skillGap: {
      missingSkills: input.resumeContext?.missingSkills || ["Cloud Native", "Advanced DSA"],
      criticalGaps: ["Architecture scaling"],
    },
    learningPlan: {
      topicsToStudy: ["Distributed Systems", "API Security"],
      codingPractice: ["Dynamic Programming", "Graph Theory"],
      interviewPractice: ["Leadership Principles", "Conflict Resolution"],
      resumeImprovements: ["Quantify impact nodes", "Add certification anchors"],
    },
    isOffline: true
  };
}

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) return generateFallbackFeedback(input);
      return { ...output, isOffline: false };
    } catch (error) {
      console.error("Master Audit Synthesis Error:", error);
      return generateFallbackFeedback(input);
    }
  }
);
