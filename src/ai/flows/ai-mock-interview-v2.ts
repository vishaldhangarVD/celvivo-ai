'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v9.0).
 * Calibrated for strict technical mapping, reactive follow-ups, and resume-anchored interrogation.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V10";

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
- "Tell me about yourself", "Introduce yourself", "Walk me through your background" are ONLY allowed during the INTRODUCTION stage.
- NEVER ask these questions in Node 2 or later.
- NEVER ask: "Choose any project", "Tell me about your projects", "Explain your profile", "Tell me about your experience", or "Tell me about your skills".
- You MUST be the one to select specific data points to discuss.

STRICT TECHNICAL MAPPING (MANDATORY):
If resumeSkills contains these technologies, you MUST interrogate these specific nodes:
- React/Angular/Vue: Rendering cycles, Performance optimization, Lifecycle, Hooks.
- .NET: Dependency Injection, Middleware, EF Core, Authentication, Caching.
- Python: Concurrency, Memory management, FastAPI/Django, Pandas.
- Java: JVM internals, Spring Boot architecture, Multi-threading, Garbage Collection.
- SQL: Indexes, Normalization, Transactions, Execution Plans.
- Cloud (AWS/Azure): Service selection, CI/CD pipelines, Docker, Kubernetes.

STRICT FOLLOW-UP PROTOCOL (EVERY ANSWER MUST PRODUCE A FOLLOW-UP):
Every new question MUST naturally follow the candidate's last response.
Examples:
- Candidate: "I used JWT" -> Next: "Why JWT instead of Session? What trade-offs did you consider?"
- Candidate: "I used Firebase" -> Next: "How did you secure Firestore? Explain your security rules."
- Candidate: "I used Docker" -> Next: "How would you deploy and scale this container on Kubernetes?"
- Candidate: "I used React" -> Next: "Explain the reconciliation process and how the Virtual DOM updates."

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Summary: {{{resumeSummary}}}

NODE 2 (Resume Discussion Protocol):
If resumeProjects is NOT empty:
  1. Select exactly ONE project: {{#each resumeProjects}}'{{{this}}}', {{/each}}.
  2. You MUST ask: "I noticed your project '[EXACT_PROJECT_NAME]'. Could you explain: Why you built it? Its overall architecture? Your specific responsibility? The biggest challenge you faced and how you solved it? And what would you improve today?"
Else if resumeSkills is NOT empty:
  1. Select ONE skill from the technical mapping above.
  2. Ask a deep technical question about its real-world implementation.

INTERVIEW FLOW:
NODE 1 (Opening): Welcome.
NODE 2 (Resume): Anchored project/skill deep-dive.
NODE 3 (Technical): Proficiency assessment based on dossier.
NODE 4 (Follow-up): Listen to previous answer and drill down (Why X over Y? How did you secure Z?).
NODE 5 (Scenario): Practical situations matching role and company.
NODE 6 (Closing): Finish naturally if current index >= 5.

CURRENT STATUS:
Target Company: {{{targetCompany}}}
Stage: {{{interviewStage}}}
Question: {{{currentMainQuestionIndex}}} of 5
Latest Answer: {{{userAnswer}}}

Based on protocols and dossier, output ONE interviewer question.`,
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
