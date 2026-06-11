
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
  roundType: z.string().optional().describe('The specific interview round (e.g. Technical Round, HR Round).'),
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
    const round = input.roundType || 'Technical Round';

    if (isFirstQuestion) {
      return {
        nextQuestion: `Welcome to the ${input.role} ${round}. To start, can you explain your professional background and how it prepares you for the specific challenges of this role?`,
        questionType: 'main',
        isInterviewComplete: false
      };
    }

    if (isLastQuestion) {
      return {
        nextQuestion: "",
        questionType: 'summary',
        feedbackOnLastAnswer: `Excellent session for a ${round} assessment. You demonstrated consistent logic and technical depth.`,
        isInterviewComplete: true,
        interviewSummary: "The candidate demonstrated strong capability in the requested assessment round."
      };
    }

    const roundQuestions: Record<string, string[]> = {
      'Technical Round': [
        "Can you describe the most complex technical challenge you've solved recently and the architecture you used?",
        "How do you ensure your code is optimized for both performance and readability in a collaborative environment?",
        "What is your preferred testing strategy for complex business logic and how do you implement it?",
        "How do you stay updated with the latest tools and trends in your specific domain?"
      ],
      'HR Round': [
        "Tell me about a time you had to handle a major disagreement within your team. How was it resolved?",
        "Describe a situation where you had to lead a project with ambiguous requirements. What was the outcome?",
        "How do you handle high-pressure deadlines while maintaining elite code quality?",
        "Give an example of a mistake you made at work and the specific steps you took to learn from it."
      ],
      'Managerial Round': [
        "Where do you see your technical leadership evolving in the next 3 years?",
        "How do you mentor junior engineers to ensure team growth and alignment with company goals?",
        "What specific qualities do you look for in a team when joining a new organization?",
        "Why are you the right fit for this role at this specific stage of your career?"
      ],
      'Full Interview Process': [
        "Can you walk me through a technical architecture you designed from scratch?",
        "How do you balance technical debt with the need for rapid feature deployment?",
        "Tell me about a time you had to deliver difficult feedback to a peer or direct report.",
        "What are your long-term professional aspirations and how does this role bridge that gap?"
      ]
    };

    const questions = roundQuestions[round] || roundQuestions['Technical Round'];

    return {
      nextQuestion: questions[input.currentMainQuestionIndex % questions.length],
      questionType: 'main',
      feedbackOnLastAnswer: "That's an insightful perspective. It aligns well with elite industry benchmarks.",
      isInterviewComplete: false
    };
  }
);
