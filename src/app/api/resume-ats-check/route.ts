import { NextResponse } from 'next/server';
import { runAtsCheck } from '@/ai/flows/ai-resume-ats-check';

/**
 * @fileOverview API Gateway for ATS Resume Checking.
 * Resolves body size limits and workstation auth cookie issues with Server Actions.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[API ATS Check] Initializing analysis node...");
    
    const result = await runAtsCheck(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API ATS Check] Fatal Fault:", error);
    return NextResponse.json({ 
      error: "Resume analysis failed.", 
      details: error.message 
    }, { status: 500 });
  }
}
