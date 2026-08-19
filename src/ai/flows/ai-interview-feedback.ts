'use server';
/**
 * @fileOverview Nexvoro AI Master Performance Auditor (Elite v16.0).
 * Synthesizes the final comprehensive report from all interview rounds.
 * Implements strict 40/60 weighting between validated nodes and verbal performance.
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
    readability: z.number().optional(),
    timeComplexity: z.string().optional(),
    spaceComplexity: z.string().optional(),
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
1. OVERALL SCORE CALCULATION: 
   - Pre-validated Nodes (Aptitude Score + Coding Score) represent 40% of the total weight.
   - Virtual Interview Evaluation (derived from transcript analysis) represents 60% of the total weight.
   - Calculate a REAL weighted percentage based on the data provided. Do not invent arbitrary numbers.
2. HIRING RECOMMENDATION: Use Excellent (>85), Good (70-85), Average (50-70), Needs Improvement (<50).
3. DETAILED ANALYTICS: Provide 0-100 scores for Technical Knowledge, Communication, Confidence, and Problem Solving based EXCLUSIVELY on the candidate's answers in the transcript.
4. SKILL GAP: Identify missing nodes based on the target role/company benchmarks and candidate's demonstrated performance.
5. LEARNING PLAN: Create a high-fidelity 30-day roadmap for remediation based on gaps found in THIS specific transcript.

Return a structured intelligence report based ONLY on this specific candidate's data. No generic filler.`,
});

function generateFallbackFeedback(input: InterviewFeedbackInput): InterviewFeedbackOutput {
  return {
    overallScore: 0,
    interviewReadiness: 0,
    hiringRecommendation: "Needs Improvement",
    virtualInterviewResult: {
      technicalKnowledge: 0,
      communication: 0,
      confidence: 0,
      hrSkills: 0,
      problemSolving: 0,
      professionalism: 0,
    },
    aiFeedback: {
      performanceSummary: "SYSTEM ERROR: Neural Auditor failed to synthesize results. Manual review required. No real scores were generated for this session.",
      strongSkills: [],
      weakSkills: [],
      mistakesMade: [],
      suggestedImprovements: [],
    },
    skillGap: {
      missingSkills: input.resumeContext?.missingSkills || [],
      criticalGaps: [],
    },
    learningPlan: {
      topicsToStudy: [],
      codingPractice: [],
      interviewPractice: [],
      resumeImprovements: [],
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
