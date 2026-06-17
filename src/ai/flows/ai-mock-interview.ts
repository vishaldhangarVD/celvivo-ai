'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent.
 * Generates adaptive questions and evaluates responses using Resilient Gemini protocols.
 * Prioritizes resume-specific questioning and dynamic difficulty scaling.
 * Includes a robust fallback repository for offline/overload scenarios.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Tell me about yourself and your professional journey so far.",
    "Why are you interested in joining our organization specifically?",
    "What are your greatest professional strengths and areas for improvement?",
    "Describe a time you had to deal with a difficult teammate. How did you resolve it?",
    "How do you handle high-pressure situations and tight project deadlines?",
    "Where do you see your career trajectory in the next five years?",
    "Why are you looking to transition from your current role at this time?",
    "What kind of work environment allows you to be most productive?",
    "Describe your ideal manager and how they support your growth.",
    "How do you stay motivated during repetitive or challenging project phases?",
    "Tell me about a time you took initiative or showed leadership outside your role.",
    "How do you handle receiving constructive criticism from peers or superiors?",
    "What do you do when you fundamentally disagree with a team decision?",
    "What unique value do you bring to this specific role that sets you apart?",
    "How do you prioritize your work when you have multiple competing tasks?",
    "Tell me about a time you failed. What did you learn from the experience?"
  ],
  'Technical Round': [
    "Can you elaborate on the most complex technical challenge you faced in your recent project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "Explain the architectural differences between horizontal and vertical scaling in modern systems.",
    "How do you approach database optimization when dealing with large-scale datasets?",
    "Describe your experience with CI/CD pipelines and automated deployment strategies.",
    "What are the significant trade-offs when choosing between microservices and monoliths?",
    "How do you ensure security best practices are integrated into your API development?",
    "Explain a software design pattern you use frequently and the problem it solves.",
    "How do you manage and communicate technical debt in a fast-paced development cycle?",
    "Describe your experience with cloud infrastructure and serverless architectures.",
    "What specific tools and metrics do you use for application performance monitoring?",
    "How do you keep your technical skills sharp and stay updated with industry trends?",
    "Explain the SOLID principles and how you apply them in your daily development work.",
    "How do you handle concurrency, locking, and race conditions in distributed systems?",
    "Describe your process for conducting and receiving effective technical code reviews."
  ],
  'Managerial Round': [
    "How do you prioritize tasks and resources for your team during a complex sprint?",
    "Tell me about a time you had to deliver difficult news or feedback to a major stakeholder.",
    "What is your strategy for mentoring junior developers and fostering technical growth?",
    "Describe your specific approach to project management—do you prefer Scrum, Kanban, or a hybrid?",
    "How do you handle a project that is significantly falling behind its original schedule?",
    "What is your philosophy for resource allocation across multiple simultaneous projects?",
    "How do you resolve high-level technical conflicts between different departments or teams?",
    "Describe a time you had to pivot a project's technical direction mid-way. Why and how?",
    "How do you define and measure the success and velocity of a high-performing technical team?",
    "What is your specific approach to hiring and evaluating technical talent for your team?",
    "How do you balance the need for new feature development with reducing existing technical debt?",
    "Describe your experience with infrastructure budgeting and cloud cost management.",
    "How do you ensure your team's technical output remains aligned with broader company goals?",
    "Tell me about a time you had to manage a poor performer. What was the outcome?",
    "How do you foster a culture of innovation and psychological safety within your team?",
    "What is your approach to managing upwards and setting expectations with executive leadership?"
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
      const renderedPrompt = `SYSTEM: You are an elite Senior Technical Interviewer for ${input.role}.
LEVEL: ${input.experienceLevel}
ROUND: ${input.roundType}
HISTORY: ${input.history.map(h => `\nInterviewer: ${h.question}\nCandidate: ${h.answer}`).join('')}
LATEST ANSWER: ${input.userAnswer || 'N/A'}
DIRECTIVE: Generate next question for step ${input.currentMainQuestionIndex}/10.`;

      return {
        nextQuestion: "[DEBUG] Adaptive signal intercepted.",
        feedbackOnLastAnswer: "DEBUG: Neural scaling logic active.",
        isInterviewComplete: input.currentMainQuestionIndex >= 10,
        debugPrompt: renderedPrompt
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
      // Dynamic Fallback Question Selection
      const round = input.roundType || 'Technical Round';
      const roundKey = round.includes('HR') ? 'HR Round' : round.includes('Managerial') ? 'Managerial Round' : 'Technical Round';
      const roundBank = FALLBACK_QUESTIONS[roundKey as keyof typeof FALLBACK_QUESTIONS] || FALLBACK_QUESTIONS['Technical Round'];
      
      // Select question based on index, ensuring we don't overflow the bank
      const bankIndex = (input.currentMainQuestionIndex - 1) % roundBank.length;
      let fallbackQ = roundBank[bankIndex];

      // Verification: Avoid duplicates from history if any
      const askedQuestions = new Set(input.history.map(h => h.question));
      if (askedQuestions.has(fallbackQ)) {
        fallbackQ = roundBank.find(q => !askedQuestions.has(q)) || roundBank[0];
      }

      return {
        nextQuestion: fallbackQ,
        feedbackOnLastAnswer: "Your answer shows baseline technical awareness. [MOCK MODE ACTIVE]",
        isInterviewComplete: input.currentMainQuestionIndex >= 10,
        isMock: true
      };
    }
  }
);
