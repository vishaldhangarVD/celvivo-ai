'use client';

import { useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';

const PING_EVERY_MS = 60 * 60 * 1000; // 1 hour: kiti vela Firestore madhe lihaych
const CHECK_EVERY_MS = 2 * 60 * 1000; // 2 minutes: fakt local check, bill nahi

export function ActivityTracker() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user || !db) return;
    const key = `lastActivePing:${user.uid}`;
    let busy = false;

    const ping = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      const last = Number(localStorage.getItem(key) || 0);
      if (Date.now() - last < PING_EVERY_MS) return;
      busy = true;
      try {
        await updateDoc(doc(db, 'users', user.uid), { lastActiveAt: serverTimestamp() });
        localStorage.setItem(key, String(Date.now())); // fakt success nantar
      } catch (e: any) {
        // Navin signup madhe document ajun banla nasto, 2 minute ne parat try hoil
        if (e?.code !== 'not-found') {
          console.error('[ActivityTracker] update failed:', e);
        }
      } finally {
        busy = false;
      }
    };

    ping();
    const interval = setInterval(ping, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', ping);
    };
  }, [user, db]);

  return null;
}
