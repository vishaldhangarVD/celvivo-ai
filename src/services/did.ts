'use server';
/**
 * @fileOverview Nexvoro AI D-ID Realtime Agent Auth Service.
 * Provides secure token generation for the D-ID Realtime Client SDK.
 * Uses the user-provided DID_CLIENT_KEY and DID_AGENT_ID.
 */

const DID_CLIENT_KEY = process.env.DID_CLIENT_KEY;
const DID_AGENT_ID = process.env.DID_AGENT_ID || "v2_agt_6iZaj8jj";

export type DidTokenResponse = {
  success: boolean;
  token?: string;
  agentId?: string;
  error?: string;
};

/**
 * Fetches a secure WebRTC session token for the D-ID Realtime SDK.
 * This ensures the DID_CLIENT_KEY is never exposed to the client.
 */
export async function getStreamingToken(): Promise<DidTokenResponse> {
  if (!DID_CLIENT_KEY) {
    console.error("[D-ID] Environment variable DID_CLIENT_KEY is missing.");
    return { success: false, error: "D-ID client configuration missing on server." };
  }

  try {
    // Request a session token for the specific Agent ID using Basic Auth with the Client Key
    const response = await fetch(`https://api.d-id.com/agents/${DID_AGENT_ID}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_CLIENT_KEY + ':').toString('base64')}`,
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
