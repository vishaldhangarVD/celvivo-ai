'use server';
/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v16.0.
 * Dynamically synthesizes high-fidelity logic nodes using Google Gemini.
 * Implements strict category distribution, difficulty mapping, and a 30-node unique fallback bank.
 * Enhanced with cross-session duplicate protection via usedQuestionIds.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question node."),
  question: z.string().describe("The text of the question, including any data tables or scenarios."),
  options: z.array(z.string()).length(4).describe("Exactly four unique multiple choice options."),
  correctOptionIndex: z.number().min(0).max(3).describe("Zero-based index of the correct option."),
  category: z.enum(['Quantitative Aptitude', 'Logical Reasoning', 'English Communication', 'Analytical Reasoning', 'Critical Thinking', 'Pattern Recognition', 'Data Interpretation', 'CS Aptitude']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  explanation: z.string().optional().describe("Brief logical explanation."),
});

const AptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  resumeSummary: z.string().optional(),
  usedQuestionIds: z.array(z.string()).optional().describe("List of question IDs already used in previous sessions to prevent repeats."),
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
  prompt: `You are an elite Recruitment Architect at {{{company}}}. 
Generate a professional 20-question Aptitude Assessment for a {{{role}}} candidate ({{{experienceLevel}}}).

### UNIQUE IDENTITY PROTOCOL:
- DO NOT use any questions that overlap with these previously asked question IDs: {{{usedQuestionIds}}}
- Every question MUST have a unique 10-character alphanumeric ID.

### CURRICULUM ARCHITECTURE (Exactly 20 Nodes):
1. QUANTITATIVE (5 Nodes): Focus on profit/loss, speed-distance, probability, and percentages.
2. LOGICAL (4 Nodes): Syllogisms, arrangements, and series.
3. VERBAL (3 Nodes): Grammar, vocabulary in context, and comprehension logic.
4. DATA INTERPRETATION (3 Nodes): Provide a small structured dataset (e.g., 'Table: Year | Revenue | Profit') and ask a multi-step calculation question.
5. PROBLEM SOLVING (3 Nodes): Resource allocation or scheduling scenarios.
6. CS APTITUDE (2 Nodes): Algorithms, databases, or system fundamentals.

### DIFFICULTY PROGRESSION PROTOCOL:
- Q1-Q5: EASY (Foundational logic)
- Q6-Q12: MEDIUM (Analytical depth)
- Q13-Q17: MEDIUM/HARD (Complex multi-step reasoning)
- Q18-Q20: HARD (Edge case scenarios & high-pressure logic)

### NEURAL INTEGRITY RULES:
- NO duplicate questions.
- NO trivial arithmetic. Questions must require reasoning.
- Every correctOptionIndex MUST point to the mathematically correct option.
- Options must be unique and plausible.
- If experience is 5+ years, prioritize system-thinking and optimization scenarios.

Return ONLY a valid JSON object containing the 'questions' array.`,
});

const FALLBACK_BANK = [
  { id: 'fb-1', category: 'Quantitative Aptitude', difficulty: 'Easy', question: 'A project velocity doubles every 2 weeks. If the project is completed in 12 weeks, at which week was it 25% complete?', options: ['3 weeks', '6 weeks', '8 weeks', '10 weeks'], correctOptionIndex: 2 },
  { id: 'fb-2', category: 'Logical Reasoning', difficulty: 'Easy', question: 'Identify the next number in the sequence: 4, 9, 25, 49, 121, ?', options: ['144', '169', '196', '225'], correctOptionIndex: 1 },
  { id: 'fb-3', category: 'CS Aptitude', difficulty: 'Easy', question: 'Which data structure is primarily used to implement Undo functionality in a text editor?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctOptionIndex: 1 },
  { id: 'fb-4', category: 'English Communication', difficulty: 'Easy', question: 'Choose the correct synonym for "Implicit":', options: ['Explicit', 'Unspoken', 'Obvious', 'Vague'], correctOptionIndex: 1 },
  { id: 'fb-5', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'A server has an uptime of 99.99%. How much maximum downtime is allowed in a 365-day year (approx)?', options: ['5 mins', '52 mins', '525 mins', '8 hours'], correctOptionIndex: 1 },
  { id: 'fb-6', category: 'Data Interpretation', difficulty: 'Medium', question: 'Dataset: Q1 Sales: 100k, Q2 Sales: 150k, Q3 Sales: 120k. What is the percentage increase in sales from Q1 to Q2?', options: ['25%', '50%', '33.3%', '20%'], correctOptionIndex: 1 },
  { id: 'fb-7', category: 'Logical Reasoning', difficulty: 'Medium', question: 'In a code, "CLOUD" is written as "DMPVE". How is "SERVER" written in that same code?', options: ['TFSWFS', 'TGTVFS', 'TFSTFS', 'TFSVFS'], correctOptionIndex: 0 },
  { id: 'fb-8', category: 'CS Aptitude', difficulty: 'Medium', question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctOptionIndex: 2 },
  { id: 'fb-9', category: 'Analytical Reasoning', difficulty: 'Medium', question: 'If A is taller than B, B is shorter than C, and C is taller than A, who is the shortest?', options: ['A', 'B', 'C', 'Cannot be determined'], correctOptionIndex: 1 },
  { id: 'fb-10', category: 'English Communication', difficulty: 'Medium', question: 'Identify the grammatically correct sentence:', options: ['He did not went to the office.', 'He does not goes to the office.', 'He did not go to the office.', 'He do not go to the office.'], correctOptionIndex: 2 },
  { id: 'fb-11', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'A and B can finish a task in 10 and 15 days respectively. If they work together, how many days will it take?', options: ['5 days', '6 days', '7 days', '8 days'], correctOptionIndex: 1 },
  { id: 'fb-12', category: 'Pattern Recognition', difficulty: 'Medium', question: 'Which shape comes next in the sequence: Square, Triangle, Circle, Square, Triangle, ?', options: ['Square', 'Circle', 'Triangle', 'Pentagon'], correctOptionIndex: 1 },
  { id: 'fb-13', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'Find the probability of getting a sum of 9 when two dice are thrown simultaneously.', options: ['1/9', '1/12', '1/6', '4/9'], correctOptionIndex: 0 },
  { id: 'fb-14', category: 'Logical Reasoning', difficulty: 'Hard', question: 'Six people are sitting in a circle facing the center. A is opposite B, B is to the right of C. D is between A and C. Who is sitting to the immediate left of B?', options: ['A', 'C', 'D', 'E'], correctOptionIndex: 0 },
  { id: 'fb-15', category: 'Data Interpretation', difficulty: 'Hard', question: 'In a team of 50, 30 know Python, 25 know Java, and 10 know both. How many know neither?', options: ['5', '10', '15', '0'], correctOptionIndex: 0 },
  { id: 'fb-16', category: 'CS Aptitude', difficulty: 'Hard', question: 'In a relational database, which normal form deals with removing partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctOptionIndex: 1 },
  { id: 'fb-17', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'A train 100m long passes a platform 200m long in 10 seconds. What is the speed of the train in km/h?', options: ['30 km/h', '60 km/h', '108 km/h', '120 km/h'], correctOptionIndex: 2 },
  { id: 'fb-18', category: 'Analytical Reasoning', difficulty: 'Hard', question: 'All cats are mammals. No mammals are reptiles. Therefore:', options: ['Some cats are reptiles.', 'All cats are reptiles.', 'No cats are reptiles.', 'All reptiles are cats.'], correctOptionIndex: 2 },
  { id: 'fb-19', category: 'Critical Thinking', difficulty: 'Hard', question: 'If "If P then Q" is true, which of the following must also be true?', options: ['If not P then not Q', 'If Q then P', 'If not Q then not P', 'P and not Q'], correctOptionIndex: 2 },
  { id: 'fb-20', category: 'Problem Solving', difficulty: 'Hard', question: 'You have 3 buckets with capacities 12L, 8L, and 5L. The 12L bucket is full. How many steps to get exactly 6L in the 12L bucket?', options: ['3', '5', '7', 'None of these'], correctOptionIndex: 1 },
  { id: 'fb-21', category: 'Quantitative Aptitude', difficulty: 'Easy', question: 'What is 15% of 200 plus 25% of 100?', options: ['45', '55', '60', '70'], correctOptionIndex: 1 },
  { id: 'fb-22', category: 'Logical Reasoning', difficulty: 'Easy', question: 'If North becomes North-East, what does West become?', options: ['North-West', 'South-West', 'South-East', 'North'], correctOptionIndex: 0 },
  { id: 'fb-23', category: 'English Communication', difficulty: 'Easy', question: 'Select the antonym for "Fragile":', options: ['Delicate', 'Sturdy', 'Weak', 'Broken'], correctOptionIndex: 1 },
  { id: 'fb-24', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was the removed number?', options: ['24', '26', '28', '30'], correctOptionIndex: 2 },
  { id: 'fb-25', category: 'CS Aptitude', difficulty: 'Medium', question: 'Which HTTP status code represents "Not Found"?', options: ['200', '403', '404', '500'], correctOptionIndex: 2 },
  { id: 'fb-26', category: 'Data Interpretation', difficulty: 'Medium', question: 'Sales: Jan($10k), Feb($12k), Mar($15k). Average monthly growth rate?', options: ['10%', '20%', '25%', '22.5%'], correctOptionIndex: 3 },
  { id: 'fb-27', category: 'Logical Reasoning', difficulty: 'Medium', question: 'Statements: 1. All pencils are pens. 2. Some pens are markers. Conclusion: Some pencils are markers.', options: ['True', 'False', 'Insufficient Data', 'None'], correctOptionIndex: 1 },
  { id: 'fb-28', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'A sum of money doubles itself in 8 years at simple interest. In how many years will it triple itself?', options: ['12 years', '14 years', '16 years', '20 years'], correctOptionIndex: 2 },
  { id: 'fb-29', category: 'CS Aptitude', difficulty: 'Hard', question: 'In networking, which layer of the OSI model is responsible for encryption?', options: ['Application', 'Presentation', 'Session', 'Transport'], correctOptionIndex: 1 },
  { id: 'fb-30', category: 'Problem Solving', difficulty: 'Hard', question: 'Four friends (A, B, C, D) need to cross a bridge at night. They have one torch. Max 2 people can cross. A takes 1m, B takes 2m, C takes 5m, D takes 10m. Min time?', options: ['15m', '17m', '19m', '21m'], correctOptionIndex: 1 },
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
      console.error("[Aptitude Flow] Neural Fault. Deploying verified unique repository.");
      // Filter out used questions from fallback bank if possible
      const usedIds = new Set(input.usedQuestionIds || []);
      const availableFallback = FALLBACK_BANK.filter(q => !usedIds.has(q.id));
      
      // If we have enough unique ones, use them, otherwise just take first 20
      const finalBank = availableFallback.length >= 20 ? availableFallback.slice(0, 20) : FALLBACK_BANK.slice(0, 20);
      
      return { questions: finalBank as any };
    }
  }
);
