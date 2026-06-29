'use server';
/**
 * @fileOverview Nexvoro AI Mock Interview Agent (Elite Senior Interviewer v6.0).
 * Calibrated for high-fidelity simulation of professional IT interviews.
 * Implements strict persona rules, resume-anchored questioning, and adaptive practical assessment.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from "crypto";
import {
  getNextStage,
  getNextDifficulty,
  isQuestionRepeated,
} from "@/ai/interviewBrain";

const INTERVIEW_VERSION = "NEXVORO_V7";

function createInterviewSeed(
  role: string,
  level: string,
  round: string
) {
  return crypto
    .createHash("md5")
    .update(
      `${role}-${level}-${round}-${Date.now()}-${Math.random()}`
    )
    .digest("hex")
    .substring(0, 10);
}
const FALLBACK_QUESTIONS = {
  'HR Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Could you walk me through your professional background and some of the key milestones in your career?",
    "Describe a time you had a conflict with a teammate over a decision. How was it resolved?",
    "Where do you see your technical career trajectory heading in the next five years?",
    "What specific aspects of our organization's mission interest you the most?"
  ],
  'Technical Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
    "Can you elaborate on the most complex technical challenge you faced in your strongest project?",
    "How do you ensure your code architecture remains maintainable and scalable over time?",
    "What is your systematic approach to debugging a critical production issue under pressure?",
    "How do you approach performance optimization when dealing with large-scale datasets?"
  ],
  'Managerial Round': [
    "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?",
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
  interviewSeed: z.string().optional(),
  interviewStage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW_UP",
    "BEHAVIOR",
    "RAPID_FIRE",
    "CLOSING"
  ]).optional(),
  
  difficultyLevel: z.enum([
    "EASY",
    "MEDIUM",
    "HARD"
  ]).optional(),
  
  askedQuestions: z.array(z.string()).optional(),
  
  candidateStrengths: z.array(z.string()).optional(),
  
  candidateWeaknesses: z.array(z.string()).optional(),
});
export type AiMockInterviewInput = z.infer<typeof AiMockInterviewInputSchema>;
const AiMockInterviewOutputSchema = z.object({
  nextQuestion: z.string(),

  feedbackOnLastAnswer: z.string().optional(),

  difficultyAdjustment: z.enum([
    "Easier",
    "Harder",
    "Maintain",
  ]).optional(),

  isInterviewComplete: z.boolean(),

  debugPrompt: z.string().optional(),

  isMock: z.boolean().optional(),

  interviewSeed: z.string().optional(),

  nextInterviewStage: z.enum([
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW_UP",
    "BEHAVIOR",
    "RAPID_FIRE",
    "CLOSING"
  ]).optional(),

  askedQuestions: z.array(z.string()).optional(),

  candidateStrengths: z.array(z.string()).optional(),

  candidateWeaknesses: z.array(z.string()).optional(),
});
export type AiMockInterviewOutput = z.infer<typeof AiMockInterviewOutputSchema>;

export async function aiMockInterview(input: AiMockInterviewInput): Promise<AiMockInterviewOutput> {
  return aiMockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockInterviewPrompt',
  input: { schema: AiMockInterviewInputSchema },
  output: { schema: AiMockInterviewOutputSchema },
  prompt: `You are an elite Senior Technical Interviewer with extensive experience conducting real-world interviews for IT professionals.
Your objective is to conduct a realistic interview that feels exactly like a live interview conducted by an experienced interviewer for a {{{role}}} position ({{{experienceLevel}}} level) during a {{{roundType}}}.

Interview Rules:

1. Never repeat any question that already exists in askedQuestions.

2. The interview must dynamically move through these stages:
INTRODUCTION
→ RESUME
→ PROJECT
→ TECHNICAL
→ SCENARIO
→ FOLLOW_UP
→ BEHAVIOR
→ RAPID_FIRE
→ CLOSING

3. Use interviewStage to decide what type of question comes next.

4. Analyze the user's previous answer before generating the next question.

5. If the previous answer is strong:
- Increase difficulty.
- Ask deeper follow-up questions.
- Explore architecture, scalability, optimization and edge cases.

6. If the previous answer is weak:
- Reduce difficulty slightly.
- Ask simpler follow-up questions.
- Test fundamentals before moving ahead.

7. Resume questions must come only from:
- resumeSkills
- resumeProjects
- resumeSummary

Never invent projects or experience.

8. Every nextQuestion must be different.

9. candidateStrengths should contain topics where the candidate performed well.

10. candidateWeaknesses should contain topics where the candidate struggled.

11. askedQuestions must always return the complete updated list.

12. nextInterviewStage must always return the next logical stage.

13. difficultyAdjustment must be one of:
Harder
Maintain
Easier

14. Keep the interview realistic like Google, Amazon, Microsoft, Atlassian, TCS Digital or Infosys Specialist interviews.

15. Ask only ONE question at a time.

GENERAL PERSONA RULES:
- Act exactly like an experienced human interviewer. Be professional, natural, and never robotic.
- NEVER mention that you are an AI or a model.
- Ask only ONE question at a time. Wait for the candidate's answer before continuing.
- Every new question should naturally continue from the previous answer or resume context.
- Never ask generic textbook definitions. Focus on technical reasoning, decision-making, and practical application.

CANDIDATE DOSSIER:
- Skills: {{#each resumeSkills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeProjects}}{{{this}}}, {{/each}}
- Experience Context: {{{resumeSummary}}}

INTERVIEW FLOW PROTOCOL:

NODE 1 (Opening):
If history is empty, you MUST start exactly with: "Hello. Welcome to today's interview. I hope you're doing well. I'll be conducting your interview today. Let's begin with a brief introduction. Could you please introduce yourself and tell me about yourself?"

NODE 2 (Resume Discussion):
Acknowledge the introduction naturally (e.g., "I appreciate the introduction.", "Thank you for that background."). 
Then, analyze the resume projects. Select the strongest project and ask a natural question about it. 
Example: "I noticed your project '{{{resumeProjects.[0]}}}'. Could you explain what problem this project solved and what technologies you chose for the implementation?"

NODE 3 (Role-Specific Technical):
Generate practical technical questions based on the role ({{{role}}}).
- Frontend: Performance, Accessibility, React state management, rendering cycles.
- Backend: API design, Scaling, DB optimization, Security protocols.
- Data: ETL pipelines, Business KPIs, Data cleaning strategies.
- Cloud/DevOps: Kubernetes, CI/CD, Disaster recovery, Cost optimization.

NODE 4 (Follow-up & Adaptivity):
Listen to the candidate's previous answer. If they mentioned a specific technology or methodology, ask "Why that choice?", "What alternatives did you consider?", or "What challenges did you face?".

NODE 5 (Scenario Questions):
Ask practical real-world work situations matching the role.
- "Suppose your production server suddenly crashes, how would you investigate?"
- "You discover incorrect dashboard values just before a client presentation..."
- "An API becomes slow after deployment. What are your first 3 steps?"

NODE 6 (Closing):
If the session is complete (current index >= 5), finish naturally with: "Thank you for your time. That concludes today's interview. It was nice speaking with you."

CURRENT STATUS:
CURRENT INTERVIEW STATE

Interview Stage:
{{{interviewStage}}}

Difficulty:
{{{difficultyLevel}}}

Interview Seed:
{{{interviewSeed}}}

Current Question Number:
{{{currentMainQuestionIndex}}} of 5

Previously Asked Questions:
{{#each askedQuestions}}
- {{{this}}}
{{/each}}

Candidate Strengths:
{{#each candidateStrengths}}
- {{{this}}}
{{/each}}

Candidate Weaknesses:
{{#each candidateWeaknesses}}
- {{{this}}}
{{/each}}

Conversation History:

{{#each history}}
Interviewer:
{{{this.question}}}

Candidate:
{{{this.answer}}}

{{/each}}

Latest Candidate Response:

{{{userAnswer}}}

VERY IMPORTANT RULES

Never repeat any question already present in "Previously Asked Questions".

Every question MUST be different.

Continue naturally.

Behave exactly like a senior interviewer.

Never jump randomly between topics.

Difficulty should increase naturally if candidate performs well.

If candidate performs poorly, simplify but do not repeat.

Every follow-up question should reference candidate's previous answer whenever possible.

Avoid textbook questions.

Prefer practical real-world situations.

Never output multiple questions.

Interview Progress Rules:

Current Stage:
{{{interviewStage}}}

Current Difficulty:
{{{difficultyLevel}}}

Already Asked Questions:
{{{askedQuestions}}}

Candidate Strengths:
{{{candidateStrengths}}}

Candidate Weaknesses:
{{{candidateWeaknesses}}}

Rules:

- Never ask the same question twice.
- If a question is already in askedQuestions, generate a completely different one.
- Follow the interviewStage strictly.
- Resume stage → ask only resume questions.
- Project stage → ask only project questions.
- Technical stage → ask technical questions.
- Scenario stage → ask situational questions.
- Behaviour stage → behavioural questions.
- Rapid Fire → short quick questions.
- Closing → final HR-style questions.

Difficulty Rules:

- EASY → beginner level
- MEDIUM → normal company interview
- HARD → senior/deep concepts

If candidate answered previous question very well,
increase difficulty.

If candidate struggled,
reduce difficulty.

After every answer return:

- nextInterviewStage
- askedQuestions
- candidateStrengths
- candidateWeaknesses
- difficultyAdjustment

Output only ONE interviewer question.
----------------------------------------
INTERVIEW STAGE RULES

Current Stage:
{{{interviewStage}}}

Follow these stages naturally:

INTRODUCTION
- Ask only 1 introduction question.

RESUME
- Ask 2 resume-based questions using resumeSummary, resumeSkills and resumeProjects.

PROJECT
- Ask 2 project deep dive questions.

TECHNICAL
- Ask technical questions according to the role.

SCENARIO
- Give one real-world scenario.

FOLLOW_UP
- Ask only follow-up questions based on previous answers.

BEHAVIOR
- Ask behavioural questions.

RAPID_FIRE
- Ask short rapid-fire questions.

CLOSING
- Finish interview politely.

At the end of every response decide the next stage.

Return:

nextInterviewStage
`,
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
        nextQuestion: "[DEBUG] Senior Interviewer Persona Active. Flow sequence initiated.",
        feedbackOnLastAnswer: "DEBUG: Acknowledgement node synchronized.",
        isInterviewComplete: input.currentMainQuestionIndex >= 5,
        debugPrompt: "System check: Elite Senior Persona Protocol Active."
      };
    }

    try {
    const interviewSeed = createInterviewSeed(
  input.role,
  input.experienceLevel,
  input.roundType
);

const askedQuestions = input.askedQuestions || [];

const interviewStage = getNextStage(
  (input.interviewStage as any) || "INTRODUCTION",
  input.currentMainQuestionIndex
);

const difficulty = getNextDifficulty(
  (input.difficultyLevel as any) || "MEDIUM",
  (input.userAnswer || "").length
);

let output;

for (let attempt = 0; attempt < 3; attempt++) {

  const result = await runWithResilience(prompt, {
    ...input,
    interviewSeed,
    interviewStage,
    difficultyLevel: difficulty,
    askedQuestions,
  });

  output = result.output;

  if (!output) continue;

  if (
    !isQuestionRepeated(
      output.nextQuestion,
      askedQuestions
    )
  ) {
    break;
  }

  output = undefined;
}

if (!output) {
  throw new Error("Unable to generate unique interview question.");
}
      if (!output) throw new Error("Neural synthesis failed.");
      if (
        output?.nextQuestion &&
        isQuestionRepeated(output.nextQuestion, askedQuestions)
      ) {
        throw new Error("Repeated question generated by AI.");
      }
      
      return {
        ...output,
      
        interviewSeed,
      
        askedQuestions: [
          ...askedQuestions,
          output.nextQuestion || ""
        ],
      
        nextInterviewStage:
          output.nextInterviewStage ??
          interviewStage,
      
        candidateStrengths:
          output.candidateStrengths ?? input.candidateStrengths ?? [],
      
        candidateWeaknesses:
          output.candidateWeaknesses ?? input.candidateWeaknesses ?? [],
      
        difficultyAdjustment:
          output.difficultyAdjustment ?? "Maintain",
      
        isInterviewComplete:
          input.currentMainQuestionIndex >= 5,
      
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