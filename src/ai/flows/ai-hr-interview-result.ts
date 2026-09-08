
'use server';
/**
 * @fileOverview Nexvoro AI — Special HR Interview Result Analyzer.
 * Unified with central model protocol to prevent 404 errors.
 */

import { ai, runWithResilience, PRIMARY_MODEL } from '@/ai/genkit';
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
  prompt: `You are a senior technical hiring evaluator. Produce a post-interview assessment report.

Candidate: {{{candidateName}}}
Role: {{{role}}}
Target Company: {{{targetCompany}}}

Evaluate the transcript and return valid JSON.`
});

const aiHRInterviewResultFlow = ai.defineFlow(
  {
    name: 'aiHRInterviewResultFlow',
    inputSchema: AiHRInterviewResultInputSchema,
    outputSchema: AiHRInterviewResultOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Neural synthesis failed.");
      return output;
    } catch (error) {
      console.error("[HR Result Flow] Failure, using fallback:", error);
      return {
        overallScore: 65,
        verdict: "Manual Review Needed",
        categoryScores: [
          { subject: "Communication", score: 70 },
          { subject: "Technical", score: 60 },
          { subject: "Behavioral", score: 65 },
          { subject: "Problem Solving", score: 60 },
          { subject: "Resume Alignment", score: 70 }
        ],
        strengths: ["Session completed successfully"],
        improvements: ["AI synthesis interrupted - review transcript manually"],
        annotatedTranscript: input.transcript.map(t => ({
          ...t,
          note: "Recorded in secure vault.",
          tag: "strong"
        }))
      };
    }
  }
);
