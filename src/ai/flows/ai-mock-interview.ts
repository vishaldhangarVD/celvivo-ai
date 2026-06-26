'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v5.0).
 * Calibrated for high-fidelity simulation of professional IT interviews.
 * Implements strict persona rules, resume-anchored questioning, and adaptive practical assessment.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Hello. Welcome to today's interview. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Could you walk me through your professional background and some of the key milestones in your career?",
    "Describe a time you had a conflict with a teammate over a decision. How was it resolved?",
    "Where do you see your technical career trajectory heading in the next five years?",
    "What specific aspects of our organization's mission interest you the most?"
  ],
  'Technical Round': [
    "Hello. Welcome to today's interview. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Can you elaborate on the most complex technical challenge you faced in your strongest project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "How do you approach performance optimization when dealing with large-scale datasets?"
  ],
  'Managerial Round': [
    "Hello. Welcome to today's interview. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "How do you prioritize tasks and resources for your team during a complex sprint?",
    "Tell me about a time you had to deliver difficult technical feedback to a major stakeholder.",
    "What is your strategy for mentoring junior developers and fostering technical growth?",
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
  prompt: `You are an elite Senior Technical Interviewer conducting a real-world interview for a candidate applying for the {{{role}}} role ({{{experienceLevel}}} level) during a {{{roundType}}}.

GENERAL PERSONA:
- Act exactly like an experienced human interviewer.
- Be professional, natural, and never robotic.
- NEVER mention that you are an AI or a model.
- Ask only ONE question at a time.
- Wait for the candidate's answer before continuing.

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Background: {{{resumeSummary}}}

INTERVIEW ARCHITECTURE:

NODE 1 (Opening & Introduction):
If history is empty, start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (Resume deep-dive):
Acknowledge the introduction naturally (e.g., "Thank you.", "I appreciate that introduction.").
Analyze the candidate's projects. Select the strongest project (e.g., '{{{resumeProjects.[0]}}}').
Ask a natural question about its purpose, architecture, or a specific hurdle.
Example: "I noticed your project '{{{resumeProjects.[0]}}}'. Could you explain what problem this project solved and what technologies you chose for the implementation?"

NODE 3 (Role-Specific Technical):
Generate practical technical questions based on the role ({{{role}}}).
- Frontend: React, Performance, Accessibility, state management.
- Backend: API design, Scaling, DB optimization, Auth.
- Data Analyst/Scientist: SQL, Stats, ETL, Dashboards.
- DevOps/Cloud: Docker, Kubernetes, CI/CD, AWS.
Avoid textbook definitions. Ask for technical reasoning or implementation strategies.

NODE 4 (Follow-up & Adaptivity):
Listen to the candidate's previous answer. If they mentioned a specific tool or methodology, ask "Why that choice?", "What alternatives did you consider?", or "What challenges did you face?".

NODE 5 (Scenario Questions):
Present a practical real-world situation relevant to the {{{role}}}.
Examples: 
"Suppose your production server suddenly crashes, how would you triage?"
"An API you deployed is becoming increasingly slow under load, what are your next steps?"

NODE 6 (Closing):
If the session is complete (Node 5+), end naturally with: "Thank you for your time. That concludes today's interview. It was nice speaking with you."

CURRENT STATUS:
Current Node: {{{currentMainQuestionIndex}}} of 5.

HISTORY:
{{#each history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST RESPONSE:
{{{userAnswer}}}

Based on the candidate's latest response and the interview flow, provide the 'nextQuestion'. Adjust difficulty (Easy -> Expert) based on their answers.`,
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
        nextQuestion: "[DEBUG] Senior Interviewer Persona Active. Node generated.",
        feedbackOnLastAnswer: "DEBUG: Acknowledgement node synchronized.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        debugPrompt: "System check: Human Senior Persona Protocol Active."
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
      console.error("AI Flow Error, using fallback:", error);
      const round = input.roundType || 'Technical Round';
      const roundKey = round.includes('HR') ? 'HR Round' : round.includes('Managerial') ? 'Managerial Round' : 'Technical Round';
      const roundBank = FALLBACK_QUESTIONS[roundKey as keyof typeof FALLBACK_QUESTIONS] || FALLBACK_QUESTIONS['Technical Round'];
      
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      let fallbackQ = roundBank[bankIndex];

      return {
        nextQuestion: fallbackQ,
        feedbackOnLastAnswer: "I appreciate that context. Let's move forward.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        isMock: true
      };
    }
  }
);
