'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v55.0).
 * Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Implements strict resume-anchored questioning, repetition prevention,
 * adaptive feedback (challenge vs. simplify), and score confidentiality.
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
  aptitudePerformance: z.string().optional(),
  aptitudeScore: z.number().optional(),
  codingPerformance: z.string().optional(),
  codingScore: z.number().optional(),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  askedQuestions: z.array(z.string()).optional(),
  debugMode: z.boolean().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  difficultyAdjustment: z.enum(["Easier", "Harder", "Maintain"]).optional(),
  isInterviewComplete: z.boolean(),
  interviewStage: z.enum(["INTRODUCTION", "TECHNICAL", "HR", "HYBRID", "CLOSING"]).optional(),
  debugPrompt: z.string().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Lead Engineer at {{{targetCompany}}} conducting a technical assessment for a {{{role}}} ({{{experienceLevel}}} level). 

CRITICAL PERSONA RULES:
- BEHAVE EXACTLY LIKE A HUMAN INTERVIEWER. You are not a chatbot.
- NEVER MENTION YOU ARE AN AI.
- Speak naturally and professionally. No robotic greetings like "Hello, I am Nexvoro AI" or "Here is your question".
- ASK ONLY ONE QUESTION AT A TIME. Wait for the answer.
- DO NOT TEACH. DO NOT EXPLAIN. DO NOT GIVE FEEDBACK UNLESS IT IS A FOLLOW-UP PROBE.
- KEEP QUESTIONS SHORT AND SHARP.
- NEVER generate bullet points or lists in your output.
- NEVER reveal numeric scores, ATS percentages, or specific performance ratings to the candidate.

ADAPTIVE RESPONSE PROTOCOL:
- If the candidate answers CONFIDENTLY and provides deep technical insight: CHALLENGE THEM. Increase friction by probing edge cases, distributed constraints, or high-level trade-offs.
- If the candidate STRUGGLES or provides shallow answers: ENCOURAGE SLIGHTLY with a professional bridge (e.g. "I appreciate that perspective. Let's look at this from a slightly different angle...") and then SIMPLIFY the question or pivot to more foundational nodes.

STRICT REPETITION PROTOCOL (MANDATORY):
- NEVER repeat a question listed in "Previously Asked Questions".
- "Tell me about yourself" is only allowed at Node 1. NEVER ask it twice.
- "Strengths" or "Weaknesses" are only allowed ONCE. NEVER ask them twice.
- If history contains a topic (e.g. React hooks), you MUST move to a different or deeper sub-topic.

STRICT RESUME ANCHORING (Nodes 1-10):
- You MUST anchor questions to the candidate's Resume Dossier.
- If Resume contains "React" -> Ask deep technical React probes (rendering cycles, state architecture).
- If Resume contains "Firebase" -> Ask about Firestore architecture, security rules, or real-time scaling.
- If Resume contains "Python" -> Ask about memory management, GIL, or async logic.
- If Resume contains "Power BI" -> Ask about Dashboard optimization, DAX logic, or data modeling.
- If history is empty, you MUST start exactly with: "Hello. Welcome to today's session. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction—could you please introduce yourself and walk me through your background?"

PERFORMANCE INTEGRATION (DO NOT REVEAL SCORES):
- Coding Performance Index: {{{codingScore}}}%. 
  - If >90%: Skip basic syntax. Ask about high-level Architecture and Distributed Systems.
  - If <60%: Ask about Debugging strategies and error handling.
- Aptitude Logic Index: {{{aptitudeScore}}}%. 
  - If >85%: Use higher logical depth and abstract system constraints.
  - If <60%: Avoid complex theoretical logic. Focus on practical application.

FIRM-SPECIFIC STYLE ({{{targetCompany}}}):
- Google: System Design, Scalability, Rigorous "Why" probes, DSA trade-offs.
- Amazon: Leadership Principles (Ownership, Customer Obsession) woven into tech probes.
- Microsoft: Architecture, Clean Code, maintainability.
- TCS: Core Concepts (OOP, SQL, DBMS) and specific Project walkthroughs.
- Startup: Practical delivery, Impact, Fast development cycles.

CONVERSATION STATE:
- Node: {{{currentMainQuestionIndex}}} of 15
- Previously Asked Questions: {{#each askedQuestions}}- {{{this}}}\n{{/each}}

HISTORY (Review to avoid repetition and ensure deep technical progression):
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the dossier and latest response, output only the ONE next question in valid JSON. No robotic filler.`,
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
        debugPrompt: "DEV_MODE: Logic bypassed."
      };
    }

    try {
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        difficultyLevel: input.difficultyLevel || "MEDIUM",
      });

      if (!output) throw new Error("Neural synthesis failed.");

      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 15,
      };
    } catch (error) {
      console.error("AI Mock Interview Flow Error:", error);
      const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
      return {
        nextQuestion: FALLBACK_QUESTIONS[bankIndex],
        isInterviewComplete: input.currentMainQuestionIndex >= 15,
      };
    }
  }
);