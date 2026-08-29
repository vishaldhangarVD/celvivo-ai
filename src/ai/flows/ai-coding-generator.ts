'use server';
/**
 * @fileOverview Nexvoro AI Coding Challenge Architect v3.0.
 * Dynamically synthesizes batches of high-fidelity algorithmic challenges using Google Gemini.
 * Implements persistent history awareness and semantic duplicate prevention.
 * Now generates FULL RUNNABLE BOILERPLATES for 13 languages with strict indentation standards.
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
    java: z.string().describe("Full Main.java boilerplate with imports and Scanner. 4-space indentation."),
    python: z.string().describe("Full Python script with sys.stdin.read(). 4-space indentation."),
    javascript: z.string().describe("Node.js script with fs.readFileSync(0). 2-space indentation."),
    typescript: z.string().describe("TypeScript script with imports and fs. 2-space indentation."),
    cpp: z.string().describe("C++ boilerplate with #include <iostream> and main. 4-space indentation."),
    c: z.string().describe("C boilerplate with #include <stdio.h> and main. 4-space indentation."),
    csharp: z.string().describe("C# boilerplate with using System and static void Main. 4-space indentation."),
    go: z.string().describe("Go boilerplate with package main and fmt. Standard tab or 4-space indentation."),
    rust: z.string().describe("Rust boilerplate with use std::io and fn main. 4-space indentation."),
    kotlin: z.string().describe("Kotlin boilerplate with java.util.Scanner. 4-space indentation."),
    php: z.string().describe("PHP boilerplate with file_get_contents('php://stdin'). 4-space indentation."),
    swift: z.string().describe("Swift boilerplate with import Foundation and readLine(). 4-space indentation."),
    ruby: z.string().describe("Ruby boilerplate with STDIN.read. 2-space indentation."),
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

### CHALLENGE CALIBRATION (CRITICAL):
1. STARTER CODE: Provide FULL IDIOMATIC BOILERPLATES for ALL 13 languages.
2. EXECUTION ENGINE REQUIREMENTS: 
   - Every template MUST be a COMPLETE, RUNNABLE SCRIPT that reads from STDIN and writes to STDOUT.
   - It must include necessary imports, a primary logic function, and a main driver block.
   - The logic function should be empty except for a default return value and a comment "// Write your logic here" (use # for Python/Ruby/PHP).
   - DO NOT include the solution logic.
3. INDENTATION PROTOCOL:
   - Python: Exactly 4 spaces.
   - JavaScript/TypeScript: Exactly 2 spaces.
   - Java/C++/C/C#/Rust/Kotlin/Swift: Exactly 4 spaces with standard brace style.
   - Ruby/PHP: Exactly 2 spaces.
   - Go: Standard 4-space or tab indentation.
4. FORMATTING: Every starterCode string MUST use actual newline characters (\n) and proper indentation. NEVER return code as a single-line or condensed string using semicolons.
5. HIDDEN VERIFICATION: Provide exactly 5 hidden test cases with expected outputs.

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