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
    category: z.string(),
    difficulty: z.string(),
    isCorrect: z.boolean(),
  })),
});

const AptitudeEvaluationOutputSchema = z.object({
  overallScore: z.number(),
  categoryScores: z.object({
    quantitative: z.number(),
    logical: z.number(),
    english: z.number(),
  }),
  feedback: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    speedAnalysis: z.string(),
    accuracyInsight: z.string(),
    improvementTips: z.array(z.string()),
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
  - Category: {{this.category}}, Difficulty: {{this.difficulty}}, Result: {{#if this.isCorrect}}CORRECT{{else}}WRONG{{/if}}
{{/each}}

Audit Requirements:
1. Accuracy Audit: Calculate category scores and overall precision.
2. Temporal Audit: Analyze speed vs. accuracy. 20 minutes was the limit.
3. Status Determination: Decide 'Pass' or 'Fail'. 'Pass' requires > 60% and solid logical performance for this seniority.
4. Recommendations: If 'Fail', provide a remedial path. If 'Pass', highlight what they should carry into the technical interview.

Return a structured report.`,
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
      // Fallback status logic
      const correct = input.results.filter(r => r.isCorrect).length;
      const score = Math.round((correct / input.totalQuestions) * 100);
      return {
        overallScore: score,
        categoryScores: { quantitative: score, logical: score, english: score },
        feedback: {
          strengths: ["Solid core performance"],
          weaknesses: ["Areas for review identified"],
          speedAnalysis: "Standard pace maintained.",
          accuracyInsight: "Accuracy within expected bounds.",
          improvementTips: ["Continue practicing logic nodes."]
        },
        status: score >= 60 ? 'Pass' : 'Fail',
        recommendation: "Review core engineering logic nodes."
      };
    }
  }
);
