'use server';
/**
 * @fileOverview Nexvoro AI Coding Challenge Architect v2.0.
 * Dynamically synthesizes batches of high-fidelity algorithmic challenges using Google Gemini.
 * Implements persistent history awareness and semantic duplicate prevention.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const CodingProblemSchema = z.object({
  id: z.string().describe("Unique identifier for the logic node."),
  title: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.string(),
  problemStatement: z.string(),
  constraints: z.array(z.string()),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  explanation: z.string(),
  starterCode: z.object({
    java: z.string(),
    python: z.string(),
    javascript: z.string(),
    cpp: z.string(),
    c: z.string(),
    csharp: z.string(),
    go: z.string(),
    rust: z.string(),
  }),
  hiddenTestCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })),
});

export type CodingProblem = z.infer<typeof CodingProblemSchema>;

const CodingGenerationInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  count: z.number().default(8),
  avoidTitles: z.array(z.string()).optional().describe("Titles of previously used questions to prevent repeats."),
});

const CodingGenerationOutputSchema = z.object({
  questions: z.array(CodingProblemSchema),
});

export async function generateCodingQuestions(input: z.infer<typeof CodingGenerationInputSchema>) {
  return codingGenerationFlow(input);
}

/**
 * Normalizes title text for programmatic duplicate detection.
 */
function normalizeTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const prompt = ai.definePrompt({
  name: 'codingGenerationPrompt',
  input: { schema: CodingGenerationInputSchema },
  output: { schema: CodingGenerationOutputSchema },
  prompt: `You are an elite Senior Staff Software Engineer at {{{company}}}.
Your objective is to architect a set of {{{count}}} UNIQUE, high-fidelity algorithmic coding challenges for a {{{role}}} candidate ({{{experienceLevel}}} level).

### VARIETY PROTOCOL:
- DO NOT generate any question that matches the logic or title of these previous questions: {{{avoidTitles}}}
- Ensure every question uses a unique algorithmic pattern.
- Distribution Required: 3 Easy, 3 Medium, 2 Hard.

### CHALLENGE CALIBRATION:
1. FIRM PERSONA: Calibrate the problem style to {{{company}}}.
2. STARTER CODE: Provide idiomatic starter templates for ALL 8 languages (Java, Python, JavaScript, C++, C, C#, Go, Rust).
3. HIDDEN VERIFICATION: Provide exactly 5 hidden test cases with expected outputs. Ensure the outputs are string-comparable.

Return a strictly structured JSON matching the output schema. No conversational text.`,
});

const codingGenerationFlow = ai.defineFlow(
  {
    name: 'codingGenerationFlow',
    inputSchema: CodingGenerationInputSchema,
    outputSchema: CodingGenerationOutputSchema,
  },
  async (input) => {
    const historySet = new Set((input.avoidTitles || []).map(normalizeTitle));
    const validQuestions: CodingProblem[] = [];
    const currentTitles = new Set<string>();

    let attempts = 0;
    while (attempts < 2 && validQuestions.length < input.count) {
      try {
        console.log(`[Coding Flow] Synthesis Attempt ${attempts + 1} for ${input.company}`);
        const { output } = await runWithResilience(prompt, input);
        
        if (output?.questions) {
          for (const q of output.questions) {
            if (validQuestions.length >= input.count) break;
            
            const normTitle = normalizeTitle(q.title);
            if (!historySet.has(normTitle) && !currentTitles.has(normTitle)) {
              validQuestions.push({
                ...q,
                id: q.id || `gen-${Math.random().toString(36).substring(2, 12)}`
              });
              currentTitles.add(normTitle);
            }
          }
        }
      } catch (e) {
        console.error("[Coding Flow] Neural synthesis fault:", e);
      }
      attempts++;
    }

    if (validQuestions.length > 0) {
      return { questions: validQuestions.slice(0, input.count) };
    }

    throw new Error("Neural coding synthesis failed to produce unique nodes.");
  }
);
