
'use client';

/**
 * @fileOverview Nexvoro AI Central Subscription & Credit Intelligence.
 * Handles access gates for one-time credits and monthly subscriptions.
 */

import { doc, updateDoc, increment, getDoc, Firestore } from 'firebase/firestore';

export type FeatureType = 'aptitude' | 'coding' | 'interview';

export interface UserSubscription {
  plan: 'starter' | 'pro' | null;
  status: 'active' | 'inactive';
  nextResetDate?: any;
  usage: {
    aptitude: number;
    coding: number;
    interview: number;
  };
}

export interface UserCredits {
  aptitude: number;
  coding: number;
  interview: number;
}

export interface UserProfileAccess {
  subscription?: UserSubscription;
  credits?: UserCredits;
  isFreeAccess?: boolean;
  // Legacy support for root-level plan strings
  plan?: string; 
}

const QUOTAS = {
  starter: { aptitude: 15, coding: 10, interview: 10 },
  pro: { aptitude: Infinity, coding: Infinity, interview: Infinity }
};

/**
 * Validates if a user can start a specific feature session.
 * Priority: 
 * 1. isFreeAccess (Master Key)
 * 2. Pro Plan (Unlimited)
 * 3. Starter Plan (Monthly Quota)
 * 4. One-Time Credits
 */
export function canStartFeature(profile: UserProfileAccess | null | undefined, feature: FeatureType): boolean {
  if (!profile) return false;
  
  // 1. Master Override (Developer/Free Access)
  // This is checked FIRST to ensure legacy or trial users aren't blocked.
  if (profile.isFreeAccess === true) return true;

  const sub = profile.subscription;
  const credits = profile.credits || { aptitude: 0, coding: 0, interview: 0 };

  // 2. Check Pro (Unlimited)
  if (sub?.plan === 'pro' && sub.status === 'active') return true;

  // 3. Check Starter Quota
  if (sub?.plan === 'starter' && sub.status === 'active') {
    const quota = QUOTAS.starter[feature];
    const used = sub.usage?.[feature] || 0;
    if (used < quota) return true;
  }

  // 4. Check One-Time Credits
  if (credits && typeof (credits as any)[feature] === 'number' && (credits as any)[feature] > 0) {
    return true;
  }

  return false;
}

/**
 * Atomically consumes a credit or increments usage counter.
 */
export async function consumeFeatureCredit(db: Firestore, userId: string, feature: FeatureType) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const profile = snap.data() as UserProfileAccess;
  
  // Free access doesn't consume anything
  if (profile.isFreeAccess === true) return;

  const sub = profile.subscription;
  const credits = profile.credits;

  // Pro doesn't consume anything
  if (sub?.plan === 'pro' && sub.status === 'active') return;

  // Starter consumes quota first
  if (sub?.plan === 'starter' && sub.status === 'active') {
    const used = sub.usage?.[feature] || 0;
    if (used < QUOTAS.starter[feature]) {
      await updateDoc(userRef, {
        [`subscription.usage.${feature}`]: increment(1)
      });
      return;
    }
  }

  // Finally consume one-time credit
  if (credits && typeof (credits as any)[feature] === 'number' && (credits as any)[feature] > 0) {
    await updateDoc(userRef, {
      [`credits.${feature}`]: increment(-1)
    });
  }
}
