
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
}

const QUOTAS = {
  starter: { aptitude: 15, coding: 10, interview: 10 },
  pro: { aptitude: Infinity, coding: Infinity, interview: Infinity }
};

/**
 * Validates if a user can start a specific feature session.
 */
export function canStartFeature(profile: UserProfileAccess | null | undefined, feature: FeatureType): boolean {
  if (!profile) return false;
  if (profile.isFreeAccess) return true;

  const sub = profile.subscription;
  const credits = profile.credits || { aptitude: 0, coding: 0, interview: 0 };

  // 1. Check Pro (Unlimited)
  if (sub?.plan === 'pro' && sub.status === 'active') return true;

  // 2. Check Starter Quota
  if (sub?.plan === 'starter' && sub.status === 'active') {
    const quota = QUOTAS.starter[feature];
    const used = sub.usage?.[feature] || 0;
    if (used < quota) return true;
  }

  // 3. Check One-Time Credits
  if (credits[feature] > 0) return true;

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
  const sub = profile.subscription;

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
  if ((profile.credits?.[feature] || 0) > 0) {
    await updateDoc(userRef, {
      [`credits.${feature}`]: increment(-1)
    });
  }
}

/**
 * Checks if usage reset is required (Monthly reset protocol).
 */
export async function checkAndResetUsage(db: Firestore, userId: string, profile: UserProfileAccess) {
  if (!profile.subscription?.nextResetDate || profile.subscription.status !== 'active') return;

  const resetDate = new Date(profile.subscription.nextResetDate.seconds * 1000);
  if (new Date() >= resetDate) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await updateDoc(doc(db, 'users', userId), {
      'subscription.usage': { aptitude: 0, coding: 0, interview: 0 },
      'subscription.nextResetDate': nextMonth
    });
  }
}
