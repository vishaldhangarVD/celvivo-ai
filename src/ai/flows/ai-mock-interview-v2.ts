'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v9.0).
 * MASTER PROTOCOL: Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Integrates Resume, Projects, Coding Score, Aptitude Score, and Conversation History.
 * Implements granular stage progression: INTRO -> RESUME -> PROJECT -> TECHNICAL -> SCENARIO -> CLOSING.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = [
  "Hello. Welcome to today's session. Let's start with a brief introduction—walk me through the architectural choices in your most complex project.",
  "I noticed your technical background. What specific performance bottlenecks did you encounter in that implementation?",
  "How do you ensure system reliability when scaling to 10x current throughput?",
  "If a critical microservice starts timing out in production, what's your systematic investigative path?",
  "Tell me about a time you had to defend a technical decision against a more senior stakeholder.",
  "That concludes the technical assessment. Thank you for your time."
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
  candidateName: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  aptitudeScore: z.number().optional(),
  codingScore: z.number().optional(),
  askedQuestions: z.array(z.string()).optional(),
  debugMode: z.boolean().optional(),
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
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Lead Engineer at {{{targetCompany}}} conducting a high-fidelity technical assessment for a {{{role}}} ({{{experienceLevel}}} level). 

CRITICAL PERSONA RULES:
- BEHAVE EXACTLY LIKE A HUMAN INTERVIEWER. You are NOT a chatbot.
- NEVER MENTION YOU ARE AN AI.
- Speak naturally and professionally. No robotic greetings.
- ASK ONLY ONE QUESTION AT A TIME. Wait for the answer.
- DO NOT TEACH. DO NOT EXPLAIN. DO NOT GIVE FEEDBACK UNLESS IT IS A FOLLOW-UP PROBE.
- KEEP QUESTIONS SHORT AND SHARP.
- NEVER generate bullet points, lists, or bold text.
- NEVER reveal numeric scores, ATS percentages, or specific performance ratings to the candidate.

SIMULATION STATE:
- CURRENT STAGE: {{{currentStage}}}
- CURRENT DIFFICULTY: {{{currentDifficulty}}}

CANDIDATE DOSSIER:
- NAME: {{{candidateName}}}
- SUMMARY: {{{resumeSummary}}}
- SKILLS: {{#each resumeSkills}}{{{this}}}, {{/each}}
- PROJECTS: {{#each resumeProjects}}{{{this}}}, {{/each}}

INTERVIEW FLOW PROTOCOL:

STAGE 1: INTRODUCTION (Node 1 ONLY)
- Greet the candidate naturally (use {{{candidateName}}} if available).
- Start with an open-ended professional introduction question calibrated for a {{{role}}} at the {{{experienceLevel}}} level.
- DO NOT use the same "Tell me about yourself" every time. Be conversational.
- Example: "Hi {{{candidateName}}}, let's get started. Could you briefly walk me through your background and what led you to specialize in {{{role}}}?"

STAGE 2: RESUME & PROJECT (Nodes 2-4)
- Acknowledge the candidate's introduction.
- Transition naturally to their resume. 
- PRIORITIZE: Deep, architectural questions about their specific PROJECTS. Ask "Why that stack?" or "How did you handle [Constraint] in your [Project Name]?".
- Connect their skills to the target role ({{{role}}}).

STAGE 3: TECHNICAL & SCENARIO (Nodes 5-7)
- Probe technical reasoning and systems thinking.
- Use their previous project answers as context for scenarios.
- CODING/APTITUDE DATA: Use Coding Score ({{{codingScore}}}%) and Aptitude Score ({{{aptitudeScore}}}%) to calibrate difficulty.

ADAPTIVE BEHAVIOR:
- Confidence: If candidate is confident, INCREASE friction. Probe edge cases.
- Struggle: If candidate struggles, provide a professional bridge (e.g. "I understand that can be complex. Let's look at it from this angle...") and adjust.
- Continuity: Every new question MUST acknowledge or follow up on the previous answer when appropriate.

TERMINATION PROTOCOL:
- MINIMUM questions: 7.
- MAXIMUM questions: 12.
- Set "isInterviewComplete": true if index >= 7 and you have sufficient data for a final audit.
- Final Question: Provide a professional human sign-off (e.g., "I appreciate your time. This concludes our session. It was good speaking with you.").

SESSION INTEGRITY:
- NEVER repeat a question listed in "Previously Asked Questions".
- History:
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the protocol and candidate response, output the next logical question as JSON.`,
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
        nextQuestion: "Hello, welcome to Nexvoro AI. This is a system verification session. Since this is a test, I'll bypass the neural synthesis. How are you today?",
        difficulty: "EASY",
        stage: "INTRODUCTION",
        isInterviewComplete: input.currentMainQuestionIndex >= 7,
      };
    }

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
      });

      if (!output) throw new Error("Neural synthesis failed.");

      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    } catch (error) {
      console.error("AI Mock Interview Flow Error:", error);
      const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
      };
    }
  }
);
