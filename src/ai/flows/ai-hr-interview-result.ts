'use server';

/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v34.0.
 * Optimized for gateway reliability by using one compact AI generation request.
 * Preserves dynamic AI generation, duplicate prevention, difficulty/category
 * requirements, history tracking, and telemetry.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AptitudeQuestionSchema = z.object({
  id: z.string().describe('Unique identifier.'),
  question: z.string().describe('Question text.'),
  options: z.array(z.string()).length(4).describe('Exactly 4 options.'),
  correctOptionIndex: z.number().min(0).max(3).describe('Correct option index from 0 to 3.'),
  category: z.string().describe('Question category.'),
  difficulty: z.string().describe('Question difficulty.'),
  explanation: z.string().optional().describe('Short explanation.'),
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

const AptitudeGenerationInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  avoidFingerprints: z.array(z.string()),
});

const FORBIDDEN_CONCEPTS = [
  'velocity doubles',
  'growth doubles',
  'doubles every',
  'triples every',
  '25% complete',
  'percentage completion',
  'missing information',
];

const VALID_CATEGORIES = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'English Communication',
  'Analytical Reasoning',
  'Data Interpretation',
  'CS Aptitude',
];

function normalizeQuestion(text: string): {
  fingerprint: string;
  pattern: string;
} {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const pattern = clean.replace(/\d+/g, 'X');

  return {
    fingerprint: clean,
    pattern,
  };
}

function validateAptitudeQuestion(
  q: any,
  existingFingerprints: Set<string>
): boolean {
  if (!q?.question || q.question.trim().length < 20) {
    return false;
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return false;
  }

  const uniqueOptions = new Set(
    q.options.map((o: any) => String(o).trim().toLowerCase())
  );

  if (uniqueOptions.size !== 4) {
    return false;
  }

  if (
    typeof q.correctOptionIndex !== 'number' ||
    q.correctOptionIndex < 0 ||
    q.correctOptionIndex > 3
  ) {
    return false;
  }

  const { fingerprint } = normalizeQuestion(q.question);

  if (existingFingerprints.has(fingerprint)) {
    return false;
  }

  for (const concept of FORBIDDEN_CONCEPTS) {
    if (fingerprint.includes(concept)) {
      return false;
    }
  }

  return true;
}

export async function generateAptitudeTest(
  input: z.infer<typeof AptitudeInputSchema>
) {
  return aptitudeFlow(input);
}

const aptitudePrompt = ai.definePrompt({
  name: 'aptitudeMasterGeneratorPrompt',
  input: {
    schema: AptitudeGenerationInputSchema,
  },
  output: {
    schema: AptitudeOutputSchema,
  },
  prompt: `You are an elite aptitude-test designer and technical recruiter at {{{company}}}.

Generate EXACTLY 20 high-quality aptitude questions for a {{{role}}} candidate at {{{experienceLevel}}} level.

IMPORTANT:
The questions must be genuinely generated for this candidate profile.
Do not use placeholder questions.
Do not copy or repeat questions from the excluded list.

QUESTION DISTRIBUTION:
1. Quantitative Aptitude: 4 questions
2. Logical Reasoning: 4 questions
3. English Communication: 3 questions
4. Analytical Reasoning: 3 questions
5. Data Interpretation: 3 questions
6. CS Aptitude: 3 questions

DIFFICULTY:
- Questions 1-5: EASY
- Questions 6-13: MEDIUM
- Questions 14-20: HARD

QUALITY RULES:
- Every question must have exactly 4 unique options.
- correctOptionIndex must be 0, 1, 2, or 3.
- Only one option may be correct.
- Questions must be complete and solvable from the information provided.
- Do not create ambiguous questions.
- Do not create duplicate or near-duplicate questions.
- Do not use "velocity doubles".
- Do not use "growth doubles".
- Do not use "doubles every".
- Do not use "triples every".
- Do not use "25% complete".
- Do not use "percentage completion".
- Do not use "missing information".
- Do not ask questions requiring information that is not provided.
- Keep explanations short.
- Use valid categories only:
  Quantitative Aptitude,
  Logical Reasoning,
  English Communication,
  Analytical Reasoning,
  Data Interpretation,
  CS Aptitude.

EXCLUDED QUESTIONS:
{{#each avoidFingerprints}}
- {{{this}}}
{{/each}}

RETURN EXACTLY 20 QUESTIONS.
RETURN ONLY THE REQUIRED JSON STRUCTURE.`,
});

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlow',
    inputSchema: AptitudeInputSchema,
    outputSchema: AptitudeOutputSchema,
  },
  async (input) => {
    const historySet = new Set(input.usedQuestionFingerprints || []);
    const generatedFingerprints = new Set<string>();
    const validQuestions: AptitudeQuestion[] = [];

    console.log(
      `[Aptitude Flow] Initializing 20-question sequence for ${input.role}`
    );

    const avoidFingerprints = Array.from(historySet).slice(-40);

    try {
      const { output } = await runWithResilience(
        aptitudePrompt,
        {
          role: input.role,
          company: input.company,
          experienceLevel: input.experienceLevel,
          avoidFingerprints,
        },
        {
          userId: input.userId,
          sessionId: input.sessionId,
          feature: 'aptitude_generation',
        }
      );

      if (!output?.questions || !Array.isArray(output.questions)) {
        throw new Error('Aptitude AI returned an invalid question set.');
      }

      for (const q of output.questions) {
        const normalized = normalizeQuestion(q.question);

        if (
          VALID_CATEGORIES.length > 0 &&
          !VALID_CATEGORIES.includes(q.category)
        ) {
          console.warn(
            `[Aptitude Flow] Invalid category rejected: ${q.category}`
          );
          continue;
        }

        if (
          validateAptitudeQuestion(
            q,
            new Set([...historySet, ...generatedFingerprints])
          )
        ) {
          validQuestions.push({
            ...q,
            id:
              q.id ||
              `apt-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`,
          });

          generatedFingerprints.add(normalized.fingerprint);
        }
      }

      console.log(
        `[Aptitude Flow] AI generated ${output.questions.length} questions; ${validQuestions.length} passed validation.`
      );

      if (validQuestions.length < 20) {
        throw new Error(
          `Aptitude synthesis produced only ${validQuestions.length}/20 valid questions.`
        );
      }

      return {
        questions: validQuestions.slice(0, 20),
      };
    } catch (error: any) {
      console.error(
        `[Aptitude Flow] Generation failure:`,
        error?.message || error
      );

      throw error;
    }
  }
);
