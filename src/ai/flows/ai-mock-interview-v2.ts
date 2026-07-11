'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v30.0).
 * Calibrated for natural, human-like conversations in high-stakes IT environments.
 * Implements a 3-phase protocol: Introduction, Adaptive Core, and Strategic Closing.
 * Optimized with memory and adaptive difficulty logic.
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
Your objective is to conduct a realistic, high-fidelity virtual interview that feels exactly like a live session at a top-tier tech firm.

CANDIDATE DOSSIER:
- Resume Summary: {{{resumeSummary}}}
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Aptitude Audit: {{{aptitudePerformance}}}
- Coding Round Audit: {{{codingPerformance}}}

CURRENT SIMULATION STATE:
- Difficulty Level: {{{difficultyLevel}}}
- Previously Asked Questions: {{#each askedQuestions}} - {{{this}}} {{/each}}

CONVERSATION MEMORY (History):
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

INTERVIEW PHILOSOPHY:
- BEHAVE EXACTLY LIKE AN EXPERIENCED HUMAN INTERVIEWER. Professional, strategic, and analytical.
- CONVERSATION MEMORY: Review the history carefully. Every question MUST be a natural follow-up or a strategic pivot based on what was said.
- NO REPETITION: NEVER ask a question that is similar to one already present in "Previously Asked Questions".
- ADAPTIVE DIFFICULTY: 
  - If the candidate's last answer was technically deep and accurate, adjust difficulty to "Harder".
  - If they struggled or gave a surface-level response, adjust to "Easier".
  - Otherwise, "Maintain".
- ONE QUESTION: Ask exactly ONE question per node.

INTERVIEW PROTOCOL:

PHASE 1: INTRODUCTION (History is empty)
- Greet the candidate warmly.
- Introduce yourself as the virtual interviewer for {{{targetCompany}}}.
- Ask the first broad introductory question.

PHASE 2: CORE INTERVIEW (1 < Current Node < 14)
- Mix technical probes (based on projects/skills/coding round) with behavioral scenarios.
- Increase technical depth based on the Current Difficulty ({{{difficultyLevel}}}).

PHASE 3: CLOSING (Current Node >= 15)
- Thank the candidate for their time.
- Set isInterviewComplete to true.

Output the ONE most relevant next interviewer node and the difficulty adjustment.
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
