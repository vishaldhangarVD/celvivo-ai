'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Generator.
 * Dynamically synthesizes logic nodes for the screening phase using Gemini.
 * Includes a premium mock fallback repository for high-availability.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  question: z.string().describe("The text of the question."),
  options: z.array(z.string()).length(4).describe("Four multiple choice options."),
  answer: z.string().describe("The exact text of the correct option."),
  category: z.enum(['Quantitative Aptitude', 'Logical Reasoning', 'English Communication', 'Analytical Reasoning', 'Critical Thinking', 'Pattern Recognition']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const AptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  resumeSummary: z.string().optional(),
});

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema).length(20),
});

export async function generateAptitudeTest(input: z.infer<typeof AptitudeInputSchema>) {
  return aptitudeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aptitudeGeneratorPrompt',
  input: { schema: AptitudeInputSchema },
  output: { schema: AptitudeOutputSchema },
  prompt: `You are an elite Recruitment Architect at a global IT firm.
Generate a fresh set of exactly 20 aptitude questions for a candidate with the following profile:

Role: {{{role}}}
Target Company: {{{company}}}
Experience Level: {{{experienceLevel}}}
Resume Context: {{{resumeSummary}}}

Simulation Protocols:
1. QUANTITATIVE (5 Nodes): Focus on numerical logic, percentages, and speed-distance.
2. LOGICAL (5 Nodes): Focus on patterns, series, and analytical deductions.
3. ANALYTICAL (5 Nodes): Focus on data interpretation and systems thinking.
4. VERBAL/CRITICAL (5 Nodes): Focus on executive communication and logical fallacies.

Calibration Guidelines:
- Difficulty Distribution: 5 Easy, 10 Medium, 5 Hard.
- Seniority Alignment: If experience is 5+ years, nodes should focus on complex systems thinking. If Fresher, focus on core mathematical and reasoning speed.
- Firm Persona: Calibrate question style to the target company ({{{company}}}).
- Correct Answer Strategy: Ensure the 'answer' field matches exactly one of the entries in the 'options' array.
- Return ONLY valid JSON.`,
});

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlow',
    inputSchema: AptitudeInputSchema,
    outputSchema: AptitudeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Aptitude synthesis failed.");
      return output;
    } catch (error) {
      console.error("[Aptitude Flow] Critical Quota/Neural Failure. Deploying Local Mock Repository.");
      
      // High-fidelity fallback question set to ensure user journey doesn't break
      return {
        questions: Array.from({ length: 20 }).map((_, i) => ({
          question: i % 4 === 0 
            ? `If a ${input.role} team doubles its velocity every 2 weeks, and completes a project in 12 weeks, when was the project 50% complete?`
            : i % 4 === 1
            ? "Complete the sequence: 2, 6, 12, 20, 30, ?"
            : i % 4 === 2
            ? `In a ${input.company} system architecture, if Component A fails with 10% probability and B fails with 20% probability, what is the probability of total system failure if they are in parallel?`
            : "Which word does not belong with the others? (Docker, Kubernetes, Terraform, Microsoft Word)",
          options: i % 4 === 0 
            ? ["10 weeks", "11 weeks", "6 weeks", "8 weeks"] 
            : i % 4 === 1
            ? ["36", "40", "42", "44"]
            : i % 4 === 2
            ? ["2%", "30%", "2.5%", "15%"]
            : ["Docker", "Kubernetes", "Terraform", "Microsoft Word"],
          answer: i % 4 === 0 ? "10 weeks" : i % 4 === 1 ? "42" : i % 4 === 2 ? "2%" : "Microsoft Word",
          category: i % 4 === 0 ? 'Analytical Reasoning' : i % 4 === 1 ? 'Logical Reasoning' : i % 4 === 2 ? 'Quantitative Aptitude' : 'Critical Thinking',
          difficulty: i < 5 ? 'Easy' : i < 15 ? 'Medium' : 'Hard'
        })) as any
      };
    }
  }
);
