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
 * @fileOverview Special HR Interview - Fullscreen Agent Protocol.
 * Force the existing D-ID Agent to occupy the full viewport (100vw x 100vh).
 */

// TypeScript declaration for the custom D-ID Web Component
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

      {/* Fullscreen CSS Override for the D-ID Agent */}
      <style jsx global>{`
        did-agent {
          display: block !important;
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1000 !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #050816 !important;
        }
        /* Target the internal container to ensure full expansion */
        #did-agent-container, 
        .did-agent-container-style {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
        }
        /* Suppress FAB artifacts */
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
          console.log("D-ID Fullscreen Agent Initialized.");
          setStatus('READY');
        }}
        onError={(e) => {
          console.error("D-ID script failed:", e);
          setStatus('ERROR');
        }}
      />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Status info remains in DOM but agent will be fixed above it when ready */}
          <div className="lg:col-span-4 space-y-8 flex flex-col justify-center">
            <header className="space-y-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Executive HR Protocol</Badge>
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tighter text-premium leading-[1.1]">AI Virtual <br/><span className="text-gradient-purple">HR Arena.</span></h1>
              <p className="text-base text-white/50 font-light leading-relaxed">
                Establishing neural link for fullscreen immersion...
              </p>
            </header>
          </div>

          <div className="lg:col-span-8">
            <Card className="premium-card bg-[#0b0e1a]/90 border-accent/20 p-6 h-[600px] flex flex-col relative overflow-hidden shadow-2xl">
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
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Establishing Uplink...</p>
                  </motion.div>
                ) : status === 'ERROR' ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-6 text-center"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <h3 className="text-xl font-bold text-white">Protocol Fault</h3>
                    <Button onClick={() => window.location.reload()} variant="outline">Restart Session</Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col h-full w-full items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                       <Zap className="w-12 h-12 text-accent animate-pulse mx-auto" />
                       <p className="text-xs font-black uppercase tracking-[0.5em]">Holographic Field Active</p>
                    </div>
                    {/* The D-ID Agent will overlay the entire screen due to fixed CSS positioning */}
                    <did-agent />
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
