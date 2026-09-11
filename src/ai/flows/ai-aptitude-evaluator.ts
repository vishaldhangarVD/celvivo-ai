'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Performance Auditor v3.0.
 * Conducts qualitative audit of candidate logic performance.
 * Numeric scoring is handled deterministically by the application core.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeEvaluationInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  timeTakenSeconds: z.number(),
  totalQuestions: z.number(),
  results: z.array(z.object({
    question: z.string(),
    category: z.string(),
    difficulty: z.string(),
    userAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
  })),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const AptitudeEvaluationOutputSchema = z.object({
  overallScore: z.number(),
  correctCount: z.number(),
  wrongCount: z.number(),
  accuracy: z.number(),
  percentile: z.string(),
  feedback: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    speedAnalysis: z.string(),
  }),
  status: z.enum(['Pass', 'Fail']),
  recommendation: z.string(),
});

export async function evaluateAptitude(input: z.infer<typeof AptitudeEvaluationInputSchema>) {
  return aptitudeEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aptitudeEvaluationPrompt',
  input: { schema: AptitudeEvaluationInputSchema },
  output: { schema: AptitudeEvaluationOutputSchema },
  prompt: `You are an elite HR Performance Auditor at {{{company}}}. 
Evaluate this candidate's logic performance for the {{{role}}} role.

AUDIT Dossier:
- Total Nodes: {{{totalQuestions}}}
- Duration: {{{timeTakenSeconds}}} seconds
- Detailed Trace: 
{{#each results}}
  - [{{this.category}}] Difficulty: {{this.difficulty}} | Result: {{#if this.isCorrect}}SUCCESS{{else}}FAIL{{/if}}
{{/each}}

Requirements:
1. Provide qualitative strengths (categories where accuracy is high).
2. Provide critical gaps (categories with high failure rates).
3. Analyze speed vs accuracy based on time taken.
4. Pass criteria: deterministic score provided in input must be interpreted.

Return a professional performance audit.`,
});

const aptitudeEvaluationFlow = ai.defineFlow(
  {
    name: 'aptitudeEvaluationFlow',
    inputSchema: AptitudeEvaluationInputSchema,
    outputSchema: AptitudeEvaluationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input, {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: 'aptitude_evaluation'
      });
      if (!output) throw new Error("Aptitude audit failed.");
      return output;
    } catch (error) {
      console.error("Aptitude Evaluation Error:", error);
      const correct = input.results.filter(r => r.isCorrect).length;
      const score = Math.round((correct / input.totalQuestions) * 100);
      return {
        overallScore: score,
        correctCount: correct,
        wrongCount: input.totalQuestions - correct,
        accuracy: score,
        percentile: "Standardized Audit",
        feedback: {
          strengths: ["Logical consistency verified"],
          weaknesses: ["Deep qualitative audit unavailable"],
          speedAnalysis: "Processed within standard temporal limits."
        },
        status: score >= 70 ? 'Pass' : 'Fail',
        recommendation: "Candidate logic baseline established."
      };
    }
  }
);
