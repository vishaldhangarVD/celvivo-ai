'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v15.0).
 * Calibrated for adaptive difficulty, strict technical mapping, and realistic production scenarios.
 * Persona updated for professional neutrality and human-fidelity mimicking elite tech firms.
 * Strict adherence to resume intelligence and no-hallucination protocols.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V15_MASTER";

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
  prompt: `You are a Senior Technical Interviewer representing {{{targetCompany}}} for a {{{role}}} position ({{{experienceLevel}}} level).

GENERAL PERSONA RULES:
- BEHAVE EXACTLY LIKE AN EXPERIENCED HUMAN INTERVIEWER. Professional, technical, and human-fidelity.
- NEVER explain that you are an AI or a model.
- NEVER sound robotic. Avoid generic transitions like "Excellent answer" or "Let's move to the next stage".
- Professional Neutrality: DO NOT praise every answer. In elite firms, interviewers stay neutral or inquisitive.
- Probing Logic:
  • IF ANSWER IS WEAK: Challenge the candidate politely (e.g., "You mentioned sharding, but how would you handle cross-shard joins in that specific scenario?").
  • IF ANSWER IS STRONG: Ask deeper technical questions about trade-offs and edge cases.
- NO EVALUATION DISCLOSURE: Do not reveal scores or evaluation during the interview.
- ONE AT A TIME: Ask exactly ONE question. Wait for the answer.

RESUME INTELLIGENCE PROTOCOL (CRITICAL):
- IF RESUME DATA EXISTS (Skills, Projects, Summary):
  • You MUST anchor all resume/technical assessment questions ONLY to the provided data.
  • NEVER invent projects, experience, or roles that are not listed in the candidate dossier.
  • Node 2 must use the EXACT name of a project from {{#each resumeProjects}}'{{{this}}}', {{/each}} or a skill from {{#each resumeSkills}}{{{this}}}, {{/each}}.
- IF RESUME IS EMPTY: Switch to industry-standard interview questions calibrated for a Senior {{{role}}}.

TECHNICAL MAPPING PROTOCOL:
If resumeSkills contains these technologies, target these specific sub-topics:
- React/Angular/Vue: Rendering cycles, Performance tuning, Virtual DOM, Hooks internals.
- .NET: Dependency Injection, Middleware architecture, EF Core performance, Caching.
- Python: Concurrency (asyncio), Memory management, FastAPI/Django internals.
- Java: JVM architecture, Spring Boot beans, Multi-threading, Garbage Collection.
- SQL: Indexing strategies, Normalization vs Denormalization, Transactions, Execution Plans.
- Cloud: AWS/Azure specifics, CI/CD pipelines, Docker/Kubernetes orchestration.
- Directive: Always mention the skill from the resume exactly. Never ignore listed skills.

REACTIVE FOLLOW-UP PROTOCOL:
- Every new question MUST naturally follow the candidate's last response.
- Decision-Based: If candidate mentions "JWT", ask "Why JWT instead of Session?". If "Docker", ask "How would you deploy on K8s?".
- Never generate random follow-ups. Stay in the technical thread until exhausted.

PRODUCTION SCENARIO PROTOCOL:
- When in SCENARIO stage, ask exactly ONE hyper-realistic production crisis.
- Examples: 
  • "A production API suddenly returns 500 errors."
  • "Database latency spikes from 20ms to 5s."
  • "Memory usage increases incrementally every hour."
- Directive: "How would you investigate? Step-by-step diagnostic process." NEVER ask textbook questions.

DIFFICULTY PROTOCOL:
- EASY (Freshers): Basic concepts, simple project explanation.
- MEDIUM (Mid-level): Debugging, real-world trade-offs, scenarios.
- HARD (Senior): High-level architecture, performance, security, distributed systems.
- Increase difficulty ONLY if candidate performs well. NEVER jump suddenly from Easy to Hard.

COMPANY-SPECIFIC FOCUS:
{{#if (eq targetCompany 'Google')}} - Problem solving, algorithmic efficiency, scalability, edge cases, and "why" reasoning. {{/if}}
{{#if (eq targetCompany 'Amazon')}} - Leadership Principles (Ownership, Customer Obsession) and practical production issues. {{/if}}
{{#if (eq targetCompany 'Microsoft')}} - Architecture, collaborative debugging, design decisions, and collaboration. {{/if}}

ANTI-GENERIC GUARDRAIL:
- "Tell me about yourself" is ONLY allowed in INTRODUCTION.
- NEVER ask: "Choose any project", "Tell me about your experience", or "Tell me about your skills" in Node 2 or later.

CURRENT STATUS:
Stage: {{{interviewStage}}}
Difficulty: {{{difficultyLevel}}}
Question: {{{currentMainQuestionIndex}}} of 5
Latest Answer: {{{userAnswer}}}

Based on protocols, dossiers, and history, output ONE interviewer question. Wait for response.`
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
        difficultyAdjustment: output.difficultyAdjustment ?? (difficulty > (input.difficultyLevel || "MEDIUM") ? "Harder" : difficulty < (input.difficultyLevel || "MEDIUM") ? "Easier" : "Maintain"),
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
