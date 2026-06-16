'use server';
/**
 * @fileOverview Nexvoro AI Performance Auditor.
 * Synthesizes comprehensive reports from interview transcripts using Resilient Gemini protocols.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  role: z.string(),
  experienceLevel: z.string(),
  round: z.string().optional(),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

const InterviewFeedbackOutputSchema = z.object({
  technicalKnowledgeScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  overallInterviewScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  jobReadinessScore: z.number().min(0).max(100),
  hiringRecommendation: z.enum(['Hire', 'Strong Hire', 'No Hire', 'Leaning No Hire']),
  improvementPlan: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
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
  prompt: `You are an elite Senior Technical Recruitment Auditor. 
Your mission is to synthesize a high-fidelity performance audit from the following interview transcript for a {{{role}}} at a {{{experienceLevel}}} level, specializing in the {{{round}}}.

Transcript:
{{{interviewTranscript}}}

Evaluation Protocol:
1. Technical Logic Audit: Evaluate accuracy of solutions, depth of architectural reasoning, and role-specific mastery.
2. Narrative Delivery: Analyze communication clarity, use of the STAR method, and command of industry terminology.
3. Operational Presence: Assess decisiveness, handling of complex follow-ups, and professional confidence.

CRITICAL INSTRUCTION FOR IMPROVEMENT PLAN:
The "improvementPlan" MUST be highly specialized for the deployment role: {{{role}}}.
- If the role is a Developer (e.g., .NET Developer), you MUST provide specific technical nodes like: C#, ASP.NET Core, Web API, Entity Framework, SQL Server, System Design, and Microservices.
- If the role is a Data Analyst, prioritize: SQL Query Optimization, Data Visualization (PowerBI/Tableau), and Exploratory Data Analysis.
- If the role is a Data Scientist, prioritize: Machine Learning Algorithms, Statistical Modeling, Feature Engineering, and Model Deployment.
- Map these technical and behavioral vectors into actionable roadmap items.

Provide:
- Scores (0-100) for all nodes.
- Exactly 3 Strengths and 3 Weaknesses.
- A strategic Hiring Recommendation.
- A role-calibrated 30-day Improvement Plan.
- A Job Readiness Score representing market calibration.`,
});

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error('Audit synthesis failed.');
    return output;
  }
);
