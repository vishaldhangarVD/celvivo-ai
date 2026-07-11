'use server';
/**
 * @fileOverview Nexvoro AI D-ID Realtime Avatar Service.
 * Provides modular access to D-ID Realtime Agents API for WebRTC streaming.
 * Handles secure token generation to prevent leaking the API key to the client.
 */

const DID_API_KEY = process.env.DID_API_KEY;
const DID_AGENT_ID = process.env.DID_AGENT_ID || "v2_agt_6iZaj8jj"; // Defaulting to the user provided ID

export type DidTokenResponse = {
  success: boolean;
  token?: string;
  agentId?: string;
  error?: string;
};

/**
 * Fetches a secure authentication token for the D-ID Realtime SDK.
 * This server action keeps the DID_API_KEY hidden from the browser.
 */
export async function getStreamingToken(): Promise<DidTokenResponse> {
  if (!DID_API_KEY) {
    console.error("[D-ID] Environment variable DID_API_KEY is missing.");
    return { success: false, error: "D-ID service configuration missing on server." };
  }

  try {
    // Request a token for the specific Agent ID
    const response = await fetch(`https://api.d-id.com/agents/${DID_AGENT_ID}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.token) {
      throw new Error(data.message || `D-ID API error: ${response.status}`);
    }

    return { 
      success: true, 
      token: data.token,
      agentId: DID_AGENT_ID 
    };
  } catch (error: any) {
    console.error("[D-ID] Token Fetch Failed:", error);
    return { success: false, error: error.message || "Failed to establish neural link." };
  }
}
