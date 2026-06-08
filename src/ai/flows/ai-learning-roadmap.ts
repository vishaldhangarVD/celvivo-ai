'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized learning roadmap based on interview feedback.
 *
 * - generateLearningRoadmap - A function that handles the generation of a learning roadmap.
 * - LearningRoadmapInput - The input type for the generateLearningRoadmap function.
 * - LearningRoadmapOutput - The return type for the generateLearningRoadmap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LearningRoadmapInputSchema = z.object({
  role: z.string().describe('The target job role for the interview (e.g., Frontend Developer).'),
  experienceLevel: z.string().describe('The experience level for the interview (e.g., Junior, Mid-Level, Senior).'),
  technicalKnowledgeScore: z.number().describe('Score reflecting technical knowledge.'),
  communicationScore: z.number().describe('Score reflecting communication skills.'),
  problemSolvingScore: z.number().describe('Score reflecting problem-solving abilities.'),
  confidenceScore: z.number().describe('Score reflecting confidence during the interview.'),
  overallInterviewScore: z.number().describe('Overall score for the interview.'),
  strengths: z.array(z.string()).describe('List of identified strengths from the interview.'),
  weaknesses: z.array(z.string()).describe('List of identified weaknesses from the interview.'),
  improvementSuggestions: z.array(z.string()).describe('List of specific suggestions for improvement.'),
  jobReadinessScore: z.number().describe('Score indicating job readiness.'),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const LearningRoadmapOutputSchema = z.object({
  missingSkills: z.array(z.string()).describe('List of skills identified as missing or needing improvement.'),
  recommendedTechnologies: z.array(z.string()).describe('List of technologies recommended for learning.'),
  learningResources: z.array(
    z.object({
      name: z.string().describe('Name of the resource (e.g., Book title, Course name).'),
      type: z.string().describe('Type of resource (e.g., Book, Online Course, Tutorial, Documentation).'),
      url: z.string().url().describe('URL to the learning resource.').optional(),
      description: z.string().describe('A brief description of the resource.'),
    })
  ).describe('List of recommended learning resources.'),
  careerImprovementPlan: z.array(z.string()).describe('A step-by-step plan for career improvement.'),
});
export type LearningRoadmapOutput = z.infer<typeof LearningRoadmapOutputSchema>;

export async function generateLearningRoadmap(input: LearningRoadmapInput): Promise<LearningRoadmapOutput> {
  return learningRoadmapFlow(input);
}

const learningRoadmapPrompt = ai.definePrompt({
  name: 'learningRoadmapPrompt',
  input: { schema: LearningRoadmapInputSchema },
  output: { schema: LearningRoadmapOutputSchema },
  prompt: `You are an AI career coach specializing in technical interview preparation. Your task is to analyze the provided interview feedback for a candidate aspiring to be a '{{{role}}}' at a '{{{experienceLevel}}}' level and generate a personalized learning roadmap. This roadmap should help the candidate address their weaknesses, acquire missing skills, and advance their career.

Analyze the following interview performance details:

Role: {{{role}}}
Experience Level: {{{experienceLevel}}}
Technical Knowledge Score: {{{technicalKnowledgeScore}}}/100
Communication Score: {{{communicationScore}}}/100
Problem Solving Score: {{{problemSolvingScore}}}/100
Confidence Score: {{{confidenceScore}}}/100
Overall Interview Score: {{{overallInterviewScore}}}/100
Job Readiness Score: {{{jobReadinessScore}}}/100

Strengths:
{{#each strengths}}- {{{this}}}
{{/each}}

Weaknesses:
{{#each weaknesses}}- {{{this}}}
{{/each}}

Improvement Suggestions:
{{#each improvementSuggestions}}- {{{this}}}
{{/each}}

Based on this information, create a detailed learning roadmap that includes:
1.  **Missing Skills**: A list of specific skills the candidate needs to acquire or improve, directly related to their weaknesses and the target role.
2.  **Recommended Technologies**: A list of key technologies, frameworks, or tools relevant to the target role that the candidate should learn.
3.  **Learning Resources**: Specific learning materials (e.g., books, online courses, documentation, tutorials) for the recommended skills and technologies. Include the resource name, type (e.g., 'Book', 'Online Course', 'Documentation'), and a brief description. If possible, provide a URL.
4.  **Career Improvement Plan**: A step-by-step action plan for how the candidate can integrate this learning into their career development, including practical advice and next steps.

Ensure the roadmap is practical, actionable, and tailored to the candidate's specific feedback and target role.`,
});

const learningRoadmapFlow = ai.defineFlow(
  {
    name: 'learningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await learningRoadmapPrompt(input);
    return output!;
  }
);
