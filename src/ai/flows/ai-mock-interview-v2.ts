'use server';
/**
 * @fileOverview Nexvoro AI Virtual Interview Agent (Elite Senior Interviewer v11.0).
 * MASTER PROTOCOL: Calibrated for multi-round intelligence.
 * Integrates Round 1 (Aptitude, Coding, Technical) + Round 2 (Special HR Resume).
 * Implements granular stage progression with cross-round context awareness.
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
  "Let's start with the basics. Please introduce yourself and briefly walk me through your background?",
  "Welcome! Could you tell me a little about yourself, including your name and what you've been working or studying recently?"
];

const Round1ContextSchema = z.object({
  resumeSummary: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  resumeProjects: z.array(z.string()).optional(),
  scores: z.object({
    aptitude: z.number().optional(),
    coding: z.number().optional(),
  }).optional(),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

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
  hintUsed: z.boolean().optional(),
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
  round1Context: Round1ContextSchema.optional(),
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
  isHint: z.boolean().optional(),
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

MULTI-ROUND INTEGRITY PROTOCOL:
You have access to candidate data from two distinct phases. Use them intelligently:

### ROUND 1 CONTEXT (Historical Intelligence):
- Resume Summary: {{{round1Context.resumeSummary}}}
- Technical Skills: {{#each round1Context.resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each round1Context.resumeProjects}}{{{this}}}, {{/each}}
- Performance: Aptitude ({{{round1Context.scores.aptitude}}}%), Coding ({{{round1Context.scores.coding}}}%)
- Previous History:
{{#each round1Context.history}}
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}
{{/each}}

### ROUND 2 CONTEXT (Active Intelligence):
- This is the current session.
- New Resume Summary: {{{resumeSummary}}}
- New Resume Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- New Resume Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}

INTELLIGENCE DIRECTIVES:
1. **Continuation**: Round 2 is an evolution. Do NOT repeat questions asked in Round 1 History.
2. **Consistency Check**: Look for inconsistencies or updates between the Round 1 resume and the Round 2 resume. Ask deep follow-ups on new skills or project details.
3. **Difficulty Calibration**: If Coding/Aptitude scores are high (>85%), start at HARD difficulty. If they are moderate (60-85%), start at MEDIUM.
4. **Contextual Linking**: If the candidate mentioned a specific technology in Round 1 (e.g., MySQL) and lists something related in Round 2 (e.g., PostgreSQL), ask a comparative architectural question.

ONE-HINT PROTOCOL:
If the candidate's latest response ({{{userAnswer}}}) is non-meaningful (e.g. "I don't know", "Not sure", "Hmm", "No idea", "I can't remember"):
1. If hintUsed is false: Provide ONE short, strategic hint or a leading follow-up question to help them approach the problem without giving the answer. Set isHint: true in your response.
2. If hintUsed is true: Do not give another hint. Acknowledge the lack of response professionally and move to the NEXT question or stage. Set isHint: false.

ACKNOWLEDGEMENT PROTOCOL:
Assess the candidate's latest response ({{{userAnswer}}}) and prepend a short acknowledgement:
1. STRONG ANSWER: Use positive validation (e.g., "Good answer.", "That's a good point.").
2. AVERAGE ANSWER: Use neutral transition (e.g., "Alright, I see.", "Okay, thank you for that context.").
3. WEAK/UNCLEAR ANSWER: Do not praise. Use a natural clarifying transition (e.g., "Okay, let's explore that a bit more.").

SIMULATION STATE:
- CURRENT STAGE: {{{currentStage}}}
- CURRENT DIFFICULTY: {{{currentDifficulty}}}
- TURN INDEX: {{{currentMainQuestionIndex}}}

TERMINATION PROTOCOL:
- MINIMUM questions: 7.
- MAXIMUM questions: 12.
- IF "isInterviewComplete" is true: Provide a professional closing message in "nextQuestion". 

LATEST CANDIDATE RESPONSE:
{{{userAnswer}}}

Based on the protocol and multi-round context, output the next logical question or hint as JSON.`
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
        isHint: false
      }; 
    }

    try {
      console.log("\n================ INTERVIEW TURN START ================");
      console.log("📌 QUESTION INDEX:", input.currentMainQuestionIndex);
      console.log("📌 CURRENT STAGE:", input.currentStage);
      console.log("📌 R1 SCORES: Aptitude:", input.round1Context?.scores?.aptitude, "Coding:", input.round1Context?.scores?.coding);
    
      const { output } = await runWithResilience(prompt, {
        ...input,
        askedQuestions: input.askedQuestions || [],
        currentStage: input.currentStage || "INTRODUCTION",
        currentDifficulty: input.currentDifficulty || "MEDIUM",
        hintUsed: input.hintUsed || false
      });
    
      if (!output) throw new Error("Neural synthesis failed.");
    
      return {
        ...output,
        isInterviewComplete: output.isInterviewComplete || input.currentMainQuestionIndex >= 12,
      };
    
    } catch (error) {
      console.error("\n🔴 AI MOCK INTERVIEW ERROR", error);
    
      let nextQuestion = "";
      const isComplete = input.currentMainQuestionIndex >= 12;
    
      if (isComplete) {
        nextQuestion = FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
      } else if (input.currentMainQuestionIndex === 1 || (input.history || []).length === 0) {
        nextQuestion = FALLBACK_INTRODUCTIONS[Math.floor(Math.random() * FALLBACK_INTRODUCTIONS.length)];
      } else {
        const bankIndex = Math.max(0, input.currentMainQuestionIndex - 1) % FALLBACK_QUESTIONS.length;
        nextQuestion = FALLBACK_QUESTIONS[bankIndex];
      }
    
      return {
        nextQuestion,
        difficulty: input.currentDifficulty || "MEDIUM",
        stage: input.currentStage || "TECHNICAL",
        isInterviewComplete: isComplete,
        isHint: false
      };
    }
  }
);
