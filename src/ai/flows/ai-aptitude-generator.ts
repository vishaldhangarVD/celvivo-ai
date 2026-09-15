'use server';
/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v33.0.
 * Optimized for reliability by batching AI generation into 4 segments of 5 questions.
 * Decoupled retries from Genkit resilience layer to prevent Gateway Timeouts.
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
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema),
});

// Internal schema for batch generation
const BatchAptitudeInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  batchInstructions: z.string().describe("Specific instructions for this batch's difficulty and category distribution."),
  avoidFingerprints: z.array(z.string()).describe("Fingerprints and patterns to avoid."),
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
 */
function normalizeQuestion(text: string): { fingerprint: string; pattern: string } {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") 
    .replace(/\s+/g, " ")    
    .trim();
  
  const pattern = clean.replace(/\d+/g, "X"); 
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

  return { 
    valid: true, 
    normalized: {
      ...q,
      category: cat,
      id: q.id || Math.random().toString(36).substring(2, 12)
    } 
  };
}

export async function generateAptitudeTest(input: z.infer<typeof AptitudeInputSchema>) {
  return aptitudeFlow(input);
}

const batchPrompt = ai.definePrompt({
  name: 'aptitudeBatchGeneratorPrompt',
  input: { schema: BatchAptitudeInputSchema },
  output: { schema: AptitudeOutputSchema },
  prompt: `You are an elite Recruitment Architect at {{{company}}}. 
Generate EXACTLY 5 professional aptitude questions for a {{{role}}} candidate ({{{experienceLevel}}}).

### BATCH FOCUS:
{{{batchInstructions}}}

### VARIETY PROTOCOL:
- DO NOT generate questions similar to these existing patterns:
{{#each avoidFingerprints}}
- {{{this}}}
{{/each}}

### QUALITY GATE:
- Reject trivial one-step arithmetic.
- Every question must have EXACTLY one correct answer.
- correctOptionIndex MUST point to that answer.

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

    const BATCH_CONFIGS = [
      {
        name: "Batch 1",
        instructions: "Difficulty: EASY. Categories: 2x Quantitative Aptitude, 1x Logical Reasoning, 1x English Communication, 1x Data Interpretation."
      },
      {
        name: "Batch 2",
        instructions: "Difficulty: MEDIUM. Categories: 1x Quantitative Aptitude, 1x Logical Reasoning, 2x Analytical Reasoning, 1x CS Aptitude."
      },
      {
        name: "Batch 3",
        instructions: "Difficulty: First 2 are MEDIUM, last 3 are MEDIUM/HARD. Categories: 1x Quantitative Aptitude, 1x Logical Reasoning, 2x English Communication, 1x Data Interpretation."
      },
      {
        name: "Batch 4",
        instructions: "Difficulty: First 2 are MEDIUM/HARD, last 3 are HARD. Categories: 1x Quantitative Aptitude, 1x Logical Reasoning, 1x Analytical Reasoning, 1x Data Interpretation, 1x CS Aptitude."
      }
    ];

    for (const config of BATCH_CONFIGS) {
      let batchSuccess = false;
      let attempts = 0;
      const MAX_BATCH_ATTEMPTS = 2; // Controlled retry to prevent aggregate timeout

      while (!batchSuccess && attempts < MAX_BATCH_ATTEMPTS) {
        attempts++;
        try {
          console.log(`[Aptitude Flow] Processing ${config.name} (Batch Attempt ${attempts})...`);
          
          const combinedAvoid = [
            ...Array.from(historySet).slice(-50), 
            ...Array.from(currentFingerprints),
            ...Array.from(currentPatterns)
          ];

          const { output } = await runWithResilience(batchPrompt, {
            role: input.role,
            company: input.company,
            experienceLevel: input.experienceLevel,
            batchInstructions: config.instructions,
            avoidFingerprints: combinedAvoid.slice(-30)
          }, {
            userId: input.userId,
            sessionId: input.sessionId,
            feature: 'aptitude_generation'
          });

          if (output?.questions && Array.isArray(output.questions)) {
            const batchQuestions: AptitudeQuestion[] = [];
            
            for (const q of output.questions) {
              if (batchQuestions.length >= 5) break;
              
              const val = validateAptitudeQuestion(q, currentFingerprints, currentPatterns);
              if (val.valid && val.normalized) {
                const { fingerprint, pattern } = normalizeQuestion(val.normalized.question);
                
                if (!historySet.has(fingerprint) && !historySet.has(pattern)) {
                  batchQuestions.push(val.normalized);
                  currentFingerprints.add(fingerprint);
                  currentPatterns.add(pattern);
                }
              }
            }

            if (batchQuestions.length === 5) {
              validQuestions.push(...batchQuestions);
              batchSuccess = true;
              console.log(`[Aptitude Flow] ${config.name} verified.`);
            } else {
              console.warn(`[Aptitude Flow] ${config.name} produced insufficient valid items (${batchQuestions.length}/5).`);
              // Cleanup keys from this failed attempt to allow fresh generation in retry
              batchQuestions.forEach(q => {
                const { fingerprint, pattern } = normalizeQuestion(q.question);
                currentFingerprints.delete(fingerprint);
                currentPatterns.delete(pattern);
              });
            }
          }
        } catch (e: any) {
          console.error(`[Aptitude Flow] Critical failure in ${config.name}:`, e.message);
          // Propagate critical network or provider errors immediately
          throw e; 
        }
      }

      if (!batchSuccess) {
        throw new Error(`Aptitude generation failed for ${config.name}. Maximum retry capacity exceeded.`);
      }
    }

    if (validQuestions.length !== 20) {
      throw new Error(`Aptitude generation consistency fault (${validQuestions.length}/20).`);
    }

    return { questions: validQuestions };
  }
);