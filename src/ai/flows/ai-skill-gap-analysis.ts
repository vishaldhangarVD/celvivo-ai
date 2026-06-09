'use server';
/**
 * @fileOverview AI flow for comparing user skills against role requirements.
 * (MOCKED for testing)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SkillGapInputSchema = z.object({
  targetRole: z.string(),
  userSkills: z.array(z.string()),
});
export type SkillGapInput = z.infer<typeof SkillGapInputSchema>;

const SkillGapOutputSchema = z.object({
  role: z.string(),
  skillMatchPercentage: z.number().min(0).max(100),
  existingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  criticalMissingSkills: z.array(z.string()),
  recommendedRoadmap: z.array(z.string()),
});
export type SkillGapOutput = z.infer<typeof SkillGapOutputSchema>;

export async function analyzeSkillGap(input: SkillGapInput): Promise<SkillGapOutput> {
  return skillGapFlow(input);
}

const skillGapFlow = ai.defineFlow(
  {
    name: 'skillGapFlow',
    inputSchema: SkillGapInputSchema,
    outputSchema: SkillGapOutputSchema,
  },
  async (input) => {
    // Logic to simulate comparison (In production this would use LLM)
    const mockRoleRequirements: Record<string, string[]> = {
      "Frontend Developer": ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Testing Library"],
      "Backend Developer": ["Node.js", "PostgreSQL", "Docker", "Redis", "Microservices", "gRPC"],
      "Full Stack Developer": ["React", "Node.js", "PostgreSQL", "Next.js", "Docker", "AWS"],
      "DevOps Engineer": ["Kubernetes", "Docker", "Terraform", "CI/CD", "AWS", "Monitoring"],
    };

    const requirements = mockRoleRequirements[input.targetRole] || ["System Design", "Algorithms", "Leadership", "Teamwork"];
    const existing = input.userSkills.filter(s => requirements.includes(s));
    const missing = requirements.filter(s => !input.userSkills.includes(s));
    const critical = missing.slice(0, 2);
    
    const matchPercentage = Math.round((existing.length / requirements.length) * 100) || 45;

    return {
      role: input.targetRole,
      skillMatchPercentage: matchPercentage,
      existingSkills: existing,
      missingSkills: missing,
      criticalMissingSkills: critical,
      recommendedRoadmap: [
        `Master ${critical[0] || 'Core Architecture'} in 2 weeks`,
        `Build a POC using ${missing[1] || 'Modern Tooling'}`,
        `Get certified in ${input.targetRole} track`
      ]
    };
  }
);