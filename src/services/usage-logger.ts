'use server';

import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * @fileOverview Nexvoro AI Central Usage Logging Service.
 * Provides server-side methods to record and retrieve AI API usage telemetry.
 * Reinforced with verbose terminal logging for definitive debugging.
 */

export interface UsageLogData {
  userId?: string;
  sessionId?: string;
  feature: string;
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  characterCount?: number;
  videoDurationSeconds?: number;
}

/**
 * Persists a single usage record to Firestore.
 */
export async function logUsage(data: UsageLogData) {
  try {
    const { firestore } = initializeFirebase();
    
    // Validate required nodes before write
    if (!data.feature) data.feature = 'unknown_feature';

    // Ensure numeric fields are actually numbers to avoid Firestore silent rejection
    const sanitizedData = {
      ...data,
      inputTokens: typeof data.inputTokens === 'number' ? data.inputTokens : 0,
      outputTokens: typeof data.outputTokens === 'number' ? data.outputTokens : 0,
      characterCount: typeof data.characterCount === 'number' ? data.characterCount : 0,
      timestamp: serverTimestamp()
    };
    
    console.log(`[UsageLogger] ATTEMPTING WRITE: feature=${data.feature}, model=${data.model}, userId=${data.userId}`);
    console.log(`[UsageLogger] PAYLOAD: ${JSON.stringify(sanitizedData)}`);
    
    const docRef = await addDoc(collection(firestore, 'usage_logs'), sanitizedData);
    
    console.log(`[UsageLogger] WRITE SUCCESS: ID=${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[UsageLogger] CRITICAL FAULT - Firestore write failed:', error);
    console.error('[UsageLogger] ERROR DETAILS:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    throw error;
  }
}
