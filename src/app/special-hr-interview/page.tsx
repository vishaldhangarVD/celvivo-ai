'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createAgentManager, type AgentManager } from '@d-id/client-sdk';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Special HR Interview powered by D-ID Agents.
 * Independent simulation track with real-time WebRTC avatar and speech recognition.
 */

export default function SpecialHRInterview() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // D-ID Refs & State
  const agentManagerRef = useRef<AgentManager | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [isDIdSpeaking, setIsDIdSpeaking] = useState(false);
  
  // Local Media State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  
  // Interview Content State
  const [transcript, setTranscript] = useState<{ role: 'interviewer' | 'candidate', text: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState("");
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(7));

  // Speech Recognition (Browser API)
  const recognitionRef = useRef<any>(null);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Vocal recognition not supported in this terminal." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setCurrentRecognition(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [toast]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (currentRecognition.trim()) {
        submitAnswer(currentRecognition);
      }
    } else {
      setCurrentRecognition("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitAnswer = async (text: string) => {
    if (!text.trim() || !agentManagerRef.current) return;
    
    setTranscript(prev => [...prev, { role: 'candidate', text }]);
    setCurrentRecognition("");

    try {
      await agentManagerRef.current.chat(text);
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Fault", description: "Failed to send data to AI Agent." });
    }
  };

  const initializeDID = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_DID_SPECIAL_HR_AGENT_ID;
    const clientKey = process.env.NEXT_PUBLIC_DID_CLIENT_KEY;

    if (!agentId || !clientKey) {
      setConnectionStatus('error');
      toast({ variant: "destructive", title: "Auth Missing", description: "D-ID Agent credentials not found." });
      return;
    }

    setConnectionStatus('connecting');

    try {
      const manager = await createAgentManager(agentId, {
        auth: { type: 'key', clientKey },
        callbacks: {
          onSrcObjectReady(event) {
            if (videoRef.current) {
              videoRef.current.srcObject = event.srcObject;
            }
          },
          onVideoStateChange(state) {
            setIsDIdSpeaking(state === 'playing');
          },
          onConnectionStateChange(state) {
            if (state === 'connected') setConnectionStatus('connected');
            if (state === 'disconnected') setConnectionStatus('disconnected');
          },
          onNewMessage(message, role) {
            if (role === 'assistant') {
              setTranscript(prev => [...prev, { role: 'interviewer', text: message }]);
            }
          },
          onError(error) {
            console.error("D-ID Error:", error);
            setConnectionStatus('error');
          }
        }
      });

      agentManagerRef.current = manager;
      await manager.connect();
    } catch (e) {
      console.error(e);
      setConnectionStatus('error');
    }
  }, [toast]);

  const startLocalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("Local camera access denied.");
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeDID();
      startLocalCamera();
      initSpeechRecognition();
    }

    return () => {
      agentManagerRef.current?.disconnect();
      recognitionRef.current?.stop();
    };
  }, [initializeDID, initSpeechRecognition]);

  const handleEndInterview = async () => {
    if (!user || !db) return;

    try {
      const sessionRef = doc(db, 'users', user.uid, 'specialHRInterviews', sessionIdRef.current);
      await setDoc(sessionRef, {
        sessionId: sessionIdRef.current,
        userId: user.uid,
        status: 'completed',
        transcript: transcript,
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        duration: transcript.length * 45 // Simulated duration
      });

      toast({ title: "Session Concluded", description: "Dossier successfully archived." });
      router.push(`/special-hr-interview/result?sessionId=${sessionIdRef.current}`);
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

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
             connectionStatus === 'connected' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
           )}>
              <div className={cn("w-2 h-2 rounded-full", connectionStatus === 'connected' ? "bg-green-400 animate-pulse" : "bg-red-400")} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                {connectionStatus === 'connecting' ? 'SYNCING...' : connectionStatus === 'connected' ? 'AI INTERVIEWER ONLINE' : 'DISCONNECTED'}
              </span>
           </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Candidate Neural Feed */}
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
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/40" />
               <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/40" />
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/40" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/40" />
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
                {isRecording && currentRecognition && (
                  <div className="text-white/40 animate-pulse">
                    <p className="text-[8px] font-black uppercase tracking-widest">RECORDING...</p>
                    <p className="text-xs font-light italic">"{currentRecognition}"</p>
                  </div>
                )}
             </div>
          </Card>
        </div>

        {/* AI Interviewer Stage */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 glass border-white/10 bg-[#080c19] rounded-[3rem] relative overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.1)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {connectionStatus === 'connecting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl z-10">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400 animate-pulse">Initializing Agent Proxy...</p>
              </div>
            )}

            {/* Speaking Indicator */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border-purple-500/30">
                <div className={cn("w-1.5 h-1.5 rounded-full", isDIdSpeaking ? "bg-purple-400 animate-ping" : "bg-white/10")} />
                <span className="text-[9px] font-black uppercase text-purple-300 tracking-widest">
                  {isDIdSpeaking ? "AGENT SPEAKING" : "AGENT LISTENING"}
                </span>
              </div>
            </div>
          </Card>

          {/* Action Dock */}
          <div className="h-24 glass border-white/5 bg-[#080c19]/60 rounded-full px-12 flex items-center justify-between shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMicOn(!isMicOn)}
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
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "w-14 h-14 rounded-full transition-all duration-500",
                  isCameraOn ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/40"
                )}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            </div>

            <Button 
              onClick={toggleRecording}
              disabled={connectionStatus !== 'connected' || isDIdSpeaking}
              className={cn(
                "h-16 px-12 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl transition-all duration-500 active:scale-95",
                isRecording ? "bg-red-600 hover:bg-red-500 animate-pulse-glow" : "btn-premium"
              )}
            >
              {isRecording ? "Stop & Transmit" : "Start Vocal Response"}
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
