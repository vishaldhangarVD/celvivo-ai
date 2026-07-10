'use server';
/**
 * @fileOverview Nexvoro AI Career Evolution Architect (v5.0).
 * Synthesizes bespoke 90-day learning roadmaps based on multi-round session data.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const RoadmapModuleSchema = z.object({
  title: z.string(),
  desc: z.string(),
  tasks: z.array(z.string()),
  milestone: z.string(),
});

const LearningRoadmapInputSchema = z.object({
  role: z.string(),
  company: z.string(),
  experienceLevel: z.string(),
  resumeContext: z.object({
    missingSkills: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  aptitudeContext: z.object({
    weakCategories: z.array(z.string()),
    speedAnalysis: z.string(),
  }),
  codingContext: z.object({
    optimizationTips: z.array(z.string()),
    complexityIssues: z.string(),
  }),
  interviewContext: z.object({
    weakSkills: z.array(z.string()),
    mistakesMade: z.array(z.string()),
    communicationFeedback: z.string(),
  }),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const LearningRoadmapOutputSchema = z.object({
  estimatedTimeToReadiness: z.string(),
  overallFocus: z.string(),
  phases: z.object({
    horizon1: z.object({
      title: z.string(),
      duration: z.string(),
      modules: z.array(RoadmapModuleSchema),
    }),
    horizon2: z.object({
      title: z.string(),
      duration: z.string(),
      modules: z.array(RoadmapModuleSchema),
    }),
    horizon3: z.object({
      title: z.string(),
      duration: z.string(),
      modules: z.array(RoadmapModuleSchema),
    }),
  }),
  dailyRoutine: z.array(z.string()),
  weeklyGoals: z.array(z.string()),
  recommendedProjects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    techStack: z.array(z.string()),
    difficulty: z.string(),
  })),
  codingPracticeSuggestions: z.array(z.string()),
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
Synthesize a bespoke 90-day Evolution Roadmap for a {{{role}}} aiming for {{{company}}} ({{{experienceLevel}}} level).

INPUT DOSSIER:

1. RESUME GAPS:
- Missing: {{#each resumeContext.missingSkills}}{{{this}}}, {{/each}}
- Weaknesses: {{#each resumeContext.weaknesses}}{{{this}}}, {{/each}}

2. COGNITIVE AUDIT (APTITUDE):
- Weak Categories: {{#each aptitudeContext.weakCategories}}{{{this}}}, {{/each}}
- Speed Analysis: {{{aptitudeContext.speedAnalysis}}}

3. SYNTAX AUDIT (CODING):
- Complexity Deviations: {{{codingContext.complexityIssues}}}
- Optimization Nodes: {{#each codingContext.optimizationTips}}{{{this}}}, {{/each}}

4. ARENA FEEDBACK (INTERVIEW):
- Soft Skill Gaps: {{#each interviewContext.weakSkills}}{{{this}}}, {{/each}}
- Specific Mistakes: {{#each interviewContext.mistakesMade}}{{{this}}}, {{/each}}
- Narrative Presence: {{{interviewContext.communicationFeedback}}}

ROADMAP ARCHITECTURE:
- Horizon 1 (Day 1-30): Core Vector Acquisition. Focus on critical gaps that blocked the current offer.
- Horizon 2 (Day 31-60): Architectural Deep-Dive. Advanced implementation and project work.
- Horizon 3 (Day 61-90): System Dominance. Final market calibration and elite prep.

Provide high-fidelity daily routines, project laboratories, and specific coding challenges.`,
});

const learningRoadmapFlow = ai.defineFlow(
  {
    name: 'learningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await runWithResilience(prompt, input);
    if (!output) throw new Error("Roadmap synthesis failure.");
    return output;
  }
);
