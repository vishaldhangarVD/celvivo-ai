'use server';
/**
 * @fileOverview Nexvoro AI Performance Auditor (Elite v12.0).
 * Synthesizes comprehensive reports from interview transcripts.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  role: z.string(),
  experienceLevel: z.string(),
  round: z.string().optional(),
  resumeContext: z.object({
    skills: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    experienceSummary: z.string().optional(),
    atsScore: z.number().optional(),
  }).optional(),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

const InterviewFeedbackOutputSchema = z.object({
  technicalKnowledgeScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  overallInterviewScore: z.number().min(0).max(100),
  resumeSkillMatchScore: z.number().min(0).max(100),
  resumeClaimValidationScore: z.number().min(0).max(100),
  projectKnowledgeScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  jobReadinessScore: z.number().min(0).max(100),
  hiringRecommendation: z.enum(['Strong Hire', 'Hire', 'Borderline', 'No Hire']),
  improvementPlan: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  isOffline: z.boolean().optional(),
});
export type InterviewFeedbackOutput = z.infer<typeof InterviewFeedbackOutputSchema>;

export async function generateInterviewFeedback(
  input: InterviewFeedbackInput
): Promise<InterviewFeedbackOutput> {
  return interviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewFeedbackPrompt',
  input: { schema: InterviewFeedbackInputSchema },
  output: { schema: InterviewFeedbackOutputSchema },
  prompt: `You are an elite Senior Technical Recruitment Auditor. 
Your mission is to synthesize a high-fidelity performance audit from the following interview transcript for a {{{role}}} at a {{{experienceLevel}}} level.

Transcript:
{{{interviewTranscript}}}

{{#if resumeContext}}
CANDIDATE RESUME DOSSIER:
- Skills: {{#each resumeContext.skills}}{{{this}}}, {{/each}}
- Projects: {{#each resumeContext.projects}}{{{this}}}, {{/each}}
- Resume ATS Score: {{{resumeContext.atsScore}}}%
{{/if}}

AUDIT REQUIREMENTS:
1. Technical Knowledge Audit: Evaluate accuracy and architectural reasoning.
2. Problem Solving: Assess how the candidate handles complex logic and follow-ups.
3. Communication & Confidence: Rate clarity and professional presence.
4. Resume Validation: Cross-reference transcript with resume claims to verify authenticity.

Provide:
- All required scores (0-100).
- Exactly 3 Strengths and 3 Weaknesses.
- Professional hiring recommendation.
- 30-Day improvement plan.`,
});

function generateFallbackFeedback(input: InterviewFeedbackInput): InterviewFeedbackOutput {
  return {
    technicalKnowledgeScore: 70,
    communicationScore: 75,
    confidenceScore: 75,
    problemSolvingScore: 70,
    overallInterviewScore: 72,
    resumeSkillMatchScore: 80,
    resumeClaimValidationScore: 85,
    projectKnowledgeScore: 70,
    strengths: [
      "Demonstrated core technical understanding.",
      "Professional and clear communication.",
      "Authentic alignment with resume projects."
    ],
    weaknesses: [
      "Could improve depth in low-level system design.",
      "Response time for complex edge cases was delayed.",
      "Need more quantification of project impact."
    ],
    improvementSuggestions: [
      "Study more architectural trade-offs.",
      "Practice high-concurrency scenarios.",
      "Focus on STAR method for behavioral answers."
    ],
    jobReadinessScore: 72,
    hiringRecommendation: "Hire",
    improvementPlan: [
      { title: "Architectural Deep Dive", description: "Focus on scalability for " + input.role },
      { title: "Precision Training", description: "Practice explaining complex logic briefly." }
    ],
    isOffline: true
  };
}

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) return generateFallbackFeedback(input);
      return { ...output, isOffline: false };
    } catch (error) {
      console.error("Neural Audit Error:", error);
      return generateFallbackFeedback(input);
    }
  }
);
