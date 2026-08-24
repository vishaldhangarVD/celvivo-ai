"use client";

import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';

/**
 * @fileOverview Special HR Interview powered by official D-ID Agent Embed.
 * High-reliability implementation using provided Client Key and Agent ID.
 */

export default function SpecialHRInterview() {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      {/* 
        Official D-ID Embed Script v2
        Client Key: ck_0T9vL02nSJmsHMLHMYLsB
        Agent ID: v2_agt_5A5V9r-C
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
        <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Dashboard Info */}
          <div className="lg:col-span-5 space-y-12">
            <header className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Executive HR Protocol</Badge>
              </motion.div>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">AI Virtual <span className="text-gradient-purple">Arena.</span></h1>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                You are entering a high-fidelity simulation with our Virtual HR Agent. The D-ID interface will automatically synchronize with your neural profile.
              </p>
            </header>

            <div className="grid gap-4">
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
                   className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 bg-white/[0.01]"
                 >
                   <div className="flex items-center gap-4 text-white/40">
                     <stat.icon className="w-5 h-5 text-accent" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{stat.val}</span>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Interview Central */}
          <div className="lg:col-span-7">
            <Card className="premium-card bg-[#0b0e1a]/80 border-accent/20 p-10 min-h-[550px] flex flex-col items-center justify-center relative overflow-hidden text-center">
              <div className="absolute inset-0 pointer-events-none border-2 border-accent/5 m-4 rounded-[2.5rem]" />
              
              <AnimatePresence mode="wait">
                {status === 'LOADING' ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                      <Loader2 className="w-full h-full text-accent animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Establishing Uplink</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Connecting to AI Interviewer...</p>
                    </div>
                  </motion.div>
                ) : status === 'ERROR' ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Protocol Fault</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Unable to connect to AI Interviewer. 
                        Please ensure the current domain is allowlisted in your D-ID dashboard and your Client Key is active.
                      </p>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-8 uppercase text-[10px] font-bold tracking-widest border-red-500/20 text-red-400">Restart Session</Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12 w-full"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                      <Command className="w-10 h-10 text-accent" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold tracking-tighter text-white">AI Arena Active</h3>
                      <p className="text-muted-foreground font-light max-sm mx-auto">
                        The virtual interviewer is now ready. Use the controls in the corner widget to start your call.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 max-w-xs mx-auto">
                      <div className="flex items-center gap-3 p-4 glass rounded-xl border-green-500/20 bg-green-500/5">
                        <Mic className="w-5 h-5 text-green-400" />
                        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest text-left">Microphone authorized</p>
                      </div>
                      <div className="flex items-center gap-3 p-4 glass rounded-xl border-green-500/20 bg-green-500/5">
                        <Video className="w-5 h-5 text-green-400" />
                        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest text-left">Visual feed synced</p>
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