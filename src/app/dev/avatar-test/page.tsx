"use client";

import Navbar from "@/components/layout/Navbar";
import HolographicInterviewer from "@/components/HolographicInterviewer";
import { Badge } from "@/components/ui/badge";
import { Cpu, Box, Eye } from "lucide-react";

/**
 * AvatarTestPage - Dedicated development route to verify Step 3 integration.
 * URL: /dev/avatar-test
 */
export default function AvatarTestPage() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-16 flex flex-col items-center gap-12">
        <header className="text-center space-y-4">
          <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
            Neural R&D Preview
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium">
            Avatar <span className="text-gradient-purple">Julia 3D.</span>
          </h1>
          <p className="text-muted-foreground font-light max-w-xl">
            Verifying 3D mesh integrity and TalkingHead rendering protocols for Step 3.
          </p>
        </header>

        <div className="w-full max-w-3xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-[#0b0e1a] relative group">
          <div className="absolute top-6 left-6 z-10 flex gap-2">
            <div className="px-3 py-1 glass rounded-lg border-green-500/20 text-green-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest">Mesh Live</span>
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
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Engine</p>
               <p className="text-sm font-bold text-white/90">TalkingHead v1.x</p>
             </div>
           </div>

           <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
               <Box className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Model Node</p>
               <p className="text-sm font-bold text-white/90">Julia.glb (8MB)</p>
             </div>
           </div>

           <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Eye className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Visibility</p>
               <p className="text-sm font-bold text-white/90">Upper Body View</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
