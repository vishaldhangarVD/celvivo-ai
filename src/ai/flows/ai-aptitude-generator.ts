'use server';

/**
 * @fileOverview Nexvoro AI Master Aptitude Generator v35.0.
 *
 * Reliability-focused version:
 * - Generates all 20 questions in ONE AI call.
 * - Prevents duplicates against previous history and current session.
 * - Uses the existing runWithResilience() wrapper.
 * - Preserves existing validation and anti-repetition logic.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

/* =========================================================
   QUESTION SCHEMA
========================================================= */

const AptitudeQuestionSchema = z.object({
  id: z.string().describe('Unique identifier.'),

  question: z
    .string()
    .describe('Professional aptitude question text.'),

  options: z
    .array(z.string())
    .length(4)
    .describe('Exactly 4 answer options.'),

  correctOptionIndex: z
    .number()
    .int()
    .min(0)
    .max(3)
    .describe('Index of the correct answer: 0, 1, 2, or 3.'),

  category: z
    .string()
    .describe('Question category.'),

  difficulty: z
    .string()
    .describe('Question difficulty.'),

  explanation: z
    .string()
    .optional()
    .describe('Short explanation of the correct answer.'),
});

export type AptitudeQuestion =
  z.infer<typeof AptitudeQuestionSchema>;

/* =========================================================
   MAIN INPUT
========================================================= */

const AptitudeInputSchema = z.object({
  role: z.string(),

  company: z.string(),

  experienceLevel: z.string(),

  usedQuestionFingerprints: z
    .array(z.string())
    .optional()
    .describe('Previously used question fingerprints.'),

  userId: z.string().optional(),

  sessionId: z.string().optional(),
});

/* =========================================================
   AI INPUT
========================================================= */

const AptitudeGenerationInputSchema =
  AptitudeInputSchema.extend({
    avoidQuestions: z
      .array(z.string())
      .describe(
        'Question fingerprints that must not be repeated.',
      ),
  });

/* =========================================================
   OUTPUT
========================================================= */

const AptitudeOutputSchema = z.object({
  questions: z.array(AptitudeQuestionSchema),
});

/* =========================================================
   CONSTANTS
========================================================= */

const REQUIRED_QUESTIONS = 20;

const VALID_CATEGORIES = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'English Communication',
  'Analytical Reasoning',
  'Data Interpretation',
  'CS Aptitude',
];

/**
 * Explicitly forbidden repetitive concepts.
 */
const FORBIDDEN_CONCEPTS = [
  'velocity doubles',
  'growth doubles',
  'doubles every',
  '25% complete',
];

/* =========================================================
   NORMALIZATION
========================================================= */

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

/* =========================================================
   VALIDATION
========================================================= */

function validateAptitudeQuestion(
  question: any,
  existingFingerprints: Set<string>,
): boolean {
  if (!question) {
    return false;
  }

  /* Question text */
  if (
    typeof question.question !== 'string' ||
    question.question.trim().length < 15
  ) {
    return false;
  }

  /* Options */
  if (
    !Array.isArray(question.options) ||
    question.options.length !== 4
  ) {
    return false;
  }

  if (
    question.options.some(
      (option: any) =>
        typeof option !== 'string' ||
        option.trim().length === 0,
    )
  ) {
    return false;
  }

  /* Correct answer index */
  if (
    typeof question.correctOptionIndex !== 'number' ||
    !Number.isInteger(question.correctOptionIndex) ||
    question.correctOptionIndex < 0 ||
    question.correctOptionIndex > 3
  ) {
    return false;
  }

  /* Category */
  if (
    typeof question.category !== 'string' ||
    !VALID_CATEGORIES.includes(question.category)
  ) {
    return false;
  }

  /* Difficulty */
  if (
    typeof question.difficulty !== 'string' ||
    question.difficulty.trim().length === 0
  ) {
    return false;
  }

  const { fingerprint } = normalizeQuestion(
    question.question,
  );

  /* Duplicate prevention */
  if (existingFingerprints.has(fingerprint)) {
    return false;
  }

  /* Forbidden concepts */
  for (const concept of FORBIDDEN_CONCEPTS) {
    if (fingerprint.includes(concept)) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   PUBLIC FUNCTION
========================================================= */

export async function generateAptitudeTest(
  input: z.infer<typeof AptitudeInputSchema>,
) {
  return aptitudeFlow(input);
}

/* =========================================================
   GEMINI PROMPT
========================================================= */

const aptitudePrompt = ai.definePrompt({
  name: 'aptitudeGeneratorPromptV35',

  input: {
    schema: AptitudeGenerationInputSchema,
  },

  output: {
    schema: AptitudeOutputSchema,
  },

  prompt: `
You are an elite technical recruiter and aptitude assessment architect at {{{company}}}.

Create EXACTLY 20 professional aptitude questions for:

Role:
{{{role}}}

Experience:
{{{experienceLevel}}}

==================================================
QUESTION DISTRIBUTION
==================================================

Generate EXACTLY 20 questions with this distribution:

- 5 Quantitative Aptitude
- 4 Logical Reasoning
- 3 English Communication
- 3 Data Interpretation
- 3 Analytical Reasoning
- 2 CS Aptitude

TOTAL:
20 questions

==================================================
DIFFICULTY DISTRIBUTION
==================================================

Use this difficulty progression:

Questions 1-5:
Easy

Questions 6-12:
Medium

Questions 13-17:
Medium/Hard

Questions 18-20:
Hard

The difficulty should be appropriate for the candidate's role
and experience level.

==================================================
STRICT QUESTION REQUIREMENTS
==================================================

1. Generate EXACTLY 20 questions.

2. Every question must be meaningfully different in:
   - wording
   - numbers
   - logic
   - reasoning pattern
   - underlying concept

3. Do NOT repeat any question from this list:

{{#each avoidQuestions}}
- {{{this}}}
{{/each}}

4. Each question must contain:
   - question
   - exactly 4 options
   - correctOptionIndex
   - category
   - difficulty
   - explanation

5. correctOptionIndex MUST be:
   0, 1, 2, or 3.

6. The correct answer MUST actually match
   the selected option.

7. Every question must be mathematically,
   logically, and factually correct.

8. Do not create ambiguous questions.

9. Do not create questions with multiple possible answers.

10. Avoid trivial or meaningless questions.

11. Do not generate duplicate questions.

12. Do not generate near-duplicate questions.

==================================================
VALID CATEGORIES
==================================================

Use ONLY these categories:

- Quantitative Aptitude
- Logical Reasoning
- English Communication
- Analytical Reasoning
- Data Interpretation
- CS Aptitude

==================================================
ANTI-REPETITION
==================================================

Do NOT use these concepts:

- "velocity doubles"
- "growth doubles"
- "doubles every"
- "25% complete"

Avoid repetitive templates such as:

- same numbers with changed names
- same formula with changed values
- same story with different objects
- same question structure repeatedly
- same reasoning pattern with superficial changes

Every question should test a genuinely different
reasoning approach where possible.

==================================================
DATA INTERPRETATION
==================================================

Include exactly 3 Data Interpretation questions.

Use meaningful mini-datasets, tables, or structured data.

Data Interpretation questions should require actual
calculation, comparison, percentage analysis, ratio,
trend analysis, or another meaningful interpretation.

Do not make Data Interpretation questions trivial.

==================================================
CS APTITUDE
==================================================

Include exactly 2 CS Aptitude questions.

Keep them appropriate for a technical candidate.

Possible areas include:

- programming fundamentals
- data structures
- algorithms
- databases
- operating systems
- networking
- complexity
- debugging concepts

Do not make both questions test the same concept.

==================================================
QUANTITATIVE APTITUDE
==================================================

Include exactly 5 questions.

Use varied concepts such as:

- percentages
- ratios
- averages
- time and work
- profit and loss
- probability
- number relationships
- arithmetic reasoning

Do not repeat the same formula pattern.

==================================================
LOGICAL REASONING
==================================================

Include exactly 4 questions.

Use varied patterns such as:

- sequences
- arrangements
- deductions
- syllogisms
- conditions
- logical relationships

Do not repeat the same reasoning template.

==================================================
ENGLISH COMMUNICATION
==================================================

Include exactly 3 questions.

Use varied professional English assessment types such as:

- grammar
- sentence correction
- vocabulary in context
- sentence completion
- professional communication

Do not make all three questions the same type.

==================================================
ANALYTICAL REASONING
==================================================

Include exactly 3 questions.

Use different analytical reasoning patterns.

==================================================
QUALITY STANDARD
==================================================

Questions should feel like real company
aptitude-screening questions.

They should be professional, clear, relevant,
and suitable for an actual technical hiring assessment.

Do not make every question mathematical.

Do not make the entire test easy.

Do not create obvious answers.

Do not create multiple-choice options where
more than one option could reasonably be correct.

==================================================
FINAL SELF-CHECK
==================================================

Before returning the response, internally verify:

- Exactly 20 questions
- Exactly 5 Quantitative Aptitude
- Exactly 4 Logical Reasoning
- Exactly 3 English Communication
- Exactly 3 Data Interpretation
- Exactly 3 Analytical Reasoning
- Exactly 2 CS Aptitude
- Exactly 4 options per question
- Correct option index is valid
- Correct option matches the question
- No duplicate questions
- No near-duplicate questions
- No forbidden concepts
- Difficulty progression is followed
- All questions are clear and unambiguous

==================================================
OUTPUT
==================================================

Return ONLY valid structured JSON matching
the supplied schema.

No markdown.

No commentary.

Exactly 20 questions.
`,
});

/* =========================================================
   APTITUDE FLOW
========================================================= */

const aptitudeFlow = ai.defineFlow(
  {
    name: 'aptitudeFlowV35',

    inputSchema: AptitudeInputSchema,

    outputSchema: AptitudeOutputSchema,
  },

  async (input) => {
    console.log(
      `[Aptitude Flow] Starting ${REQUIRED_QUESTIONS}-question generation for ${input.role}`,
    );

    /* -----------------------------------------------------
       Previous question history
    ----------------------------------------------------- */

    const historySet = new Set(
      (input.usedQuestionFingerprints || []).map(
        (item) =>
          normalizeQuestion(item).fingerprint,
      ),
    );

    /* -----------------------------------------------------
       Current generated questions
    ----------------------------------------------------- */

    const validQuestions: AptitudeQuestion[] = [];

    const currentFingerprints = new Set<string>();

    /* -----------------------------------------------------
       Avoid list
    ----------------------------------------------------- */

    const avoidQuestions = [
      ...Array.from(historySet).slice(-10),
      ...Array.from(currentFingerprints).slice(-10),
    ].slice(-20);

    /* -----------------------------------------------------
       ONE AI CALL ONLY
    ----------------------------------------------------- */

    try {
      console.log(
        '[Aptitude Flow] Sending ONE 20-question generation request...',
      );

      const result = await runWithResilience(
        aptitudePrompt,

        {
          role: input.role,

          company: input.company,

          experienceLevel: input.experienceLevel,

          avoidQuestions,
        },

        {
          userId: input.userId,

          sessionId: input.sessionId,

          feature: 'aptitude_generation',
        },
      );

      const generatedQuestions =
        result?.output?.questions || [];

      console.log(
        `[Aptitude Flow] AI returned ${generatedQuestions.length} questions`,
      );

      /* ---------------------------------------------------
         Validate generated questions
      --------------------------------------------------- */

      for (const question of generatedQuestions) {
        if (
          validQuestions.length >=
          REQUIRED_QUESTIONS
        ) {
          break;
        }

        if (
          !question ||
          typeof question.question !== 'string'
        ) {
          continue;
        }

        const { fingerprint } =
          normalizeQuestion(
            question.question,
          );

        /* -----------------------------------------------
           Check against BOTH history and current session
        ------------------------------------------------ */

        const alreadyUsed =
          historySet.has(fingerprint) ||
          currentFingerprints.has(fingerprint);

        if (alreadyUsed) {
          console.warn(
            `[Aptitude Flow] Duplicate rejected: ${question.question.substring(
              0,
              60,
            )}...`,
          );

          continue;
        }

        /* -----------------------------------------------
           Existing validation
        ------------------------------------------------ */

        const allExistingFingerprints =
          new Set([
            ...historySet,
            ...currentFingerprints,
          ]);

        if (
          validateAptitudeQuestion(
            question,
            allExistingFingerprints,
          )
        ) {
          const finalQuestion: AptitudeQuestion = {
            ...question,

            id:
              question.id ||
              `apt-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`,
          };

          validQuestions.push(
            finalQuestion,
          );

          currentFingerprints.add(
            fingerprint,
          );
        }
      }

      console.log(
        `[Aptitude Flow] Valid questions after validation: ${validQuestions.length}/${REQUIRED_QUESTIONS}`,
      );
    } catch (error: any) {
      console.error(
        '[Aptitude Flow] Generation failed:',
        error?.message || error,
      );

      throw new Error(
        error?.message ||
          'We could not generate the aptitude test. Please try again.',
      );
    }

    /* =====================================================
       FINAL VALIDATION
    ===================================================== */

    if (
      validQuestions.length <
      REQUIRED_QUESTIONS
    ) {
      console.error(
        `[Aptitude Flow] Generation incomplete: ${validQuestions.length}/${REQUIRED_QUESTIONS}`,
      );

      throw new Error(
        `Aptitude generation incomplete. Generated ${validQuestions.length}/${REQUIRED_QUESTIONS} valid questions.`,
      );
    }

    /* =====================================================
       FINAL RESULT
    ===================================================== */

    console.log(
      `[Aptitude Flow] Successfully generated ${validQuestions.length} unique questions.`,
    );

    return {
      questions: validQuestions.slice(
        0,
        REQUIRED_QUESTIONS,
      ),
    };
  },
);