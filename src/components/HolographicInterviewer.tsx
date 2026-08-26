'use client';

import React, { useEffect } from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - Simplified AI Interviewer Presence.
 * Vocalization/TTS is completely disabled to prevent authentication errors.
 * No network requests are made for speech generation.
 */

interface HolographicInterviewerProps {
  className?: string;
  isSpeaking?: boolean;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
}

export default function HolographicInterviewer({ 
  className,
  isSpeaking = false,
  isGenerating = false,
  currentQuestion,
  onSpeechEnd,
}: HolographicInterviewerProps) {
  
  /**
   * TTS Logic is intentionally disabled.
   * We skip calling the TTS API entirely to avoid 401 Unauthenticated errors
   * and potential quota issues. Speech playback is skipped silently.
   */
  useEffect(() => {
    if (currentQuestion && onSpeechEnd) {
      // Signal completion of "speech" immediately without network activity.
      const timer = setTimeout(() => {
        onSpeechEnd();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, onSpeechEnd]);

  return (
    <div className={cn("h-full w-full", className)}>
      <CandidateHologram 
        active={true}
        speaking={isSpeaking}
        isLoader={isGenerating}
        className="w-full h-full"
      />
    </div>
  );
}
