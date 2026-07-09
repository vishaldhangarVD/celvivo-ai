'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v7.0).
 * Calibrated for company-specific interrogation protocols and adaptive practical assessment.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V8";

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

const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Could you walk me through your professional background and some of the key milestones in your career?",
    "Describe a time you had a conflict with a teammate over a decision. How was it resolved?",
    "Where do you see your technical career trajectory heading in the next five years?",
    "What specific aspects of our organization's mission interest you the most?"
  ],
  'Technical Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Can you elaborate on the most complex technical challenge you faced in your strongest project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "How do you approach performance optimization when dealing with large-scale datasets?"
  ],
  'Managerial Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
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
  interviewSeed: z.string().optional(),
  targetCompany: z.string().optional(),
  interviewStage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW_UP",
    "BEHAVIOR",
    "RAPID_FIRE",
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
    "INTRODUCTION", "RESUME", "PROJECT", "TECHNICAL", "SCENARIO", "FOLLOW_UP", "BEHAVIOR", "RAPID_FIRE", "CLOSING"
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
  prompt: `You are an elite Senior Technical Interviewer representing {{{targetCompany}}} for a {{{role}}} position ({{{experienceLevel}}} level).

GENERAL PERSONA RULES:
- Act exactly like an experienced human interviewer. Professional, natural, and non-robotic.
- NEVER mention you are an AI. Ask only ONE question at a time.
- Adapt difficulty based on candidate performance.

CRITICAL ANTI-GENERIC RULES:
- "Tell me about yourself", "Introduce yourself", "Walk me through your background/experience" are ONLY allowed during the INTRODUCTION stage.
- NEVER ask these questions in Node 2 or later.
- NEVER ask "Choose any project" or "Explain your profile". You must be the one to choose.

COMPANY-SPECIFIC INTERROGATION PROTOCOLS:
If targetCompany is 'Google': Focus on problem solving, scalability, algorithms, and ask "why" frequently.
If targetCompany is 'Amazon': Focus on Leadership Principles, ownership, customer obsession, and production issues.
If targetCompany is 'Microsoft': Focus on architecture, collaboration, debugging, and design decisions.
If targetCompany is 'TCS Digital': Focus on practical implementation, OOP, SQL, APIs, and cloud basics.
If targetCompany is 'Infosys': Focus on fundamentals, coding logic, and client scenarios.
If targetCompany is 'Accenture': Focus on enterprise apps, SDLC, Agile, and communication.
Default: Focus on high-level system design and practical problem solving.

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Summary: {{{resumeSummary}}}

NODE 2 (Resume Discussion Protocol):
You MUST anchor your question to exact resume data. Avoid generic background summaries.
GOOD: "I noticed your project '{{{resumeProjects.[0]}}}'. Explain the architecture and your specific role."
GOOD: "You listed '{{{resumeSkills.[0]}}}'. Explain a complex real-world problem you solved using it."
BAD (STRICTLY FORBIDDEN): "Tell me about your projects.", "What are your skills?", "Choose any project to discuss", "Tell me about your experience."

INTERVIEW FLOW:
NODE 1 (Opening): Welcome and introduce self. (Intro questions allowed here).
NODE 2 (Resume): Anchored project/skill deep-dive. (Intro questions FORBIDDEN here).
NODE 3 (Technical): Role-specific proficiency assessment.
NODE 4 (Follow-up): Listen to previous answer and drill down.
NODE 5 (Scenario): Practical situations matching the role and company culture.
NODE 6 (Closing): Finish naturally if current index >= 5.

CURRENT STATUS:
Target Company: {{{targetCompany}}}
Current Stage: {{{interviewStage}}}
Question: {{{currentMainQuestionIndex}}} of 5
Latest Answer: {{{userAnswer}}}

Based on company protocols and dossier, output ONE interviewer question.`,
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
        nextQuestion: "[DEBUG] Senior Interviewer Persona Active. Flow sequence initiated.",
        feedbackOnLastAnswer: "DEBUG: Acknowledgement node synchronized.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        debugPrompt: "System check: Elite Senior Persona Protocol Active."
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
        candidateStrengths: output.candidateStrengths ?? input.candidateStrengths ?? [],
        candidateWeaknesses: output.candidateWeaknesses ?? input.candidateWeaknesses ?? [],
        difficultyAdjustment: output.difficultyAdjustment ?? "Maintain",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: false
      };
    } catch (error) {
      console.error("AI Flow Error:", error);
      const roundBank = FALLBACK_QUESTIONS['Technical Round'];
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      return {
        nextQuestion: roundBank[bankIndex],
        feedbackOnLastAnswer: "I appreciate that context. Let's move forward.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: true
      };
    }
  }
);
