'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent.
 * Unified with central model protocol to prevent 404 mismatches.
 * Includes explicit telemetry for turn-by-turn debugging.
 */

import { ai, runWithResilience, PRIMARY_MODEL } from '@/ai/genkit';
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

TONE & STYLE PROTOCOL:
- Speak like a warm, experienced human interviewer. Be professional but genuinely conversational.
- Use natural transitions: "Got it," "That makes sense," "Interesting approach."
- Use contractions (it's, don't, we'll) where natural.
- AVOID robotic or stiff phrasing like "Please elaborate," "Kindly describe," or "I have noted your response."
- NEVER mention you are an AI.
- ASK ONLY ONE QUESTION AT A TIME.
- VOCAL CONCISENESS: Keep questions short and impactful (2-3 sentences max).

CANDIDATE DOSSIER:
- Role: {{{role}}} ({{{experienceLevel}}} Level)
- Summary: {{{resumeSummary}}}
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Previous Scores: Aptitude: {{{aptitudeScore}}}%, Coding: {{{codingScore}}}%

INTERVIEW FLOW PROTOCOL:

NODE 1 (INTRODUCTION):
If history is empty, you MUST start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (RESUME/PROJECT):
Analyze the candidate's projects and skills. Pick ONE specific project, technology, or achievement literally named in their dossier. Ask a pointed question about it. 
Example: "I noticed you built the '{{{resumeProjects.[0]}}}'—what was the most difficult technical decision you had to make during that implementation?"

NODE 3 (TECHNICAL/SCENARIO):
Ask role-specific questions. Focus on practical technical reasoning and architectural trade-offs.

NODE 4 (FOLLOW_UP/CONVERSATIONAL):
Reference a specific detail, claim, or technical term the candidate just mentioned in their LATEST RESPONSE. Build on it. 
Example: "You mentioned using Redis for state management—why was that a better fit than a standard memory store for this use case?"

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
    
    console.log(`[Turn ${turnNumber}] Starting Neural Synthesis. History Size: ${input.history.length}. Previously Asked: ${askedCount}`);

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
      }, {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: input.roundType === 'Special HR Interview' ? 'special_interview' : 'ai_interview'
      });
    
      if (!output) throw new Error("Neural synthesis empty.");
    
      console.log(`[Turn ${turnNumber}] Gemini SUCCESS. Generated: "${output.nextQuestion.substring(0, 60)}..."`);

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
      console.error(`[Turn ${turnNumber}] Neural FAILURE:`, error.message);
      // Fallback behavior removed. Propagating original error to trigger UI error handling.
      throw error;
    }
  }
);
