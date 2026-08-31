import { NextResponse } from 'next/server';

/**
 * @fileOverview Server-side Certificate API (Deprecated).
 * This route has been moved to client-side generation (jsPDF + html2canvas) 
 * to resolve persistent environment shared-library issues with Chromium.
 */

export async function POST() {
  return NextResponse.json({ 
    error: "Protocol Migrated", 
    message: "Certificate generation is now performed entirely on the client-side for enhanced reliability." 
  }, { status: 410 });
}
