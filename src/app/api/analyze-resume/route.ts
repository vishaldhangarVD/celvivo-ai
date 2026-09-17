import { NextResponse } from 'next/server';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

/**
 * @fileOverview API Gateway for Resume Analysis.
 * Proxies requests to the analyzeResume server action to avoid client-side
 * Server Action invocation issues in restricted preview environments.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeDataUri, targetRole, experienceLevel, targetCompany } = body;

    if (!resumeDataUri || !targetRole) {
      return NextResponse.json({ error: "Required intelligence nodes missing." }, { status: 400 });
    }

    console.log(`[API Analyze Resume] Initializing analysis for role: ${targetRole}`);
    
    const result = await analyzeResume({
      resumeDataUri,
      targetRole,
      experienceLevel,
      targetCompany
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Analyze Resume] FATAL FAULT:", error);
    return NextResponse.json({ 
      error: "Neural analysis failed", 
      details: error.message || "Internal server error during dossier parsing."
    }, { status: 500 });
  }
}
