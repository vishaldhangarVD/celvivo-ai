'use client';

import React, { useEffect, useRef } from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - Visual Synchronization Hub.
 * Manages holographic states for the interviewer avatar.
 * 
 * NOTE: Automated TTS vocalization is disabled to prevent unauthenticated API errors.
 * Questions are handled silently without making external API requests.
 */

export default function HolographicInterviewer({ 
  className,
  isSpeaking: isSpeakingProp = false,
  isGenerating = false,
  currentQuestion,
  onSpeechEnd 
}: { 
  className?: string;
  isSpeaking?: boolean;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProcessedQuestion = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no question, if initializing, or if question already processed
    if (!currentQuestion || isGenerating || currentQuestion === lastProcessedQuestion.current) return;

    // Mark current question as processed to avoid re-triggering logic
    lastProcessedQuestion.current = currentQuestion;
    
    // Silent mode: skip TTS API requests entirely to prevent 401 unauthenticated errors.
    // Trigger the speech completion callback immediately so the parent state remains synchronized.
    if (onSpeechEnd) {
      onSpeechEnd();
    }
  }, [currentQuestion, isGenerating, onSpeechEnd]);

  return (
    <div className={cn("h-full w-full", className)}>
      <audio ref={audioRef} className="hidden" />
      <CandidateHologram 
        active={true}
        speaking={isSpeakingProp}
        isLoader={isGenerating}
        className="w-full h-full"
      />
    </div>
  );
}
