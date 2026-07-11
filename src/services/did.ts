'use server';
/**
 * @fileOverview Nexvoro AI D-ID Service Registry.
 * Note: Token generation has been migrated to the direct Client SDK flow.
 * Ensure NEXT_PUBLIC_D_ID_CLIENT_KEY and NEXT_PUBLIC_D_ID_AGENT_ID are set in .env.
 */

export type DidTokenResponse = {
  success: boolean;
  token?: string;
  agentId?: string;
  error?: string;
};

// This service is now a registry placeholder as authentication occurs directly on the client 
// using the official D-ID Realtime SDK 'key' auth type.
