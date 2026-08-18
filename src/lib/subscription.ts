
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
}

/**
 * Checks if the user is authorized to initialize a new interview journey.
 * Protocol: 
 * - Pro/Premium: Unlimited access.
 * - Free: One complete journey only.
 */
export function canStartInterviewJourney(profile: UserProfileSubscription | null | undefined): boolean {
  if (!profile) return true; // Fail-open during profile initialization to avoid race conditions

  const plan = profile.plan || 'free';
  const status = profile.subscriptionStatus || 'active';
  const used = profile.freeJourneyUsed || false;

  // Elite Tiers
  if (plan === 'pro' || plan === 'premium') {
    return status === 'active';
  }

  // Base Tier
  if (plan === 'free') {
    return !used;
  }

  return false;
}

export function isPro(profile: UserProfileSubscription | null | undefined): boolean {
  return profile?.plan === 'pro' || profile?.plan === 'premium';
}

export function isPremium(profile: UserProfileSubscription | null | undefined): boolean {
  return profile?.plan === 'premium';
}

export function isFreeTrialAvailable(profile: UserProfileSubscription | null | undefined): boolean {
  return profile?.plan === 'free' && !profile?.freeJourneyUsed;
}
