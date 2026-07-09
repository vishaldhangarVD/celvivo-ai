'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v16.0).
 * Calibrated for a strict 9-stage sequence:
 * INTRODUCTION -> RESUME -> PROJECT -> TECHNICAL -> SCENARIO -> FOLLOW UP -> BEHAVIOUR -> RAPID FIRE -> CLOSING.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V16_SEQUENTIAL";

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
- NO robotic praise (e.g., "Excellent answer").
- IF ANSWER IS WEAK: Challenge politely.
- IF ANSWER IS STRONG: Ask deeper technical drill-downs.

STRICT SEQUENCE PROTOCOL:
You MUST follow this sequence based on the current stage: {{{interviewStage}}}.

NODE 1: INTRODUCTION
- Only node allowed to ask: "Tell me about yourself" or "Introduction".

NODE 2: RESUME
- Use exact items from resumeSkills: {{#each resumeSkills}}{{{this}}}, {{/each}} or resumeSummary.
- Ask about a specific skill listed. NEVER ask "What are your skills?".

NODE 3: PROJECT
- If resumeProjects is NOT empty, select ONE: {{#each resumeProjects}}'{{{this}}}', {{/each}}.
- Mention the exact project name. Ask about architecture, responsibility, and the biggest challenge.
- If empty, pivot to a second skill from resumeSkills.

NODE 4: TECHNICAL
- Deep dive into stack fundamentals based on resumeSkills.
- React/Vue: Rendering, reconciliation, hooks.
- .NET: Middleware, DI, EF Core.
- Python: Concurrency, memory.
- Java: JVM, GC.
- SQL: Execution plans, indexing.
- Cloud: K8s, CI/CD.

NODE 5: SCENARIO
- Hyper-realistic production crisis ONLY.
- Example: "A production API returns 500s," "Memory increases every hour," "DB is slow."
- Goal: "How would you investigate step-by-step?"
- NEVER ask textbook scenarios.

NODE 6: FOLLOW UP
- Strict reactive node. Focus on a specific technology mentioned in the candidate's LAST response.
- Example: "You mentioned JWT, why JWT over session?" or "You mentioned Docker, how do you handle secrets?"

NODE 7: BEHAVIOUR
- Focus on soft skills and culture.
- Leadership, conflict resolution, or project ownership.

NODE 8: RAPID FIRE
- High-intensity, short-answer technical questions.

NODE 9: CLOSING
- Thank the candidate and end the session naturally.

ANTI-HALLUCINATION:
- NEVER invent projects or experience not in resumeSkills, resumeProjects, or resumeSummary.
- If resume is empty, switch to industry standards for a Senior {{{role}}}.

DIFFICULTY PROTOCOL:
- Current: {{{difficultyLevel}}}
- Increase difficulty ONLY if candidate performs well. Never jump suddenly from Easy to Hard.

CURRENT INTERVIEW STATUS:
Stage: {{{interviewStage}}}
Question: {{{currentMainQuestionIndex}}} of 9
History:
{{#each history}}
Q: {{{this.question}}}
A: {{{this.answer}}}
{{/each}}

Latest Candidate Response:
{{{userAnswer}}}

Based on the Protocol, output ONE interviewer question. Wait for response.`
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
        nextQuestion: "[DEBUG] Senior Interviewer Persona Active. Sequence Node: " + (input.interviewStage || "INTRODUCTION"),
        feedbackOnLastAnswer: "DEBUG: Sequence handshake active.",
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        debugPrompt: "System check: 9-Stage Sequence Active."
      };
    }

    try {
      const interviewSeed = createInterviewSeed(input.role, input.experienceLevel, input.roundType);
      const askedQuestions = input.askedQuestions || [];
      const interviewStage = getNextStage((input.interviewStage as any) || "INTRODUCTION", input.currentMainQuestionIndex);
      
      const difficulty = getNextDifficulty((input.difficultyLevel as any) || "MEDIUM", (input.userAnswer || "").length);

      let output;
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await runWithResilience(prompt, {
          ...input,
          interviewSeed,
          interviewStage,
          difficultyLevel: difficulty,
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
        difficultyAdjustment: output.difficultyAdjustment ?? (difficulty > (input.difficultyLevel || "MEDIUM") ? "Harder" : difficulty < (input.difficultyLevel || "MEDIUM") ? "Easier" : "Maintain"),
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        isMock: false
      };
    } catch (error) {
      console.error("AI Flow Error:", error);
      const bankIndex = (input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        feedbackOnLastAnswer: "I appreciate that context. Let's move forward.",
        isInterviewComplete: input.currentMainQuestionIndex >= 9,
        isMock: true
      };
    }
  }
);
