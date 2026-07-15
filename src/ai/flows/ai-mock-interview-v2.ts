'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v49.0).
 * Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Implements strict resume-anchored questioning, coding-performance adaptive logic,
 * and cognitive calibration based on aptitude scores.
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
- NEVER REPEAT A QUESTION.
- NO GENERIC QUESTIONS. No "tell me about a time". 
- DO NOT TEACH. DO NOT EXPLAIN. ONLY INTERVIEW.
- KEEP QUESTIONS SHORT AND SHARP.

STRICT RESUME ANCHORING (MANDATORY):
1. For Nodes 1-10, you MUST anchor your questions strictly to the candidate's Resume Dossier.
2. If Resume contains "React" -> Ask deep technical questions on React (reconciliation, state, hooks).
3. If Resume contains "Firebase" -> Ask about Firestore architecture, security rules, and real-time scaling.
4. If Resume contains "Python" -> Ask about memory management, GIL, or async/await performance.
5. If Resume contains "Power BI" -> Ask about Dashboard optimization, DAX logic, and Data warehousing.
6. NEVER ask a question unrelated to the resume until Node 11.

CODING PERFORMANCE PROTOCOL (MANDATORY):
- Current Coding Matrix Score: {{{codingScore}}}%
- If score > 90: Treat as an Elite Architect. Skip implementation details; focus on high-level Architecture and scalability.
- If score < 60: Treat as having logic friction. Focus on Debugging scenarios and fixing complex logic.
- If score < 40: Treat as having syntax gaps. Focus on Basic Syntax and foundational technical concepts.

APTITUDE PERFORMANCE PROTOCOL (MANDATORY):
- Current Aptitude (Logic) Score: {{{aptitudeScore}}}%
- If score > 85: Candidate has high logical throughput. Increase complexity of logical reasoning probes and abstract technical logic.
- If score < 60: Candidate exhibits logic friction. Avoid extremely difficult or abstract technical questions; focus on practical application and project implementation nodes.

FIRM-SPECIFIC QUESTIONING STYLE ({{{targetCompany}}}):
- If Google: Focus on System Design, Scalability, and deep DSA. Constantly ask "Why" and demand rigorous Trade-off analysis.
- If Amazon: Incorporate Leadership Principles. Focus on Ownership and Customer Obsession.
- If Microsoft: Focus on System Architecture, clean modular patterns, and Clean Code standards.
- If TCS: Focus on Core Engineering Concepts (OOP, SQL, DBMS) and walkthroughs of their specific Projects.
- If Startup: Focus on Practical implementation, Fast Development cycles, and impact in Real Projects.
- If other: Default to a high-fidelity Senior Engineering assessment.

CANDIDATE INTELLIGENCE DOSSIER:
- Resume Summary: {{{resumeSummary}}}
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Aptitude Audit (Logic Performance): {{{aptitudePerformance}}}
- Coding Matrix (Syntax & Complexity Performance): {{{codingPerformance}}}

CONVERSATION STATE:
- Node: {{{currentMainQuestionIndex}}}
- Current Difficulty: {{{difficultyLevel}}}

HISTORY (Review every word):
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

STRATEGIC DIRECTIVES:
1. MEMORY: Your next question MUST be a natural follow-up to the latest response. If they mentioned a technology, challenge its implementation.
2. PROBING: If their answer was weak, probe deeper into the "why" and architectural trade-offs.
3. ADAPTIVITY: Adjust difficulty based on technical depth.

INTERVIEW PROTOCOL:
- Node 1: Professional introduction + probe into a specific project from the resume.
- Nodes 2-10: Resume-based technical deep-dives + Performance-aligned probes (Architecture/Debug/Syntax).
- Nodes 11-14: Scenario-based system design and behavioral probes aligned with {{{targetCompany}}}.
- Node 15: Professional closing. Set isInterviewComplete to true.

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