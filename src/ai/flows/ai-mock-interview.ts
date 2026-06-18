'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Optimized v3.0).
 * High-impact, 5-node simulation protocol to reduce API consumption.
 * Generates adaptive questions and evaluates responses using Resilient Gemini protocols.
 * Prioritizes resume-specific questioning and dynamic difficulty scaling.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Describe a time you had a conflict with a teammate over a code architecture decision. How was it resolved?",
    "How do you handle high-pressure situations, such as a critical production bug or a tight release deadline?",
    "Walk me through your professional journey as a software developer so far.",
    "What specific aspects of our organization's technical mission interest you?",
    "Where do you see your technical career trajectory heading in the next five years?"
  ],
  'Technical Round': [
    "Can you elaborate on the most complex technical challenge you faced in your recent project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "Explain the architectural differences between horizontal and vertical scaling in modern systems.",
    "How do you approach database optimization when dealing with large-scale datasets?"
  ],
  'Managerial Round': [
    "How do you prioritize tasks and resources for your team during a complex sprint?",
    "Tell me about a time you had to deliver difficult technical feedback to a major stakeholder.",
    "What is your strategy for mentoring junior developers and fostering technical growth?",
    "Describe your specific approach to project management—do you prefer Scrum, Kanban, or a hybrid?",
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
  resumeContext: z.object({
    skills: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    experienceSummary: z.string().optional(),
    atsScore: z.number().optional(),
    certifications: z.array(z.string()).optional(),
  }).optional(),
  // New optimized fields
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;

const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),
  feedbackOnLastAnswer: z.string().optional(),
  difficultyAdjustment: z.enum(['Easier', 'Harder', 'Maintain']).optional(),
  isInterviewComplete: z.boolean(),
  debugPrompt: z.string().optional(),
  isMock: z.boolean().optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Technical Interviewer.
Your mission is to conduct a high-impact, 5-question simulation for a {{{role}}} at a {{{experienceLevel}}} level, specializing in {{{roundType}}}.

CRITICAL PROTOCOL:
This is a condensed 5-question interview. Questions must be deep, scenario-based, and multi-layered.

{{#if resumeSkills}}
CANDIDATE DOSSIER (Primary):
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Summary: {{{resumeSummary}}}
{{else}}
{{#if resumeContext}}
CANDIDATE CAREER DOSSIER (Secondary):
- Skills: {{#each resumeContext.skills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeContext.projects}}{{{this}}}, {{/each}}
- Experience: {{{resumeContext.experienceSummary}}}
- Certifications: {{#each resumeContext.certifications}}{{{this}}}, {{/each}}
{{/if}}
{{/if}}

RESUME-AWARE RULES:
1. Interrogate the candidate specifically on their LISTED PROJECTS and SKILLS.
2. Validate if their experience matches their tenure claims.

Current Progress: Node {{{currentMainQuestionIndex}}} of 5.

ADAPTIVE SCALING:
- If the last answer was technically shallow, set difficultyAdjustment to "Easier".
- If the last answer was architectural/expert, set difficultyAdjustment to "Harder" and challenge with a complex trade-off.

SEQUENCED INTERROGATION PROTOCOL (MANDATORY):
- Node 1: Analyze the CANDIDATE DOSSIER and identify their strongest project. Ask a high-impact opening question about its core objective and architectural foundation. (Do NOT ask generic intro questions).
- Node 2: Deep-dive into the architectural decisions, implementation challenges, or specific tools used in the SAME project identified in Node 1.
- Node 3: Identify the primary technical skill (e.g., .NET, React, SQL) associated with that project and present a scenario-based validation question.
- Node 4: Generate a complex, role-specific scenario question (for {{{role}}}) involving a realistic trade-off or production-grade challenge.
- Node 5: Advanced evaluation. Either a high-level system design question or a behavioral evaluation tailored to a {{{experienceLevel}}} professional.

CRITICAL: Do NOT ask "Tell me about yourself" or generic introductions. Start with Node 1 immediately.

History:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

Latest Candidate Answer: {{{userAnswer}}}`,
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
        nextQuestion: "[DEBUG] Node generated.",
        feedbackOnLastAnswer: "DEBUG: Signal intercepted.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        debugPrompt: "System check: 5-Node Protocol Active."
      };
    }

    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural synthesis failed.");
      
      return {
        ...output,
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: false
      };
    } catch (error) {
      const round = input.roundType || 'Technical Round';
      const roundKey = round.includes('HR') ? 'HR Round' : round.includes('Managerial') ? 'Managerial Round' : 'Technical Round';
      const roundBank = FALLBACK_QUESTIONS[roundKey as keyof typeof FALLBACK_QUESTIONS] || FALLBACK_QUESTIONS['Technical Round'];
      
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      let fallbackQ = roundBank[bankIndex];

      const askedQuestions = new Set(input.history.map(h => h.question));
      if (askedQuestions.has(fallbackQ)) {
        fallbackQ = roundBank.find(q => !askedQuestions.has(q)) || roundBank[0];
      }

      return {
        nextQuestion: fallbackQ,
        feedbackOnLastAnswer: "Your answer shows baseline professional awareness. [MOCK MODE ACTIVE]",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: true
      };
    }
  }
);