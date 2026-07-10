'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v22.0).
 * Calibrated for high-fidelity simulation of professional IT interviews.
 * Ingests multi-dimensional context (Aptitude, Coding, Resume).
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";

const FALLBACK_QUESTIONS = [
  "Hello. Welcome to today's interview. Let's begin with a brief introduction. Tell me about yourself?",
  "I noticed your technical background. What specific aspects of your strongest project are you most proud of?",
  "How do you ensure your code remains maintainable and scalable over time?",
  "If a production API suddenly returns 500 errors, how would you investigate step-by-step?",
  "Tell me about a time you had to work with a difficult teammate. How did you handle it?",
  "That concludes our session. It was nice speaking with you."
];

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
  targetCompany: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  aptitudePerformance: z.string().optional(),
  codingPerformance: z.string().optional(),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  askedQuestions: z.array(z.string()).optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  difficultyAdjustment: z.enum(["Easier", "Harder", "Maintain"]).optional(),
  isInterviewComplete: z.boolean(),
  interviewStage: z.string().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Technical Interviewer representing {{{targetCompany}}} for a {{{role}}} position ({{{experienceLevel}}} level).

CANDIDATE DOSSIER:
- Resume Summary: {{{resumeSummary}}}
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Aptitude Audit: {{{aptitudePerformance}}}
- Coding Round Audit: {{{codingPerformance}}}

GENERAL PERSONA RULES:
- BEHAVE EXACTLY LIKE AN EXPERIENCED HUMAN INTERVIEWER. Professional, technical, and high-fidelity.
- NEVER mention you are an AI or a Genkit flow.
- Ask exactly ONE technical or behavioral question at a time.
- ADAPTIVE DIFFICULTY:
  - If previous answer was strong (detailed, trade-offs mentioned): Increase difficulty to HARD (System design, edge cases).
  - If previous answer was weak: Pivot to EASY (Conceptual, fundamental theory).
- FOLLOW-UP LOGIC: Listen to the candidate's latest response. If they mentioned a specific tech or pattern, challenge it (e.g., "Why that specific load balancer?", "How would that scale if X happened?").

INTERVIEW PROTOCOL:
- Question Range: 10 to 15 questions.
- Current Question: {{{currentMainQuestionIndex}}}
- Previously Asked: 
{{#each askedQuestions}}
- {{{this}}}
{{/each}}

HISTORY:
{{#each history}}
Q: {{{this.question}}}
A: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the protocol and dossier, output the ONE most relevant next question. 
Return ONLY valid JSON.`,
});

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        difficultyLevel: input.difficultyLevel || "MEDIUM",
      });

      if (!output) throw new Error("Neural synthesis failed.");

      return {
        ...output,
        isInterviewComplete: input.currentMainQuestionIndex >= 15,
      };
    } catch (error) {
      console.error("AI Flow Error:", error);
      const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        isInterviewComplete: input.currentMainQuestionIndex >= 15,
      };
    }
  }
);
