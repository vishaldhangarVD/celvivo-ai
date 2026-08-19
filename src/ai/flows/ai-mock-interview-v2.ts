'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v10.0).
 * MASTER PROTOCOL: Calibrated for zero-chatbot behavior. Mimics a Lead Engineer at a Tier-1 tech firm.
 * Integrates Resume, Projects, Coding Score, Aptitude Score, and Conversation History.
 * Implements granular stage progression with natural acknowledgments and transitions.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_QUESTIONS = [
  "Hi! Welcome to the interview. Before we begin, could you please introduce yourself and tell me a little about yourself?",
  "Thank you for that background. Could you walk me through your professional history and any key milestones in your career?",
  "I noticed your technical background. What specific performance bottlenecks did you encounter in that implementation?",
  "How do you ensure system reliability when scaling to 10x current throughput?",
  "If a critical microservice starts timing out in production, what's your systematic investigative path?",
  "Tell me about a time you had to defend a technical decision against a more senior stakeholder.",
  "That concludes the technical assessment. Thank you for your time."
];

const FALLBACK_INTRODUCTIONS = [
  "Hi! Welcome to the interview. Before we begin, could you please introduce yourself and tell me a little about yourself?",
  "Let's begin with a quick introduction. Could you tell me your name and give me a brief overview of yourself?",
  "Before we dive into the technical discussion, could you please introduce yourself and share a little about your professional journey?",
  "Great to have you here. To get started, could you tell me about yourself and your background?",
  "Let's start with the basics. Please introduce yourself and briefly walk me through your background.",
  "Welcome! Could you tell me a little about yourself, including your name and what you've been working or studying recently?"
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
  candidateName: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  resumeSummary: z.string().optional(),
  aptitudeScore: z.number().optional(),
  codingScore: z.number().optional(),
  askedQuestions: z.array(z.string()).optional(),
  debugMode: z.boolean().optional(),
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
- DO NOT TEACH. DO NOT EXPLAIN. 
- Provide a VERY BRIEF (3-8 words) natural acknowledgement or transition based on the candidate's previous answer before asking the next question.
- KEEP QUESTIONS SHORT AND SHARP.
- NEVER generate bullet points, lists, or bold text.
- NEVER reveal numeric scores, ATS percentages, or specific performance ratings to the candidate.

ACKNOWLEDGEMENT PROTOCOL:
Assess the candidate's latest response ({{{userAnswer}}}) and prepend a short acknowledgement to your next question:
1. STRONG ANSWER: Use positive validation (e.g., "Good answer.", "That's a good point.", "Excellent, that's clear.").
2. AVERAGE ANSWER: Use neutral transition (e.g., "Alright, I see.", "Okay, thank you for that context.").
3. WEAK/UNCLEAR ANSWER: Do not praise. Use a natural clarifying transition (e.g., "Okay, let's explore that a bit more.", "I'd like to understand that in more detail.").
- NEVER use the same phrase twice.
- The acknowledgement and question MUST feel like a single natural spoken turn.

SIMULATION STATE:
- CURRENT STAGE: {{{currentStage}}}
- CURRENT DIFFICULTY: {{{currentDifficulty}}}

CANDIDATE DOSSIER:
- NAME: {{{candidateName}}}
- SUMMARY: {{{resumeSummary}}}
- SKILLS: {{#each resumeSkills}}{{{this}}}, {{/each}}
- PROJECTS: {{#each resumeProjects}}{{{this}}}, {{/each}}

INTERVIEW FLOW PROTOCOL:

STAGE 1: PERSONAL INTRODUCTION (Node 1 ONLY)
- If history is empty, you MUST start with a natural, welcoming, and varied introduction.
- Ask the candidate to introduce themselves, state their name, and provide a high-level background.
- VARIETY PROTOCOL: Dynamically generate the wording (e.g., "Hi! Welcome to the interview. Could you start by introducing yourself and telling me a little about your background?", "Let's begin with a quick introduction. Could you tell me your name and give me a brief overview of yourself?", etc.).
- Never use the exact same opening sentence across different interviews.
- DO NOT ask about specialization or technical details in this turn.

STAGE 2: EDUCATION & PROFESSIONAL BACKGROUND (Node 2)
- Acknowledge the introduction.
- Ask about their professional journey or academic foundations.

STAGE 3: ROLE-SPECIFIC EXPERIENCE (Node 3)
- Connect their background to the requirements of the {{{role}}} position.
- Ask about their experience with specific core tools or methodologies mentioned in their dossier.

STAGE 4: PROJECTS & PRACTICAL EXPERIENCE (Node 4)
- Analyze their PROJECTS: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Select one and ask deep, architectural questions. "Why that stack?" or "How did you handle [Constraint] in your [Project Name]?".

STAGE 5: TECHNICAL & SYSTEM REASONING (Nodes 5-6)
- Probe technical reasoning and systems thinking.
- Use their previous project answers as context for scenarios.
- CODING/APTITUDE DATA: Use Coding Score ({{{codingScore}}}%) and Aptitude Score ({{{aptitudeScore}}}%) to calibrate difficulty.

STAGE 6: ADVANCED SCENARIOS & ADAPTIVITY (Node 7)
- Ask complex real-world situational questions.
- If candidate is confident, INCREASE friction. Probe edge cases.
- If candidate struggles, provide a professional bridge and adjust.

STAGE 7: FOLLOW-UP & CLOSING (Nodes 8+)
- Every new question MUST acknowledge or follow up on the previous answer.
- Continue deep probing until the session is complete.

TERMINATION PROTOCOL:
- MINIMUM questions: 7.
- MAXIMUM questions: 12.
- Set "isInterviewComplete": true if index >= 7 and you have sufficient data for a final audit.
- Final Question: Provide a professional human sign-off (e.g., "I appreciate your time. This concludes our session. It was good speaking with you.").

SESSION INTEGRITY:
- NEVER repeat a question listed in "Previously Asked Questions".
- History:
{{#each history}}
You: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the protocol and candidate response, output the next logical question with a brief acknowledgement as JSON.`,
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
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
      });

      if (!output) throw new Error("Neural synthesis failed.");

      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    } catch (error) {
      console.error("AI Mock Interview Flow Error:", error);
      
      let nextQuestion = "";
      if (input.currentMainQuestionIndex === 1 || (input.history || []).length === 0) {
        // Use a random intro variant for fallback
        nextQuestion = FALLBACK_INTRODUCTIONS[Math.floor(Math.random() * FALLBACK_INTRODUCTIONS.length)];
      } else {
        const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
        nextQuestion = FALLBACK_QUESTIONS[bankIndex];
      }

      return {
        nextQuestion,
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: input.currentMainQuestionIndex >= 12,
      };
    }
  }
);
