
'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v11.0).
 * MASTER PROTOCOL: Calibrated for multi-round intelligence.
 * Integrates Round 1 (Aptitude, Coding, Technical) + Round 2 (Special HR Resume).
 * Implements granular stage progression with cross-round context awareness.
 * Now includes telemetry identifiers for usage tracking.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

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
  // TELEMETRY
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
Every question must be intelligently connected to the candidate's uploaded resume, the candidate's previous answer, or a directly related concept required to validate a resume claim.

MANDATORY FIRST-TURN RULE:
If Current Turn is 0, OR the current interview history is empty, you MUST ask a short, warm, professional introduction question.

==================================================
CANDIDATE RESUME — PRIMARY SOURCE
==================================================
Resume Summary: {{{resumeSummary}}}
Resume Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
Resume Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
Candidate Name: {{{candidateName}}}
Role: {{{role}}}
Experience: {{{experienceLevel}}}

==================================================
CURRENT SPECIAL HR INTERVIEW HISTORY
==================================================
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}
Latest Candidate Answer: {{{userAnswer}}}

==================================================
QUESTION GENERATION PRIORITY
==================================================
1. UPLOADED RESUME: Ask about specific claims, projects, or contribution.
2. ANSWER FOLLOW-UP: Analyze answer for architectural or professional details.
3. RELATED TECHNICAL: Logical connections to claimed skills.

==================================================
IMPORTANT SPOKEN OUTPUT RULE
==================================================
Return ONLY the natural spoken interviewer dialogue. No JSON, no labels.

Generate the next interviewer dialogue now.`
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
        nextQuestion: "Hello, welcome to Nexvoro AI. Identity node synchronized. How are you today?",
        difficulty: "EASY",
        stage: "INTRODUCTION",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
        isHint: false
      }; 
    }

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
        hintUsed: input.hintUsed || false
      }, {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: input.roundType === 'Special HR Interview' ? 'special_interview' : 'interview'
      });
    
      if (!output) throw new Error("Neural synthesis failed.");
    
      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    
    } catch (error) {
      console.error("\n🔴 AI MOCK INTERVIEW ERROR", error);
      return {
        nextQuestion: "Thank you for that context. Let's explore your professional background further.",
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
        isHint: false
      };
    }
  }
);
