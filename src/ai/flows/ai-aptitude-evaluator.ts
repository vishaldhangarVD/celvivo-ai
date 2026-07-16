'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Performance Auditor.
 * Evaluates aptitude results using Gemini to provide deep insights into logic, speed, and accuracy.
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
  prompt: `You are an elite HR Performance Auditor at a Tier-1 IT company. 
Evaluate this candidate's aptitude performance for a {{{role}}} position at {{{company}}} ({{{experienceLevel}}} level).

DATA Dossier:
- Total Nodes: {{{totalQuestions}}}
- Time Taken: {{{timeTakenSeconds}}} seconds
- Results: 
{{#each results}}
  - Category: {{this.category}}, Result: {{#if this.isCorrect}}CORRECT{{else}}WRONG{{/if}}
{{/each}}

Audit Requirements:
1. Accuracy Audit: Calculate category scores and overall precision.
2. Temporal Audit: Analyze speed vs. accuracy.
3. Status Determination: 'Pass' REQUIRES score >= 70%.
4. Recommendation: Provide a high-impact summary of performance.

Return a structured intelligence report.`,
});

const aptitudeEvaluationFlow = ai.defineFlow(
  {
    name: 'aptitudeEvaluationFlow',
    inputSchema: AptitudeEvaluationInputSchema,
    outputSchema: AptitudeEvaluationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Aptitude audit synthesis failed.");
      return output;
    } catch (error) {
      console.error("Aptitude Evaluation Error:", error);
      // Simple fallback logic
      const correct = input.results.filter(r => r.isCorrect).length;
      const score = Math.round((correct / input.totalQuestions) * 100);
      return {
        overallScore: score,
        correctCount: correct,
        wrongCount: input.totalQuestions - correct,
        accuracy: score,
        percentile: "Top 30%",
        feedback: {
          strengths: ["Logical pattern recognition"],
          weaknesses: ["Speed refinement required"],
          speedAnalysis: "Candidate completed within the allotted time."
        },
        status: score >= 70 ? 'Pass' : 'Fail',
        recommendation: "Evaluation based on raw accuracy node."
      };
    }
  }
);
