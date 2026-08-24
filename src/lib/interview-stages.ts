/**
 * @fileOverview Standardized stage constants for the Nexvoro AI Interview Journey.
 * These values are used as the single source of truth in Firestore.
 */

export const INTERVIEW_STAGES = {
  RESUME_UPLOAD: 'RESUME_UPLOAD',
  RESUME_ANALYSIS: 'RESUME_ANALYSIS',
  RESUME_RESULT: 'RESUME_RESULT',
  APTITUDE: 'APTITUDE',
  APTITUDE_RESULT: 'APTITUDE_RESULT',
  CODING: 'CODING',
  CODING_RESULT: 'CODING_RESULT',
  HR_INTERVIEW: 'HR_INTERVIEW',
  FEEDBACK: 'FEEDBACK',
  COMPLETED: 'COMPLETED',
} as const;

export type InterviewStage = keyof typeof INTERVIEW_STAGES;

export const STAGE_ROUTES: Record<InterviewStage, string> = {
  RESUME_UPLOAD: '/resume-upload',
  RESUME_ANALYSIS: '/resume-analysis',
  RESUME_RESULT: '/resume-result',
  APTITUDE: '/interview/aptitude',
  APTITUDE_RESULT: '/interview/aptitude-result',
  CODING: '/interview/coding',
  CODING_RESULT: '/interview/coding-result',
  HR_INTERVIEW: '/interview/', // Appends sessionId
  FEEDBACK: '/feedback/', // Appends sessionId
  COMPLETED: '/dashboard',
};
