'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent.
 * Generates dynamic questions and evaluates responses using Resilient Gemini protocols.
 * Includes an Offline Mock Fallback for high availability during API outages.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AiMockInterviewInputSchema = z.object({
  role: z.string(),
  experienceLevel: z.string(),
  roundType: z.string(),
  currentMainQuestionIndex: z.number(),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  userAnswer: z.string().optional(),
  debugMode: z.boolean().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  scores: z.object({
    technical: z.number(),
    communication: z.number(),
    confidence: z.number(),
  }).optional(),
  isInterviewComplete: z.boolean(),
  debugPrompt: z.string().optional(),
  isMock: z.boolean().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

// Local Intelligence Nodes for Offline Fallback
const MOCK_KNOWLEDGE_BANK: Record<string, string[]> = {
  "Technical Round": [
    "Explain the difference between asynchronous and synchronous execution in your primary tech stack.",
    "How do you approach debugging a memory leak in a production environment?",
    "Describe the trade-offs between using a SQL database vs a NoSQL database for a high-traffic application.",
    "What are the core principles of SOLID and how do you apply them in your daily coding?",
    "How do you ensure data security and integrity when building distributed systems?"
  ],
  "HR Round": [
    "Tell me about a time you handled a significant conflict within your team.",
    "Why are you looking to leave your current organization at this stage of your career?",
    "What is the most challenging technical project you have led, and what was the outcome?",
    "Describe your ideal work environment and company culture.",
    "Where do you see your technical trajectory in the next 5 years?"
  ],
  "Managerial Round": [
    "How do you prioritize competing deadlines across multiple high-stakes projects?",
    "Describe your experience with mentoring junior engineers and fostering technical growth.",
    "How do you handle a situation where a project is falling behind schedule?",
    "What is your approach to technical debt management in a fast-paced delivery cycle?",
    "How do you align technical engineering goals with broader business objectives?"
  ]
};

const DEFAULT_MOCK_QUESTIONS = [
  "Can you elaborate on your experience with system architecture and design patterns?",
  "How do you keep your skills updated in this rapidly evolving tech landscape?",
  "Describe a time you had to learn a complex new technology in a very short period.",
  "What is your philosophy on code quality versus delivery speed?"
];

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite technical interviewer at a Tier-1 tech company.
Your mission is to conduct a professional, high-fidelity interview for a {{{role}}} at a {{{experienceLevel}}} level, specializing in {{{roundType}}}.

Current Progress: Question {{{currentMainQuestionIndex}}} of 10.

Protocol:
1. If this is the FIRST question (history is empty), ask a strong opening question related to the role and level.
2. If the user just answered (userAnswer is provided), evaluate their answer based on technical logic, communication clarity, and professional confidence.
3. Provide a brief, encouraging, but objective piece of feedback on their last answer.
4. Ask the NEXT question. The questions should get progressively more challenging.
5. If Question Index reaches 10, mark isInterviewComplete as true.

History of conversation:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

Latest Candidate Answer: {{{userAnswer}}}

Ensure the next question is specific to {{{role}}} and appropriate for a {{{experienceLevel}}} grade.`,
});

function generateMockResponse(input: AiMockInterviewInput): AiMockInterviewOutput {
  console.warn('[OFFLINE MOCK FALLBACK TRIGGERED]', { role: input.role, round: input.roundType });
  
  const bank = MOCK_KNOWLEDGE_BANK[input.roundType] || DEFAULT_MOCK_QUESTIONS;
  const nextQ = bank[input.currentMainQuestionIndex % bank.length];
  
  return {
    nextQuestion: nextQ,
    feedbackOnLastAnswer: "Your response shows a clear understanding of core concepts. Continue maintaining this level of technical detail.",
    scores: {
      technical: 8,
      communication: 9,
      confidence: 8
    },
    isInterviewComplete: input.currentMainQuestionIndex >= 10,
    isMock: true
  };
}

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    // Neural Debug Intercept
    if (input.debugMode) {
      console.log('[DEBUG REQUEST RECEIVED]', { role: input.role, exp: input.experienceLevel });
      
      const historyStr = input.history.length > 0 
        ? input.history.map(h => `Interviewer: ${h.question}\nCandidate: ${h.answer}`).join('\n')
        : 'No history yet.';

      const renderedPrompt = `SYSTEM:
You are an elite technical interviewer at a Tier-1 tech company.
Your mission is to conduct a professional, high-fidelity interview for a ${input.role} at a ${input.experienceLevel} level, specializing in ${input.roundType}.

INTERVIEW INSTRUCTIONS:
Current Progress: Question ${input.currentMainQuestionIndex} of 10.
1. If this is the FIRST question (history is empty), ask a strong opening question.
2. If the user just answered, evaluate based on technical logic, communication, and confidence.
3. Provide objective feedback and ask the NEXT question (progressively challenging).
4. If index reaches 10, terminate simulation.

CONVERSATION HISTORY:
${historyStr}

LATEST CANDIDATE INPUT:
${input.userAnswer || 'Awaiting first input.'}

FINAL PROMPT SENT TO GEMINI (2.5-FLASH):
Generate the next ${input.roundType} interview question for a ${input.experienceLevel} ${input.role}. Output must follow the structured JSON schema for feedback and question nodes.`;

      const debugResponse: AiMockInterviewOutput = {
        nextQuestion: "[DEBUG MODE: NEXT QUESTION SIMULATED]",
        feedbackOnLastAnswer: "DEBUG: Neural loop functional. Logic gate bypassed.",
        isInterviewComplete: input.currentMainQuestionIndex >= 10,
        debugPrompt: renderedPrompt
      };
      
      console.log('[DEBUG RESPONSE GENERATED]');
      return debugResponse;
    }

    try {
      const { output } = await runWithResilience(prompt, input);
      
      if (!output) {
        return generateMockResponse(input);
      }

      if (input.currentMainQuestionIndex >= 10) {
        return {
          ...output,
          isInterviewComplete: true,
          nextQuestion: "The simulation is complete. Initiating comprehensive audit."
        };
      }

      return output;
    } catch (error) {
      return generateMockResponse(input);
    }
  }
);
