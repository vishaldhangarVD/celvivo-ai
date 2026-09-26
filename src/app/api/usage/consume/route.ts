import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @fileOverview Access-control gate.
 * Called before any feature use (aptitude, interview, coding, specialHR, resumeBuilder).
 * Order of checks: active subscription (with plan limits) -> free-quota (once) -> credits.
 * 'coding' and 'specialHR' never get a free-quota.
 */

const FREE_ELIGIBLE = ['aptitude', 'interview', 'resumeBuilder'];

const PLAN_LIMITS: Record<string, Record<string, number | 'unlimited'>> = {
  starter: { aptitude: 15, coding: 10, interview: 10, specialHR: 5, resumeBuilder: 'unlimited' },
  pro: { aptitude: 'unlimited', coding: 'unlimited', interview: 'unlimited', specialHR: 'unlimited', resumeBuilder: 'unlimited' },
};

export async function POST(req: Request) {
  try {
    const { userId, feature } = await req.json();

    if (!userId || !feature) {
      return NextResponse.json({ allowed: false, error: 'userId and feature are required' }, { status: 400 });
    }
    if (!['aptitude', 'interview', 'coding', 'specialHR', 'resumeBuilder'].includes(feature)) {
      return NextResponse.json({ allowed: false, error: 'Unknown feature' }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.exists ? snap.data()! : {};

      // 1. Active subscription check
      const sub = data.subscription;
      if (sub?.status === 'active' && (sub.plan === 'starter' || sub.plan === 'pro')) {
        const limit = PLAN_LIMITS[sub.plan][feature];
        const used = sub.usage?.[feature] || 0;

        if (limit === 'unlimited' || used < limit) {
          tx.set(userRef, { subscription: { usage: { [feature]: FieldValue.increment(1) } } }, { merge: true });
          return { allowed: true, via: 'subscription' };
        }
        // subscription exists but this feature's quota for the cycle is used up —
        // fall through to credits (no free-quota once subscribed)
      }

      // 2. Free-quota (only for eligible features, only once ever)
      if (FREE_ELIGIBLE.includes(feature) && !data.freeUsage?.[feature]) {
        tx.set(userRef, { freeUsage: { [feature]: true } }, { merge: true });
        return { allowed: true, via: 'free' };
      }

      // 3. One-time credits
      const creditCount = data.credits?.[feature] || 0;
      if (creditCount > 0) {
        tx.set(userRef, { credits: { [feature]: FieldValue.increment(-1) } }, { merge: true });
        return { allowed: true, via: 'credit' };
      }

      return { allowed: false };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Usage Consume] Error:', error);
    return NextResponse.json({ allowed: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
