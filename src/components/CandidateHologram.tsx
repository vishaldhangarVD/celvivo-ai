'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - Static Identity Placeholder with Animated Voice Orb.
 * Replaced static icon with a morphing, glowing orb that reacts to speaking state.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  className = '', 
  isLoader = false 
}: CandidateHologramProps) {
  if (!active) return null;

  return (
    <div className={cn(
      "relative w-full h-full bg-[#050816] flex flex-col items-center justify-center rounded-[2rem] border border-white/5 overflow-hidden",
      className
    )}>
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />
      
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Voice Orb Container */}
        <div className="relative flex items-center justify-center w-48 h-48">
          {/* Outer Pulsing Glow */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-accent/20 blur-3xl transition-all duration-700 ease-in-out",
            speaking ? "scale-150 opacity-60" : "scale-100 opacity-30"
          )} />

          {/* Morphing Blob */}
          <div 
            className={cn(
              "relative w-32 h-32 transition-all duration-500 ease-in-out shadow-[0_0_50px_rgba(34,211,238,0.3)]",
              speaking ? "scale-110" : "scale-100"
            )}
            style={{
              animation: 'morph 8s ease-in-out infinite, rotate-gradient 12s linear infinite',
              background: 'conic-gradient(from 0deg at 50% 50%, #22d3ee, #8b5cf6, #3b82f6, #22d3ee)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Bright core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-10 h-10 rounded-full bg-white blur-md transition-all duration-500",
                speaking ? "scale-125 opacity-100" : "scale-100 opacity-80"
              )} />
              <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)]" />
            </div>
          </div>

          {/* Orbiting Particles */}
          <div className="absolute w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#22d3ee]" 
               style={{ animation: 'orbit 5s linear infinite' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" 
               style={{ animation: 'orbit 8s linear infinite reverse' }} />
          <div className="absolute w-1 h-1 rounded-full bg-blue-400" 
               style={{ animation: 'orbit 12s linear infinite', animationDelay: '-2s' }} />
        </div>
        
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
            {isLoader ? "Synchronizing Neural Link" : "AI Interface Active"}
          </p>
          {speaking && (
            <div className="flex justify-center gap-1.5 h-4 items-center">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className="w-1 bg-accent/60 rounded-full animate-bounce" 
                  style={{ 
                    height: `${40 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white">Encrypted Node</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white">Status: Optimal</span>
      </div>

      <style jsx>{`
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          33% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          66% { border-radius: 50% 40% 60% 50% / 40% 70% 40% 60%; }
        }

        @keyframes rotate-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
