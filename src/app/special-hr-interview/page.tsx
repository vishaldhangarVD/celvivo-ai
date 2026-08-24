"use client";

import { useState } from 'react';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  Mic, 
  Video, 
  Activity,
  Zap,
  Command
} from 'lucide-react';

/**
 * @fileOverview Special HR Interview - Full-Screen Viewport Protocol.
 * Scales the layout to fill 100vw and 100vh while maintaining structural logic.
 */

export default function SpecialHRInterview() {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');

  return (
    <div className="h-screen w-full bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      {/* Global CSS for the D-ID Agent to fill its expanded container */}
      <style jsx global>{`
        did-agent {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          z-index: 10 !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: transparent !important;
        }
        /* Target the internal container to ensure full expansion */
        #did-agent-container, 
        .did-agent-container-style {
          width: 100% !important;
          height: 100% !important;
        }
        /* Suppress default floating artifacts */
        #did-agent-launcher, 
        .did-agent-fab {
          display: none !important;
        }
      `}</style>

      {/* Official D-ID Embed Script v2 */}
      <Script
        id="did-agent-embed-v2"
        src="https://agent.d-id.com/v2/index.js"
        type="module"
        data-mode="fabio"
        data-client-key="ck_0T9vL02nSJmsHMLHMYLsB"
        data-agent-id="v2_agt_5A5V9r-C"
        data-name="did-agent"
        data-monitor="true"
        data-orientation="horizontal"
        data-position="right"
        data-open-mode="expanded"
        onLoad={() => {
          console.log("D-ID Full-screen layout logic initialized.");
          setStatus('READY');
        }}
        onError={(e) => {
          console.error("D-ID script failed:", e);
          setStatus('ERROR');
        }}
      />

      <main className="flex-1 w-full h-[calc(100vh-72px)] mt-[72px] px-4 md:px-6 py-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-none grid lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Briefing Section - Proportional Scaling */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-10 flex flex-col justify-center">
            <header className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1.5 text-[10px] tracking-widest font-black uppercase">Executive HR Protocol</Badge>
              </motion.div>
              <div className="space-y-4">
                <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter text-premium leading-[1.05]">AI Virtual <br/><span className="text-gradient-purple">HR Arena.</span></h1>
                <p className="text-lg text-white/50 font-light leading-relaxed max-w-md">
                  Engaging in a high-fidelity behavioral simulation. Ensure your vocal and visual nodes are clear.
                </p>
              </div>
            </header>

            <div className="space-y-6">
              <div className="p-6 glass border-white/5 bg-white/[0.01] rounded-3xl space-y-4">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-accent" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Neural Integrity Check</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">System Status</span>
                   <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Optimal</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Card className="glass border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <Mic className="w-4 h-4 text-accent" />
                    <span className="text-[9px] font-black uppercase text-white/40">Vocal Node</span>
                 </Card>
                 <Card className="glass border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <Video className="w-4 h-4 text-accent" />
                    <span className="text-[9px] font-black uppercase text-white/40">Visual Node</span>
                 </Card>
              </div>
            </div>
          </div>

          {/* AI Arena - Full Expansion */}
          <div className="lg:col-span-9 xl:col-span-10 h-full min-w-0">
          <Card className="premium-card w-full min-w-0 bg-[#0b0e1a]/90 border-accent/10 p-0 h-full flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <AnimatePresence mode="wait">
                {status === 'LOADING' ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#0b0e1a] z-50"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                      <Loader2 className="w-full h-full text-accent animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Establishing Uplink</p>
                       <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Syncing Matrix Protocol v5.0.2</p>
                    </div>
                  </motion.div>
                ) : status === 'ERROR' ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6 text-center bg-[#0b0e1a] z-50"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Protocol Fault</h3>
                      <p className="text-sm text-white/40 max-w-xs mx-auto">Unable to verify connection with the HR Agent.</p>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline" className="h-12 px-10 rounded-xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest">Restart Session</Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="h-full w-full relative flex items-center justify-center"
                  >
                    {/* Visual Indicators Overlay */}
                    <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white/80 py-2 px-5 rounded-full flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Live Arena</span>
                      </Badge>
                    </div>

                    <div className="absolute top-8 right-8 z-20">
                       <div className="flex items-center gap-2 px-4 py-2 glass rounded-2xl border-white/10">
                          <Activity className="w-3.5 h-3.5 text-accent" />
                          <span className="text-[9px] font-black uppercase text-accent tracking-widest">Neural Link Active</span>
                       </div>
                    </div>

                    {/* D-ID Agent Component fills the expanded card */}
                    <div className="w-full h-full flex items-center justify-center bg-black/40">
                      <did-agent />
                    </div>

                    {/* Arena Backdrop Branding */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
                       <Command className="w-96 h-96 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
