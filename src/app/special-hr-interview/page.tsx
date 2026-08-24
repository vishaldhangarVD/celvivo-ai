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
 * @fileOverview Special HR Interview powered by official D-ID Agent Embed.
 * Centralized layout to maximize Agent visibility within the primary panel.
 */

// Fix TypeScript error for the custom D-ID Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'did-agent': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function SpecialHRInterview() {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      {/* Global CSS to override D-ID default floating behavior and enlarge the viewport */}
      <style jsx global>{`
        did-agent {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          bottom: auto !important;
          right: auto !important;
          left: auto !important;
          top: auto !important;
          margin: 0 auto !important;
          z-index: 1 !important;
        }
        /* Suppress internal floating artifacts from the D-ID library */
        #did-agent-launcher, 
        #did-agent-close-btn,
        .did-agent-fab {
          display: none !important;
        }
        /* Target the internal container if the script uses it */
        .did-agent-container-style,
        #did-agent-container {
          background-color: transparent !important;
          box-shadow: none !important;
          position: relative !important;
          bottom: auto !important;
          right: auto !important;
          left: auto !important;
          top: auto !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* 
        Official D-ID Embed Script v2
        Credentials maintained exactly as provided.
      */}
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
          console.log("D-ID Agent script initialized.");
          setStatus('READY');
        }}
        onError={(e) => {
          console.error("D-ID Agent script failed to load:", e);
          setStatus('ERROR');
        }}
      />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Dashboard Info */}
          <div className="lg:col-span-4 space-y-8 flex flex-col justify-center">
            <header className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Executive HR Protocol</Badge>
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tighter text-premium leading-[1.1]">AI Virtual <br/><span className="text-gradient-purple">HR Arena.</span></h1>
              <p className="text-base text-white/50 font-light leading-relaxed">
                Experience a high-fidelity simulation with our Virtual HR Agent. The interface is now synchronized with your neural profile and displayed in the central arena.
              </p>
            </header>

            <div className="grid gap-3">
               {[
                 { icon: ShieldCheck, label: "Neural Integrity", val: "VERIFIED" },
                 { icon: Activity, label: "Response Mode", val: "REAL-TIME" },
                 { icon: Zap, label: "Interface", val: "D-ID FABIO" }
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 bg-white/[0.01]"
                 >
                   <div className="flex items-center gap-3 text-white/30">
                     <stat.icon className="w-4 h-4 text-accent" />
                     <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <span className="text-[9px] font-black text-white uppercase tracking-widest">{stat.val}</span>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Interview Central - The "AI Arena Active" Box */}
          <div className="lg:col-span-8">
            <Card className="premium-card bg-[#0b0e1a]/90 border-accent/20 p-6 h-[600px] flex flex-col relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 pointer-events-none border-2 border-accent/5 m-2 rounded-[2.5rem]" />
              
              <AnimatePresence mode="wait">
                {status === 'LOADING' ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-8"
                  >
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                      <Loader2 className="w-full h-full text-accent animate-spin" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-xl font-bold text-white">Establishing Uplink</h3>
                      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Connecting to AI Interviewer...</p>
                    </div>
                  </motion.div>
                ) : status === 'ERROR' ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-6 text-center"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Protocol Fault</h3>
                      <p className="text-sm text-white/50 max-w-xs mx-auto">
                        Unable to connect to AI Interviewer. 
                        Please ensure the current domain is allowlisted in your D-ID dashboard.
                      </p>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-8 uppercase text-[10px] font-bold tracking-widest border-red-500/20 text-red-400">Restart Session</Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col h-full w-full"
                  >
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                          <Command className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold tracking-tighter text-white">AI Arena Active</h3>
                          <p className="text-[9px] font-black text-accent uppercase tracking-widest">Protocol ID: DID-v2-STABLE</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest">Encrypted Stream</Badge>
                    </div>

                    {/* Agent Container - Centered and Enlarged via global CSS */}
                    <div className="flex-1 relative rounded-[2rem] overflow-hidden bg-black/40 border border-white/5 shadow-inner group p-2 sm:p-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                         <div className="text-center opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-accent animate-pulse mx-auto" />
                            <p className="text-xs font-black uppercase tracking-[0.5em] mt-4">Holographic Field Active</p>
                         </div>
                      </div>
                      
                      {/* The D-ID Agent Web Component - Enforced to fill the parent via global CSS */}
                      <did-agent />
                    </div>

                    {/* Bottom Telemetry Action Row */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0 relative z-10">
                      <div className="flex items-center gap-3 p-3 glass rounded-xl border-green-500/10 bg-green-500/[0.03]">
                        <Mic className="w-4 h-4 text-green-400" />
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Mic Sync</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 glass rounded-xl border-green-500/10 bg-green-500/[0.03]">
                        <Video className="w-4 h-4 text-green-400" />
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Vision Lock</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 p-3 glass rounded-xl border-accent/10 bg-accent/[0.03]">
                        <Activity className="w-4 h-4 text-accent" />
                        <span className="text-[8px] font-black text-accent uppercase tracking-widest">Latency: 12ms</span>
                      </div>
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
