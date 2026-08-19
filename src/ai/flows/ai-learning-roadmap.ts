'use server';
/**
 * @fileOverview Nexvoro AI Career Evolution Architect (v6.0).
 * Synthesizes high-fidelity, evidence-based learning roadmaps.
 * Performs cross-assessment analysis of Resume, Aptitude, Coding, and Interview data.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const RoadmapModuleSchema = z.object({
  title: z.string(),
  desc: z.string(),
  evidence: z.string().describe("Explain why this specific user needs this based on their actual performance in assessments."),
  currentLevel: z.enum(['Beginner', 'Developing', 'Intermediate', 'Strong']),
  tasks: z.array(z.string()),
  realWorldProject: z.string().describe("A practical project task to apply this skill."),
  validationCriteria: z.string().describe("A measurable goal to verify mastery."),
  milestone: z.string(),
});

const RoadmapPhaseSchema = z.object({
  title: z.string(),
  duration: z.string(),
  modules: z.array(RoadmapModuleSchema),
});

const LearningRoadmapInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  transcript: z.string().optional(),
  resumeContext: z.object({
    skills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }).optional(),
  interviewFeedback: z.object({
    weakSkills: z.array(z.string()),
    mistakesMade: z.array(z.string()),
    scores: z.object({
      technical: z.number(),
      communication: z.number(),
      problemSolving: z.number(),
    }),
  }).optional(),
  aptitudeScore: z.number().optional(),
  codingScore: z.number().optional(),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const LearningRoadmapOutputSchema = z.object({
  estimatedTimeToReadiness: z.string(),
  overallFocus: z.string(),
  skillGapPriority: z.array(z.object({
    skill: z.string(),
    priority: z.enum(['High', 'Medium', 'Low']),
    reason: z.string(),
  })),
  phases: z.array(RoadmapPhaseSchema).length(5).describe("Must provide exactly 5 phases: Critical Gaps, Core Competency, Applied Practice, Interview Readiness, Validation."),
  dailyRoutine: z.array(z.string()),
  softSkillDirectives: z.array(z.string()),
});
export type LearningRoadmapOutput = z.infer<typeof LearningRoadmapOutputSchema>;

export async function generatePersonalizedRoadmap(input: LearningRoadmapInput): Promise<LearningRoadmapOutput> {
  return learningRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningRoadmapPrompt',
  input: { schema: LearningRoadmapInputSchema },
  output: { schema: LearningRoadmapOutputSchema },
  prompt: `You are an elite Engineering Mentor and Career Strategist. 
Synthesize a bespoke 90-day Evolution Roadmap for a {{{role}}} candidate targeting {{{company}}}.

### CORE DIRECTIVE:
You must perform a "Cross-Assessment Skill Analysis" using the provided data:
1. INTERVIEW PERFORMANCE: 
   - Weaknesses: {{#each interviewFeedback.weakSkills}}{{{this}}}, {{/each}}
   - Mistakes: {{#each interviewFeedback.mistakesMade}}{{{this}}}, {{/each}}
   - Transcript Context: {{{transcript}}}
2. RESUME GAPS: {{#each resumeContext.missingSkills}}{{{this}}}, {{/each}}
3. APTITUDE SCORE: {{{aptitudeScore}}}%
4. CODING SCORE: {{{codingScore}}}%

### REQUIREMENTS:
- NO HARDCODED CONTENT: Every module must be derived from the specific user's assessment data.
- EVIDENCE-BASED: For every "Why This Matters" (evidence field), cite the specific round or answer that exposed the gap.
- PRIORITIZATION: Identify repeated weaknesses (e.g. if coding and aptitude both show low logic, prioritize problem-solving).
- 5-PHASE STRUCTURE: 
  - Phase 1: Fix Critical Gaps (address High priority failures).
  - Phase 2: Build Core Competency (strengthen role-specific fundamentals).
  - Phase 3: Applied Practice (project-based implementation).
  - Phase 4: Interview Readiness (behavioral and technical communication).
  - Phase 5: Validation (measurable re-testing goals).

- TARGET ROLE AWARENESS: All recommendations must align with the standards of a {{{role}}} at {{{company}}}.
- REASONABLE & ACTIONABLE: Provide specific concepts, not generic "Learn Python".

Return a high-fidelity intelligence report.`,
});

const learningRoadmapFlow = ai.defineFlow(
  {
    name: 'learningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) throw new Error("Roadmap synthesis failure.");
      return output;
    } catch (error) {
      console.error("[Roadmap Flow] Error:", error);
      throw error;
    }
  }
);
