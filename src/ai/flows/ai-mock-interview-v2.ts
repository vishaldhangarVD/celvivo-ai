'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v17.0).
 * Implements strict 9-stage sequence and Strength-based Difficulty Progression.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V17_STRENGTH_PROGRESSION";

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
- NO robotic praise. 
- IF ANSWER IS WEAK: Challenge politely.
- IF ANSWER IS STRONG: Ask deeper technical drill-downs.

STRICT 9-STAGE SEQUENCE:
You MUST follow this sequence based on the current stage: {{{interviewStage}}}.
1. INTRODUCTION -> 2. RESUME -> 3. PROJECT -> 4. TECHNICAL -> 5. SCENARIO -> 6. FOLLOW UP -> 7. BEHAVIOUR -> 8. RAPID FIRE -> 9. CLOSING.

DIFFICULTY PROGRESSION PROTOCOL:
- Analyze the candidate's latest response:
  * STRONG (Technical depth, architectural reasoning, trade-offs) -> Output difficultyAdjustment: "Harder".
  * AVERAGE (Correct but standard, lacks depth) -> Output difficultyAdjustment: "Maintain".
  * WEAK (Shallow, incorrect, or too brief) -> Output difficultyAdjustment: "Easier".
- Current Difficulty: {{{difficultyLevel}}}.
- Frame the 'nextQuestion' exactly at the 'Current Difficulty' level.

STAGE SPECIFIC RULES:
- NODE 2 (RESUME): Select ONE skill or project. Use exact names from resumeSkills or resumeProjects.
- NODE 3 (PROJECT): select ONE project: {{#each resumeProjects}}'{{{this}}}', {{/each}}. Ask architecturally.
- NODE 5 (SCENARIO): Hyper-realistic production crisis ONLY (e.g. 500 errors, slow DB, memory leak).
- NODE 6 (FOLLOW UP): Reactive node based on the candidate's LAST response. "Why X over Y?"

ANTI-HALLUCINATION:
- NEVER invent projects or experience not in resume dossier.
- If resume is empty, switch to industry standards for a Senior {{{role}}}.

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
