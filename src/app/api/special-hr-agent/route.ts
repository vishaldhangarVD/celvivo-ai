import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure Gateway for D-ID Agent Configuration.
 * Keeps sensitive Agent IDs and API Keys on the server.
 */

export async function GET() {
  try {
    const agentId = process.env.DID_SPECIAL_HR_AGENT_ID;
    const clientKey = process.env.DID_API_KEY; // Using the key provided in the environment

    if (!agentId || !clientKey) {
      console.error("[D-ID Config] Missing DID_SPECIAL_HR_AGENT_ID or DID_API_KEY in environment.");
      return NextResponse.json({ error: "D-ID Agent credentials not configured." }, { status: 500 });
    }

    return NextResponse.json({
      agentId,
      clientKey
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}
