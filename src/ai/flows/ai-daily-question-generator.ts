'use server';
/**
 * @fileOverview Nexvoro AI Daily Challenge Architect.
 * Dynamically synthesizes professional career nodes using Gemini.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const DailyQuestionOutputSchema = z.object({
  id: z.string().describe("Deterministic identifier for the day."),
  question: z.string().describe("The professional career/interview question."),
  category: z.enum(['HR', 'Technical', 'Aptitude', 'Behavioral']).describe("The focus area of the challenge."),
});

export type DailyQuestionOutput = z.infer<typeof DailyQuestionOutputSchema>;

export async function generateDailyQuestion(dateSeed: string): Promise<DailyQuestionOutput> {
  return dailyQuestionFlow(dateSeed);
}

const dailyQuestionPrompt = ai.definePrompt({
  name: 'dailyQuestionPrompt',
  input: { schema: z.string() },
  output: { schema: DailyQuestionOutputSchema },
  prompt: `You are an elite career strategist and technical recruiter. 
Generate a high-fidelity, professional interview or career-preparation question for today: {{{this}}}.

### GUIDELINES:
- The question must be sophisticated and suitable for an elite IT professional.
- Choose EXACTLY one category from: HR, Technical, Aptitude, Behavioral.
- The question should vary in focus each day (e.g., if today is Technical, tomorrow could be Behavioral).
- Return only a structured JSON object.

Category Definitions:
- HR: Cultural fit, company values, salary negotiation, career trajectory.
- Technical: System design, architecture, advanced data structures, optimization.
- Aptitude: Logic puzzles, mathematical reasoning, critical thinking.
- Behavioral: Conflict resolution, leadership, failure analysis, teamwork.`,
});

const dailyQuestionFlow = ai.defineFlow(
  {
    name: 'dailyQuestionFlow',
    inputSchema: z.string(),
    outputSchema: DailyQuestionOutputSchema,
  },
  async (dateSeed) => {
    try {
      const { output } = await runWithResilience(dailyQuestionPrompt, dateSeed);
      if (!output) throw new Error("Neural synthesis failed to produce a valid node.");
      return output;
    } catch (error) {
      console.error("[Daily Gen Flow] Critical Fault:", error);
      throw error;
    }
  }
);
