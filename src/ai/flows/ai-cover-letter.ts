
'use server';
/**
 * @fileOverview Genkit flow for generating professional AI cover letters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CoverLetterInputSchema = z.object({
  companyName: z.string(),
  jobRole: z.string(),
  jobDescription: z.string().optional(),
  userSkills: z.array(z.string()).optional(),
  experienceHighlights: z.array(z.string()).optional(),
});
export type CoverLetterInput = z.infer<typeof CoverLetterInputSchema>;

const CoverLetterOutputSchema = z.object({
  generatedLetter: z.string(),
});
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput> {
  return coverLetterFlow(input);
}

const coverLetterFlow = ai.defineFlow(
  {
    name: 'coverLetterFlow',
    inputSchema: CoverLetterInputSchema,
    outputSchema: CoverLetterOutputSchema,
  },
  async (input) => {
    // MOCK RESPONSE for Nexvoro AI premium experience
    const skillsText = input.userSkills?.join(', ') || 'modern software development';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const letter = `
Dear Hiring Manager at ${input.companyName},

I am writing to express my strong interest in the ${input.jobRole} position at ${input.companyName}, as advertised. With a proven track record in ${skillsText}, I am confident that my technical precision and strategic mindset align perfectly with the high-stakes engineering goals of your team.

Throughout my career, I have focused on building scalable, resilient architectures and delivering high-impact solutions. My expertise in ${input.userSkills?.[0] || 'software engineering'} has allowed me to consistently reduce system latency and improve operational efficiency in complex environments. I am particularly drawn to ${input.companyName} because of your commitment to technical excellence and industry-leading innovation.

In my previous roles, I have demonstrated:
• Expertise in ${skillsText}
• Strategic problem-solving within distributed systems
• A commitment to maintaining elite code quality and documentation standards

I am eager to bring my unique blend of technical mastery and professional presence to the ${input.jobRole} role. Thank you for your time and for considering my application. I look forward to the possibility of discussing how my background can contribute to the continued success of ${input.companyName}.

Sincerely,

[Your Name]
Neural Sync ID: ${Math.random().toString(36).substring(7).toUpperCase()}
Date: ${date}
    `.trim();

    return {
      generatedLetter: letter
    };
  }
);
