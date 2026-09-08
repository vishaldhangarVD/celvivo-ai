'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v12.0).
 * MASTER PROTOCOL: Calibrated for multi-round intelligence.
 * Includes improved fallback diversity to prevent repeated questions during neural drift.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = [
  "Thank you for that context. Could you elaborate more on how you handled the technical trade-offs in your most recent project?",
  "That's a solid perspective. Moving forward, how do you typically approach learning a new complex technology under a tight deadline?",
  "I appreciate the detail. Let's shift gears slightly—tell me about a time you had to resolve a significant conflict within a technical team.",
  "Very interesting. In your experience, what are the most critical factors for maintaining high-quality code in a fast-paced environment?",
  "Understood. Let's explore your professional growth—where do you see your technical expertise evolving over the next few years?"
];

const Round1ContextSchema = z.object({
  resumeSummary: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  scores: z.object({
    aptitude: z.number().optional(),
    coding: z.number().optional(),
  }).optional(),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

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
  candidateName: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  aptitudeScore: z.number().optional(),
  codingScore: z.number().optional(),
  askedQuestions: z.array(z.string()).optional(),
  debugMode: z.boolean().optional(),
  hintUsed: z.boolean().optional(),
  currentStage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW_UP",
    "BEHAVIOUR",
    "RAPID_FIRE",
    "CLOSING"
  ]).optional(),
  currentDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  round1Context: Round1ContextSchema.optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  stage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW_UP",
    "BEHAVIOUR",
    "RAPID_FIRE",
    "CLOSING"
  ]),
  isInterviewComplete: z.boolean(),
  isHint: z.boolean().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite human Senior Interviewer conducting a high-fidelity Special HR Interview for a {{{role}}} candidate at {{{targetCompany}}}.

CORE INTERVIEW RULE:
Every question must be intelligently connected to the candidate's uploaded resume, previous answers, or Round 1 performance nodes.

MANDATORY FIRST-TURN RULE:
If current interview history is empty, ask a warm, professional introduction.

RESUME DATA:
Summary: {{{resumeSummary}}}
Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}

ROUND 1 PERFORMANCE:
Aptitude: {{{aptitudeScore}}}%
Coding: {{{codingScore}}}%

HISTORY:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}
Latest Answer: {{{userAnswer}}}

Return ONLY the natural spoken interviewer dialogue in JSON.`
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
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
      }, {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: 'special_interview'
      });
    
      if (!output) throw new Error("Neural synthesis failed.");
    
      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    
    } catch (error) {
      console.error("\n🔴 AI MOCK INTERVIEW ERROR", error);
      // DYNAMIC FALLBACK: Rotate questions to prevent repeating the same one
      const fallbackIdx = input.currentMainQuestionIndex % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[fallbackIdx],
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
        isHint: false
      };
    }
  }
);
