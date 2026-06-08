'use server';
/**
 * @fileOverview An AI-powered mock interview agent.
 *
 * - aiMockInterview - A function that conducts a mock interview tailored to a specific role and experience level.
 * - AiMockInterviewInput - The input type for the aiMockInterview function.
 * - AiMockInterviewOutput - The return type for the aiMockInterview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @const AiMockInterviewInputSchema
 * @description Defines the input schema for the AI mock interview flow.
 */
const AiMockInterviewInputSchema = z.object({
  role: z.string().describe('The job role for the mock interview, e.g., "Frontend Developer".'),
  experienceLevel: z.string().describe('The experience level for the mock interview, e.g., "Junior", "Mid", "Senior".'),
  currentMainQuestionIndex: z.number().describe('The 0-indexed count of main questions asked so far. Max 5 main questions, so this goes from 0 to 4.'),
  history: z.array(z.object({
    question: z.string().describe('The question previously asked by the AI.'),
    answer: z.string().describe('The user\'s answer to the previous question.'),
    aiFeedback: z.string().optional().describe('AI feedback on the previous answer.'),
  })).describe('A chronological list of previous questions and answers, including AI feedback.'),
  lastQuestionAsked: z.string().optional().describe('The exact text of the last question the AI asked the user.'),
  userAnswer: z.string().optional().describe('The user\'s current answer to the last question asked. This will be undefined for the very first turn.'),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

/**
 * @const AiMockInterviewOutputSchema
 * @description Defines the output schema for the AI mock interview flow.
 */
const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question for the candidate, or an empty string if the interview is complete and a summary is provided.'),
  questionType: z.enum(['main', 'follow-up', 'summary']).describe('Indicates if the next item is a main question, a follow-up question, or a final summary.'),
  feedbackOnLastAnswer: z.string().optional().describe('Concise feedback on the user\'s last answer, highlighting strengths and areas for improvement. This should be empty if there was no prior user answer.'),
  isInterviewComplete: z.boolean().describe('True if the interview has concluded, meaning all main questions have been asked or a summary is being provided.'),
  interviewSummary: z.string().optional().describe('A comprehensive summary of the entire interview, including overall performance, strengths, weaknesses, and general suggestions. Only present if isInterviewComplete is true.'),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

/**
 * @const mockInterviewPrompt
 * @description Defines the Genkit prompt for conducting an AI mock interview.
 * It acts as an interviewer, asks questions, evaluates answers, and provides feedback.
 */
const mockInterviewPrompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an AI technical interviewer for a {{role}} at a {{experienceLevel}} level.
Your goal is to assess the candidate's technical knowledge, problem-solving skills, and communication.
You will conduct a mock interview with a maximum of 5 main technical questions.

Here is the full interview history so far:
{{#if history}}
  {{#each history}}
    Interviewer: {{{question}}}
    Candidate: {{{answer}}}
    {{#if aiFeedback}}
    AI Feedback: {{{aiFeedback}}}
    {{/if}}
  {{/each}}
{{else}}
  No questions have been asked yet.
{{/if}}

The current main question index (0-indexed, up to 4 for the 5th main question) is {{currentMainQuestionIndex}}.

{{#if userAnswer}}
  The candidate's last answer to your question "{{{lastQuestionAsked}}}" was: "{{{userAnswer}}}".
  First, provide concise feedback on their last answer, highlighting strengths and areas for improvement.
  Second, based on their answer and the interview history, decide the next action:
  - If their answer was incomplete, incorrect, or lacked depth, ask a specific follow-up question to probe deeper or clarify.
  - If their answer was satisfactory and there are less than 5 main questions asked (i.e., currentMainQuestionIndex is less than 4), ask the next main technical question. When asking a new main question, ensure it is distinct from previous main questions and appropriate for the role and experience level.
  - If their answer was satisfactory and 5 main questions have already been asked (i.e., currentMainQuestionIndex is 4), conclude the interview and provide a comprehensive overall summary.

{{else}}
  // This is the very start of the interview. currentMainQuestionIndex will be 0 here.
  Start the interview by asking the first main technical question suitable for a {{role}} at a {{experienceLevel}} level. Do not provide feedback as there is no prior user answer.
{{/if}}

Strictly structure your response as a JSON object conforming to the output schema. Ensure all fields are present as per the schema's requirements.
`
});

/**
 * @const aiMockInterviewFlow
 * @description Implements the Genkit flow for an AI-powered mock interview.
 * It processes user input and generates the next question, feedback, or interview summary.
 */
const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    // The prompt handles all the logic for generating the next question/feedback/summary
    // based on the provided input state.
    const { output } = await mockInterviewPrompt(input);

    // The output from the prompt is directly the desired flow output.
    return output!;
  }
);

/**
 * @function aiMockInterview
 * @description Wrapper function to execute the AI mock interview Genkit flow.
 * @param {AiMockInterviewInput} input - The input object containing interview context.
 * @returns {Promise<AiMockInterviewOutput>} A promise that resolves to the AI's response for the next interview step.
 */
export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}
