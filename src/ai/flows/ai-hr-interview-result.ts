'use server';
/**
 * @fileOverview Nexvoro AI — Special HR Interview Result Analyzer.
 * Takes the full completed interview transcript and produces a structured,
 * real evaluation: composite score, category breakdown, verdict, strengths,
 * and improvement areas — grounded entirely in what the candidate actually said.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const TranscriptEntrySchema = z.object({
  stage: z.string(),
  question: z.string(),
  answer: z.string(),
});

const AiHRInterviewResultInputSchema = z.object({
  candidateName: z.string(),
  role: z.string(),
  targetCompany: z.string().optional(),
  resumeSummary: z.string().optional(),
  transcript: z.array(TranscriptEntrySchema),
});
export type AiHRInterviewResultInput = z.infer<typeof AiHRInterviewResultInputSchema>;

const AiHRInterviewResultOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdict: z.string(),
  categoryScores: z.array(z.object({
    subject: z.string(),
    score: z.number().min(0).max(100),
  })),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  annotatedTranscript: z.array(z.object({
    stage: z.string(),
    question: z.string(),
    answer: z.string(),
    note: z.string(),
    tag: z.enum(["strong", "weak"]),
  })),
});
export type AiHRInterviewResultOutput = z.infer<typeof AiHRInterviewResultOutputSchema>;

export async function analyzeHRInterviewResult(
  input: AiHRInterviewResultInput
): Promise<AiHRInterviewResultOutput> {
  return aiHRInterviewResultFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHRInterviewResultPrompt',
  input: { schema: AiHRInterviewResultInputSchema },
  output: { schema: AiHRInterviewResultOutputSchema },
  prompt: `You are a senior technical hiring evaluator producing a post-interview assessment report.

Candidate: {{{candidateName}}}
Role: {{{role}}}
Target Company: {{{targetCompany}}}
Resume Summary: {{{resumeSummary}}}

Full Interview Transcript:
{{#each transcript}}
[{{{this.stage}}}]
Interviewer: {{{this.question}}}
Candidate: {{{this.answer}}}

{{/each}}

Evaluate this transcript honestly and specifically — grounded ONLY in what the candidate actually said. Do not invent details not present in the transcript.

Produce:

1. overallScore (0-100): a composite score reflecting resume depth, technical accuracy, communication clarity, problem solving, and behavioural fit — weighted by how strong the actual answers were.

2. verdict: a short 2-4 word hiring signal phrase (e.g. "Strong Hire Signal", "Promising, Needs Depth", "Below Bar for Role").

3. categoryScores: score (0-100) for exactly these 5 categories, based on transcript evidence:
   - Resume Depth
   - Technical
   - Communication
   - Problem Solving
   - HR / Behavioural
   If a category wasn't meaningfully covered in the transcript, give a conservative mid-range score (50-60) rather than guessing high or low.

4. strengths: 2-4 short, specific bullet points citing what the candidate actually did well, referencing real content from their answers (not generic praise).

5. improvements: 1-3 short, specific bullet points on what was weak or underdeveloped, grounded in specific transcript moments.

6. annotatedTranscript: return every entry from the input transcript, unchanged in stage/question/answer, but add for EACH:
   - note: one short sentence (under 15 words) evaluating that specific answer.
   - tag: "strong" if the answer was solid/specific/confident, "weak" if it was vague, incorrect, or underdeveloped.

Be honest and calibrated — do not inflate scores. A mediocre transcript should score in the 50s-60s, not 80+. Only strong, well-evidenced transcripts should score 80+.

Return ONLY the structured output, nothing else.`
});

const aiHRInterviewResultFlow = ai.defineFlow(
  {
    name: 'aiHRInterviewResultFlow',
    inputSchema: AiHRInterviewResultInputSchema,
    outputSchema: AiHRInterviewResultOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error("Result analysis failed — neural synthesis returned no output.");
    return output;
  }
);
