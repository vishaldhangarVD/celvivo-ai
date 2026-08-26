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
    location: z.string().optional(),
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
  prompt: `You are the Nexvoro Resume Intelligence Engine, a world-class ATS evaluator, Technical Recruiter, and Engineering Manager.

Your mission is to perform a high-fidelity, evidence-based analysis of the provided resume for the target role: "{{{targetRole}}}".

### CRITICAL DIRECTIVES:
- **NO HALLUCINATION**: Use ONLY information available in the resume. If a section is missing, return an empty array or indicator; NEVER invent data.
- **EVIDENCE-BASED PROFICIENCY**: Assign proficiency ('Beginner', 'Intermediate', 'Advanced', 'Expert') based on actual usage evidence (years of use, complexity of projects, depth of responsibilities). Do not assume Expertise without strong evidence.
- **INDIVIDUAL SKILLS**: Extract individual technologies and tools. Do not combine unrelated tech into single generic skills.

### EXTRACTION REQUIREMENTS:

1. **Personal Information**: Extract Candidate Name, Email, Phone, and Location.
2. **Professional Summary**: Generate a high-fidelity 2-3 sentence summary based STRICTLY on the career history nodes in the document.
3. **Sections (Rich Detail Required)**:
   - **Education**: Extract Degree, Institution, Course, Specialization, Dates, and GPA/Percentage (if present).
   - **Experience**: Extract EVERY professional role. For each entry, format as a descriptive string including: [Company Name] | [Job Title] | [Duration] | [Detailed Responsibilities & Specific Tech used] | [Quantifiable Results/Achievements].
   - **Projects**: Extract EVERY project. Format as a descriptive string including: [Project Name] | [Detailed Description] | [Core Tech Stack] | [Role/Contribution] | [Features/Impact].
   - **Certifications**: List all verified certifications and issuing providers.
   - **Achievements**: List all listed awards, ranks, or notable professional nodes.
4. **Technical Skills**: Map all identified technologies with their evidence-based proficiency levels.
5. **Evaluation**:
   - Calculate REAListic scores (0-100) for ATS, Readiness, Quality, Technical Depth, and Keyword Optimization relative to standard benchmarks for a "{{{targetRole}}}".
   - Identify concrete strengths and weaknesses found in the text.
   - Identify missingSkills that are vital for the role but absent from the resume text.
6. **Role Match**: Provide match percentages for the target role and 1-2 other related industry tracks.

Resume:
{{media url=resumeDataUri}}`,
});

function generateFallbackAnalysis(targetRole: string): AiResumeAnalysisOutput {
  console.warn('[RESUME ANALYSIS FALLBACK ACTIVATED]', { targetRole });
  
  return {
    personalInfo: {
      fullName: "CANDIDATE IDENTITY NOT PARSED",
      email: "identity@nexus.ai",
    },
    atsScore: 0,
    interviewReadinessScore: 0,
    resumeQualityScore: 0,
    technicalSkillsScore: 0,
    keywordOptimizationScore: 0,
    summary: "The neural engine was unable to parse the document content. Manual review of the PDF is required.",
    strengths: ["Manual Review Required"],
    weaknesses: ["Extraction Protocol Failure"],
    skillAnalysis: [],
    sections: {
      education: ["Parsing error: education nodes not extracted"],
      projects: ["Parsing error: project nodes not extracted"],
      experience: ["Parsing error: experience nodes not extracted"],
      certifications: [],
      achievements: []
    },
    missingSkills: [],
    improvementSuggestions: [
      "Ensure the PDF contains selectable text (not scanned images).",
      "Check that the file is not password protected.",
      "Verify the file format is standard PDF or DOCX."
    ],
    roleMatches: [
      { role: targetRole, matchPercentage: 0 }
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
    } catch (error) {
      console.error("===== RESUME ANALYSIS ERROR =====", error);
      return generateFallbackAnalysis(input.targetRole);
    }
  }
);
