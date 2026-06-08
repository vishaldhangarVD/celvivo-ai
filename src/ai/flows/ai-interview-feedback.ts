'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating an AI-powered interview feedback report.
 *
 * - generateInterviewFeedback - A function that handles the generation of the interview feedback report.
 * - InterviewFeedbackInput - The input type for the generateInterviewFeedback function.
 * - InterviewFeedbackOutput - The return type for the generateInterviewFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  interviewTranscript: z
    .string()
    .describe('The full transcript of the mock interview.'),
  role: z.string().describe('The role the user interviewed for (e.g., "Frontend Developer").'),
  experienceLevel: z.string().describe('The experience level (e.g., "Junior", "Mid", "Senior").'),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

const InterviewFeedbackOutputSchema = z.object({
  technicalKnowledgeScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0-100 representing the candidate\'s technical knowledge.'),
  communicationScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0-100 representing the candidate\'s communication skills.'),
  problemSolvingScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0-100 representing the candidate\'s problem-solving ability.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0-100 representing the candidate\'s confidence during the interview.'),
  overallInterviewScore: z
    .number()
    .min(0)
    .max(100)
    .describe('An overall score from 0-100 for the interview performance.'),
  strengths: z.array(z.string()).describe('A list of the candidate\'s strengths identified in the interview.'),
  weaknesses: z.array(z.string()).describe('A list of areas where the candidate showed weaknesses.'),
  improvementSuggestions: z
    .array(z.string())
    .describe('Specific suggestions for how the candidate can improve their performance.'),
  jobReadinessScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0-100 indicating how ready the candidate is for the job.'),
});
export type InterviewFeedbackOutput = z.infer<typeof InterviewFeedbackOutputSchema>;

export async function generateInterviewFeedback(
  input: InterviewFeedbackInput
): Promise<InterviewFeedbackOutput> {
  return interviewFeedbackFlow(input);
}

const interviewFeedbackPrompt = ai.definePrompt({
  name: 'interviewFeedbackPrompt',
  input: {schema: InterviewFeedbackInputSchema},
  output: {schema: InterviewFeedbackOutputSchema},
  prompt: `You are an expert technical interviewer and career coach. Your task is to provide comprehensive feedback on a mock interview.

The candidate interviewed for a '{{{role}}}' position at a '{{{experienceLevel}}}' level.

Here is the interview transcript:

---
{{{interviewTranscript}}}
---

Analyze the transcript carefully and provide a detailed feedback report. Your report MUST include:

1.  **Scores (0-100)** for Technical Knowledge, Communication, Problem Solving, and Confidence. Also, provide an Overall Interview Score and a Job Readiness Score.
2.  A list of the candidate's **Strengths** based on their performance.
3.  A list of **Weaknesses** or areas for improvement.
4.  **Improvement Suggestions** that are specific and actionable.

Ensure your output is a JSON object matching the following schema. Provide only the JSON object in your response.
`,
});

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async input => {
    const {output} = await interviewFeedbackPrompt(input);
    return output!;
  }
);
