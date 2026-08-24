
'use client';

/**
 * @fileOverview Legacy D-ID Agent Manager (Purged).
 * The project has migrated to the official D-ID Embed v2 at /special-hr-interview.
 * This component is retained as an empty shell for backward compatibility during route transition.
 */

export function useDIDAgent() {
  return { 
    isReady: false, 
    speak: (text: string) => console.warn("Legacy Agent API called. Use official D-ID Embed at /special-hr-interview.") 
  };
}
