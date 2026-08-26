'use client';

import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - Static Identity Placeholder.
 * Replaced WebGL particle system with a stable, high-fidelity UI representation
 * to eliminate hardware-specific rendering errors.
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
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className={cn(
          "w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500",
          speaking && "border-accent/40 bg-accent/5 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-105"
        )}>
          <User className={cn("w-12 h-12 text-white/20 transition-colors", speaking && "text-accent")} />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
            {isLoader ? "Synchronizing Neural Link" : "AI Interface Active"}
          </p>
          {speaking && (
            <div className="flex justify-center gap-1.5 h-4 items-center">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className="w-1 bg-accent/60 rounded-full animate-bounce" 
                  style={{ 
                    height: `${40 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
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
    </div>
  );
}
