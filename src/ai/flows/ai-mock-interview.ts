'use server';
/**
 * @fileOverview An AI-powered mock interview agent.
 * (MOCKED for testing)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiMockInterviewInputSchema = z.object({
  role: z.string().describe('The job role for the mock interview.'),
  experienceLevel: z.string().describe('The experience level for the mock interview.'),
  currentMainQuestionIndex: z.number().describe('The 0-indexed count of main questions asked so far.'),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    aiFeedback: z.string().optional(),
  })),
  lastQuestionAsked: z.string().optional(),
  userAnswer: z.string().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  questionType: z.enum(['main', 'follow-up', 'summary']),
  feedbackOnLastAnswer: z.string().optional(),
  isInterviewComplete: z.boolean(),
  interviewSummary: z.string().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    const isFirstQuestion = !input.userAnswer;
    const isLastQuestion = input.currentMainQuestionIndex >= 4;

    if (isFirstQuestion) {
      return {
        nextQuestion: `Welcome to the ${input.role} interview. To start, can you explain the core architectural principles you follow when building scalable applications?`,
        questionType: 'main',
        isInterviewComplete: false
      };
    }

    if (isLastQuestion) {
      return {
        nextQuestion: "",
        questionType: 'summary',
        feedbackOnLastAnswer: "Excellent explanation of distributed systems. You clearly understand scaling bottlenecks.",
        isInterviewComplete: true,
        interviewSummary: "The candidate demonstrated strong architectural knowledge and clear communication throughout the session."
      };
    }

    const mockQuestions = [
      "How do you handle state management in large-scale React applications?",
      "Can you describe a time you had to optimize a slow database query?",
      "What is your approach to ensuring code quality and test coverage?",
      "How do you stay updated with the latest trends in the software industry?"
    ];

    return {
      nextQuestion: mockQuestions[input.currentMainQuestionIndex % mockQuestions.length],
      questionType: 'main',
      feedbackOnLastAnswer: "That was a solid answer. I liked how you mentioned performance trade-offs.",
      isInterviewComplete: false
    };
  }
);
