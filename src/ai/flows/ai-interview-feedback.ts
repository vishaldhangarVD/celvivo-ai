'use server';
/**
 * @fileOverview Nexvoro AI Performance Auditor.
 * Synthesizes comprehensive reports from interview transcripts using Resilient Gemini protocols.
 * Upgraded with Resume Intelligence synchronization.
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
  overallInterviewScore: z.number().min(0).max(100),
  resumeSkillMatchScore: z.number().min(0).max(100).describe('Alignment between transcript and resume skills.'),
  resumeClaimValidationScore: z.number().min(0).max(100).describe('Verification of claims made in the resume.'),
  projectKnowledgeScore: z.number().min(0).max(100).describe('Depth of understanding of listed projects.'),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  jobReadinessScore: z.number().min(0).max(100),
  hiringRecommendation: z.enum(['Hire', 'Strong Hire', 'No Hire', 'Leaning No Hire']),
  improvementPlan: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
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
- Experience: {{{resumeContext.experienceSummary}}}
- Resume ATS Score: {{{resumeContext.atsScore}}}%

RESUME VALIDATION PROTOCOL:
1. Resume Skill Match: Analyze if the candidate's technical answers align with the proficiency claimed for skills listed in the resume.
2. Claim Validation: Evaluate if the candidate successfully defended the achievements and tenure claimed in the resume.
3. Project Depth: Specifically score how well the candidate explained the architectural and technical details of the projects listed in their resume.
{{/if}}

Evaluation Protocol:
1. Technical Logic Audit: Evaluate accuracy of solutions and architectural reasoning.
2. Narrative Delivery: Analyze communication clarity and STAR method application.
3. Operational Presence: Assess decisiveness and professional confidence.

Provide:
- All required scores (0-100).
- Exactly 3 Strengths and 3 Weaknesses.
- Hiring Recommendation.
- Role-calibrated Improvement Plan.`,
});

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackInputSchema,
    outputSchema: InterviewFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error('Audit synthesis failed.');
    return output;
  }
);
