
'use server';

import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * @fileOverview Nexvoro AI Central Usage Logging Service.
 * Provides server-side methods to record and retrieve AI API usage telemetry.
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
    
    console.log(`[UsageLogger] Attempting to write log for feature: ${data.feature}...`);
    
    const docRef = await addDoc(collection(firestore, 'usage_logs'), sanitizedData);
    
    console.log(`[UsageLogger] SUCCESS. Document ID: ${docRef.id} archived.`);
    return docRef.id;
  } catch (error) {
    console.error('[UsageLogger] CRITICAL FAULT - Write failed:', error);
    throw error;
  }
}
