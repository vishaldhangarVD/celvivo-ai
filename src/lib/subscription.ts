/**
 * @fileOverview Nexvoro AI Central Subscription Intelligence.
 * Unified logic for determining user access levels and feature availability.
 */

export type UserPlan = 'free' | 'pro' | 'premium';

export interface UserProfileSubscription {
  plan?: UserPlan;
  subscriptionStatus?: string;
  freeJourneyUsed?: boolean;
  subscriptionEnd?: any;
  isFreeAccess?: boolean; // Secure override flag
}

/**
 * Checks if the user is authorized to initialize a new interview journey.
 * Protocol: 
 * - Free Access Override: Highest priority, grants unlimited access.
 * - Pro/Premium: Unlimited access if active.
 * - Free: One complete journey only.
 */
export function canStartInterviewJourney(profile: UserProfileSubscription | null | undefined): boolean {
  if (!profile) return true; // Fail-open during profile initialization to avoid race conditions

  // 1. FREE ACCESS OVERRIDE (PRIORITY 0)
  if (profile.isFreeAccess === true) {
    return true;
  }

  const plan = profile.plan || 'free';
  const status = profile.subscriptionStatus || 'active';
  const used = profile.freeJourneyUsed || false;

  // 2. ELITE TIERS (PRIORITY 1)
  if (plan === 'pro' || plan === 'premium') {
    return status === 'active';
  }

  // 3. BASE TIER (PRIORITY 2)
  if (plan === 'free') {
    return !used;
  }

  return false;
}

export function isPro(profile: UserProfileSubscription | null | undefined): boolean {
  if (profile?.isFreeAccess === true) return true;
  return profile?.plan === 'pro' || profile?.plan === 'premium';
}

export function isPremium(profile: UserProfileSubscription | null | undefined): boolean {
  if (profile?.isFreeAccess === true) return true;
  return profile?.plan === 'premium';
}

export function isFreeTrialAvailable(profile: UserProfileSubscription | null | undefined): boolean {
  if (profile?.isFreeAccess === true) return false;
  return profile?.plan === 'free' && !profile?.freeJourneyUsed;
}
