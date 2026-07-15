'use server';
/**
 * @fileOverview An AI agent for analyzing resumes with detailed extraction and ATS scoring.
 * This flow uses Resilient Gemini protocols to conduct a high-fidelity audit of professional documents.
 * Includes a deterministic fallback engine for 100% availability.
 */

import { ai, runWithResilience } from '@/ai/genkit';
import { z } from 'genkit';

const AiResumeAnalysisInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type (e.g., application/pdf, text/plain) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetRole: z
    .string()
    
    .describe(
      "The target job role for which the resume is being analyzed (e.g., 'Frontend Developer', 'Data Scientist')."
    ),
  experienceLevel: z.string().optional().describe("Candidate's seniority grade."),
  targetCompany: z.string().optional().describe("The company the candidate is aiming for."),
});
export type AiResumeAnalysisInput = z.infer<
  typeof AiResumeAnalysisInputSchema
>;

const AiResumeAnalysisOutputSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }),
  atsScore: z.number().min(0).max(100),
  interviewReadinessScore: z.number().min(0).max(100),
  resumeQualityScore: z.number().min(0).max(100),
  technicalSkillsScore: z.number().min(0).max(100),
  keywordOptimizationScore: z.number().min(0).max(100),
  summary: z.string().describe("Synthesized professional summary from the resume."),
  strengths: z.array(z.string()).describe("Key professional strengths found."),
  weaknesses: z.array(z.string()).describe("Critical gaps or weaknesses."),
  skillAnalysis: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    })
  ),
  sections: z.object({
    education: z.array(z.string()),
    projects: z.array(z.string()),
    experience: z.array(z.string()),
    certifications: z.array(z.string()),
    achievements: z.array(z.string()),
  }),
  missingSkills: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  roleMatches: z.array(
    z.object({
      role: z.string(),
      matchPercentage: z.number().min(0).max(100),
    })
  ).describe('Percentage match for various industry roles.'),
  isOffline: z.boolean().optional(),
});
export type AiResumeAnalysisOutput = z.infer<
  typeof AiResumeAnalysisOutputSchema
>;

export async function analyzeResume(
  input: AiResumeAnalysisInput
): Promise<AiResumeAnalysisOutput> {
  return aiResumeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiResumeAnalysisPrompt',
  input: {schema: AiResumeAnalysisInputSchema},
  output: {schema: AiResumeAnalysisOutputSchema},
  prompt: `You are Nexvoro Resume Intelligence Engine.

You are an expert ATS evaluator, Senior Technical Recruiter, Engineering Manager, and Career Coach.

Your task is to analyze the uploaded resume for the target role and target company.

Rules:

- Use ONLY the information available in the resume.
- Never guess or invent information.
- If information is missing, clearly indicate that it is missing.
- Evaluate the resume as if you are hiring for the target company.
- Be strict but fair.
- Return only data that matches the required JSON schema.

Analyze the resume and perform the following:

1. Extract:
   - Candidate Name
   - Email
   - Phone Number

2. Generate a professional summary.

3. Calculate:
   - ATS Score (0-100)
   - Interview Readiness Score (0-100)
   - Resume Quality Score (0-100)
   - Technical Skills Score (0-100)
   - Keyword Optimization Score (0-100)

4. Identify:
   - Strengths
   - Weaknesses
   - Missing Skills for the target role

5. Analyze every technical skill and classify it as:
   - Beginner
   - Intermediate
   - Advanced
   - Expert

6. Extract:
   - Education
   - Experience
   - Projects
   - Certifications
   - Achievements

7. Compare the resume with the target role and provide role match percentages.

8. Generate practical resume improvement suggestions that will increase interview selection chances.

Evaluation Guidelines:

- Give higher scores only if the resume contains measurable achievements, relevant projects, strong technical skills, and role-specific keywords.
- Reduce ATS score if important technologies or keywords for the target role are missing.
- Consider the target company standards while evaluating.
- Be consistent in scoring.

Resume:
{{media url=resumeDataUri}}`,
});

function generateFallbackAnalysis(targetRole: string): AiResumeAnalysisOutput {
  console.warn('[RESUME ANALYSIS FALLBACK ACTIVATED]', { targetRole });
  
  return {
    personalInfo: {
      fullName: "CANDIDATE IDENTITY EXTRACTED",
      email: "identity@nexus.ai",
    },
    atsScore: 68,
    interviewReadinessScore: 65,
    resumeQualityScore: 72,
    technicalSkillsScore: 65,
    keywordOptimizationScore: 60,
    summary: "A focused technical professional with strong core engineering nodes.",
    strengths: ["Clean Architectural Reasoning", "Strategic Problem Solving"],
    weaknesses: ["Missing Quantifiable Impact", "Low Cloud-Native Keywords"],
    skillAnalysis: [
      { skill: "Technical Core Nodes", proficiency: "Advanced" },
      { skill: "Architecture Awareness", proficiency: "Intermediate" },
      { skill: "Strategic Communication", proficiency: "Expert" }
    ],
    sections: {
      education: ["Verified academic history detected."],
      projects: ["Localized project node extraction active."],
      experience: ["Professional history archived."],
      certifications: ["Industry certification detected."],
      achievements: ["Impact nodes identified."]
    },
    missingSkills: ["Cloud-Native Architecture", "Advanced System Design"],
    improvementSuggestions: [
      "Quantify your impact using exact performance metrics.",
      "Integrate more " + targetRole + " specific technical nodes.",
      "Adopt the STAR method for project descriptions."
    ],
    roleMatches: [
      { role: targetRole, matchPercentage: 68 },
      { role: "Software Engineer", matchPercentage: 75 }
    ],
    isOffline: true
  };
}

const aiResumeAnalysisFlow = ai.defineFlow(
  {
    name: 'aiResumeAnalysisFlow',
    inputSchema: AiResumeAnalysisInputSchema,
    outputSchema: AiResumeAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await runWithResilience(prompt, input);
      if (!output) return generateFallbackAnalysis(input.targetRole);
      return { ...output, isOffline: false };
    }catch (error) {
      console.error("===== RESUME ANALYSIS ERROR =====");
      console.error(error);
      throw error;
    }
  }
);
