'use server';
/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v33.0.
 * Optimized for reliability by batching AI generation into 4 segments of 5 questions.
 * Flattened retry structure to prevent Gateway Timeouts.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  id: z.string().describe("Unique identifier."),
  question: z.string().describe("Question text."),
  options: z.array(z.string()).length(4).describe("4 options."),
  correctOptionIndex: z.number().min(0).max(3).describe("Correct index."),
  category: z.string().describe("Category."),
  difficulty: z.string().describe("Difficulty."),
  explanation: z.string().optional().describe("Explanation."),
});

export type AptitudeQuestion = z.infer<typeof AptitudeQuestionSchema>;

const AptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  usedQuestionFingerprints: z.array(z.string()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema),
});

const BatchAptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  batchInstructions: z.string(),
  avoidFingerprints: z.array(z.string()),
});

const FORBIDDEN_CONCEPTS = ["velocity doubles", "growth doubles", "doubles every", "25% complete"];
const VALID_CATEGORIES = ['Quantitative Aptitude', 'Logical Reasoning', 'English Communication', 'Analytical Reasoning', 'Data Interpretation', 'CS Aptitude'];

function normalizeQuestion(text: string): { fingerprint: string; pattern: string } {
  const clean = text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const pattern = clean.replace(/\d+/g, "X"); 
  return { fingerprint: clean, pattern };
}

function validateAptitudeQuestion(q: any, existingFingerprints: Set<string>): boolean {
  if (!q.question || q.question.length < 15) return false;
  if (!q.options || q.options.length !== 4) return false;
  if (q.correctOptionIndex < 0 || q.correctOptionIndex > 3) return false;
  
  const { fingerprint } = normalizeQuestion(q.question);
  if (existingFingerprints.has(fingerprint)) return false;
  
  for (const concept of FORBIDDEN_CONCEPTS) {
    if (fingerprint.includes(concept)) return false;
  }
  return true;
}

export async function generateAptitudeTest(input: z.infer<typeof AptitudeInputSchema>) {
  return aptitudeFlow(input);
}

const batchPrompt = ai.definePrompt({
  name: 'aptitudeBatchGeneratorPrompt',
  input: { schema: BatchAptitudeInputSchema },
  output: { schema: AptitudeOutputSchema },
  prompt: `You are an elite Recruiter at {{{company}}}. Generate EXACTLY 5 professional aptitude questions for a {{{role}}} candidate ({{{experienceLevel}}}).

### FOCUS:
{{{batchInstructions}}}

### RULES:
- Avoid these patterns: {{#each avoidFingerprints}}{{{this}}}, {{/each}}
- Return strictly valid JSON. 5 questions only.`,
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

    const BATCH_CONFIGS = [
      { name: "B1", instructions: "EASY: 2x Quant, 1x Logic, 1x English, 1x Data" },
      { name: "B2", instructions: "MEDIUM: 1x Quant, 1x Logic, 2x Analytical, 1x CS" },
      { name: "B3", instructions: "MEDIUM/HARD: 1x Quant, 1x Logic, 2x English, 1x Data" },
      { name: "B4", instructions: "HARD: 1x Quant, 1x Logic, 1x Analytical, 1x Data, 1x CS" }
    ];

    console.log(`[Aptitude Flow] Initializing 20-question sequence for ${input.role}`);

    for (const config of BATCH_CONFIGS) {
      console.log(`[Aptitude Flow] Processing ${config.name}...`);
      
      const combinedAvoid = [...Array.from(historySet).slice(-20), ...Array.from(currentFingerprints)];

      const { output } = await runWithResilience(batchPrompt, {
        role: input.role,
        company: input.company,
        experienceLevel: input.experienceLevel,
        batchInstructions: config.instructions,
        avoidFingerprints: combinedAvoid.slice(-15)
      }, {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: 'aptitude_generation',
        batch: config.name
      });

      if (output?.questions) {
        for (const q of output.questions) {
          if (validateAptitudeQuestion(q, currentFingerprints)) {
            const { fingerprint } = normalizeQuestion(q.question);
            validQuestions.push({ ...q, id: q.id || Math.random().toString(36).substring(7) });
            currentFingerprints.add(fingerprint);
          }
        }
      }

      if (validQuestions.length < (BATCH_CONFIGS.indexOf(config) + 1) * 4) {
        console.warn(`[Aptitude Flow] ${config.name} under-performed. Current count: ${validQuestions.length}`);
      }
    }

    // Safety fallback: if we have at least 15 questions, fill the rest to reach 20
    // If we have fewer, the generation is considered a failure.
    if (validQuestions.length < 15) {
      throw new Error(`Aptitude synthesis reached critical latency/error limit (${validQuestions.length}/20).`);
    }

    return { questions: validQuestions.slice(0, 20) };
  }
);
