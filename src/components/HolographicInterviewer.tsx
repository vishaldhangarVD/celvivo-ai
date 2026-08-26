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
  const voicesChangedListenerRef = useRef<(() => void) | null>(null);
  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Setup the utterance first
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0; 
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
    function speakWithVoice() {
      const vList = synth.getVoices();

      // Browsers often load voices asynchronously. If empty, wait for the event.
      if (vList.length === 0) {
        const handleVoicesChanged = () => {
          synth.removeEventListener('voiceschanged', handleVoicesChanged);
          voicesChangedListenerRef.current = null;
          speakWithVoice();
        };
        voicesChangedListenerRef.current = handleVoicesChanged;
        synth.addEventListener('voiceschanged', handleVoicesChanged);
        return;
      }

      // Priority logic:
      // 1. Any en-IN voice (Microsoft Heera, Ravi, Google India, etc.)
      // 2. Any English voice with "Google" or "Neural"
      // 3. Any fallback English voice
      const preferredVoice = 
        vList.find(v => v.lang === 'en-IN') ||
        vList.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Neural'))) ||
        vList.find(v => v.lang.startsWith('en'));

      console.log(`[TTS] Selected Voice: ${preferredVoice?.name || 'System Default'} (${preferredVoice?.lang || 'N/A'})`);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }

      // Chrome bug workaround: cancel() and speak() in same tick can cause silence.
      // Small delay ensures previous context is cleared.
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      speakTimerRef.current = setTimeout(() => {
        synth.speak(utterance);
      }, 50);
    }

    // Start playback cycle
    synth.cancel();
    speakWithVoice();

    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      if (voicesChangedListenerRef.current) {
        synth.removeEventListener('voiceschanged', voicesChangedListenerRef.current);
      }
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
