'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent.
 * Generates dynamic questions and evaluates responses using Resilient Gemini protocols.
 * Includes a Debug Mode to intercept and display rendered prompts.
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
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

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

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    console.log('[DEBUG REQUEST RECEIVED]', { role: input.role, debugMode: input.debugMode });

    // Render the prompt for debugging or live use using Genkit 1.x standard
    const rendered = await ai.renderPrompt({
      prompt,
      input,
    });
    const renderedText = rendered.text;

    if (input.debugMode) {
      console.log('[DEBUG RESPONSE GENERATED - BYPASS ACTIVE]');
      return {
        nextQuestion: "[DEBUG MODE ACTIVE - NO AI RESPONSE]",
        isInterviewComplete: false,
        debugPrompt: renderedText
      };
    }

    const { output } = await runWithResilience(prompt, input);
    
    if (!output) {
      throw new Error('Neural simulation failed to generate response.');
    }

    if (input.currentMainQuestionIndex >= 10) {
      return {
        ...output,
        isInterviewComplete: true,
        nextQuestion: "The simulation is complete. Initiating comprehensive audit."
      };
    }

    return output;
  }
);
