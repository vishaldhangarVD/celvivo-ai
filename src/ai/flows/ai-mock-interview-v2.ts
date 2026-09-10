'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent.
 * Unified with central model protocol to prevent 404 mismatches.
 * Includes explicit telemetry for turn-by-turn debugging.
 */

import { ai, runWithResilience, PRIMARY_MODEL } from '@/ai/genkit';
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
  _debug: z.object({
    modelUsed: z.string(),
    geminiSucceeded: z.boolean(),
    geminiError: z.string().optional(),
    usedFallback: z.boolean()
  }).optional()
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Technical Interviewer conducting a realistic, high-fidelity interview for a {{{role}}} position at {{{targetCompany}}}.

GENERAL PERSONA RULES:
- Act exactly like an experienced human interviewer. Professional, natural, and conversational.
- NEVER mention you are an AI.
- ASK ONLY ONE QUESTION AT A TIME.
- VOCAL CONCISENESS: Keep questions short and impactful (Maximum 2-3 sentences).
- Connect questions to the candidate's Resume, Previous Answers, and Round 1 performance.

CANDIDATE DOSSIER:
- Role: {{{role}}} ({{{experienceLevel}}} Level)
- Resume Summary: {{{resumeSummary}}}
- Resume Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Resume Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Round 1 Scores: Aptitude: {{{aptitudeScore}}}%, Coding: {{{codingScore}}}%

INTERVIEW FLOW PROTOCOL:

NODE 1 (INTRODUCTION):
If history is empty, you MUST start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (RESUME/PROJECT):
Analyze the resume projects/skills. Select a specific technology or project (e.g., {{{resumeProjects.[0]}}}) and ask a practical question about the implementation or challenges.

NODE 3 (TECHNICAL/SCENARIO):
Ask role-specific questions. Focus on technical reasoning and architectural trade-offs, not textbook definitions.

NODE 4 (FOLLOW_UP/BEHAVIOUR):
Listen to the candidate's latest response. Ask a follow-up that starts with "Why that choice?", "What alternatives were considered?", or "How did you handle the conflict?".

NODE 5 (CLOSING):
If current index >= 12, finish naturally with: "Thank you for your time. That concludes today's interview. It was nice speaking with you."

MANDATORY ANTI-REPETITION:
DO NOT REPEAT ANY OF THESE QUESTIONS:
{{#each askedQuestions}}
- {{{this}}}
{{/each}}

SEMANTIC IDENTITY CHECK: Ensure the core concept of your next question is entirely different from the questions listed above.

CONVERSATION HISTORY:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Task: Generate the NEXT unique question for the {{{currentStage}}} stage.
Return ONLY valid JSON with the natural spoken dialogue in 'nextQuestion'.`
});

const aiMockInterviewFlow = ai.defineFlow(
  {
    name: 'aiMockInterviewFlow',
    inputSchema: AiMockInterviewInputSchema,
    outputSchema: AiMockInterviewOutputSchema,
  },
  async (input) => {
    const turnNumber = input.currentMainQuestionIndex;
    const askedCount = input.askedQuestions?.length || 0;
    
    console.log(`[Special HR] Turn ${turnNumber} - Starting Neural Synthesis. History Size: ${input.history.length}. Previously Asked: ${askedCount}`);

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
    
      if (!output) throw new Error("Neural synthesis empty.");
    
      console.log(`[Special HR] Turn ${turnNumber} - Gemini SUCCESS. Generated: "${output.nextQuestion.substring(0, 60)}..."`);

      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
        _debug: {
          modelUsed: PRIMARY_MODEL,
          geminiSucceeded: true,
          usedFallback: false
        }
      };
    
    } catch (error: any) {
      console.error(`[Special HR] Turn ${turnNumber} - Neural FAILURE:`, error.message);
      
      const isQuotaError = error.message?.includes("429") || error.message?.includes("Quota");
      const fallbackIdx = input.currentMainQuestionIndex % FALLBACK_QUESTIONS.length;
      
      const fallbackMsg = isQuotaError 
        ? "My apologies, our AI connection is experiencing high demand due to free-tier limits. I'm carefully analyzing your points—please allow me a brief moment to synchronize our next discussion node."
        : FALLBACK_QUESTIONS[fallbackIdx];

      return {
        nextQuestion: fallbackMsg,
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
        isHint: false,
        _debug: {
          modelUsed: PRIMARY_MODEL,
          geminiSucceeded: false,
          geminiError: error.message,
          usedFallback: true
        }
      };
    }
  }
);