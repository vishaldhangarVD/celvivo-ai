'use client';

import React, { useState, useEffect, useRef } from 'react';
import CandidateHologram from './CandidateHologram';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview HolographicInterviewer - Audio and Visual Synchronization Hub.
 * Manages TTS triggers and communicates state to the Hologram.
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
  const { toast } = useToast();
  const [internalSpeaking, setInternalSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProcessedQuestion = useRef<string | null>(null);

  useEffect(() => {
    if (!currentQuestion || isGenerating || currentQuestion === lastProcessedQuestion.current) return;

    const playSpeech = async () => {
      try {
        lastProcessedQuestion.current = currentQuestion;
        setInternalSpeaking(true);
        
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentQuestion }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ details: 'Internal gateway error.' }));
          throw new Error(err.details || 'TTS Handshake Failed');
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          audioRef.current.onended = () => {
            setInternalSpeaking(false);
            if (onSpeechEnd) onSpeechEnd();
            URL.revokeObjectURL(url);
          };
        }
      } catch (error: any) {
        console.error("[TTS Error]", error);
        setInternalSpeaking(false);
        toast({
          variant: "destructive",
          title: "Vocal Matrix Offline",
          description: error.message
        });
      }
    };

    playSpeech();
  }, [currentQuestion, isGenerating, onSpeechEnd, toast]);

  return (
    <div className={cn("h-full w-full", className)}>
      <audio ref={audioRef} className="hidden" />
      <CandidateHologram 
        active={true}
        speaking={internalSpeaking || isSpeakingProp}
        isLoader={isGenerating}
        className="w-full h-full"
      />
    </div>
  );
}
