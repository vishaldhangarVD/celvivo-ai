'use server';

/**
 * @fileOverview HR Interview Result Analyzer.
 * Analyzes a completed Special HR interview transcript and produces
 * a structured evaluation matching the Special HR Interview Result page:
 * overall score, verdict, category radar scores, strengths, improvements,
 * and a per-exchange annotated transcript.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

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
});

const CategoryScoreSchema = z.object({
  subject: z.string().describe('Category name shown on the radar chart, e.g. "Communication", "Confidence", "Role Fit".'),
  score: z.number().min(0).max(100),
});

const AnnotatedTranscriptEntrySchema = z.object({
  stage: z.string(),
  question: z.string(),
  answer: z.string(),
  note: z.string().describe('Short evaluator note explaining why this answer was strong or weak.'),
  tag: z.enum(['strong', 'weak']),
});

const HRInterviewResultOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall performance score out of 100.'),
  verdict: z.string().describe('One-line hiring verdict, e.g. "Strong Hire", "Hire", "Borderline", "No Hire".'),
  categoryScores: z.array(CategoryScoreSchema).min(4).max(6).describe('4-6 categories for the radar chart, e.g. Communication, Confidence, Role Fit, Technical Depth, Clarity.'),
  strengths: z.array(z.string()).min(2).max(5).describe('Key strengths observed during the interview.'),
  improvements: z.array(z.string()).min(2).max(5).describe('Key areas worth improving.'),
  annotatedTranscript: z.array(AnnotatedTranscriptEntrySchema).describe('Every question/answer pair from the transcript, each annotated with a short note and a strong/weak tag.'),
});

export type HRInterviewResult = z.infer<typeof HRInterviewResultOutputSchema>;
export type HRInterviewResultInput = z.infer<typeof HRInterviewResultInputSchema>;

export async function analyzeHRInterviewResult(
  input: HRInterviewResultInput
): Promise<HRInterviewResult> {
  return hrInterviewResultFlow(input);
}

const hrInterviewResultPrompt = ai.definePrompt({
  name: 'hrInterviewResultPrompt',
  input: {
    schema: HRInterviewResultInputSchema,
  },
  output: {
    schema: HRInterviewResultOutputSchema,
  },
  prompt: `You are a senior HR interview evaluator at {{{targetCompany}}}.

Analyze the following completed HR interview transcript for candidate {{{candidateName}}}, applying for the role of {{{role}}}.

CANDIDATE RESUME SUMMARY:
{{{resumeSummary}}}

INTERVIEW TRANSCRIPT:
{{#each transcript}}
[{{this.stage}}]
Q: {{this.question}}
A: {{this.answer}}

{{/each}}

Evaluate the candidate's overall performance based on:
- Clarity and relevance of answers
- Communication skills
- Confidence and composure
- Alignment with the role requirements
- Depth of experience demonstrated

For categoryScores, pick 4-6 relevant categories (e.g. Communication, Confidence, Role Fit, Technical Depth, Clarity, Structure) and score each 0-100.

For annotatedTranscript, go through EVERY question/answer pair in the transcript above, in order, and for each one write a short evaluator note (1-2 sentences) and tag it "strong" or "weak" based on the quality of that specific answer.

Provide an honest, constructive, and professional evaluation.
Return ONLY the required JSON structure.`,
});

const hrInterviewResultFlow = ai.defineFlow(
  {
    name: 'hrInterviewResultFlow',
    inputSchema: HRInterviewResultInputSchema,
    outputSchema: HRInterviewResultOutputSchema,
  },
  async (input) => {
    console.log(
      `[HR Interview Result Flow] Analyzing interview for ${input.candidateName} (${input.role})`
    );

    try {
      const { output } = await runWithResilience(
        hrInterviewResultPrompt,
        input,
        {
          feature: 'hr_interview_result_analysis',
        }
      );

      if (!output) {
        throw new Error('HR Interview evaluator returned an empty result.');
      }

      return output;
    } catch (error: any) {
      console.error(
        `[HR Interview Result Flow] Generation failure:`,
        error?.message || error
      );
      throw error;
    }
  }
);
