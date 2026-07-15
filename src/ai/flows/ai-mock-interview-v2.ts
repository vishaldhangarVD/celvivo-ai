'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v52.0).
 * Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Implements strict resume-anchored questioning, repetition prevention,
 * and cognitive calibration based on previous round performance.
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
- Speak naturally and professionally. No robotic greetings.
- ASK ONLY ONE QUESTION AT A TIME.
- DO NOT TEACH. DO NOT EXPLAIN. ONLY INTERVIEW.
- KEEP QUESTIONS SHORT AND SHARP.

STRICT REPETITION PROTOCOL (MANDATORY):
- NEVER repeat a question listed in "Previously Asked Questions".
- "Tell me about yourself" is only allowed at Node 1. NEVER ask it twice.
- "Strengths" or "Weaknesses" are only allowed ONCE. NEVER ask them twice.
- If history contains a topic, you MUST move to a different or deeper sub-topic.

STRICT RESUME ANCHORING:
1. For Nodes 1-10, anchor questions strictly to the candidate's Resume Dossier.
2. If Resume contains "React" -> Ask deep technical React probes.
3. If Resume contains "Firebase" -> Ask about Firestore architecture and security.
4. If Resume contains "Python" -> Ask about memory or performance logic.
5. If Resume contains "Power BI" -> Ask about Dashboard optimization and DAX logic.
6. NEVER ask a question unrelated to the resume until Node 11.

PERFORMANCE INTEGRATION:
- Coding Score: {{{codingScore}}}%. (90+ -> Architecture, <60 -> Debugging, <40 -> Syntax).
- Aptitude Score: {{{aptitudeScore}}}%. (85+ -> Higher logic depth, <60 -> Focus on practical application).

FIRM-SPECIFIC STYLE ({{{targetCompany}}}):
- Google: System Design, Scalability, Rigorous "Why" probes.
- Amazon: Leadership Principles, Ownership, Customer Obsession.
- Microsoft: Architecture, Clean Code standards.
- TCS: Core Concepts (OOP, SQL) and Project walkthroughs.
- Startup: Practical delivery, Impact, Fast cycles.

CONVERSATION STATE:
- Node: {{{currentMainQuestionIndex}}} of 15
- Previously Asked Questions: {{#each askedQuestions}}- {{{this}}}\n{{/each}}

HISTORY (Review to avoid repetition):
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Output only the ONE next question in valid JSON.`,
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
        nextQuestion: "Hello, welcome to Nexvoro AI. This is a developer test of the D-ID avatar integration.",
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