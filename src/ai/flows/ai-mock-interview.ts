
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
  roundType: z.string().optional().describe('The specific interview round (e.g. Technical, Behavioral).'),
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
    const round = input.roundType || 'Technical';

    if (isFirstQuestion) {
      return {
        nextQuestion: `Welcome to the ${input.role} ${round} interview. To start, can you explain your background and how you approach challenges in this specific field?`,
        questionType: 'main',
        isInterviewComplete: false
      };
    }

    if (isLastQuestion) {
      return {
        nextQuestion: "",
        questionType: 'summary',
        feedbackOnLastAnswer: `Excellent session for a ${round} evaluation. You demonstrated consistent logic and depth.`,
        isInterviewComplete: true,
        interviewSummary: "The candidate demonstrated strong capability in the requested assessment round."
      };
    }

    const roundQuestions: Record<string, string[]> = {
      'Technical': [
        "Can you describe the most complex technical challenge you've solved recently?",
        "How do you ensure your code is optimized for both performance and readability?",
        "What is your preferred testing strategy for complex business logic?",
        "How do you stay updated with the latest tools and trends in your specific domain?"
      ],
      'Behavioral': [
        "Tell me about a time you had to handle a major disagreement within your team.",
        "Describe a situation where you had to lead a project with ambiguous requirements.",
        "How do you handle high-pressure deadlines while maintaining quality?",
        "Give an example of a mistake you made at work and what you learned from it."
      ],
      'System Design': [
        "How would you design a rate-limiting system for a global API?",
        "What strategy would you use to handle consistency in a distributed database?",
        "How do you identify and mitigate single points of failure in an architecture?",
        "Describe how you would scale a real-time notification system to millions of users."
      ],
      'HR / Managerial': [
        "Where do you see your technical leadership evolving in the next 3 years?",
        "How do you mentor junior engineers to ensure team growth?",
        "What qualities do you look for in a team when joining a new organization?",
        "Why are you the right fit for this role at this stage of your career?"
      ]
    };

    const questions = roundQuestions[round] || roundQuestions['Technical'];

    return {
      nextQuestion: questions[input.currentMainQuestionIndex % questions.length],
      questionType: 'main',
      feedbackOnLastAnswer: "That's an insightful perspective. It aligns well with industry benchmarks.",
      isInterviewComplete: false
    };
  }
);
