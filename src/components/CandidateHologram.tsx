'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  pulse?: boolean;
  className?: string;
  isLoader?: boolean;
  stage?: string;
  sessionId?: string;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

/**
 * @fileOverview CandidateHologram - Technical HUD Interface.
 * Features rotating rings, segmented arcs, scanning lines, stage-based color themes, and branded "N" core.
 * Enhanced with real session telemetry: Session ID, Stage Tracking, and Question Progression.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  pulse = false,
  className = '', 
  isLoader = false,
  stage,
  sessionId,
  currentQuestionIndex,
  totalQuestions
}: CandidateHologramProps) {
  const [litSegments, setLitSegments] = useState<boolean[]>(new Array(12).fill(false));
  const [rayFlicker, setRayFlicker] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Derive display values from real props
  const displaySid = useMemo(() => {
    if (!sessionId) return null;
    return `SID:${sessionId.slice(-6).toUpperCase()}`;
  }, [sessionId]);

  const displayStage = useMemo(() => {
    if (!stage) return "STAGE::NULL";
    return `STAGE::${stage.toUpperCase().replace(/\s+/g, '_')}`;
  }, [stage]);

  const displayProgress = useMemo(() => {
    if (isLoader) return "Synchronizing Neural Link";
    if (currentQuestionIndex !== undefined && totalQuestions !== undefined) {
      return `QUESTION ${currentQuestionIndex} OF ${totalQuestions}`;
    }
    return "AI Interview System Active";
  }, [isLoader, currentQuestionIndex, totalQuestions]);

  // Set mounted state for boot animation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine theme color based on interview stage
  const themeColor = useMemo(() => {
    if (!stage) return '#22d3ee'; // Default Cyan
    const s = stage.toUpperCase();
    if (s.includes('TECH') || s.includes('RAPID')) return '#a855f7'; // Purple
    if (s.includes('BEHAV') || s.includes('SCENARIO') || s.includes('FOLLOW')) return '#f59e0b'; // Amber
    return '#22d3ee'; // Default Cyan
  }, [stage]);

  // Helper to round coordinates to prevent hydration mismatches
  const round = (num: number) => Math.round(num * 100) / 100;

  // Drive arc bursts when speaking
  useEffect(() => {
    let arcInterval: NodeJS.Timeout;

    if (speaking) {
      arcInterval = setInterval(() => {
        const newSegments = new Array(12).fill(false).map(() => Math.random() > 0.5);
        setLitSegments(newSegments);
        setRayFlicker(Math.random() > 0.3);
      }, 90);
    } else {
      setLitSegments(new Array(12).fill(false));
      setRayFlicker(false);
    }

    return () => {
      clearInterval(arcInterval);
    };
  }, [speaking]);

  if (!active) return null;

  return (
    <div className={cn(
      "relative w-full h-full bg-[#050816] flex flex-col items-center rounded-[2rem] border border-white/5 overflow-hidden",
      className
    )}>
      {/* Hex Grid Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
      
      {/* Background patterns and Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />
      <div className="absolute inset-0 pointer-events-none w-full h-[2px] opacity-40 shadow-[0_0_15px_#fff] animate-scanline z-20" style={{ backgroundColor: themeColor }} />

      {/* Targeting Brackets */}
      <div className="absolute top-12 left-12 pointer-events-none border-l border-t w-8 h-8 rounded-tl-xl transition-colors duration-700" style={{ borderColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)' }} />
      <div className="absolute top-12 right-12 pointer-events-none border-r border-t w-8 h-8 rounded-tr-xl transition-colors duration-700" style={{ borderColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)' }} />
      <div className="absolute bottom-12 left-12 pointer-events-none border-l border-b w-8 h-8 rounded-bl-xl transition-colors duration-700" style={{ borderColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)' }} />
      <div className="absolute bottom-12 right-12 pointer-events-none border-r border-b w-8 h-8 rounded-br-xl transition-colors duration-700" style={{ borderColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)' }} />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4">
        
        {/* HUD Graphics Container */}
        <div className="relative flex items-center justify-center w-72 h-72 shrink-0">
          
          <div 
            className={cn(
              "absolute inset-0 rounded-full blur-3xl transition-all duration-700",
              speaking ? "opacity-30 scale-125" : "opacity-5 scale-100"
            )} 
            style={{ backgroundColor: themeColor }}
          />

          {/* HUD Rings (SVG) */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 200">
            {/* Outer Tick Ring */}
            <g 
              style={{ transformOrigin: '100px 100px', color: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)' }}
              className={cn("transition-all duration-700 animate-rotate-slow")}
            >
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" />
              {[...Array(36)].map((_, i) => (
                <line key={i} x1="100" y1="5" x2="100" y2="10" stroke="currentColor" strokeWidth="1" transform={`rotate(${i * 10}, 100, 100)`} />
              ))}
            </g>

            {/* Mid Segmented Arc Ring */}
            <g 
              style={{ transformOrigin: '100px 100px' }}
              className="animate-rotate-counter"
            >
              {[...Array(12)].map((_, i) => {
                const x1 = round(100 + 80 * Math.cos((i * 30 * Math.PI) / 180));
                const y1 = round(100 + 80 * Math.sin((i * 30 * Math.PI) / 180));
                const x2 = round(100 + 80 * Math.cos(((i * 30 + 20) * Math.PI) / 180));
                const y2 = round(100 + 80 * Math.sin(((i * 30 + 20) * Math.PI) / 180));
                
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={litSegments[i] ? themeColor : "rgba(255, 255, 255, 0.05)"}
                    strokeWidth="3"
                    className="transition-colors duration-150"
                    style={{ filter: litSegments[i] ? `drop-shadow(0 0 5px ${themeColor})` : 'none', opacity: litSegments[i] ? 0.8 : 1 }}
                  />
                );
              })}
            </g>

            {/* Inner HUD Data Ring */}
            <circle 
              cx="100" cy="100" r="60" 
              fill="none" 
              stroke={speaking ? themeColor : "rgba(255, 255, 255, 0.05)"} 
              strokeWidth="1" 
              strokeDasharray="10 5" 
              style={{ transformOrigin: '100px 100px', opacity: speaking ? 0.3 : 0.1 }}
              className="animate-rotate-fast transition-all duration-700" 
            />
          </svg>

          {/* Central Wireframe polygon */}
          <div className={cn(
            "relative w-24 h-24 flex items-center justify-center transition-all duration-300",
            speaking ? "scale-110" : "scale-100",
            pulse && "scale-125 brightness-150",
            isMounted ? "animate-boot-signature" : "opacity-0 scale-0"
          )}>
            {/* Hexagon Outline SVG */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
              <polygon 
                points="50,5 90,27 90,73 50,95 10,73 10,27" 
                fill="none" 
                stroke={speaking ? themeColor : 'rgba(255,255,255,0.2)'} 
                strokeWidth="2" 
                style={{ 
                  filter: speaking ? `drop-shadow(0 0 8px ${themeColor})` : 'none', 
                  transformOrigin: '50px 50px' 
                }} 
                className="animate-rotate-counter transition-all duration-700" 
              />
              
              {/* Brand Seal Ring (Interior) */}
              <circle 
                cx="50" cy="50" r="18" 
                fill="none" 
                stroke="#F5D061" 
                strokeWidth="0.5" 
                strokeDasharray="1 3" 
                style={{ transformOrigin: '50px 50px', opacity: 0.4 }}
                className="animate-rotate-slow" 
              />

              {/* Speaking Rays (Triggered when AI is active) */}
              {speaking && rayFlicker && [...Array(6)].map((_, i) => (
                <line 
                  key={i}
                  x1="50" y1="35" x2="50" y2="30"
                  stroke="#F5D061"
                  strokeWidth="1"
                  style={{ transformOrigin: '50px 50px', opacity: 0.8 }}
                  transform={`rotate(${i * 60}, 50, 50)`}
                />
              ))}
            </svg>
            
            {/* Branded Core Initial - Fixed Gold Color */}
            <div className={cn(
              "relative z-10 flex items-center justify-center font-headline font-black text-2xl transition-all duration-300 select-none",
              speaking ? "animate-pulse scale-110" : "animate-breathing-glow scale-100"
            )} style={{ 
              color: '#F5D061', // Fixed Premium Gold Brand Color
              textShadow: speaking 
                ? '0 0 20px rgba(245, 208, 97, 0.8), 0 0 10px rgba(245, 208, 97, 0.4), 0 0 5px rgba(255, 255, 255, 0.3)' 
                : '0 0 5px rgba(245, 208, 97, 0.2)'
            }}>
              N
            </div>

            {/* Readout Nodes */}
            <div className="absolute -top-12 text-[8px] font-black tracking-widest flex flex-col items-center transition-all duration-700" style={{ color: speaking ? themeColor : 'rgba(255, 255, 255, 0.2)' }}>
              <span>{isLoader ? "SYNC" : (speaking ? "TRANSMITTING" : "STANDBY")}</span>
              <div className="w-px h-6 mt-1 transition-all duration-700" style={{ backgroundColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)', opacity: speaking ? 0.4 : 0.2 }} />
            </div>

            {/* Etched Brand Name below hexagon */}
            <div className="absolute -bottom-8 text-[7px] font-bold tracking-[0.6em] text-white/20 uppercase select-none">
              NEXVOROAI
            </div>
          </div>

          {/* Orbitting Satellites */}
          <div className="absolute inset-0 animate-rotate-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-700" style={{ backgroundColor: speaking ? themeColor : 'rgba(255, 255, 255, 0.2)', boxShadow: speaking ? `0 0 8px ${themeColor}` : 'none' }} />
          </div>
        </div>
        
        {/* Technical Readout Labels */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black tracking-[0.2em] transition-all duration-700" style={{ color: speaking ? themeColor : 'rgba(255, 255, 255, 0.1)', opacity: speaking ? 0.6 : 0.3 }}>
                {displaySid}
              </span>
              <div className="w-1 h-1 rounded-full transition-all duration-700" style={{ backgroundColor: themeColor, opacity: speaking ? 0.6 : 0.1 }} />
              <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
                {displayStage}
              </span>
            </div>
            
            {/* Animated Waveform Strip */}
            <div className="flex justify-center gap-1 h-3 items-end overflow-hidden w-32 mx-auto">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: speaking ? [4, Math.random() * 12 + 4, 4] : 2 }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
                  className={cn("w-1 rounded-t-sm transition-colors duration-700")}
                  style={{ backgroundColor: themeColor, opacity: speaking ? 0.6 : 0.1 }}
                />
              ))}
            </div>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 animate-pulse">
            {displayProgress}
          </p>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="w-full p-6 flex justify-between items-center opacity-20 relative z-10 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white">Encrypted Node</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white">Status: Ready</span>
      </div>

      <style jsx>{`
        @keyframes rotate-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-counter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes scanline {
          0% { top: -2%; opacity: 0; }
          5% { opacity: 0.5; }
          95% { opacity: 0.5; }
          100% { top: 102%; opacity: 0; }
        }
        @keyframes breathing-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(245, 208, 97, 0.4)); opacity: 0.7; }
          50% { filter: drop-shadow(0 0 15px rgba(245, 208, 97, 0.7)); opacity: 1; }
        }
        @keyframes boot-signature {
          0% { transform: scale(0); opacity: 0; filter: blur(10px); }
          70% { transform: scale(1.15); opacity: 0.8; filter: blur(0px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        .animate-rotate-slow {
          animation: rotate-clockwise 20s linear infinite;
        }
        .animate-rotate-fast {
          animation: rotate-clockwise 10s linear infinite;
        }
        .animate-rotate-counter {
          animation: rotate-counter 15s linear infinite;
        }
        .animate-scanline {
          animation: scanline 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-breathing-glow {
          animation: breathing-glow 3s ease-in-out infinite;
        }
        .animate-boot-signature {
          animation: boot-signature 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
