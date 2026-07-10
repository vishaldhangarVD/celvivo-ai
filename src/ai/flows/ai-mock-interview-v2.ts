'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v25.0).
 * Calibrated for high-fidelity simulation of professional IT interviews.
 * Ingests multi-dimensional context (Aptitude, Coding, Resume).
 * Naturally blends Technical and HR probes into a single narrative flow.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = [
  "Hello. Welcome to today's interview. I'm pleased to meet you. Let's start with a brief introduction—could you walk me through your background?",
  "I noticed your technical background in your resume. What specific aspects of your strongest project are you most proud of?",
  "How do you ensure your code remains maintainable and scalable over time?",
  "If a production API suddenly returns 500 errors, how would you investigate step-by-step?",
  "Tell me about a time you had to handle a technical disagreement with a teammate. How was it resolved?",
  "That concludes our session today. It was nice speaking with you."
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
  interviewStage: z.enum(["INTRODUCTION", "TECHNICAL", "HR", "HYBRID", "CLOSING"]).optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Recruiter and Lead Engineer representing {{{targetCompany}}} for a {{{role}}} position ({{{experienceLevel}}} level). 
This is a high-stakes Virtual Interview that combines both Technical Depth and HR/Culture Fit assessments.

CANDIDATE DOSSIER:
- Resume Summary: {{{resumeSummary}}}
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Aptitude Audit: {{{aptitudePerformance}}}
- Coding Round Audit: {{{codingPerformance}}}

INTERVIEW PHILOSOPHY:
- BEHAVE EXACTLY LIKE AN EXPERIENCED HUMAN INTERVIEWER. Professional, strategic, and analytical.
- NO AI MENTIONS: Never state you are an AI or a language model.
- HYBRID FLOW: Seamlessly mix technical probes with HR/Behavioral questions. For example, after a technical system design question, pivot to "How did you manage the team during that deployment?".
- DYNAMIC ADAPTIVITY:
  - If previous answer was strong: Escalate to HARD (Architectural trade-offs, edge cases, leadership scenarios).
  - If previous answer was weak: Pivot to EASY (Conceptual fundamentals, core values).
- ONE QUESTION: Ask exactly ONE question. Never list multiple questions.

INTERVIEW LOGISTICS:
- Duration: 10 to 15 questions total.
- Current Node: {{{currentMainQuestionIndex}}}
- Previously Explored: 
{{#each askedQuestions}}
- {{{this}}}
{{/each}}

CONVERSATION HISTORY:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the protocol and dossier, output the ONE most relevant next question. If we have reached 15 nodes, set isInterviewComplete to true and output a professional closing.
Return ONLY valid JSON matching the output schema.`,
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
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 15,
      };
    } catch (error) {
      console.error("AI Mock Interview Flow Error:", error);
      const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        isInterviewComplete: input.currentMainQuestionIndex >= 15,
      };
    }
  }
);
