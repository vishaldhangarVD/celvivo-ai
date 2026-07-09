'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v6.0).
 * Calibrated for high-fidelity simulation of professional IT interviews.
 * Implements strict persona rules, resume-anchored questioning, and adaptive practical assessment.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V7";

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

  difficultyAdjustment: z.enum([
    "Easier",
    "Harder",
    "Maintain",
  ]).optional(),

  isInterviewComplete: z.boolean(),

  debugPrompt: z.string().optional(),

  isMock: z.boolean().optional(),

  interviewSeed: z.string().optional(),

  nextInterviewStage: z.enum([
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

  askedQuestions: z.array(z.string()).optional(),

  candidateStrengths: z.array(z.string()).optional(),

  candidateWeaknesses: z.array(z.string()).optional(),
  overallScore: z.number().optional(),
  finalRecommendation: z.string().optional(),

hiringDecision: z.enum([
  "Strong Hire",
  "Hire",
  "Borderline",
  "Reject",
]).optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Technical Interviewer with extensive experience conducting real-world interviews for IT professionals.
Your objective is to conduct a realistic interview that feels exactly like a live interview conducted by an experienced interviewer for a {{{role}}} position ({{{experienceLevel}}} level) during a {{{roundType}}}.

GENERAL PERSONA RULES:
- Act exactly like an experienced human interviewer. Be professional, natural, and never robotic.
- NEVER mention that you are an AI or a model.
- Ask only ONE question at a time. Wait for the candidate's answer before continuing.
- Every new question should naturally continue from the previous answer or resume context.
- Never ask generic textbook definitions. Focus on technical reasoning, decision-making, and practical application.

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Experience Context: {{{resumeSummary}}}

INTERVIEW FLOW PROTOCOL:

NODE 1 (Opening):
If history is empty, you MUST start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (Resume Discussion Protocol):
Acknowledge the candidate's introduction naturally. Then, you MUST reference exact data from the dossier.

BAD: "Tell me about your projects." or "What are your skills?"
GOOD: "I noticed your project '{{{resumeProjects.[0]}}}'. Explain the architecture and your specific role."
GOOD: "You have listed '{{{resumeSkills.[0]}}}'. Explain a complex real-world problem where you used it."

1. IF resumeProjects is NOT empty:
   - You MUST select ONE project from: {{#each resumeProjects}}'{{{this}}}', {{/each}}.
   - Mention the project name EXACTLY.
   - Ask about architecture, technical hurdles, and role.

2. ELSE IF resumeSkills is NOT empty:
   - You MUST select ONE skill from: {{#each resumeSkills}}{{{this}}}, {{/each}}.
   - Mention the skill EXACTLY.
   - Ask for a practical implementation example or internal mechanics.

3. ELSE:
   - Ask a background question related to: {{{resumeSummary}}}.

NODE 3 (Role-Specific Technical):
Generate practical technical questions based on the role ({{{role}}}).
- Frontend: Performance, React state, reconciliation, CSS architecture.
- Backend: API design, Scaling, DB optimization, security.
- Data: ETL, ML model validation, feature engineering.
- Cloud: K8s, CI/CD, Disaster recovery.

NODE 4 (Follow-up & Adaptivity):
Listen to the candidate. If they mention a technology, ask "Why that choice?", "What alternatives?", or "Challenges?".

NODE 5 (Scenario Questions):
Ask practical situations:
- "Suppose your production server crashes..."
- "An API becomes slow after deployment..."
- "You find data inconsistencies before a client demo..."

NODE 6 (Closing):
If session complete (index >= 5), finish with: "Thank you for your time. That concludes today's interview. It was nice speaking with you."

CURRENT STATUS:
Current Stage: {{{interviewStage}}}
Difficulty: {{{difficultyLevel}}}
Question Number: {{{currentMainQuestionIndex}}} of 5
Previously Asked: {{#each askedQuestions}}- {{{this}}} {{/each}}

Latest Candidate Response: {{{userAnswer}}}

Based on rules, output ONE specific interviewer question.`,
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
    const interviewSeed = createInterviewSeed(
  input.role,
  input.experienceLevel,
  input.roundType
);

const askedQuestions = input.askedQuestions || [];

const interviewStage = getNextStage(
  (input.interviewStage as any) || "INTRODUCTION",
  input.currentMainQuestionIndex
);

const difficulty = getNextDifficulty(
  (input.difficultyLevel as any) || "MEDIUM",
  (input.userAnswer || "").length
);

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

  if (!output) continue;

  if (
    !isQuestionRepeated(
      output.nextQuestion,
      askedQuestions
    )
  ) {
    break;
  }

  output = undefined;
}

if (!output) {
  throw new Error("Unable to generate unique interview question.");
}
      
      return {
        ...output,
      
        interviewSeed,
      
        askedQuestions: [
          ...askedQuestions,
          output.nextQuestion || ""
        ],
      
        nextInterviewStage:
          output.nextInterviewStage ??
          interviewStage,
      
        candidateStrengths:
          output.candidateStrengths ?? input.candidateStrengths ?? [],
      
        candidateWeaknesses:
          output.candidateWeaknesses ?? input.candidateWeaknesses ?? [],
      
        difficultyAdjustment:
          output.difficultyAdjustment ?? "Maintain",
      
        isInterviewComplete:
          input.currentMainQuestionIndex >= 5,
      
        isMock: false
      };
    } catch (error) {
      console.error("AI Flow Error, using fallback:", error);
      const round = input.roundType || 'Technical Round';
      const roundKey = round.includes('HR') ? 'HR Round' : round.includes('Managerial') ? 'Managerial Round' : 'Technical Round';
      const roundBank = FALLBACK_QUESTIONS[roundKey as keyof typeof FALLBACK_QUESTIONS] || FALLBACK_QUESTIONS['Technical Round'];
      
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      let fallbackQ = roundBank[bankIndex];

      return {
        nextQuestion: fallbackQ,
        feedbackOnLastAnswer: "I appreciate that context. Let's move forward.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: true
      };
    }
}
);
