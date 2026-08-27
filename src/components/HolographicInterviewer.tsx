'use client';

import React, { useEffect, useState, useRef } from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - AI Interviewer Presence using browser-native Speech Synthesis.
 * Optimized for en-IN locale with reactive word-boundary pulsing and session telemetry support.
 */

interface HolographicInterviewerProps {
  className?: string;
  isSpeaking?: boolean;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
  stage?: string;
  sessionId?: string;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

export default function HolographicInterviewer({
  className,
  isSpeaking = false,
  isGenerating = false,
  currentQuestion,
  onSpeechEnd,
  stage,
  sessionId,
  currentQuestionIndex,
  totalQuestions
}: HolographicInterviewerProps) {
  const [pulse, setPulse] = useState(false);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync callback ref to avoid effect re-triggering on parent re-renders
  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    if (!currentQuestion || !isSpeaking || typeof window === 'undefined') {
      window.speechSynthesis?.cancel();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      setPulse(false);
      return;
    }

    const synth = window.speechSynthesis;

    const speak = () => {
      // 1. Cancel previous speech
      synth.cancel();

      // 2. Small delay to ensure synth is ready (Chrome specific bug fix)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(currentQuestion);
        
        // 3. Voice selection logic
        const voices = synth.getVoices();
        const preferredVoice = 
          voices.find(v => v.lang === 'en-IN') ||
          voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Neural'))) ||
          voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.lang = 'en-IN';
        utterance.rate = 1.05;
        utterance.pitch = 1;

        // 4. Reactive visual feedback
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            setPulse(true);
            if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
            pulseTimeoutRef.current = setTimeout(() => setPulse(false), 150);
          }
        };

        utterance.onend = () => {
          setPulse(false);
          onSpeechEndRef.current?.();
        };

        utterance.onerror = (err) => {
          console.error('[Vocal Matrix] Synthesis Error:', err);
          setPulse(false);
          onSpeechEndRef.current?.();
        };

        // 5. Trigger vocalization
        synth.speak(utterance);
      }, 50);
    };

    // Handle async voice loading
    if (synth.getVoices().length === 0) {
      synth.addEventListener('voiceschanged', speak, { once: true });
    } else {
      speak();
    }

    return () => {
      synth.cancel();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      synth.removeEventListener('voiceschanged', speak);
    };
  }, [currentQuestion, isSpeaking]);

  return (
    <div className={cn("h-full w-full", className)}>
      <CandidateHologram
        active={true}
        speaking={isSpeaking}
        pulse={pulse}
        isLoader={isGenerating}
        stage={stage}
        sessionId={sessionId}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        className="w-full h-full"
      />
    </div>
  );
}
