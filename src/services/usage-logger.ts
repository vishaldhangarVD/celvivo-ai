'use server';

import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

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
    
    await addDoc(collection(firestore, 'usage_logs'), {
      ...data,
      timestamp: serverTimestamp()
    });
    
    console.log(`[UsageLogger] Successfully archived telemetry for: ${data.feature}`);
  } catch (error) {
    // Avoid circular logging of logging errors
    console.error('[UsageLogger] Failed to record usage node:', error);
  }
}

/**
 * Aggregates logs for a specific timeframe.
 */
export async function getUsageLogs(days = 30) {
  const { firestore } = initializeFirebase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const q = query(
    collection(firestore, 'usage_logs'),
    where('timestamp', '>=', Timestamp.fromDate(cutoff)),
    orderBy('timestamp', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: (doc.data().timestamp as Timestamp)?.toDate()
  }));
}
