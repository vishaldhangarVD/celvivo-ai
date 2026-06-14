'use server';
/**
 * @fileOverview Genkit flow for generating a structured multi-horizon career roadmap.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RoadmapModuleSchema = z.object({
  title: z.string(),
  desc: z.string(),
  tasks: z.array(z.string()),
});

const LearningRoadmapInputSchema = z.object({
  role: z.string(),
  experienceLevel: z.string(),
  existingSkills: z.array(z.string()).optional(),
  missingSkills: z.array(z.string()).optional(),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const LearningRoadmapOutputSchema = z.object({
  plans: z.object({
    thirtyDay: z.array(RoadmapModuleSchema),
    sixtyDay: z.array(RoadmapModuleSchema),
    ninetyDay: z.array(RoadmapModuleSchema),
  }),
  recommendedProjects: z.array(z.string()),
  interviewPrepTasks: z.array(z.string()),
});
export type LearningRoadmapOutput = z.infer<typeof LearningRoadmapOutputSchema>;

export async function generateLearningRoadmap(input: LearningRoadmapInput): Promise<LearningRoadmapOutput> {
  return learningRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningRoadmapPrompt',
  input: { schema: LearningRoadmapInputSchema },
  output: { schema: LearningRoadmapOutputSchema },
  prompt: `You are a high-level engineering mentor.
Synthesize a 90-day technical evolution roadmap for a {{{role}}} at a {{{experienceLevel}}} level.

Current Capabilities: {{#each existingSkills}}{{{this}}}, {{/each}}
Identified Delta Gaps: {{#each missingSkills}}{{{this}}}, {{/each}}

Generate:
1. 30-Day: Core Vector Acquisition (Focus on critical gaps).
2. 60-Day: Architectural Deep-Dive (Advanced concepts and projects).
3. 90-Day: System Dominance (Final readiness and market calibration).`,
});

const learningRoadmapFlow = ai.defineFlow(
  {
    name: 'learningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (output) return output;
    } catch (e) {
      console.error('Roadmap Genkit Error:', e);
    }

    // Static roadmap fallback
    return {
      plans: {
        thirtyDay: [{ title: "Foundational Bridge", desc: "Master the basics of missing nodes", tasks: ["Study documentation", "Complete 5 small exercises"] }],
        sixtyDay: [{ title: "Component Mastery", desc: "Build modular solutions", tasks: ["Build a mini-project", "Refactor existing code"] }],
        ninetyDay: [{ title: "System Ready", desc: "Final performance audit", tasks: ["Execute full simulation", "Optimize resume keywords"] }]
      },
      recommendedProjects: ["Personal Portfolio v2", "Logic-heavy Dashboard"],
      interviewPrepTasks: ["Review data structures", "Practice behavior questions"]
    };
  }
);
