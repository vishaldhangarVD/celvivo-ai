'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Human Persona v4.0).
 * High-fidelity simulation protocol calibrated for professional job interviews.
 * Implements strict persona rules, resume-anchored questioning, and practical assessment tiers.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Could you please introduce yourself and briefly walk me through your professional background?",
    "Describe a time you had a conflict with a teammate over a decision. How was it resolved?",
    "How do you handle high-pressure situations, such as a critical production bug or a tight deadline?",
    "Where do you see your technical career trajectory heading in the next five years?",
    "What specific aspects of our organization's mission interest you the most?"
  ],
  'Technical Round': [
    "Could you please introduce yourself and briefly walk me through your background?",
    "Can you elaborate on the most complex technical challenge you faced in your strongest project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "How do you approach performance optimization when dealing with large-scale datasets?"
  ],
  'Managerial Round': [
    "Could you please introduce yourself and briefly walk me through your background?",
    "How do you prioritize tasks and resources for your team during a complex sprint?",
    "Tell me about a time you had to deliver difficult technical feedback to a major stakeholder.",
    "What is your strategy for mentoring junior developers and fostering technical growth?",
    "How do you handle a project that is significantly falling behind its original schedule?"
  ]
};

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
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  difficultyAdjustment: z.enum(['Easier', 'Harder', 'Maintain']).optional(),
  isInterviewComplete: z.boolean(),
  debugPrompt: z.string().optional(),
  isMock: z.boolean().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an experienced professional interviewer conducting a real job interview for a {{{role}}} role ({{{experienceLevel}}} level), specifically for a {{{roundType}}}.

GENERAL RULES (STRICT):
1. Behave exactly like a human interviewer. NEVER mention you are an AI or a model.
2. Speak naturally and professionally. No robotic language or textbook definitions.
3. Ask only ONE question at a time. Never group questions.
4. Wait for the candidate's answer before continuing.
5. Every question MUST naturally continue from the previous answer or the resume context.
6. Difficulty should increase naturally based on answer quality.

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Background: {{{resumeSummary}}}

INTERVIEW FLOW PROTOCOL:

NODE 1 (Introduction):
If history is empty, start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. Let's begin. Could you please introduce yourself and briefly walk me through your background?"

NODE 2 (Resume Discussion):
Carefully analyze the dossier. Identify the strongest project listed. 
Mention the project BY ITS EXACT NAME.
Ask naturally about the problem it solved, the technology choices, or a specific implementation hurdle.
Example: "In your '{{{resumeProjects.[0]}}}' project, what was the primary problem you were solving, and why did you choose that specific tech stack?"

NODE 3 (Technical Deep-Dive):
Transition to practical technical discussion based on the role ({{{role}}}). 
Avoid definitions. Ask for architectural reasoning or decision-making.
If the previous answer was strong, increase difficulty. If weak, ask an easier follow-up to help them explain.

NODE 4 (Scenario Questions):
Present a realistic work situation. 
Example: "You receive incorrect dashboard numbers just before a client presentation. How would you investigate?" or "A production query suddenly becomes slow as the data grows. What are your first steps?"

NODE 5 (Executive Finality):
Advanced technical reasoning or a leadership/behavioral scenario. 
Wrap up by saying: "Thank you for your time. Do you have any questions for me?"

CURRENT STATUS:
Node: {{{currentMainQuestionIndex}}} of 5.

HISTORY:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Provide the 'nextQuestion' that follows this sequence. Adjust difficulty if needed.`,
});

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    if (input.debugMode) {
      return {
        nextQuestion: "[DEBUG] Human Persona Active. Node generated.",
        feedbackOnLastAnswer: "DEBUG: Signal synchronized.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        debugPrompt: "System check: Human Interviewer Protocol Active."
      };
    }

    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural synthesis failed.");
      
      return {
        ...output,
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: false
      };
    } catch (error) {
      console.error("AI Flow Error, using fallback:", error);
      const round = input.roundType || 'Technical Round';
      const roundKey = round.includes('HR') ? 'HR Round' : round.includes('Managerial') ? 'Managerial Round' : 'Technical Round';
      const roundBank = FALLBACK_QUESTIONS[roundKey as keyof typeof FALLBACK_QUESTIONS] || FALLBACK_QUESTIONS['Technical Round'];
      
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      let fallbackQ = roundBank[bankIndex];

      return {
        nextQuestion: fallbackQ,
        feedbackOnLastAnswer: "I see. Let's move forward with that context. [RECOVERY MODE]",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: true
      };
    }
  }
);