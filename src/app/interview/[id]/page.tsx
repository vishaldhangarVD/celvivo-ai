"use client";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Send, 
  Mic, 
  Command, 
  User, 
  Settings,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

// Global reference for D-ID SDK
let didSdk: any;

function VirtualArenaContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const role = searchParams.get("role") || "Software Engineer";
  const company = searchParams.get("company") || "Standard Tech";
  const exp = searchParams.get("exp") || "Senior";
  const round = searchParams.get("round") || "Virtual Interview";

  const [currentIdx, setCurrentIdx] = useState(1);
  const [transcript, setTranscript] = useState<{role: 'interviewer' | 'candidate', text: string}[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isAvatarSynthesizing, setIsAvatarSynthesizing] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [agent, setAgent] = useState<any>(null);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);

  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Re-attach stream to video element on every render to ensure visibility
  useEffect(() => {
    if (videoRef.current && activeMediaStream) {
      if (videoRef.current.srcObject !== activeMediaStream) {
        console.log("[WebRTC Sync] Re-attaching MediaStream to video element...");
        videoRef.current.srcObject = activeMediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log("[WebRTC Sync] Stream Telemetry:", {
            w: videoRef.current?.videoWidth,
            h: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState,
            networkState: videoRef.current?.networkState,
            paused: videoRef.current?.paused,
            time: videoRef.current?.currentTime
          });
          videoRef.current?.play().catch(e => console.error("[WebRTC Sync] Play Failure:", e));
        };
      }
    }
  }, [activeMediaStream, isAgentConnected]);

  // Initialize Recognition
  useEffect(() => {
    const initClient = async () => {
      try {
        if (!didSdk) {
          didSdk = await import("@d-id/client-sdk");
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                setUserAnswer(prev => prev + " " + event.results[i][0].transcript);
              }
            }
          };
          recognition.onstart = () => setIsMicActive(true);
          recognition.onend = () => setIsMicActive(false);
          recognitionRef.current = recognition;
        }
      } catch (e) {
        console.error("Initialization Fault:", e);
      }
    };
    initClient();
  }, []);

  const connectToAgent = async () => {
    if (isAgentConnected || !didSdk) return;
    
    const clientKey = process.env.NEXT_PUBLIC_D_ID_CLIENT_KEY;
    const agentId = process.env.NEXT_PUBLIC_D_ID_AGENT_ID;

    if (!clientKey || !agentId) {
      const err = `Identity Fault: ${!clientKey ? 'CLIENT_KEY' : 'AGENT_ID'} MISSING`;
      setConfigError(err);
      return;
    }

    try {
      const agentInstance = await didSdk.createAgentManager(agentId, {
        auth: { type: 'key', clientKey: clientKey },
        callbacks: {
          onSrcObjectReady: (stream: MediaStream) => {
            console.log("[WebRTC] Stream Received.");
            setActiveMediaStream(stream);
          },
          onConnectionStateChange: (state: string) => {
            console.log("[WebRTC] State:", state);
            setIsAgentConnected(state === "connected");
            if (state === "disconnected") setActiveMediaStream(null);
          },
          onVideoStatusChange: (status: string) => {
            setIsAvatarSpeaking(status === 'play');
          }
        }
      });
      
      await agentInstance.connect();
      setAgent(agentInstance);
      return agentInstance;
    } catch (error: any) {
      console.error("Neural Connection Error:", error);
      toast({ variant: "destructive", title: "Visual Node Offline" });
      throw error;
    }
  };

  const handleInterviewerSpeech = async (targetAgent: any, text: string) => {
    if (!targetAgent || !isAgentConnected) return;
    try {
      setIsAvatarSynthesizing(true);
      await targetAgent.speak({ type: 'text', input: text });
    } catch (e) {
      console.error("Vocal Synthesis Error:", e);
    } finally {
      setIsAvatarSynthesizing(false);
    }
  };

  // Bootstrap Simulation
  useEffect(() => {
    async function init() {
      if (!user || !db || !role || !company) return;
      
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setAssessmentContext(data);
        
        try {
          if (!didSdk) didSdk = await import("@d-id/client-sdk");
          const agentInstance = await connectToAgent();
          
          if (transcript.length === 0) {
            let firstMsg = "";
            if (data.debugMode) {
              firstMsg = "Hello. Welcome to today's session. I'm looking forward to our technical assessment. Let's start with a brief introduction—could you please introduce yourself and walk me through your background?";
            } else {
              const response = await aiMockInterview({
                role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: 1, 
                history: [], targetCompany: company,
                resumeSkills: data.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
                resumeProjects: data.resumeAnalysis?.sections?.projects || [],
                resumeSummary: data.resumeAnalysis?.summary || "",
                aptitudePerformance: data.aptitudeReport?.recommendation || "N/A",
                aptitudeScore: data.aptitudeReport?.overallScore || 0,
                codingPerformance: data.codingReport?.finalRecommendation || "N/A",
                codingScore: data.codingReport?.score || 0,
                askedQuestions: []
              });
              firstMsg = response.nextQuestion;
            }

            setTranscript([{ role: 'interviewer', text: firstMsg }]);
            setAskedQuestions([firstMsg]);
            if (agentInstance) await handleInterviewerSpeech(agentInstance, firstMsg);
          }
        } catch (e) {
          console.error("Bootstrap Fault:", e);
        } finally {
          setIsInitializing(false);
        }
      } else {
        router.push('/interview');
      }
    }
    init();
    return () => { if (agent) agent.disconnect(); };
  }, [user, db, role, company, exp]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete || isAvatarSpeaking) return;
    
    setIsProcessing(true);
    const newTranscript = [...transcript, { role: 'candidate' as const, text: userAnswer }];
    setTranscript(newTranscript);
    const currentAns = userAnswer;
    setUserAnswer("");

    try {
      let response;
      if (assessmentContext?.debugMode) {
        response = { nextQuestion: `That's clear. Moving to Node ${currentIdx + 1} for verification. Tell me more about your experience with real-time architectures.`, isInterviewComplete: currentIdx >= 5 };
      } else {
        const chatHistory = newTranscript.filter(t => t.role === 'candidate').map((t) => {
          const candidateIdx = newTranscript.indexOf(t);
          const interviewerMsg = newTranscript[candidateIdx - 1];
          return {
            question: interviewerMsg?.text || "Introduction",
            answer: t.text
          };
        });

        response = await aiMockInterview({
          role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: currentIdx + 1,
          history: chatHistory,
          userAnswer: currentAns, targetCompany: company,
          resumeSkills: assessmentContext.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
          resumeProjects: assessmentContext.resumeAnalysis?.sections?.projects || [],
          resumeSummary: assessmentContext.resumeAnalysis?.summary || "",
          aptitudePerformance: assessmentContext.aptitudeReport?.recommendation || "N/A",
          aptitudeScore: assessmentContext.aptitudeReport?.overallScore || 0,
          codingPerformance: assessmentContext.codingReport?.finalRecommendation || "N/A",
          codingScore: assessmentContext.codingReport?.score || 0,
          askedQuestions: askedQuestions
        });
      }

      const finalTranscript = [...newTranscript, { role: 'interviewer' as const, text: response.nextQuestion }];
      setTranscript(finalTranscript);
      setAskedQuestions(prev => [...prev, response.nextQuestion]);
      setCurrentIdx(prev => prev + 1);

      if (response.isInterviewComplete) {
        finalizeSession(finalTranscript);
      } else {
        await handleInterviewerSpeech(agent, response.nextQuestion);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Logic Sync Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSession = async (currentTranscript: any[]) => {
    if (!user || !db || isGeneratingReport) return;
    setIsGeneratingReport(true);
    setIsSimulationComplete(true);
    if (agent) agent.disconnect();
    
    try {
      const transcriptStr = currentTranscript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n\n');
      const finalAudit = await generateInterviewFeedback({
        role, company, experienceLevel: exp, interviewTranscript: transcriptStr,
        resumeContext: {
          atsScore: assessmentContext.resumeAnalysis?.atsScore || 0,
          strengths: assessmentContext.resumeAnalysis?.analysis?.strengths || [],
          weaknesses: assessmentContext.resumeAnalysis?.analysis?.weaknesses || [],
          missingSkills: assessmentContext.resumeAnalysis?.analysis?.missingSkills || [],
        }
      });

      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        userId: user.uid, role, company, experienceLevel: exp, round,
        history: currentTranscript, overallScore: finalAudit.overallScore,
        feedback: finalAudit, createdAt: serverTimestamp(),
      });
      
      await deleteDoc(doc(db, 'users', user.uid, 'journey', 'active'));
      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Final Audit Synthesis Failed" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isMicActive) recognitionRef.current.stop();
    else { setUserAnswer(""); recognitionRef.current.start(); }
  };

  const handleGoHome = () => router.push('/');
  const handleBack = () => router.push('/interview');

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
           <Command className="w-5 h-5 text-accent" />
           <div>
             <h1 className="text-sm font-bold uppercase tracking-widest">{company} Arena</h1>
             <p className="text-[10px] text-muted-foreground uppercase font-bold">Node {currentIdx}/{assessmentContext?.debugMode ? '5' : '15'}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 glass rounded-full border-accent/20 font-mono text-accent">
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full px-6 py-6 gap-6">
        <section className="relative h-[45vh] overflow-hidden rounded-[3rem] bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover z-10" 
          />
          
          {!isAgentConnected && !configError && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#050816] z-20 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                <User className="w-10 h-10 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent animate-pulse">Establishing Direct Neural Link...</p>
            </div>
          )}

          {configError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-red-950/20 backdrop-blur-xl z-50">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-2xl font-bold text-red-400 uppercase tracking-tighter">Configuration Fault</h2>
              <p className="text-white/60 mt-2 max-w-md">{configError}</p>
            </div>
          )}

          <div className="absolute bottom-8 left-8 z-30 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl glass border-accent/20 flex items-center justify-center bg-black/40 backdrop-blur-md">
              <Settings className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">Senior Partner</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">{isAvatarSpeaking ? "Delivering Probes..." : "Monitoring Stream"}</p>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
          <div className="flex-1 glass bg-white/[0.01] border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {transcript.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-6 rounded-[2rem] border ${msg.role === 'candidate' ? 'bg-accent/10 border-accent/20 text-accent' : 'glass border-white/10 bg-white/5'}`}>
                    <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={transcriptEndRef} />
          </div>

          <div className="h-24 glass bg-[#0b0e1a]/80 border-white/10 rounded-[2.5rem] p-4 flex items-center gap-4">
             <Button onClick={toggleMic} disabled={isAvatarSpeaking || isProcessing || !isAgentConnected} className={`w-16 h-16 rounded-[1.5rem] transition-all ${isMicActive ? 'bg-red-500 text-white shadow-xl animate-pulse' : 'bg-white/5 text-white/40'}`}>
               <Mic className="w-6 h-6" />
             </Button>
             <input 
               disabled={isProcessing || isAvatarSpeaking || !isAgentConnected} 
               value={userAnswer} 
               onChange={(e) => setUserAnswer(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
               className="flex-1 bg-transparent outline-none px-6 text-base font-light placeholder:text-white/20" 
               placeholder={isAvatarSpeaking ? "Interviewer is speaking..." : "Type your reasoning..."} 
             />
             <Button onClick={handleSend} disabled={!userAnswer.trim() || isProcessing || isAvatarSpeaking || !isAgentConnected} className="h-16 px-12 btn-premium rounded-[1.5rem] uppercase tracking-widest text-xs font-bold">
                Transmit <Send className="ml-3 w-4 h-4" />
             </Button>
          </div>
        </section>
      </main>

      <NavigationControls onHome={handleGoHome} onBack={handleBack} />

      <AnimatePresence>
        {isSimulationComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent mx-auto" />
                <ShieldCheck className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Finalizing Audit</h2>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Compiling Master Dossier...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VirtualArena() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <VirtualArenaContent />
    </Suspense>
  );
}