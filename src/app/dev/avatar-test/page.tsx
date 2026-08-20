"use client";

import dynamic from 'next/dynamic';
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Cpu, Box, Eye } from "lucide-react";

/**
 * @fileOverview AvatarTestPage - Step 3: Mesh Verification Route.
 * Uses an Import Map to load 3D modules directly from CDN, bypassing 
 * Next.js build-time resolution errors for TalkingHead.
 */

// SSR must be disabled for components relying on browser-only import maps
const HolographicInterviewer = dynamic(() => import("@/components/HolographicInterviewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a]/50">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-accent">Preparing Arena...</p>
    </div>
  )
});

export default function AvatarTestPage() {
  return (
    <div className="min-h-screen bg-[#050816]">
      {/* 
        Import Map: Essential for browser-side resolution of CDN modules.
        Must be placed before the components that import these specifiers.
        Updated to resolve three/addons/ for internal TalkingHead dependencies.
      */}
      <script
        type="importmap"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            imports: {
              "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
              "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/",
              "talkinghead": "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.7/modules/talkinghead.mjs"
            }
          })
        }}
      />
      
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-16 flex flex-col items-center gap-12">
        <header className="text-center space-y-4">
          <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
            Step 3: Mesh Verification
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium">
            Julia <span className="text-gradient-purple">3D Engine.</span>
          </h1>
          <p className="text-muted-foreground font-light max-w-xl">
            Verifying GPU rendering and mesh integrity via CDN module protocol.
          </p>
        </header>

        <div className="w-full max-w-3xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-[#0b0e1a] relative group">
          <div className="absolute top-6 left-6 z-10 flex gap-2">
            <div className="px-3 py-1 glass rounded-lg border-green-500/20 text-green-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest">Protocol Live</span>
            </div>
          </div>
          
          <HolographicInterviewer />
        </div>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
           <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
               <Cpu className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Architecture</p>
               <p className="text-sm font-bold text-white/90">Browser Import Map</p>
             </div>
           </div>

           <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
               <Box className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Source</p>
               <p className="text-sm font-bold text-white/90">CDN mjs Proxy</p>
             </div>
           </div>

           <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Eye className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">View</p>
               <p className="text-sm font-bold text-white/90">Upper Body Fixed</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
