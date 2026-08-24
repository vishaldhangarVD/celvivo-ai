/**
 * @fileOverview Standardized stage constants for the Nexvoro AI Interview Journey.
 * These values are used as the single source of truth in Firestore.
 */

export const INTERVIEW_STAGES = {
  RESUME: 'RESUME',
  APTITUDE: 'APTITUDE',
  CODING: 'CODING',
  HR_INTERVIEW: 'HR_INTERVIEW',
  COMPLETED: 'COMPLETED',
} as const;

export type InterviewStage = keyof typeof INTERVIEW_STAGES;

export const STAGE_ROUTES: Record<InterviewStage, string> = {
  RESUME: '/resume-upload',
  APTITUDE: '/interview/aptitude',
  CODING: '/interview/coding',
  HR_INTERVIEW: '/interview/', // Appends sessionId
  COMPLETED: '/dashboard',
};
