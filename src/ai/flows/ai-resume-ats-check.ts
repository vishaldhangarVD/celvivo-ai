'use server';
/**
 * @fileOverview Nexvoro AI ATS Intelligence Flow.
 * Performs deep semantic comparison between a resume blueprint and a job description.
 * Calibrated for objective scoring and actionable remediation advice.
 * Now supports direct PDF/DOCX file text extraction.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AtsCheckInputSchema = z.object({
  resumeData: z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    skills: z.array(z.string()),
    experience: z.array(z.any()),
    projects: z.array(z.any()),
    education: z.array(z.any()),
  }).optional(),
  resumeDataUri: z.string().optional(),
  jobDescription: z.string(),
});

const AtsCheckOutputSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string().describe("A short 2-4 word phrase like 'Strong Match' or 'Needs Alignment'."),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(z.string()).describe("2-4 short, specific, actionable tips to improve match."),
});

/**
 * Helper to extract text from PDF or DOCX data URI.
 */
async function extractTextFromUri(uri: string): Promise<string> {
  const parts = uri.split(',');
  if (parts.length < 2) throw new Error("Invalid file protocol.");
  
  const mimetype = parts[0].split(';')[0].split(':')[1];
  const buffer = Buffer.from(parts[1], 'base64');

  if (mimetype === 'application/pdf') {
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  throw new Error("Unsupported file format. Please use PDF or DOCX.");
}

export async function runAtsCheck(input: z.infer<typeof AtsCheckInputSchema>) {
  return runAtsCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runAtsCheckPrompt',
  input: { 
    schema: AtsCheckInputSchema.extend({
      resumeText: z.string().optional()
    })
  },
  output: { schema: AtsCheckOutputSchema },
  prompt: `You are an ATS (Applicant Tracking System) resume screener. 
Compare the following resume against the job description. 

REQUISITION INTEL (Job Description):
{{{jobDescription}}}

### CANDIDATE DOSSIER
{{#if resumeText}}
{{{resumeText}}}
{{else}}
Name: {{{resumeData.name}}}
Target Role: {{{resumeData.role}}}
Summary: {{{resumeData.summary}}}
Skills: {{#each resumeData.skills}}{{{this}}}, {{/each}}

EXPERIENCE:
{{#each resumeData.experience}}
- {{{this.role}}} at {{{this.company}}} ({{{this.dates}}}): {{{this.bullets}}}
{{/each}}

PROJECTS:
{{#each resumeData.projects}}
- {{{this.name}}}: {{{this.desc}}}
{{/each}}

EDUCATION:
{{#each resumeData.education}}
- {{{this.degree}}} from {{{this.school}}} ({{{this.dates}}})
{{/each}}
{{/if}}

### AUDIT REQUIREMENTS:
1. SCORE: Calculate a realistic 0-100 score based on keyword match, experience depth, and role alignment.
2. KEYWORDS: Identify specific technical and soft skills present in both, and critical ones missing from the resume.
3. SUGGESTIONS: Provide 2-4 highly specific tips (e.g., "Add 'Docker' to skills", "Quantify the Vaultly project impact").

Return ONLY a valid JSON object matching the schema.`,
});

const runAtsCheckFlow = ai.defineFlow(
  {
    name: 'runAtsCheckFlow',
    inputSchema: AtsCheckInputSchema,
    outputSchema: AtsCheckOutputSchema,
  },
  async (input) => {
    try {
      let resumeText = undefined;
      
      if (input.resumeDataUri) {
        try {
          const extracted = await extractTextFromUri(input.resumeDataUri);
          if (!extracted || extracted.trim().length < 50) {
            throw new Error("Couldn't read text from this file — it might be a scanned image or empty. Please try a different file or use a saved resume.");
          }
          resumeText = extracted;
        } catch (extractionError: any) {
          throw new Error(extractionError.message || "Failed to extract text from file.");
        }
      }

      const { output } = await runWithResilience(prompt, {
        ...input,
        resumeText
      });
      
      if (!output) throw new Error("Neural auditor failed to respond.");
      return output;
    } catch (error: any) {
      console.error("[ATS Flow] Neural fault:", error);
      throw new Error(error.message || "Couldn't complete the ATS check — please try again.");
    }
  }
);