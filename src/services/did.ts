'use server';
/**
 * @fileOverview Nexvoro AI D-ID Avatar Service.
 * Provides modular access to D-ID Realtime Agents API.
 * Handles secure token generation for WebRTC streaming.
 */

const DID_API_KEY = process.env.DID_API_KEY;
const DID_AGENT_ID = process.env.DID_AGENT_ID;

export type DidTokenResponse = {
  success: boolean;
  token?: string;
  agentId?: string;
  error?: string;
};

/**
 * Fetches a secure authentication token for the D-ID Realtime SDK.
 * This prevents leaking the API key to the frontend.
 */
export async function getStreamingToken(): Promise<DidTokenResponse> {
  if (!DID_API_KEY || !DID_AGENT_ID) {
    console.error("[D-ID] Environment variables missing (DID_API_KEY or DID_AGENT_ID).");
    return { success: false, error: "D-ID service configuration missing." };
  }

  try {
    const response = await fetch(`https://api.d-id.com/agents/${DID_AGENT_ID}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!data.token) {
      throw new Error(data.message || "Failed to retrieve streaming token.");
    }

    return { 
      success: true, 
      token: data.token,
      agentId: DID_AGENT_ID 
    };
  } catch (error: any) {
    console.error("[D-ID] Token Fetch Failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Legacy Talk support (optional, kept for resilience fallback)
 */
export async function createTalk(text: string, sourceUrl: string) {
  if (!DID_API_KEY) return { success: false, error: "D-ID API key not configured." };
  try {
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: sourceUrl,
        script: { type: 'text', input: text, provider: { type: 'microsoft', voice_id: 'en-US-GuyNeural' } },
        config: { fluent: true, pad_audio: 0.0, driver_expressions: { expressions: [{ expression: 'serious', start_frame: 0 }] } },
      }),
    });
    const data = await response.json();
    return { success: true, talkId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}