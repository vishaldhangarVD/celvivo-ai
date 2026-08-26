'use client';

import React from 'react';
import CandidateHologram from './CandidateHologram';
import { cn } from '@/lib/utils';

/**
 * @fileOverview HolographicInterviewer - Simplified AI Interviewer Presence.
 * Replaces the 3D WebGL hologram with a stable placeholder UI.
 */

export default function HolographicInterviewer({ 
  className,
  isSpeaking = false,
  isGenerating = false,
}: { 
  className?: string;
  isSpeaking?: boolean;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
}) {
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
