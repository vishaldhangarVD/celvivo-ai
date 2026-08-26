'use client';

import React, { useEffect, useState, useRef } from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - AI Interviewer Presence with browser-native TTS.
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
  const [pulse, setPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSpeechEndRef = useRef(onSpeechEnd);

  // Store the latest callback in a ref to avoid dependency re-renders
  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guard for Speech Synthesis API
    if (!('speechSynthesis' in window)) {
      if (currentQuestion && isSpeaking) {
        const wordCount = currentQuestion.trim().split(/\s+/).length;
        const estimatedMs = Math.min(Math.max((wordCount / 2.5) * 1000, 1500), 8000);
        const timer = setTimeout(() => onSpeechEndRef.current?.(), estimatedMs);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (!currentQuestion || !isSpeaking) return;

    const synth = window.speechSynthesis;
    
    // Cancel existing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = 'en-US';
    utterance.rate = 1.05; // Slightly faster for a professional feel
    utterance.pitch = 1;

    // Try to find a high-quality English voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Neural')) && v.lang.startsWith('en')) 
                         || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onSpeechEndRef.current?.();
    };

    utterance.onerror = () => {
      onSpeechEndRef.current?.();
    };

    // React visually to word boundaries
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setPulse(true);
        if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = setTimeout(() => setPulse(false), 150);
      }
    };

    // Chrome bug workaround: cancel() and speak() in same tick can cause silence.
    // Small delay ensures previous context is cleared.
    const speakTimer = setTimeout(() => {
      synth.speak(utterance);
    }, 50);

    return () => {
      clearTimeout(speakTimer);
      synth.cancel();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [currentQuestion, isSpeaking]); // Removed onSpeechEnd from deps

  return (
    <div className={cn("h-full w-full", className)}>
      <CandidateHologram 
        active={true}
        speaking={isSpeaking}
        pulse={pulse}
        isLoader={isGenerating}
        className="w-full h-full"
      />
    </div>
  );
}
