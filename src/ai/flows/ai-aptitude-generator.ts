'use server';
/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v30.0.
 * Dynamically synthesizes high-fidelity logic nodes using Google Gemini.
 * Implements persistent history awareness and semantic duplicate prevention.
 * Features a safety net to ensure 20 unique questions even under fallback conditions.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question node."),
  question: z.string().describe("The text of the question."),
  options: z.array(z.string()).length(4).describe("Exactly four unique multiple choice options."),
  correctOptionIndex: z.number().min(0).max(3).describe("Zero-based index of the correct option."),
  category: z.string().describe("The logic category."),
  difficulty: z.string().describe("The difficulty level."),
  explanation: z.string().optional().describe("Brief logical explanation."),
});

export type AptitudeQuestion = z.infer<typeof AptitudeQuestionSchema>;

const AptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  usedQuestionFingerprints: z.array(z.string()).optional().describe("Fingerprints of previously used questions to prevent repeats."),
});

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema),
});

const FORBIDDEN_CONCEPTS = [
  "velocity doubles",
  "growth doubles",
  "doubles every",
  "triples every",
  "25% complete", 
  "percentage completion",
  "missing information",
];

const VALID_CATEGORIES = [
  'Quantitative Aptitude', 
  'Logical Reasoning', 
  'English Communication', 
  'Analytical Reasoning', 
  'Data Interpretation', 
  'CS Aptitude'
];

const CATEGORY_MAP: Record<string, string> = {
  "Verbal Ability": "English Communication",
  "Verbal Reasoning": "English Communication",
  "Verbal": "English Communication",
  "Problem Solving": "Analytical Reasoning",
  "Critical Reasoning": "Logical Reasoning",
};

/**
 * Normalizes question text for fingerprinting.
 * Also generates a "reasoning pattern" by removing digits.
 */
function normalizeQuestion(text: string): { fingerprint: string; pattern: string } {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ")    // Normalize whitespace
    .trim();
  
  const pattern = clean.replace(/\d+/g, "X"); // Replace numbers with X to detect templates
  return { fingerprint: clean, pattern };
}

/**
 * Validates a single question node for logical and structural integrity.
 */
function validateAptitudeQuestion(q: any, existingFingerprints: Set<string>, existingPatterns: Set<string>): { valid: boolean; reason?: string; normalized?: AptitudeQuestion } {
  if (!q.question || q.question.trim().length < 20) return { valid: false, reason: "Question text too short or empty." };
  if (!q.options || q.options.length !== 4) return { valid: false, reason: "Invalid options count." };
  
  const uniqueOpts = new Set(q.options.map((o: any) => String(o).trim().toLowerCase()));
  if (uniqueOpts.size !== 4) return { valid: false, reason: "Duplicate options detected." };

  if (q.correctOptionIndex < 0 || q.correctOptionIndex > 3) return { valid: false, reason: "Correct index out of bounds." };
  if (!q.options[q.correctOptionIndex] || String(q.options[q.correctOptionIndex]).trim() === "") return { valid: false, reason: "Correct index points to empty option." };

  let cat = q.category;
  if (CATEGORY_MAP[cat]) cat = CATEGORY_MAP[cat];
  if (!VALID_CATEGORIES.includes(cat)) {
    const closest = VALID_CATEGORIES.find(v => cat.toLowerCase().includes(v.toLowerCase().split(' ')[0]));
    cat = closest || "Logical Reasoning";
  }

  const { fingerprint, pattern } = normalizeQuestion(q.question);
  
  for (const concept of FORBIDDEN_CONCEPTS) {
    if (fingerprint.includes(concept)) return { valid: false, reason: `Question contains forbidden pattern: ${concept}` };
  }

  if (existingFingerprints.has(fingerprint)) return { valid: false, reason: "Duplicate question content detected." };
  if (existingPatterns.has(pattern)) return { valid: false, reason: "Duplicate reasoning template detected." };

  existingFingerprints.add(fingerprint);
  existingPatterns.add(pattern);

  return { 
    valid: true, 
    normalized: {
      ...q,
      category: cat,
      id: q.id || Math.random().toString(36).substring(2, 12)
    } 
  };
}

const FALLBACK_BANK: AptitudeQuestion[] = [
  { id: 'fb-1', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'A cistern is normally filled in 8 hours, but it takes 2 hours longer to fill because of a leak in its bottom. If the cistern is full, the leak will empty it in how many hours?', options: ['16 hours', '20 hours', '40 hours', '50 hours'], correctOptionIndex: 2, explanation: 'Work by tap = 1/8 per hr. Work by (tap + leak) = 1/10 per hr. Leak work = 1/8 - 1/10 = 1/40. Thus, 40 hours.' },
  { id: 'fb-2', category: 'Logical Reasoning', difficulty: 'Easy', question: 'Identify the next number in the sequence: 4, 9, 25, 49, 121, ?', options: ['144', '169', '196', '225'], correctOptionIndex: 1, explanation: 'The sequence consists of squares of prime numbers: 2, 3, 5, 7, 11. The next prime is 13, and 13 squared is 169.' },
  { id: 'fb-3', category: 'CS Aptitude', difficulty: 'Easy', question: 'Which data structure is primarily used to implement Undo functionality in a text editor?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctOptionIndex: 1, explanation: 'A Stack follows Last-In-First-Out (LIFO), which is ideal for reversing the most recent actions.' },
  { id: 'fb-4', category: 'English Communication', difficulty: 'Medium', question: 'Select the sentence that uses the word "Implicit" correctly:', options: ['The instructions were implicit and easy to read.', 'His approval was implicit in his silence.', 'He made an implicit demand for more money.', 'The sign provided an implicit warning.'], correctOptionIndex: 1, explanation: 'Implicit means implied though not plainly expressed.' },
  { id: 'fb-5', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'A server has an uptime of 99.99%. How much maximum downtime is allowed in a 365-day year (approx)?', options: ['5 mins', '52 mins', '525 mins', '8 hours'], correctOptionIndex: 1, explanation: '0.01% of 365 days is 0.0001 * 365 * 24 * 60 = 52.56 minutes.' },
  { id: 'fb-6', category: 'Data Interpretation', difficulty: 'Medium', question: 'Dataset: Q1 Sales: 100k, Q2 Sales: 150k, Q3 Sales: 120k. What is the percentage growth in sales from Q1 to Q2 followed by the decline in Q3?', options: ['50% growth, 20% decline', '50% growth, 30% decline', '33% growth, 20% decline', '25% growth, 20% decline'], correctOptionIndex: 0, explanation: '(150-100)/100 = 50%. (120-150)/150 = -20%.' },
  { id: 'fb-7', category: 'Logical Reasoning', difficulty: 'Medium', question: 'In a code, "CLOUD" is written as "DMPVE". How is "SERVER" written in that same code?', options: ['TFSWFS', 'TGTVFS', 'TFSTFS', 'TFSVFS'], correctOptionIndex: 0, explanation: 'Each letter is shifted by +1 in the alphabet.' },
  { id: 'fb-8', category: 'CS Aptitude', difficulty: 'Medium', question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctOptionIndex: 2, explanation: 'Balanced trees reduce search space by half at each node, resulting in logarithmic time.' },
  { id: 'fb-9', category: 'Analytical Reasoning', difficulty: 'Medium', question: 'If A is taller than B, B is shorter than C, and C is taller than A, who is the shortest?', options: ['A', 'B', 'C', 'Cannot be determined'], correctOptionIndex: 1, explanation: 'B is shorter than both A and C, therefore B is the shortest.' },
  { id: 'fb-10', category: 'English Communication', difficulty: 'Medium', question: 'Identify the grammatically correct sentence:', options: ['He did not went to the office.', 'He does not goes to the office.', 'He did not go to the office.', 'He do not go to the office.'], correctOptionIndex: 2, explanation: 'The auxiliary "did not" is followed by the base form of the verb "go".' },
  { id: 'fb-11', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'A and B can finish a task in 12 and 15 days respectively. They began work together but A left 3 days before the completion. In how many days was the work completed?', options: ['6 days', '8 days', '10 days', '12 days'], correctOptionIndex: 1, explanation: 'Let total work be 60 units. A=5u/d, B=4u/d. Last 3 days only B worked (12u). Remaining 48u done by both (9u/d) = 5.33 + 3 = ~8 days.' },
  { id: 'fb-12', category: 'Pattern Recognition', difficulty: 'Medium', question: 'Which shape comes next in the sequence: Square, Triangle, Circle, Square, Triangle, ?', options: ['Square', 'Circle', 'Triangle', 'Pentagon'], correctOptionIndex: 1, explanation: 'The sequence Square-Triangle-Circle repeats.' },
  { id: 'fb-13', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'Find the probability of getting a sum of 9 when two dice are thrown simultaneously.', options: ['1/9', '1/12', '1/6', '4/9'], correctOptionIndex: 0, explanation: 'Sums of 9: (3,6), (4,5), (5,4), (6,3). Total outcomes 36. Probability 4/36 = 1/9.' },
  { id: 'fb-14', category: 'Logical Reasoning', difficulty: 'Hard', question: 'Six people are sitting in a circle facing the center. A is opposite B, B is to the right of C. D is between A and C. Who is sitting to the immediate left of B?', options: ['A', 'C', 'D', 'E'], correctOptionIndex: 0, explanation: 'Following the arrangement, A is sitting to the immediate left of B.' },
  { id: 'fb-15', category: 'Data Interpretation', difficulty: 'Hard', question: 'In a team of 50, 30 know Python, 25 know Java, and 10 know both. How many know neither?', options: ['5', '10', '15', '0'], correctOptionIndex: 0, explanation: 'Total knowing at least one: 30 + 25 - 10 = 45. Neither: 50 - 45 = 5.' },
  { id: 'fb-16', category: 'CS Aptitude', difficulty: 'Hard', question: 'In a relational database, which normal form deals with removing partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctOptionIndex: 1, explanation: 'Second Normal Form (2NF) ensures no partial functional dependencies on a primary key.' },
  { id: 'fb-17', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'A train 100m long passes a platform 200m long in 10 seconds. What is the speed of the train in km/h?', options: ['30 km/h', '60 km/h', '108 km/h', '120 km/h'], correctOptionIndex: 2, explanation: 'Total distance 300m. Speed = 30 m/s. In km/h: 30 * 18/5 = 108.' },
  { id: 'fb-18', category: 'Analytical Reasoning', difficulty: 'Hard', question: 'All cats are mammals. No mammals are reptiles. Therefore:', options: ['Some cats are reptiles.', 'All cats are reptiles.', 'No cats are reptiles.', 'All reptiles are cats.'], correctOptionIndex: 2, explanation: 'If all A are B and no B are C, then no A can be C.' },
  { id: 'fb-19', category: 'Critical Thinking', difficulty: 'Hard', question: 'If "If P then Q" is true, which of the following must also be true?', options: ['If not P then not Q', 'If Q then P', 'If not Q then not P', 'P and not Q'], correctOptionIndex: 2, explanation: 'The contrapositive (If not Q then not P) is logically equivalent to the original statement.' },
  { id: 'fb-20', category: 'Data Interpretation', difficulty: 'Hard', question: 'You have 3 buckets with capacities 12L, 8L, and 5L. The 12L bucket is full. How many steps to get exactly 6L in the 12L bucket?', options: ['3', '5', '7', 'None of these'], correctOptionIndex: 1, explanation: 'It takes 5 pouring steps to measure exactly 6L.' },
  { id: 'fb-21', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'A sum of money doubles itself in 10 years at simple interest. What is the rate of interest per annum?', options: ['5%', '10%', '15%', '20%'], correctOptionIndex: 1, explanation: 'Interest = Principal. R = (100 * I) / (P * T) = (100 * P) / (P * 10) = 10%.' },
  { id: 'fb-22', category: 'Logical Reasoning', difficulty: 'Easy', question: 'If North becomes North-East, what does West become?', options: ['North-West', 'South-West', 'South-East', 'North'], correctOptionIndex: 0, explanation: 'A 45-degree clockwise rotation makes West into North-West.' },
  { id: 'fb-23', category: 'English Communication', difficulty: 'Easy', question: 'Select the antonym for "Fragile":', options: ['Delicate', 'Sturdy', 'Weak', 'Broken'], correctOptionIndex: 1, explanation: 'Sturdy means strong or solid, the opposite of fragile.' },
  { id: 'fb-24', category: 'Quantitative Aptitude', difficulty: 'Medium', question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was the removed number?', options: ['24', '26', '28', '30'], correctOptionIndex: 2, explanation: 'Total sum was 100. New sum is 18 * 4 = 72. Removed: 100 - 72 = 28.' },
  { id: 'fb-25', category: 'CS Aptitude', difficulty: 'Medium', question: 'Which HTTP status code represents "Not Found"?', options: ['200', '403', '404', '500'], correctOptionIndex: 2, explanation: '404 is the standard code for Not Found.' },
  { id: 'fb-26', category: 'Data Interpretation', difficulty: 'Medium', question: 'Sales: Jan($10k), Feb($12k), Mar($15k). What is the total growth from Jan to Mar?', options: ['20%', '25%', '50%', '33.3%'], correctOptionIndex: 2, explanation: '(15-10)/10 * 100 = 50%.' },
  { id: 'fb-27', category: 'Logical Reasoning', difficulty: 'Medium', question: 'Statements: 1. All pencils are pens. 2. Some pens are markers. Conclusion: Some pencils are markers.', options: ['True', 'False', 'Insufficient Data', 'None'], correctOptionIndex: 1, explanation: 'The overlap between markers and pens might not include the section of pens that are pencils.' },
  { id: 'fb-28', category: 'Quantitative Aptitude', difficulty: 'Hard', question: 'A sum of money doubles itself in 8 years at simple interest. In how many years will it triple itself?', options: ['12 years', '14 years', '16 years', '20 years'], correctOptionIndex: 2, explanation: 'Doubling means 100% interest in 8 years. Tripling means 200% interest, which takes 16 years.' },
  { id: 'fb-29', category: 'CS Aptitude', difficulty: 'Hard', question: 'In networking, which layer of the OSI model is responsible for encryption?', options: ['Application', 'Presentation', 'Session', 'Transport'], correctOptionIndex: 1, explanation: 'The Presentation layer handles data formatting and encryption.' },
  { id: 'fb-30', category: 'Analytical Reasoning', difficulty: 'Hard', question: 'Four friends (A, B, C, D) cross a bridge. Max 2 at a time. A takes 1m, B takes 2m, C takes 5m, D takes 10m. Min time?', options: ['15m', '17m', '19m', '21m'], correctOptionIndex: 1, explanation: 'Best strategy: (A,B) cross, A returns, (C,D) cross, B returns, (A,B) cross. 2+1+10+2+2 = 17.' },
];

export async function generateAptitudeTest(input: z.infer<typeof AptitudeInputSchema>) {
  return aptitudeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aptitudeGeneratorPrompt',
  input: { schema: AptitudeInputSchema },
  output: { schema: AptitudeOutputSchema },
  prompt: `You are an elite Recruitment Architect at {{{company}}}. 
Generate a professional 20-question Aptitude Assessment for a {{{role}}} candidate ({{{experienceLevel}}}).

### CATEGORY DISTRIBUTION (Exactly 20 Nodes):
- Quantitative Aptitude (5)
- Logical Reasoning (4)
- English Communication (3)
- Data Interpretation (3)
- Analytical Reasoning (3)
- CS Aptitude (2)

### VARIETY PROTOCOL:
- DO NOT generate any question that matches the logic or text of these previous questions: {{{usedQuestionFingerprints}}}
- Ensure every question uses a unique reasoning pattern.
- Quantitative: Include ratios, probabilities, profit/loss, and mixtures.
- Data Interpretation: Create mini-datasets (tables) that require 2-step calculations.

### QUALITY GATE:
- Reject trivial one-step arithmetic.
- Every question must have EXACTLY one correct answer.
- correctOptionIndex MUST point to that answer.

### DIFFICULTY PROGRESSION:
- Q1-Q5: Easy
- Q6-Q12: Medium
- Q13-Q17: Medium/Hard
- Q18-Q20: Hard

Return ONLY valid JSON.`,
});

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlow',
    inputSchema: AptitudeInputSchema,
    outputSchema: AptitudeOutputSchema,
  },
  async (input) => {
    const historySet = new Set(input.usedQuestionFingerprints || []);
    const validQuestions: AptitudeQuestion[] = [];
    const currentFingerprints = new Set<string>();
    const currentPatterns = new Set<string>();

    let attempts = 0;
    while (attempts < 3 && validQuestions.length < 20) {
      try {
        console.log(`[Aptitude Flow] Synthesis Attempt ${attempts + 1} for ${input.company}`);
        const { output } = await runWithResilience(prompt, input);
        
        if (output?.questions) {
          for (const q of output.questions) {
            if (validQuestions.length >= 20) break;
            
            const val = validateAptitudeQuestion(q, currentFingerprints, currentPatterns);
            if (val.valid && val.normalized) {
              const { fingerprint, pattern } = normalizeQuestion(val.normalized.question);
              if (!historySet.has(fingerprint) && !historySet.has(pattern)) {
                validQuestions.push(val.normalized);
                currentFingerprints.add(fingerprint);
                currentPatterns.add(pattern);
              }
            }
          }
        }
      } catch (e) {
        console.error("[Aptitude Flow] Neural synthesis fault:", e);
      }
      attempts++;
    }

    // FIX 2: Safety net for fallback injection
    if (validQuestions.length < 20) {
      console.warn("[Aptitude Flow] Insufficient dynamic nodes. Injecting unique fallback nodes.");
      const filteredFallback = FALLBACK_BANK.filter(q => {
        const { fingerprint, pattern } = normalizeQuestion(q.question);
        // Ensure not in history AND not already in validQuestions (to avoid duplicating Gemini's work)
        return !historySet.has(fingerprint) && !historySet.has(pattern) && !validQuestions.some(vq => vq.id === q.id);
      });
      
      const needed = 20 - validQuestions.length;
      validQuestions.push(...filteredFallback.slice(0, needed));
    }

    // FIX 2: Final safety net - reuse older fallback questions if user has exhausted all unique content
    if (validQuestions.length < 20) {
      console.warn("[Aptitude] Reusing older fallback questions to complete test - user has exhausted available unique questions");
      
      const historyArr = input.usedQuestionFingerprints || [];
      const remainingSlots = 20 - validQuestions.length;
      
      const reuseCandidates = FALLBACK_BANK
        .filter(q => !validQuestions.some(vq => vq.id === q.id))
        .map(q => {
          const { fingerprint } = normalizeQuestion(q.question);
          // Find the last index in the provided history array
          const lastSeenIndex = historyArr.lastIndexOf(fingerprint);
          return { question: q, lastSeenIndex };
        })
        // Sort by lastSeenIndex ascending (oldest first)
        .sort((a, b) => a.lastSeenIndex - b.lastSeenIndex);
      
      validQuestions.push(...reuseCandidates.slice(0, remainingSlots).map(c => c.question));
    }

    return { questions: validQuestions.slice(0, 20) };
  }
);
