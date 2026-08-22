'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Command, 
  Activity, 
  Wifi, 
  Loader2,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Home,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * @fileOverview Special HR Interview - Powered by D-ID Agents.
 * Implements real-time WebRTC streaming and autonomous AI conversation.
 */

export default function SpecialHRInterview() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // D-ID Refs & State
  const agentManagerRef = useRef<any>(null);
  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const [status, setStatus] = useState<'INITIALIZING' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDIdSpeaking, setIsDIdSpeaking] = useState(false);
  
  // Local Media State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  
  // Interview Content State
  const [transcript, setTranscript] = useState<{ role: 'interviewer' | 'candidate', text: string }[]>([]);
  const [isVocalResponseActive, setIsVocalResponseActive] = useState(false);
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(7));

  // Initialization Protocol
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initializeAgent = async () => {
      try {
        // 1. Fetch browser-safe credentials from our API gateway
        const configRes = await fetch('/api/special-hr-agent');
        const configData = await configRes.json();

        if (!configRes.ok) {
          if (configData.agentIdMissing) setErrorMessage("Special HR Agent ID is missing.");
          else if (configData.clientKeyMissing) setErrorMessage("Special HR Client Key is missing.");
          else setErrorMessage("Credentials not configured correctly.");
          setStatus('ERROR');
          return;
        }

        const { agentId, clientKey } = configData;

        // 2. Client-safe dynamic import to prevent SSR "window is not defined"
        const { createAgentManager } = await import('@d-id/client-sdk');

        // 3. Create the D-ID Agent Manager
        const manager = await createAgentManager(agentId, {
          auth: { type: 'key', clientKey },
          callbacks: {
            onSrcObjectReady(stream) {
              console.log("[D-ID] Source stream ready.");
              if (agentVideoRef.current) {
                agentVideoRef.current.srcObject = stream;
              }
            },
            onConnectionStateChange(state) {
              console.log("[D-ID] Connection State Change:", state);
              if (!isMounted) return;
              
              if (state === 'connecting') setStatus('CONNECTING');
              if (state === 'connected') {
                setStatus('CONNECTED');
                toast({ title: "Neural Link Established", description: "The Special HR Agent is online." });
              }
              if (state === 'disconnected' || state === 'closed') setStatus('DISCONNECTED');
              if (state === 'fail') {
                setStatus('ERROR');
                setErrorMessage("Unable to connect to Special HR Agent.");
              }
            },
            onVideoStateChange(state) {
              if (isMounted) setIsDIdSpeaking(state === 'playing');
            },
            onNewMessage(messages, type) {
              if (type === 'assistant' && isMounted) {
                const text = Array.isArray(messages) ? messages[messages.length - 1] : messages;
                setTranscript(prev => [...prev, { role: 'interviewer', text }]);
              }
            },
            onError(error, errorData) {
              console.error("[D-ID] Protocol Fault:", error, errorData);
              if (isMounted) {
                setStatus('ERROR');
                setErrorMessage("Unable to connect to Special HR Agent.");
              }
            }
          }
        });

        agentManagerRef.current = manager;
        await manager.connect();

      } catch (err) {
        console.error("[D-ID] Fatal Handshake Failure:", err);
        if (isMounted) {
          setStatus('ERROR');
          setErrorMessage("Unable to connect to Special HR Agent.");
        }
      }
    };

    initializeAgent();

    // Initialize local preview
    const startLocalPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn("Local camera access denied.");
      }
    };
    startLocalPreview();

    return () => {
      isMounted = false;
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect();
      }
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [toast]);

  const toggleVocalResponse = async () => {
    if (!agentManagerRef.current || status !== 'CONNECTED') return;

    try {
      if (isVocalResponseActive) {
        await agentManagerRef.current.stopListening();
        setIsVocalResponseActive(false);
      } else {
        await agentManagerRef.current.startListening();
        setIsVocalResponseActive(true);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Audio Transceiver Fault", description: "Failed to communicate with AI Agent." });
    }
  };

  const handleEndInterview = async () => {
    if (!user || !db) return;

    try {
      const sessionRef = doc(db, 'users', user.uid, 'specialHRInterviews', sessionIdRef.current);
      await setDoc(sessionRef, {
        sessionId: sessionIdRef.current,
        userId: user.uid,
        status: 'completed',
        transcript: transcript,
        createdAt: serverTimestamp(),
        duration: transcript.length * 45 
      });

      toast({ title: "Session Concluded", description: "Dossier successfully archived." });
      router.push(`/special-hr-interview/result?sessionId=${sessionIdRef.current}`);
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getAudioTracks().forEach(t => t.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getVideoTracks().forEach(t => t.enabled = !isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col overflow-hidden selection:bg-accent/30">
      <div className="particles-bg" />
      <Navbar />

      <header className="h-16 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50 mt-[72px]">
        <div className="flex items-center gap-6">
           <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
             <Command className="w-5 h-5" />
           </div>
           <div>
             <h1 className="text-sm font-black uppercase tracking-widest text-premium">SPECIAL HR ARENA</h1>
             <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">D-ID NEURAL INTERFACE ACTIVE</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className={cn(
             "px-4 py-1.5 rounded-full glass border-white/5 flex items-center gap-3 transition-all",
             status === 'CONNECTED' ? "bg-green-500/10 border-green-500/20" : 
             status === 'CONNECTING' || status === 'INITIALIZING' ? "bg-accent/10 border-accent/20" : 
             "bg-red-500/10 border-red-500/20"
           )}>
              <div className={cn(
                "w-2 h-2 rounded-full", 
                status === 'CONNECTED' ? "bg-green-400 animate-pulse" : 
                status === 'CONNECTING' || status === 'INITIALIZING' ? "bg-accent animate-spin" : 
                "bg-red-400"
              )} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                {status}
              </span>
           </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Candidate Neural Feed (LEFT) */}
        <div className="w-1/3 flex flex-col gap-6">
          <Card className="flex-1 glass border-white/5 bg-black rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn("w-full h-full object-cover grayscale opacity-60", !isCameraOn && "hidden")} 
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white/10">
                <VideoOff className="w-24 h-24" />
              </div>
            )}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white/80 py-1.5 px-4 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">LOCAL FEED</span>
              </Badge>
            </div>
            {/* Visual HUD */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/40 m-8" />
               <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/40 m-8" />
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/40 m-8" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/40 m-8" />
            </div>
          </Card>

          {/* Transcript Log */}
          <Card className="h-1/3 glass border-white/5 bg-white/[0.01] rounded-[2rem] p-6 overflow-hidden flex flex-col gap-4">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/20 tracking-widest px-1">
               <MessageSquare className="w-3.5 h-3.5" /> NEURAL LOG
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {transcript.map((msg, i) => (
                  <div key={i} className={cn("space-y-1", msg.role === 'interviewer' ? "text-purple-400" : "text-accent")}>
                    <p className="text-[8px] font-black uppercase tracking-widest">{msg.role}</p>
                    <p className="text-xs font-light leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                {transcript.length === 0 && (
                   <p className="text-[10px] text-white/20 text-center py-8">Awaiting initial handshake...</p>
                )}
             </div>
          </Card>
        </div>

        {/* AI Interviewer Stage (RIGHT) */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 glass border-white/10 bg-[#080c19] rounded-[3rem] relative overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.1)]">
            {status === 'ERROR' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-12 text-center">
                 <AlertCircle className="w-12 h-12 text-red-400 mb-6" />
                 <h3 className="text-xl font-bold mb-2">Protocol Error</h3>
                 <p className="text-sm text-white/40 max-w-sm mb-8">{errorMessage}</p>
                 <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-8 h-12 text-[10px] uppercase font-bold tracking-widest">Restart Session</Button>
              </div>
            ) : null}

            <video 
              ref={agentVideoRef} 
              autoPlay 
              playsInline 
              className={cn("w-full h-full object-cover", status !== 'CONNECTED' && "opacity-0")}
            />
            
            {(status === 'INITIALIZING' || status === 'CONNECTING') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl z-10">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400 animate-pulse">Initializing Agent Proxy...</p>
              </div>
            )}

            {/* Speaking Indicator */}
            {status === 'CONNECTED' && (
              <div className="absolute bottom-8 left-8 flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border-purple-500/30">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isDIdSpeaking ? "bg-purple-400 animate-ping" : "bg-white/10")} />
                  <span className="text-[9px] font-black uppercase text-purple-300 tracking-widest">
                    {isDIdSpeaking ? "AGENT SPEAKING" : "AGENT LISTENING"}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Action Dock */}
          <div className="h-24 glass border-white/5 bg-[#080c19]/60 rounded-full px-12 flex items-center justify-between shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMic}
                className={cn(
                  "w-14 h-14 rounded-full transition-all duration-500",
                  isMicOn ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/40"
                )}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCamera}
                className={cn(
                  "w-14 h-14 rounded-full transition-all duration-500",
                  isCameraOn ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/40"
                )}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            </div>

            <Button 
              onClick={toggleVocalResponse}
              disabled={status !== 'CONNECTED' || isDIdSpeaking}
              className={cn(
                "h-16 px-12 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl transition-all duration-500 active:scale-95",
                isVocalResponseActive ? "bg-red-600 hover:bg-red-500 animate-pulse-glow text-white border-none" : "btn-premium"
              )}
            >
              {isVocalResponseActive ? "STOP & TRANSMIT" : "START VOCAL RESPONSE"}
            </Button>

            <Button 
              onClick={handleEndInterview}
              variant="outline"
              className="h-14 px-8 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <PhoneOff className="w-4 h-4 mr-3" /> Terminate Session
            </Button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </div>
  );
}
