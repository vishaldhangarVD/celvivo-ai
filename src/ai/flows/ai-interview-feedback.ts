'use server';
/**
 * @fileOverview Genkit flow for generating mock interview feedback.
 * (MOCKED for testing)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  role: z.string(),
  experienceLevel: z.string(),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

const InterviewFeedbackOutputSchema = z.object({
  technicalKnowledgeScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  overallInterviewScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  jobReadinessScore: z.number().min(0).max(100),
});
export type InterviewFeedbackOutput = z.infer<typeof InterviewFeedbackOutputSchema>;

export async function generateInterviewFeedback(
  input: InterviewFeedbackInput
): Promise<InterviewFeedbackOutput> {
  return interviewFeedbackFlow(input);
}

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async input => {
    return {
      technicalKnowledgeScore: 82,
      communicationScore: 88,
      problemSolvingScore: 79,
      confidenceScore: 92,
      overallInterviewScore: 85,
      strengths: [
        "Clear communication of complex technical concepts",
        "Strong understanding of React hooks and performance optimization",
        "Logical approach to system design questions"
      ],
      weaknesses: [
        "Lacked detail in database indexing strategies",
        "Could provide more concrete examples of past failures and lessons learned"
      ],
      improvementSuggestions: [
        "Review deep-dive database performance tuning",
        "Practice the STAR method for behavioral questions"
      ],
      jobReadinessScore: 89
    };
  }
);
