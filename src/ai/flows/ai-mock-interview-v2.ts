'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent.
 * High-fidelity, resume-grounded interview simulation protocol.
 * Calibrated to prioritize candidate projects and specific resume nodes.
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

CANDIDATE RESUME — SOURCE OF TRUTH
Summary:
{{{resumeSummary}}}

Skills:
{{#each resumeSkills}}
- {{{this}}}
{{/each}}

Projects:
{{#each resumeProjects}}
- {{{this}}}
{{/each}}

STRICT GROUNDING RULES:
- Only reference projects, skills, or achievements explicitly listed in the 'CANDIDATE RESUME' section.
- Never claim the candidate built a specific system or used a specific tech unless it is in the data above.
- If the resume data is empty, default to role-based technical questioning.

INTERVIEW FLOW PROTOCOL:

NODE 1 (INTRODUCTION):
If history is empty AND currentMainQuestionIndex is 1, you MUST start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (RESUME / PROJECT ANCHOR):
If currentMainQuestionIndex is 2, you MUST ask a question based on a specific project (prioritize this) or skill from the resume. You MUST mention the name of the project or skill in your question.
Example: "I noticed you developed a 'Placement Prediction System' using ML—what was the biggest data quality challenge you faced during that project?"

NODE 3 (PERSONALIZED TECHNICAL):
Ask technical questions that relate to the candidate's demonstrated skills or projects. Use their experience level ({{{experienceLevel}}}) to calibrate difficulty.

NODE 4 (ADAPTIVE FOLLOW-UP):
If the currentStage is FOLLOW_UP, you MUST reference a specific technical detail, decision, or claim from the candidate's LATEST RESPONSE. Probing deeper into "why" or "how" for that specific item.

NODE 5 (CLOSING):
If currentMainQuestionIndex >= 12, finish naturally with: "Thank you for your time. That concludes today's interview. It was nice speaking with you."

MANDATORY ANTI-REPETITION:
DO NOT REPEAT ANY OF THESE QUESTIONS:
{{#each askedQuestions}}
- {{{this}}}
{{/each}}

CURRENT STATUS:
Turn: {{{currentMainQuestionIndex}}}
Current Stage: {{{currentStage}}}
History Size: {{history.length}}

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
    
    // Normalize resume data
    const cleanSkills = (input.resumeSkills || []).filter(s => s && typeof s === 'string' && s.trim() !== "");
    const cleanProjects = (input.resumeProjects || []).filter(p => p && typeof p === 'string' && p.trim() !== "");
    const cleanSummary = input.resumeSummary || "";

    // Determine target stage based on turn number if not explicitly set
    let targetStage = input.currentStage || "INTRODUCTION";
    if (turnNumber === 1 && input.history.length === 0) {
      targetStage = "INTRODUCTION";
    } else if (turnNumber === 2) {
      targetStage = cleanProjects.length > 0 ? "PROJECT" : "RESUME";
    } else if (turnNumber >= 12) {
      targetStage = "CLOSING";
    }

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        resumeSkills: cleanSkills,
        resumeProjects: cleanProjects,
        resumeSummary: cleanSummary,
        askedQuestions: input.askedQuestions || [],
        currentStage: targetStage,
        currentDifficulty: input.currentDifficulty || "MEDIUM",
      }, {
        // TELEMETRY PROTECTION: Ensure userId and sessionId are never undefined for the usage logger
        userId: input.userId || 'anonymous',
        sessionId: input.sessionId || 'unknown-session',
        feature: input.roundType === 'Special HR Interview' ? 'special_interview' : 'ai_interview'
      });
    
      if (!output) throw new Error("Neural synthesis empty.");
    
      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || turnNumber >= 12,
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
