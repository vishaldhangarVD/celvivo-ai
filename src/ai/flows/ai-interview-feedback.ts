
'use server';
/**
 * @fileOverview Nexvoro AI Performance Auditor.
 * Synthesizes comprehensive reports from interview transcripts using Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  role: z.string(),
  experienceLevel: z.string(),
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
  prompt: `You are a Senior Recruitment Auditor.
Analyze the following interview transcript for a {{{role}}} ({{{experienceLevel}}} level).

Transcript:
{{{interviewTranscript}}}

Evaluation Rubric:
1. Technical Depth: Accuracy of solutions and architectural reasoning.
2. Communication: Clarity, structure (STAR method), and terminology usage.
3. Confidence: Decisiveness and handling of difficult follow-ups.

Provide:
- Scores out of 100.
- Exactly 3 Strengths and 3 Weaknesses.
- A final Hiring Recommendation.
- A detailed Improvement Plan for the next 30 days.
- A Job Readiness Score (0-100%) indicating how close they are to clearing a real interview for this role.`,
});

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Audit synthesis failed.');
    return output;
  }
);
