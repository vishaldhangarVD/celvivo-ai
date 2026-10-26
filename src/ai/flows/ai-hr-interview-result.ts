'use server';

/**
 * @fileOverview HR Interview Result Analyzer (answer-grounded).
 *
 * Rules:
 *  - No meaningful answers  -> NO score is produced (status: "insufficient").
 *  - Every answer is scored individually (0-100) by the evaluator.
 *  - Unanswered / non-answers are forced to 0 in code (the AI cannot inflate them).
 *  - overallScore, verdict and tags are computed in code from per-answer scores.
 *  - Radar categories are scaled by answer coverage (answered / total questions).
 *  - The answer text shown on the result page is the candidate's REAL answer,
 *    never rewritten by the AI.
 *  - No fallback / default scores: if the evaluator output is incomplete, we throw.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

// ---------- Input ----------

const TranscriptEntrySchema = z.object({
  stage: z.string(),
  question: z.string(),
  answer: z.string(),
});

const HRInterviewResultInputSchema = z.object({
  candidateName: z.string(),
  role: z.string(),
  targetCompany: z.string(),
  resumeSummary: z.string().optional(),
  transcript: z.array(TranscriptEntrySchema),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type HRInterviewResultInput = z.infer<typeof HRInterviewResultInputSchema>;

// ---------- Public output ----------

const AnnotatedEntrySchema = z.object({
  stage: z.string(),
  question: z.string(),
  answer: z.string(),
  note: z.string(),
  tag: z.enum(['strong', 'weak']),
  score: z.number().min(0).max(100),
});

const HRInterviewResultOutputSchema = z.object({
  status: z.enum(['ok', 'insufficient']),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  message: z.string().optional(),
  overallScore: z.number().optional(),
  verdict: z.string().optional(),
  categoryScores: z
    .array(z.object({ subject: z.string(), score: z.number() }))
    .optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  annotatedTranscript: z.array(AnnotatedEntrySchema).optional(),
});

export type HRInterviewResult = z.infer<typeof HRInterviewResultOutputSchema>;

// ---------- Internal evaluator schemas ----------

const EvaluatorInputSchema = z.object({
  candidateName: z.string(),
  role: z.string(),
  targetCompany: z.string(),
  resumeSummary: z.string().optional(),
  totalQuestions: z.number(),
  entries: z.array(
    z.object({
      number: z.number(),
      stage: z.string(),
      question: z.string(),
      answer: z.string(),
    })
  ),
});

const EvaluatorOutputSchema = z.object({
  answerEvaluations: z.array(
    z.object({
      number: z.number().describe('The answer number exactly as given in the input.'),
      score: z.number().min(0).max(100),
      note: z.string().describe('1-2 sentences referring to something concrete the candidate said.'),
    })
  ),
  categoryScores: z.array(
    z.object({
      subject: z.string(),
      score: z.number().min(0).max(100),
    })
  ),
  strengths: z.array(z.string()).max(5),
  improvements: z.array(z.string()).max(5),
});

type EvaluatorOutput = z.infer<typeof EvaluatorOutputSchema>;

// ---------- Helpers (not exported) ----------

const MIN_WORDS = 3;
const MIN_MEANINGFUL_ANSWERS = 3;
const REQUIRED_CATEGORIES = ['Communication', 'Clarity', 'Relevance', 'Depth', 'Role Fit'];

const NON_ANSWER =
  /^(i\s*(do not|don'?t)\s*know|no\s*idea|not\s*sure|skip|pass|nothing|no|yes|ok|okay|hmm+|\.+)[\s.!?]*$/i;

function isMeaningfulAnswer(answer: string): boolean {
  const t = (answer || '').trim();
  if (!t) return false;
  if (NON_ANSWER.test(t)) return false;
  return t.split(/\s+/).filter(Boolean).length >= MIN_WORDS;
}

function verdictFor(score: number): string {
  if (score >= 80) return 'Strong Hire';
  if (score >= 65) return 'Hire';
  if (score >= 45) return 'Borderline';
  return 'Needs Improvement';
}

// ---------- Public entry ----------

export async function analyzeHRInterviewResult(
  input: HRInterviewResultInput
): Promise<HRInterviewResult> {
  return hrInterviewResultFlow(input);
}

// ---------- Prompt ----------

const hrInterviewResultPrompt = ai.definePrompt({
  name: 'hrInterviewResultPrompt',
  input: { schema: EvaluatorInputSchema },
  output: { schema: EvaluatorOutputSchema },
  prompt: `You are a strict but fair senior HR interview evaluator at {{{targetCompany}}}.
Evaluate candidate {{{candidateName}}} for the role of {{{role}}}.

CANDIDATE RESUME SUMMARY (for checking consistency only):
{{{resumeSummary}}}

The interview had {{{totalQuestions}}} questions. Below are ONLY the answers that contained real content.

ANSWERS:
{{#each entries}}
#{{this.number}} [{{this.stage}}]
Q: {{this.question}}
A: {{this.answer}}

{{/each}}

SCORING RULES (follow strictly):
1. Judge ONLY what the candidate actually said. Never assume, invent or add anything they did not say.
2. The text comes from speech-to-text. Ignore missing punctuation, capitalization and small transcription errors.
3. Score EVERY answer above from 0 to 100:
   - 0-20: irrelevant, nonsense, or does not address the question
   - 21-40: very vague or generic, no substance
   - 41-60: partly relevant, generic, little detail
   - 61-80: relevant and clear, some specifics or reasoning
   - 81-100: specific, well structured, backed by a concrete example, decision or result
4. For factual or technical questions, a wrong answer must score low even if it sounds confident.
5. Do not give high scores by default. Most average answers belong in the 40-65 range.
6. If an answer contradicts the resume summary, mention it in the note and lower the score.
7. Each note: 1-2 sentences, referring to something concrete from that answer.

categoryScores: return EXACTLY these 5 categories with these exact names, each scored 0-100 from the answers above:
Communication, Clarity, Relevance, Depth, Role Fit.

strengths / improvements: each item must be backed by what the candidate actually said. Return fewer items (or none) rather than inventing anything. Do not praise something that was not shown.

Return ONLY the required JSON. Use the answer numbers exactly as given (#1, #2, ...).`,
});

// ---------- Flow ----------

const hrInterviewResultFlow = ai.defineFlow(
  {
    name: 'hrInterviewResultFlow',
    inputSchema: HRInterviewResultInputSchema,
    outputSchema: HRInterviewResultOutputSchema,
  },
  async (input) => {
    const totalQuestions = input.transcript.length;

    const entries = input.transcript.map((t, i) => ({
      number: i + 1,
      stage: t.stage,
      question: t.question,
      answer: (t.answer || '').trim(),
    }));

    const meaningful = entries.filter((e) => isMeaningfulAnswer(e.answer));

    // Not enough real answers -> do not score at all.
    if (meaningful.length < MIN_MEANINGFUL_ANSWERS) {
      return {
        status: 'insufficient' as const,
        answeredCount: meaningful.length,
        totalQuestions,
        message:
          'There were not enough answers in this session to generate a reliable evaluation.',
      };
    }

    console.log(
      `[HR Result] ${input.candidateName}: ${meaningful.length}/${totalQuestions} meaningful answers`
    );

    const { output: rawOutput } = await runWithResilience(
      hrInterviewResultPrompt,
      {
        candidateName: input.candidateName,
        role: input.role,
        targetCompany: input.targetCompany,
        resumeSummary: input.resumeSummary || '',
        totalQuestions,
        entries: meaningful,
      },
      {
        userId: input.userId || 'anonymous',
        sessionId: input.sessionId || 'unknown-session',
        feature: 'hr_interview_result_analysis',
      }
    );

    if (!rawOutput) {
      throw new Error('HR Interview evaluator returned an empty result.');
    }
    const output = rawOutput as EvaluatorOutput;

    const evalByNumber = new Map<number, (typeof output.answerEvaluations)[number]>();
    output.answerEvaluations.forEach((e) => evalByNumber.set(e.number, e));

    // Build the annotated transcript from the REAL answers (AI never rewrites them).
    const annotatedTranscript = entries.map((e) => {
      if (!isMeaningfulAnswer(e.answer)) {
        return {
          stage: e.stage,
          question: e.question,
          answer: e.answer || '(no answer given)',
          note: 'No meaningful answer was given to this question.',
          tag: 'weak' as const,
          score: 0,
        };
      }
      const ev = evalByNumber.get(e.number);
      if (!ev) {
        throw new Error(`Evaluator did not score answer #${e.number}.`);
      }
      const score = Math.round(ev.score);
      return {
        stage: e.stage,
        question: e.question,
        answer: e.answer,
        note: ev.note,
        tag: (score >= 60 ? 'strong' : 'weak') as 'strong' | 'weak',
        score,
      };
    });

    // Overall score = average over ALL questions (unanswered ones count as 0).
    const overallScore = Math.round(
      annotatedTranscript.reduce((sum, a) => sum + a.score, 0) / annotatedTranscript.length
    );

    // Radar categories scaled by how much of the interview was actually answered.
    const coverage = meaningful.length / totalQuestions;
    const categoryScores = REQUIRED_CATEGORIES.map((name) => {
      const c = output.categoryScores.find(
        (x) => x.subject.trim().toLowerCase() === name.toLowerCase()
      );
      if (!c) throw new Error(`Evaluator did not score category "${name}".`);
      return { subject: name, score: Math.round(c.score * coverage) };
    });

    return {
      status: 'ok' as const,
      overallScore,
      verdict: verdictFor(overallScore),
      categoryScores,
      strengths: output.strengths,
      improvements: output.improvements,
      annotatedTranscript,
      answeredCount: meaningful.length,
      totalQuestions,
    };
  }
);
