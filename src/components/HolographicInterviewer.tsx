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
    utterance.lang = 'en-IN';
    utterance.rate = 1.0; // Natural rate
    utterance.pitch = 1;

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

    // Voice selection and execution logic
    const handleSpeak = () => {
      const vList = synth.getVoices();
      
      // Preference: Indian English (Neural/Google) -> Indian English -> English (Neural/Google) -> English
      const preferredVoice = 
        vList.find(v => v.lang === 'en-IN' && (v.name.includes('Google') || v.name.includes('Neural'))) ||
        vList.find(v => v.lang === 'en-IN') ||
        vList.find(v => (v.name.includes('Google') || v.name.includes('Neural')) && v.lang.startsWith('en')) ||
        vList.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }
      
      synth.speak(utterance);
    };

    // Chrome bug workaround: cancel() and speak() in same tick can cause silence.
    // Small delay ensures previous context is cleared.
    const speakTimer = setTimeout(() => {
      // Browsers often load voices asynchronously
      if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', handleSpeak, { once: true });
      } else {
        handleSpeak();
      }
    }, 50);

    return () => {
      clearTimeout(speakTimer);
      synth.removeEventListener('voiceschanged', handleSpeak);
      synth.cancel();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [currentQuestion, isSpeaking]);

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
