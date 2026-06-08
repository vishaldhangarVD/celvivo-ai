'use server';
/**
 * @fileOverview Genkit flow for generating a mock learning roadmap.
 * (MOCKED for testing)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LearningRoadmapInputSchema = z.object({
  role: z.string(),
  experienceLevel: z.string(),
  technicalKnowledgeScore: z.number(),
  communicationScore: z.number(),
  problemSolvingScore: z.number(),
  confidenceScore: z.number(),
  overallInterviewScore: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  jobReadinessScore: z.number(),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const LearningRoadmapOutputSchema = z.object({
  missingSkills: z.array(z.string()),
  recommendedTechnologies: z.array(z.string()),
  learningResources: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      url: z.string().url().optional(),
      description: z.string(),
    })
  ),
  careerImprovementPlan: z.array(z.string()),
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
    return {
      missingSkills: ["GraphQL", "Microservices Architecture", "Advanced SQL"],
      recommendedTechnologies: ["Apollo Server", "Docker", "Kubernetes", "PostgreSQL"],
      learningResources: [
        {
          name: "Full Stack Open - GraphQL Module",
          type: "Online Course",
          url: "https://fullstackopen.com/en/part8",
          description: "Comprehensive guide to GraphQL and building schemas."
        },
        {
          name: "Designing Data-Intensive Applications",
          type: "Book",
          description: "The definitive guide to architecture and scalability."
        }
      ],
      careerImprovementPlan: [
        "Master GraphQL basics within 2 weeks",
        "Build a small project using microservices architecture",
        "Contribute to an open-source project in your tech stack"
      ]
    };
  }
);
