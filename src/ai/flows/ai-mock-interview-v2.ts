'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v7.0).
 * MASTER PROTOCOL: Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Integrates Resume, Projects, Coding Score, Aptitude Score, and Conversation History.
 * Implements strict adaptive friction, firm-specific style, and repetition prevention.
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
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  aptitudeScore: z.number().optional(),
  codingScore: z.number().optional(),
  askedQuestions: z.array(z.string()).optional(),
  debugMode: z.boolean().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  isInterviewComplete: z.boolean(),
  interviewStage: z.enum(["INTRODUCTION", "TECHNICAL", "HR", "HYBRID", "CLOSING"]).optional(),
  internalNotes: z.string().optional().describe("Internal AI notes on performance (hidden from user)"),
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
- Speak naturally and professionally. No robotic greetings like "Hello, I am Nexvoro AI" or "Here is your next question".
- ASK ONLY ONE QUESTION AT A TIME. Wait for the answer.
- DO NOT TEACH. DO NOT EXPLAIN. DO NOT GIVE FEEDBACK UNLESS IT IS A FOLLOW-UP PROBE.
- KEEP QUESTIONS SHORT AND SHARP.
- NEVER generate bullet points, lists, or bold text in your output.
- NEVER reveal numeric scores, ATS percentages, or specific performance ratings to the candidate.

ADAPTIVE BEHAVIOR (PERFORMANCE-AWARE):
1. CANDIDATE CONFIDENCE:
   - If answer is CONFIDENT and DEEP: CHALLENGE THEM immediately. Increase friction. Probe edge cases, distributed constraints, or high-level trade-offs.
   - If answer is SHALLOW or candidate STRUGGLES: ENCOURAGE SLIGHTLY with a professional bridge (e.g. "I appreciate that perspective. Let's look at this from a slightly different angle...") and then SIMPLIFY the question or return to foundational nodes.
2. PREVIOUS MISTAKES:
   - If history shows a previous technical deviation or weak logic, circle back naturally to probe if they've corrected their reasoning.

STRICT RESUME & PROJECT ANCHORING:
- You MUST anchor questions to the candidate's Resume Dossier and Projects.
- If history is empty, you MUST start exactly with: "Hello. Welcome to today's session. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction—could you please introduce yourself and walk me through your background?"

PERFORMANCE INTEGRATION (SYNTAX & LOGIC):
- CODING SCORE: {{{codingScore}}}% 
  - >90%: Bypassing syntax. Ask about System Architecture, Scalability, and Distributed Systems.
  - <60%: Present Debugging scenarios. Ask how they identify and resolve bottlenecks.
  - <40%: Validate basic Syntax and Core Language Fundamentals.
- APTITUDE SCORE: {{{aptitudeScore}}}%
  - >85%: Use higher logical depth and abstract multi-variable constraints.
  - <60%: Avoid complex theoretical logic. Focus on practical implementation nodes.

FIRM-SPECIFIC RUBRIC ({{{targetCompany}}}):
- Google: System Design, Scalability, Rigorous "Why" probes, DSA trade-offs.
- Amazon: Leadership Principles (Ownership, Customer Obsession) woven into tech probes.
- Microsoft: Architecture, Clean Code, maintainability.
- TCS: Core Concepts (OOP, SQL, DBMS) and specific Project walkthroughs.
- Startup: Practical delivery, Impact, Fast development cycles.

SESSION TERMINATION PROTOCOL (NATURAL CONCLUSION):
- You decide when to conclude the assessment.
- MINIMUM questions: 7.
- MAXIMUM questions: 12.
- If current index >= 7 and you have sufficient data to generate a complete performance audit, you may transition to CLOSING by setting "isInterviewComplete": true.
- If current index >= 12, you MUST conclude the session immediately.
- When closing, provide a professional human sign-off as the 'nextQuestion' (e.g., "I appreciate your time today. This concludes our session. It was good speaking with you.").

SESSION INTEGRITY (MEMORY):
- Current Node: {{{currentMainQuestionIndex}}}
- NEVER repeat a question in "Previously Asked Questions".
- "Tell me about yourself" is Node 1 ONLY.
- "Strengths" or "Weaknesses" are allowed ONCE total.
- History (Analyze for follow-ups):
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on EVERY node above, output the ONE next question or sign-off in valid JSON.`,
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
        nextQuestion: "Hello, welcome to Nexvoro AI. This is a developer test of the D-ID avatar integration. Since this is a verification node, I'll bypass the neural synthesis. How are you today?",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        interviewStage: "INTRODUCTION",
      };
    }

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
      });

      if (!output) throw new Error("Neural synthesis failed.");

      // Safety enforcement of the 12-question ceiling
      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    } catch (error) {
      console.error("AI Mock Interview Flow Error:", error);
      const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
      };
    }
  }
);
