'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v18.0).
 * Implements strict 9-stage sequence, Strength-based Difficulty, and Tech Mapping.
 * Fixed: Robust fallback indexing to prevent schema validation failures.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V18_CONSOLIDATED_STRICT_FIXED";

function createInterviewSeed(
  role: string,
  level: string,
  round: string
) {
  return crypto
    .createHash("md5")
    .update(
      `${role}-${level}-${round}-${Date.now()}-${Math.random()}`
    )
    .digest("hex")
    .substring(0, 10);
}

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
  debugMode: z.boolean().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  interviewSeed: z.string().optional(),
  targetCompany: z.string().optional(),
  interviewStage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW UP",
    "BEHAVIOUR",
    "RAPID FIRE",
    "CLOSING"
  ]).optional(),
  
  difficultyLevel: z.enum([
    "EASY",
    "MEDIUM",
    "HARD"
  ]).optional(),
  
  askedQuestions: z.array(z.string()).optional(),
  
  candidateStrengths: z.array(z.string()).optional(),
  
  candidateWeaknesses: z.array(z.string()).optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  difficultyAdjustment: z.enum(["Easier", "Harder", "Maintain"]).optional(),
  isInterviewComplete: z.boolean(),
  debugPrompt: z.string().optional(),
  isMock: z.boolean().optional(),
  interviewSeed: z.string().optional(),
  nextInterviewStage: z.enum([
    "INTRODUCTION", "RESUME", "PROJECT", "TECHNICAL", "SCENARIO", "FOLLOW UP", "BEHAVIOUR", "RAPID FIRE", "CLOSING"
  ]).optional(),
  askedQuestions: z.array(z.string()).optional(),
  candidateStrengths: z.array(z.string()).optional(),
  candidateWeaknesses: z.array(z.string()).optional(),
  overallScore: z.number().optional(),
  finalRecommendation: z.string().optional(),
  hiringDecision: z.enum(["Strong Hire", "Hire", "Borderline", "Reject"]).optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are a Senior Technical Interviewer representing {{{targetCompany}}} for a {{{role}}} position ({{{experienceLevel}}} level).

GENERAL PERSONA RULES:
- BEHAVE EXACTLY LIKE AN EXPERIENCED HUMAN INTERVIEWER. Professional, neutral, and high-fidelity.
- NEVER say you are an AI or a model.
- Ask exactly ONE question at a time. Wait for the answer.
- NO robotic praise (e.g., "Good job", "Great answer"). 
- IF ANSWER IS WEAK: Challenge politely to expose gaps.
- IF ANSWER IS STRONG: Ask deeper technical drill-downs (sharding, consistency, edge cases).
- DO NOT reveal interview evaluation during the interview.

9-STAGE SEQUENCE (STRICT):
You MUST follow this sequence based on current stage: {{{interviewStage}}}.
1. INTRODUCTION -> 2. RESUME -> 3. PROJECT -> 4. TECHNICAL -> 5. SCENARIO -> 6. FOLLOW UP -> 7. BEHAVIOUR -> 8. RAPID FIRE -> 9. CLOSING.

STAGE OBJECTIVES:
- INTRODUCTION: Allowed ONLY once. "Tell me about yourself" or "Introduce yourself".
- RESUME: Anchored to resumeSkills or resumeSummary. Use exact names. If React, ask Rendering/Hooks. If .NET, ask DI/Middleware. If Java, ask JVM/GC.
- PROJECT: If resumeProjects NOT empty, select ONE. Mention project name exactly. Interrogate on: Why built, Architecture, Responsibility, Biggest Challenge, How solved, Current improvements.
- TECHNICAL: Deep-dive into stacks listed in resumeSkills (e.g. React Reconciliation, SQL Execution Plans).
- SCENARIO: Realistic production crises ONLY (e.g. API 500 spikes, slow DB, memory leaks, broken auth). Never ask textbook scenarios.
- FOLLOW UP: Reactive node. If they said "X", ask "Why X instead of Y?".
- BEHAVIOUR: Leadership Principles, failure, or team conflict.
- RAPID FIRE: Quick-fire technical concept verification.
- CLOSING: Professional wrap-up.

DIFFICULTY PROGRESSION:
- STRONG ANSWER (Depth, trade-offs) -> output difficultyAdjustment: "Harder".
- AVERAGE ANSWER (Correct but standard) -> output difficultyAdjustment: "Maintain".
- WEAK ANSWER (Shallow or incorrect) -> output difficultyAdjustment: "Easier".
- Current Difficulty: {{{difficultyLevel}}}.
  * EASY: Fundamentals, basic concepts.
  * MEDIUM: Debugging, real scenarios.
  * HARD: Architecture, Security, Scaling, Performance.

COMPANY-SPECIFIC PROTOCOL ({{{targetCompany}}}):
- Google: Problem solving, "why", scalability, algorithms, edge cases.
- Amazon: Leadership Principles, ownership, customer obsession, production crisis.
- Microsoft: Architecture, design decisions, debugging, collaboration.
- TCS/Infosys: Fundamentals, OOP, SQL, APIs, Cloud basics.
- Accenture: Enterprise applications, Agile, SDLC, communication.

ANTI-HALLUCINATION:
- ONLY ask questions based on resumeSkills, resumeProjects, and resumeSummary.
- NEVER invent projects or experience not in dossier.
- If resume is empty, switch to industry standards for {{{role}}}.

CURRENT STATUS:
Stage: {{{interviewStage}}}
Question: {{{currentMainQuestionIndex}}} of 9
History:
{{#each history}}
Q: {{{this.question}}}
A: {{{this.answer}}}
{{/each}}

Latest Candidate Response:
{{{userAnswer}}}

Based on the Protocol, output ONE interviewer question. Wait for response.
Return ONLY valid JSON matching the schema. No markdown, no explanation.`
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
        nextQuestion: "[DEBUG] Senior Interviewer Persona Active. Stage: " + (input.interviewStage || "INTRODUCTION"),
        feedbackOnLastAnswer: "DEBUG: Protocol synchronized.",
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        debugPrompt: "System check: Consolidated Protocol Active."
      };
    }

    try {
      const interviewSeed = createInterviewSeed(input.role, input.experienceLevel, input.roundType);
      const askedQuestions = input.askedQuestions || [];
      const interviewStage = getNextStage((input.interviewStage as any) || "INTRODUCTION", input.currentMainQuestionIndex);
      
      let output;
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await runWithResilience(prompt, {
          ...input,
          interviewSeed,
          interviewStage,
          askedQuestions,
        });
        output = result.output;
        if (output && !isQuestionRepeated(output.nextQuestion, askedQuestions)) break;
        output = undefined;
      }

      if (!output) throw new Error("Unable to generate unique interview question.");
      
      return {
        ...output,
        interviewSeed,
        askedQuestions: [...askedQuestions, output.nextQuestion || ""],
        nextInterviewStage: output.nextInterviewStage ?? interviewStage,
        difficultyAdjustment: output.difficultyAdjustment || "Maintain",
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        isMock: false
      };
    } catch (error) {
      console.error("AI Flow Error, using fallback:", error);
      // Fixed: robust indexing to prevent undefined nextQuestion
      const bankIndex = Math.max(0, input.currentMainQuestionIndex) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex] || FALLBACK_QUESTIONS[0],
        feedbackOnLastAnswer: "I appreciate that context. Let's move forward.",
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        isMock: true
      };
    }
  }
);