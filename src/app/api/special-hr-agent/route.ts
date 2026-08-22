import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure Gateway for D-ID Agent Credentials.
 * Provides the browser-safe Agent ID and Client Key to the frontend.
 * The private DID_API_KEY remains strictly server-side.
 */

export async function GET() {
  try {
    const agentId = process.env.DID_SPECIAL_HR_AGENT_ID;
    const clientKey = process.env.DID_SPECIAL_HR_CLIENT_KEY;

    // Verify presence of required credentials
    if (!agentId || !clientKey) {
      console.error("[D-ID Config] Missing credentials in environment. Ensure DID_SPECIAL_HR_AGENT_ID and DID_SPECIAL_HR_CLIENT_KEY are set.");
      return NextResponse.json({ 
        error: "Configuration Incomplete",
        agentIdMissing: !agentId,
        clientKeyMissing: !clientKey
      }, { status: 400 });
    }

    return NextResponse.json({
      agentId,
      clientKey
    });
  } catch (error: any) {
    console.error("[D-ID Gateway] Fatal Error:", error);
    return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}
