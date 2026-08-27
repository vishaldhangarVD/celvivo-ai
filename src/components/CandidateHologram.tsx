'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  pulse?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - Technical HUD Interface.
 * Features rotating rings, segmented arcs, scanning lines, and hex readouts.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  pulse = false,
  className = '', 
  isLoader = false 
}: CandidateHologramProps) {
  const [hexCode, setHexCode] = useState('0x0000');
  const [litSegments, setLitSegments] = useState<boolean[]>(new Array(12).fill(false));

  // Helper to round coordinates to prevent hydration mismatches
  const round = (num: number) => Math.round(num * 100) / 100;

  // Drive hex readout and arc bursts when speaking
  useEffect(() => {
    let hexInterval: NodeJS.Timeout;
    let arcInterval: NodeJS.Timeout;

    if (speaking) {
      hexInterval = setInterval(() => {
        const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        setHexCode(`0x${randomHex}`);
      }, 150);

      arcInterval = setInterval(() => {
        const newSegments = new Array(12).fill(false).map(() => Math.random() > 0.5);
        setLitSegments(newSegments);
      }, 90);
    } else {
      setHexCode('0x7F00');
      setLitSegments(new Array(12).fill(false));
    }

    return () => {
      clearInterval(hexInterval);
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
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.15) 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
      
      {/* Background patterns and Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />
      <div className="absolute inset-0 pointer-events-none w-full h-[2px] bg-accent/20 shadow-[0_0_15px_#22d3ee] animate-scanline z-20" />

      {/* Targeting Brackets */}
      <div className="absolute top-12 left-12 pointer-events-none border-l border-t border-accent/20 w-8 h-8 rounded-tl-xl" />
      <div className="absolute top-12 right-12 pointer-events-none border-r border-t border-accent/20 w-8 h-8 rounded-tr-xl" />
      <div className="absolute bottom-12 left-12 pointer-events-none border-l border-b border-accent/20 w-8 h-8 rounded-bl-xl" />
      <div className="absolute bottom-12 right-12 pointer-events-none border-r border-b border-accent/20 w-8 h-8 rounded-br-xl" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4">
        
        {/* HUD Graphics Container */}
        <div className="relative flex items-center justify-center w-72 h-72 shrink-0">
          
          <div className={cn(
            "absolute inset-0 rounded-full bg-accent/5 blur-3xl transition-all duration-700",
            speaking ? "opacity-40 scale-125" : "opacity-10 scale-100"
          )} />

          {/* HUD Rings (SVG) */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 200">
            {/* Outer Tick Ring */}
            <g 
              style={{ transformOrigin: '100px 100px' }}
              className={cn("transition-all duration-500 animate-rotate-slow", speaking ? "text-accent/40" : "text-white/10")}
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
                    stroke={litSegments[i] ? "rgba(34, 211, 238, 0.8)" : "rgba(255, 255, 255, 0.05)"}
                    strokeWidth="3"
                    className="transition-colors duration-150"
                    style={{ filter: litSegments[i] ? 'drop-shadow(0 0 5px #22d3ee)' : 'none' }}
                  />
                );
              })}
            </g>

            {/* Inner HUD Data Ring */}
            <circle 
              cx="100" cy="100" r="60" 
              fill="none" 
              stroke="rgba(34, 211, 238, 0.1)" 
              strokeWidth="1" 
              strokeDasharray="10 5" 
              style={{ transformOrigin: '100px 100px' }}
              className="animate-rotate-fast" 
            />
          </svg>

          {/* Central Wireframe polygon */}
          <div className={cn(
            "relative w-24 h-24 flex items-center justify-center transition-all duration-300",
            speaking ? "scale-110" : "scale-100",
            pulse && "scale-125 brightness-150"
          )}>
            {/* Hexagon Outline SVG */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
              <polygon 
                points="50,5 90,27 90,73 50,95 10,73 10,27" 
                fill="none" 
                stroke={speaking ? '#22d3ee' : 'rgba(255,255,255,0.2)'} 
                strokeWidth="2" 
                style={{ 
                  filter: speaking ? 'drop-shadow(0 0 8px #22d3ee)' : 'none', 
                  transformOrigin: '50px 50px' 
                }} 
                className="animate-rotate-counter" 
              />
            </svg>
            
            {/* Pulsing Core */}
            <div className={cn(
              "w-4 h-4 rounded-full transition-all duration-300 relative z-10",
              speaking ? "bg-accent shadow-[0_0_20px_#22d3ee] animate-pulse" : "bg-white/10"
            )} />

            {/* Readout Nodes */}
            <div className="absolute -top-12 text-[8px] font-black tracking-widest text-accent/60 flex flex-col items-center">
              <span>{isLoader ? "SYNC" : (speaking ? "TRANSMITTING" : "STANDBY")}</span>
              <div className="w-px h-6 bg-accent/20 mt-1" />
            </div>
          </div>

          {/* Orbitting Satellites */}
          <div className="absolute inset-0 animate-rotate-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#22d3ee]" />
          </div>
        </div>
        
        {/* Technical Readout Labels */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-accent/40 tracking-[0.2em]">{hexCode}</span>
              <div className="w-1 h-1 rounded-full bg-accent/40" />
              <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
                {isLoader ? "Neural Sync" : (speaking ? "SYS.ACTIVE" : "SYS.NOMINAL")}
              </span>
            </div>
            
            {/* Animated Waveform Strip */}
            <div className="flex justify-center gap-1 h-3 items-end overflow-hidden w-32 mx-auto">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: speaking ? [4, Math.random() * 12 + 4, 4] : 2 }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
                  className={cn("w-1 bg-accent/40 rounded-t-sm", !speaking && "opacity-20")}
                />
              ))}
            </div>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 animate-pulse">
            {isLoader ? "Synchronizing Neural Link" : "Neural Interface Active"}
          </p>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="w-full p-6 flex justify-between items-center opacity-20 relative z-10 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-white">Encrypted Node</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white">Status: Optimal</span>
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
      `}</style>
    </div>
  );
}
