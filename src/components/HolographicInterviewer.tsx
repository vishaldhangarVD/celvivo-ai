'use client';

import React, { useEffect, useState, useRef } from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - AI Interviewer Presence with Gemini Neural TTS.
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
  const onSpeechEndRef = useRef(onSpeechEnd);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // Sync callback ref to avoid closure issues
  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  // Handle TTS synthesis and playback
  useEffect(() => {
    if (!currentQuestion || !isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      setPulse(false);
      return;
    }

    const synthesizeAndPlay = async () => {
      try {
        // Cleanup previous session
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
        }
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentQuestion }),
        });

        if (!response.ok) throw new Error('TTS Network Error');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        currentUrlRef.current = url;

        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
          
          // Start periodic pulse effect while audio plays
          if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 200);
          }, 450);
        }
      } catch (err) {
        console.error('[Hologram TTS] Playback failed:', err);
        // Fallback to end speech so the UI doesn't hang
        onSpeechEndRef.current?.();
      }
    };

    synthesizeAndPlay();

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
    };
  }, [currentQuestion, isSpeaking]);

  const handleEnded = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    setPulse(false);
    onSpeechEndRef.current?.();
  };

  const handleError = () => {
    console.error('[Hologram TTS] Audio element reported error');
    handleEnded();
  };

  return (
    <div className={cn("h-full w-full", className)}>
      <CandidateHologram
        active={true}
        speaking={isSpeaking}
        pulse={pulse}
        isLoader={isGenerating}
        className="w-full h-full"
      />
      <audio 
        ref={audioRef} 
        className="hidden" 
        onEnded={handleEnded} 
        onError={handleError}
        autoPlay={false}
      />
    </div>
  );
}
