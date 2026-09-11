import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';

/**
 * @fileOverview Emergency Diagnostic Route for Usage Telemetry.
 * Directly queries Firestore to prove existence and structure of logs.
 */
export async function GET() {
  try {
    const { firestore } = initializeFirebase();
    const logsRef = collection(firestore, 'usage_logs');

    console.log('[Debug API] Starting global usage log interrogation...');

    // 1. Get total count
    const countSnapshot = await getCountFromServer(logsRef);
    const totalCount = countSnapshot.data().count;

    // 2. Get latest 5 documents
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);
    
    const recentLogs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Format timestamp for readability
        timestamp: data.timestamp?.toDate?.()?.toISOString() || 'NULL_OR_PENDING'
      };
    });

    return NextResponse.json({
      success: true,
      diagnostics: {
        totalCount,
        hasLogs: totalCount > 0,
        collectionPath: 'usage_logs',
        checkedAt: new Date().toISOString()
      },
      recentLogs
    });

  } catch (error: any) {
    console.error('[Debug API] Diagnostic Fault:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3)
    }, { status: 500 });
  }
}
