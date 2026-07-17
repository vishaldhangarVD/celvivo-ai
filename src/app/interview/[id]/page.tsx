"use client";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  const [assessmentContext, setAssessmentContext] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [agent, setAgent] = useState<any>(null);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Handle WebRTC Stream Attachment with state sync
  useEffect(() => {
    if (videoRef.current && activeMediaStream) {
      if (videoRef.current.srcObject !== activeMediaStream) {
        videoRef.current.srcObject = activeMediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("[WebRTC Play Failure]", e));
        };
      }
    }
  }, [activeMediaStream, isAgentConnected]);

  // Speech Recognition Setup
  useEffect(() => {
    const initClient = async () => {
      try {
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
        console.error("Recognition Init Fault:", e);
      }
    };
    initClient();
  }, []);

  const connectToAgent = async () => {
    if (isAgentConnected) return;
    
    const clientKey = process.env.NEXT_PUBLIC_D_ID_CLIENT_KEY;
    const agentId = process.env.NEXT_PUBLIC_D_ID_AGENT_ID;

    if (!clientKey || !agentId) {
      setConfigError(`Identity Fault: ${!clientKey ? 'CLIENT_KEY' : 'AGENT_ID'} MISSING`);
      return;
    }

    try {
      if (!didSdk) didSdk = await import("@d-id/client-sdk");

      const agentInstance = await didSdk.createAgentManager(agentId, {
        auth: { type: 'key', clientKey: clientKey },
        callbacks: {
          onSrcObjectReady: (stream: MediaStream) => {
             setActiveMediaStream(stream);
          },
          onConnectionStateChange: (state: string) => {
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
      console.error("D-ID Connection Error:", error);
      toast({ variant: "destructive", title: "Visual Node Offline" });
      throw error;
    }
  };

  const handleInterviewerSpeech = async (targetAgent: any, text: string) => {
    if (!targetAgent || !isAgentConnected) return;
    try {
      await targetAgent.speak({ type: 'text', input: text });
    } catch (e) {
      console.error("Vocal Synthesis Error:", e);
    }
  };

  // Bootstrap Simulation Journey
  useEffect(() => {
    async function init() {
      if (!user || !db || !role || !company) return;
      
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setAssessmentContext(data);
        
        try {
          const agentInstance = await connectToAgent();
          
          if (transcript.length === 0) {
            const response = await aiMockInterview({
              role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: 1, 
              history: [], targetCompany: company,
              resumeSkills: data.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
              resumeProjects: data.resumeAnalysis?.sections?.projects || [],
              resumeSummary: data.resumeAnalysis?.summary || "",
              aptitudeScore: data.aptitudeReport?.overallScore || 0,
              codingScore: data.codingReport?.score || 0,
              askedQuestions: [],
              debugMode: data.debugMode
            });

            setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
            setAskedQuestions([response.nextQuestion]);
            if (agentInstance) await handleInterviewerSpeech(agentInstance, response.nextQuestion);
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
  }, [user, db]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete || isAvatarSpeaking) return;
    
    setIsProcessing(true);
    const newTranscript = [...transcript, { role: 'candidate' as const, text: userAnswer }];
    setTranscript(newTranscript);
    const currentAns = userAnswer;
    setUserAnswer("");

    try {
      const chatHistory = newTranscript.filter(t => t.role === 'candidate').map((t) => {
        const candidateIdx = newTranscript.indexOf(t);
        const interviewerMsg = newTranscript[candidateIdx - 1];
        return {
          question: interviewerMsg?.text || "Introduction",
          answer: t.text
        };
      });

      const response = await aiMockInterview({
        role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: currentIdx + 1,
        history: chatHistory,
        userAnswer: currentAns, targetCompany: company,
        resumeSkills: assessmentContext.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
        resumeProjects: assessmentContext.resumeAnalysis?.sections?.projects || [],
        resumeSummary: assessmentContext.resumeAnalysis?.summary || "",
        aptitudeScore: assessmentContext.aptitudeReport?.overallScore || 0,
        codingScore: assessmentContext.codingReport?.score || 0,
        askedQuestions: askedQuestions,
        debugMode: assessmentContext?.debugMode
      });

      const updatedTranscript = [...newTranscript, { role: 'interviewer' as const, text: response.nextQuestion }];
      setTranscript(updatedTranscript);
      setAskedQuestions(prev => [...prev, response.nextQuestion]);
      setCurrentIdx(prev => prev + 1);

      if (response.isInterviewComplete) {
        finalizeSession(updatedTranscript);
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
      toast({ variant: "destructive", title: "Final Audit Failed" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isMicActive) recognitionRef.current.stop();
    else { setUserAnswer(""); recognitionRef.current.start(); }
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <header className="h-[10vh] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50 shrink-0">
        <div className="flex items-center gap-4">
           <Command className="w-5 h-5 text-accent" />
           <div>
             <h1 className="text-sm font-bold uppercase tracking-widest">{company} Arena</h1>
             <p className="text-[10px] text-muted-foreground uppercase font-bold">Protocol Node {currentIdx}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 glass rounded-full border-accent/20 font-mono text-accent">
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        {/* Massive AI Avatar Area */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="w-full h-full max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover z-10" 
            />
            
            {!isAgentConnected && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#050816] z-20 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                  <User className="w-10 h-10 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent animate-pulse">Establishing Link...</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Bottom Input Panel */}
        <div className="h-[15vh] bg-[#0b0e1a]/95 backdrop-blur-2xl border-t border-white/5 flex items-center px-10 gap-6 z-50">
           <Button onClick={toggleMic} disabled={isAvatarSpeaking || isProcessing || !isAgentConnected} className={`w-16 h-16 rounded-[1.5rem] shrink-0 transition-all ${isMicActive ? 'bg-red-500 text-white shadow-xl animate-pulse' : 'bg-white/5 text-white/40'}`}>
             <Mic className="w-6 h-6" />
           </Button>
           
           <div className="flex-1 relative group">
             <input 
               disabled={isProcessing || isAvatarSpeaking || !isAgentConnected} 
               value={userAnswer} 
               onChange={(e) => setUserAnswer(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
               className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl outline-none px-8 text-lg font-light placeholder:text-white/20 focus:border-accent/30 focus:bg-white/[0.05] transition-all" 
               placeholder={isAvatarSpeaking ? "Listening to the interviewer..." : "Provide your professional reasoning..."} 
             />
             <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
           </div>

           <Button onClick={handleSend} disabled={!userAnswer.trim() || isProcessing || isAvatarSpeaking || !isAgentConnected} className="h-16 px-12 btn-premium rounded-2xl uppercase tracking-widest text-xs font-bold shrink-0 shadow-2xl">
              Transmit <Send className="ml-3 w-4 h-4" />
           </Button>
        </div>
      </main>

      <NavigationControls className="top-24" onHome={() => router.push('/')} onBack={() => router.push('/interview')} />

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
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Compiling Master Dossier...</span>
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
