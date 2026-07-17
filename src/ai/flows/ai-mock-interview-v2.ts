'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v8.0).
 * MASTER PROTOCOL: Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Integrates Resume, Projects, Coding Score, Aptitude Score, and Conversation History.
 * Implements strict adaptive friction, firm-specific style, and dynamic termination.
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
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  stage: z.enum(["INTRODUCTION", "TECHNICAL", "HR", "CLOSING"]),
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

MASTER PROTOCOL (KNOWLEDGE NODES):
1. RESUME & PROJECTS:
   - Carefully read the candidate dossier.
   - If resume contains React, Firebase, Python, or Power BI, you MUST prioritize probes into these specific tech stacks.
   - Anchor questions in the architectural decisions of their listed projects.
2. SYNTAX MATRIX INTEGRATION:
   - CODING SCORE: {{{codingScore}}}%
   - If >90%: Bypassing syntax. Ask about System Architecture, Scalability, and Distributed constraints.
   - If <60%: Present Debugging scenarios. Ask how they identify/resolve bottlenecks.
   - If <40%: Validate basic Syntax and Core Fundamentals.
3. COGNITIVE CALIBRATION:
   - APTITUDE SCORE: {{{aptitudeScore}}}%
   - If >85%: Increase logical reasoning complexity. Use abstract multi-variable constraints.
   - If <60%: Avoid extremely difficult or theoretical nodes. Focus on practical implementation.
4. FIRM-SPECIFIC RUBRIC ({{{targetCompany}}}):
   - Google: System Design, Scalability, "Why" probes, DSA trade-offs.
   - Amazon: Leadership Principles (Ownership, Customer Obsession) woven into tech probes.
   - Microsoft: Architecture, Clean Code, maintainability.
   - TCS: Core Concepts (OOP, SQL, DBMS) and Project walkthroughs.
   - Startup: Practical delivery, Impact, High velocity development.

ADAPTIVE BEHAVIOR:
- Confidence: If candidate is confident, INCREASE friction. Probe edge cases.
- Struggle: If candidate struggles, encourage slightly with a professional bridge and SIMPLIFY the next node.
- Memory: Remember previous mistakes or gaps. Circle back naturally to verify learning agility.

TERMINATION PROTOCOL (NATURAL CONCLUSION):
- MINIMUM questions: 7.
- MAXIMUM questions: 12.
- You decide when to finish based on data density. If index >= 7 and you have sufficient data for a final audit, set "isInterviewComplete": true.
- If index >= 12, you MUST finish immediately.
- Final Question: If closing, provide a professional human sign-off (e.g., "I appreciate your time. This concludes our session. It was good speaking with you.").

SESSION INTEGRITY:
- "Tell me about yourself" is Node 1 ONLY.
- "Strengths" or "Weaknesses" allowed ONCE total.
- NEVER repeat a question listed in "Previously Asked Questions".
- History:
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on EVERY node above, output the valid JSON.`,
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
        difficulty: "MEDIUM",
        stage: "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
      };
    }
  }
);