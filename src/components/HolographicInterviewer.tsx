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
   * 
   * We calculate an estimated duration based on the question length to ensure
   * the visual "speaking" state behaves realistically.
   */
  useEffect(() => {
    if (currentQuestion && onSpeechEnd) {
      const wordCount = currentQuestion.trim().split(/\s+/).length;
      // Estimate duration: ~150 words per minute (2.5 words per sec)
      // Clamped between 1.5s and 8s for visual realism
      const estimatedMs = Math.min(Math.max((wordCount / 2.5) * 1000, 1500), 8000);

      const timer = setTimeout(() => {
        onSpeechEnd();
      }, estimatedMs);
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
