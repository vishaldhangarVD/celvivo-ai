'use server';

/**
 * @fileOverview HR Interview Result Analyzer.
 * Analyzes a completed Special HR interview transcript and produces
 * a structured evaluation: overall score, strengths, weaknesses,
 * and stage-wise feedback.
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

const HRInterviewResultOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall performance score out of 100.'),
  verdict: z.string().describe('One-line hiring verdict, e.g. "Strong Hire", "Hire", "No Hire".'),
  summary: z.string().describe('2-3 sentence overall summary of the candidate performance.'),
  strengths: z.array(z.string()).describe('Key strengths observed during the interview.'),
  weaknesses: z.array(z.string()).describe('Key weaknesses or areas for improvement.'),
  communicationScore: z.number().min(0).max(100).describe('Communication skills score.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence level score.'),
  stageWiseFeedback: z.array(
    z.object({
      stage: z.string(),
      feedback: z.string(),
    })
  ).describe('Short feedback per interview stage.'),
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
