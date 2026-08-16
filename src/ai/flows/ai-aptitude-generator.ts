'use server';
/**
 * @fileOverview Nexvoro AI Aptitude Generator v12.0.
 * Dynamically synthesizes logic nodes using Google Gemini.
 * Implements strict index-based correctness mapping and a large unique fallback bank.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question node."),
  question: z.string().describe("The text of the question."),
  options: z.array(z.string()).length(4).describe("Exactly four unique multiple choice options."),
  correctOptionIndex: z.number().min(0).max(3).describe("Zero-based index of the correct option in the options array."),
  category: z.enum(['Quantitative Aptitude', 'Logical Reasoning', 'English Communication', 'Analytical Reasoning', 'Critical Thinking', 'Pattern Recognition']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  explanation: z.string().optional().describe("Brief logical explanation of the correct answer."),
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
- Question Uniqueness: DO NOT repeat questions. Every question must be distinct.
- Difficulty Distribution: 5 Easy, 10 Medium, 5 Hard.
- Seniority Alignment: If experience is 5+ years, nodes should focus on complex systems thinking. If Fresher, focus on core mathematical and reasoning speed.
- Correct Answer Strategy: Set 'correctOptionIndex' to the EXACT index of the correct answer in the 'options' array.
- Return ONLY valid JSON matching the schema.`,
});

const FALLBACK_BANK = [
  { id: 'fb-1', question: 'If a project velocity doubles every 2 weeks and completes in 12 weeks, when was it 50% complete?', options: ['6 weeks', '8 weeks', '10 weeks', '11 weeks'], correctOptionIndex: 2, category: 'Analytical Reasoning', difficulty: 'Medium' },
  { id: 'fb-2', question: 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '44'], correctOptionIndex: 2, category: 'Logical Reasoning', difficulty: 'Easy' },
  { id: 'fb-3', question: 'If A is taller than B, and B is shorter than C, who is the tallest?', options: ['A', 'B', 'C', 'Cannot be determined'], correctOptionIndex: 3, category: 'Logical Reasoning', difficulty: 'Easy' },
  { id: 'fb-4', question: 'Which term does not belong: Docker, Kubernetes, Terraform, Microsoft Word?', options: ['Docker', 'Kubernetes', 'Terraform', 'Microsoft Word'], correctOptionIndex: 3, category: 'Critical Thinking', difficulty: 'Easy' },
  { id: 'fb-5', question: 'A server has 99.9% uptime. How many minutes of downtime is allowed per year (approx)?', options: ['5 mins', '50 mins', '525 mins', '5250 mins'], correctOptionIndex: 2, category: 'Quantitative Aptitude', difficulty: 'Medium' },
  { id: 'fb-6', question: 'If 3 devs build 3 APIs in 3 days, how long for 1 dev to build 1 API?', options: ['1 day', '3 days', '9 days', '0.3 days'], correctOptionIndex: 1, category: 'Logical Reasoning', difficulty: 'Easy' },
  { id: 'fb-7', question: 'Select the synonym for "Scalable":', options: ['Fixed', 'Extensible', 'Fragile', 'Isolated'], correctOptionIndex: 1, category: 'English Communication', difficulty: 'Easy' },
  { id: 'fb-8', question: 'A team has 5 members. How many unique 2-person pairings are possible?', options: ['5', '10', '15', '20'], correctOptionIndex: 1, category: 'Quantitative Aptitude', difficulty: 'Medium' },
  { id: 'fb-9', question: 'In a binary search of 1000 items, what is the maximum number of comparisons?', options: ['10', '100', '500', '1000'], correctOptionIndex: 0, category: 'Analytical Reasoning', difficulty: 'Hard' },
  { id: 'fb-10', question: 'If "CODE" is "3 15 4 5", what is "JAVA"?', options: ['10 1 22 1', '10 2 21 1', '9 1 22 1', '11 2 23 2'], correctOptionIndex: 0, category: 'Logical Reasoning', difficulty: 'Medium' },
  { id: 'fb-11', question: 'The cost of 5 instances is $200. What is the cost of 8 instances?', options: ['$300', '$320', '$350', '$400'], correctOptionIndex: 1, category: 'Quantitative Aptitude', difficulty: 'Easy' },
  { id: 'fb-12', question: 'Identify the odd one out:', options: ['Java', 'C++', 'Python', 'HTML'], correctOptionIndex: 3, category: 'Critical Thinking', difficulty: 'Easy' },
  { id: 'fb-13', question: 'If today is Monday, what day will it be in 65 days?', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], correctOptionIndex: 2, category: 'Logical Reasoning', difficulty: 'Medium' },
  { id: 'fb-14', question: 'A train travels at 60km/h. How far does it go in 15 minutes?', options: ['10km', '15km', '20km', '25km'], correctOptionIndex: 1, category: 'Quantitative Aptitude', difficulty: 'Easy' },
  { id: 'fb-15', question: 'Which is a logical fallacy?', options: ['Star Algorithm', 'Ad Hominem', 'Recursion', 'Binary Tree'], correctOptionIndex: 1, category: 'Critical Thinking', difficulty: 'Medium' },
  { id: 'fb-16', question: 'If N developers complete N tasks in N hours, how many tasks does 1 developer do per hour?', options: ['1', 'N', '1/N', 'N^2'], correctOptionIndex: 0, category: 'Analytical Reasoning', difficulty: 'Hard' },
  { id: 'fb-17', question: 'An API response time increased by 50% from 200ms. New time?', options: ['250ms', '300ms', '400ms', '100ms'], correctOptionIndex: 1, category: 'Quantitative Aptitude', difficulty: 'Easy' },
  { id: 'fb-18', question: 'A clock shows 3:15. Angle between hands?', options: ['0 deg', '7.5 deg', '15 deg', '22.5 deg'], correctOptionIndex: 1, category: 'Logical Reasoning', difficulty: 'Hard' },
  { id: 'fb-19', question: 'Opposite of "Synchronous":', options: ['Parallel', 'Sequential', 'Asynchronous', 'Blocking'], correctOptionIndex: 2, category: 'English Communication', difficulty: 'Easy' },
  { id: 'fb-20', question: 'If 2^x = 1024, what is x?', options: ['8', '9', '10', '11'], correctOptionIndex: 2, category: 'Quantitative Aptitude', difficulty: 'Medium' }
];

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlow',
    inputSchema: AptitudeInputSchema,
    outputSchema: AptitudeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output || !output.questions || output.questions.length === 0) throw new Error("Aptitude synthesis failed.");
      return output;
    } catch (error) {
      console.error("[Aptitude Flow] Critical Quota/Neural Failure. Deploying Local unique repository.");
      return { questions: FALLBACK_BANK as any };
    }
  }
);
