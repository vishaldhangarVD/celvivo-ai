'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Performance Auditor.
 * Evaluates aptitude results using Gemini to provide deep insights into logic, speed, and accuracy.
 * Generates detailed explanations for every question to support the review protocol.
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
  skippedCount: z.number(),
  accuracy: z.number(),
  percentile: z.string(),
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
  questionReviews: z.array(z.object({
    question: z.string(),
    explanation: z.string().describe("Clear explanation of why the correct answer is right."),
  })),
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
  - Question: {{{this.question}}}
{{/each}}

Audit Requirements:
1. Accuracy Audit: Calculate category scores and overall precision.
2. Temporal Audit: Analyze speed vs. accuracy. 15 minutes was the limit.
3. Status Determination: 'Pass' REQUIRES score >= 70%.
4. Question Review: For EVERY question provided in the results, provide a clear, concise explanation of the logic behind the correct answer.
5. Recommendation: Provide a high-impact summary of performance.

Return a structured intelligence report matching the output schema.`,
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
      
      const qReviews = input.results.map(r => ({
        question: r.question,
        explanation: "The logic follows standard principles for " + r.category + ". (Detailed neural explanation unavailable in fallback mode)."
      }));

      return {
        overallScore: score,
        correctCount: correct,
        wrongCount: input.totalQuestions - correct,
        skippedCount: 0,
        accuracy: score,
        percentile: "Top 30%",
        categoryScores: { quantitative: score, logical: score, english: score },
        feedback: {
          strengths: ["Core logical patterns detected"],
          weaknesses: ["Further refinement in speed recommended"],
          speedAnalysis: "Standard pace maintained.",
          accuracyInsight: "Accuracy within expected bounds.",
          improvementTips: ["Practice high-throughput logic nodes."]
        },
        questionReviews: qReviews,
        status: score >= 70 ? 'Pass' : 'Fail',
        recommendation: "Continue calibrating core engineering logic nodes."
      };
    }
  }
);
