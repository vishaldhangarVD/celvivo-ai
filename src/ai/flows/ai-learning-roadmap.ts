
'use server';
/**
 * @fileOverview Genkit flow for generating a structured multi-horizon career roadmap.
 * (MOCKED for testing)
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

const learningRoadmapFlow = ai.defineFlow(
  {
    name: 'learningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async (input) => {
    // Simulated multi-horizon roadmap generation
    const missing = input.missingSkills || ["System Design", "Cloud Infrastructure"];
    
    return {
      plans: {
        thirtyDay: [
          {
            title: "Core Vector Acquisition",
            desc: `Master the fundamental delta in ${input.role} architecture.`,
            tasks: [`Complete training in ${missing[0] || 'Core Design'}`, "Quantify resume impact nodes"]
          },
          {
            title: "Logic Refinement",
            desc: "Daily session simulation to boost confidence vectors.",
            tasks: ["Complete 5 technical simulations", "Analyze tone distribution reports"]
          }
        ],
        sixtyDay: [
          {
            title: "Architectural Deep-Dive",
            desc: `Scale your knowledge in ${missing[1] || 'Advanced Tooling'}.`,
            tasks: [`Build proof-of-concept using ${missing[1] || 'Modern Stack'}`, "Study distributed system bottlenecks"]
          },
          {
            title: "Executive Presence",
            desc: "Calibrate behavioral archetypes for lead placements.",
            tasks: ["Record and analyze soft-skill metrics", "Refine strategy presentation logic"]
          }
        ],
        ninetyDay: [
          {
            title: "System Dominance",
            desc: "Final readiness audit for top-tier corporate tracks.",
            tasks: ["Execute full 1-hour simulation", "Complete cross-functional node analysis"]
          },
          {
            title: "Direct Placement",
            desc: "Market calibration and partner network initialization.",
            tasks: ["Optimize global neural profile", "Connect with verified hiring nodes"]
          }
        ]
      },
      recommendedProjects: [
        `Scalable ${input.role} Dashboard`,
        "Distributed Event-Driven Service",
        "AI-Integrated Knowledge Vault"
      ],
      interviewPrepTasks: [
        "Master STAR behavioral logic",
        "Study Big-O for distributed systems",
        "Practice technical whiteboard simulation"
      ]
    };
  }
);
