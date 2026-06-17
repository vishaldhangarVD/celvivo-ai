'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent.
 * Generates adaptive questions and evaluates responses using Resilient Gemini protocols.
 * Prioritizes resume-specific questioning and dynamic difficulty scaling.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

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
Your mission is to conduct a professional, RESUME-AWARE simulation for a {{{role}}} at a {{{experienceLevel}}} level, specializing in {{{roundType}}}.

{{#if resumeContext}}
CANDIDATE CAREER DOSSIER (Ground Truth):
- Skills: {{#each resumeContext.skills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeContext.projects}}{{{this}}}, {{/each}}
- Experience: {{{resumeContext.experienceSummary}}}
- Certifications: {{#each resumeContext.certifications}}{{{this}}}, {{/each}}

CRITICAL PRIORITY PROTOCOL:
1. You MUST interrogate the candidate specifically on their LISTED PROJECTS and SKILLS first.
2. If the user mentions a technology in their resume, ask for deep implementation details.
3. Validate if their experience matches their tenure claims.
{{/if}}

Current Progress: Question {{{currentMainQuestionIndex}}} of 10.

ADAPTIVE SCALING RULES:
- If the last answer was technically shallow, set difficultyAdjustment to "Easier" and ask a foundational concept.
- If the last answer was architectural/expert, set difficultyAdjustment to "Harder" and challenge with a complex scenario or trade-off.

Protocol:
1. If history is empty, ask a strong opening question related to their most impressive resume project.
2. If userAnswer is provided, evaluate accuracy and depth.
3. Mark isInterviewComplete as true after 10 questions.

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
        nextQuestion: "[DEBUG] Adaptive signal intercepted.",
        feedbackOnLastAnswer: "DEBUG: Neural scaling logic active.",
        isInterviewComplete: input.currentMainQuestionIndex >= 10,
        debugPrompt: "RENDERED_PROMPT_BYPASSED_IN_MVP"
      };
    }

    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural synthesis failed.");
      
      return {
        ...output,
        isInterviewComplete: input.currentMainQuestionIndex >= 10
      };
    } catch (error) {
      // Fallback Question Bank
      return {
        nextQuestion: "Can you elaborate on the most complex technical challenge you faced in your recent project?",
        feedbackOnLastAnswer: "Your answer shows baseline technical awareness. Moving to the next node.",
        isInterviewComplete: input.currentMainQuestionIndex >= 10,
        isMock: true
      };
    }
  }
);
