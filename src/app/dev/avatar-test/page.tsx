"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Box, Eye, Zap, Mic, MicOff, MessageSquare, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview AvatarTestPage - Hologram Transformation Test.
 */

const HolographicInterviewer = dynamic(() => import("@/components/HolographicInterviewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050816]">
      <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-6" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
    </div>
  )
});

export default function AvatarTestPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-16 flex flex-col items-center gap-12">
        <header className="text-center space-y-4">
          <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">
            Phase 04: Neural Hologram
          </Badge>
          <h1 className="text-6xl font-bold tracking-tighter text-premium">
            Hologram <span className="text-gradient-purple">Matrix Core.</span>
          </h1>
          <p className="text-muted-foreground font-light max-w-xl">
            Transformation of the professional identity blueprint into a high-fidelity holographic projection for elite simulations.
          </p>
        </header>

        <div className="w-full max-w-4xl aspect-[16/10] rounded-[3.5rem] overflow-hidden border border-accent/20 shadow-[0_0_100px_rgba(34,211,238,0.1)] bg-black relative group">
          <HolographicInterviewer isSpeaking={isSpeaking} />
          
          {/* Diagnostic Controls */}
          <div className="absolute top-8 right-8 z-40 flex flex-col gap-3">
            <Button 
              onClick={() => setIsSpeaking(!isSpeaking)}
              className={cn(
                "h-14 px-8 rounded-2xl flex gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                isSpeaking ? "bg-accent text-black" : "glass border-white/10 text-white/60 hover:text-white"
              )}
            >
              {isSpeaking ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {isSpeaking ? "Mute Vocal Matrix" : "Trigger Vocal Matrix"}
            </Button>
            
            <div className="glass border-white/5 p-4 rounded-2xl space-y-3">
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Diagnostic Feed</p>
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/60">FPS</span>
                    <span className="text-xs font-mono text-accent">60.0</span>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/60">LATENCY</span>
                    <span className="text-xs font-mono text-accent">12ms</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 w-full max-w-5xl">
           <div className="p-10 glass rounded-[2.5rem] border-white/5 space-y-4 group hover:bg-white/[0.03] transition-all">
             <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
               <Zap className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Visual Protocol</p>
               <p className="text-sm font-bold text-white/90 leading-tight">Neon Holographic Projection</p>
             </div>
           </div>

           <div className="p-10 glass rounded-[2.5rem] border-white/5 space-y-4 group hover:bg-white/[0.03] transition-all">
             <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Simulation</p>
               <p className="text-sm font-bold text-white/90 leading-tight">Audio-Sync Waveforms</p>
             </div>
           </div>

           <div className="p-10 glass rounded-[2.5rem] border-white/5 space-y-4 group hover:bg-white/[0.03] transition-all">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
               <MessageSquare className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Interaction</p>
               <p className="text-sm font-bold text-white/90 leading-tight">Natural Neural Gestures</p>
             </div>
           </div>

           <div className="p-10 glass rounded-[2.5rem] border-white/5 space-y-4 group hover:bg-white/[0.03] transition-all">
             <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
               <Eye className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
               <p className="text-sm font-bold text-white/90 leading-tight">Eye Contact Enabled</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
