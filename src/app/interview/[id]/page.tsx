"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Send, 
  Mic, 
  Video, 
  LogOut, 
  Timer, 
  ShieldCheck, 
  Command, 
  ChevronRight,
  User,
  BrainCircuit,
  Terminal,
  Activity,
  Volume2,
  Cpu,
  RefreshCcw,
  CircleAlert,
  Wifi,
  Link2,
  Home,
  LayoutDashboard
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { synthesizeAudio } from "@/ai/flows/ai-audio-synthesis";
import { getStreamingToken } from "@/services/did";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

let createAgent: any;

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
  const [transcript, setTranscript] = useState<{role: 'interviewer' | 'candidate', text: string, feedback?: string}[]>([]);
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

  const [agent, setAgent] = useState<any>(null);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isConnectingAgent, setIsConnectingAgent] = useState(false);

  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const initClient = async () => {
      const sdk = await import("@d-id/client-sdk");
      createAgent = sdk.createAgent;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
    };
    initClient();
  }, []);

  const connectToAgent = async () => {
    if (isAgentConnected || !createAgent) return;
    setIsConnectingAgent(true);
    try {
      const auth = await getStreamingToken();
      if (!auth.success || !auth.token || !auth.agentId) throw new Error(auth.error);
      const agentInstance = await createAgent(auth.agentId, {
        auth: { type: 'token', token: auth.token },
        callbacks: {
          onSrcObjectReady: (stream: any) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(e => console.warn(e));
            }
          },
          onConnectionStateChange: (state: string) => {
            if (state === 'connected') setIsAgentConnected(true);
            if (state === 'disconnected') setIsAgentConnected(false);
          },
          onVideoStatusChange: (status: string) => {
            setIsAvatarSpeaking(status === 'play');
          }
        }
      });
      await agentInstance.connect();
      setAgent(agentInstance);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Visual Node Offline", description: "Falling back to high-fidelity audio." });
    } finally {
      setIsConnectingAgent(false);
    }
  };

  const handleInterviewerResponse = async (text: string) => {
    if (agent && isAgentConnected) {
      try {
        setIsAvatarSynthesizing(true);
        await agent.speak({ type: 'text', input: text });
        setIsAvatarSynthesizing(false);
      } catch (e) {
        fallbackTTS(text);
      }
    } else {
      fallbackTTS(text);
    }
  };

  const fallbackTTS = async (text: string) => {
    setIsAvatarSynthesizing(false);
    setIsAvatarSpeaking(true);
    try {
      const audioUri = await synthesizeAudio(text);
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.play();
      }
    } catch (e) {
      setIsAvatarSpeaking(false);
    }
  };

  useEffect(() => {
    async function init() {
      if (!user || !db || !role || !company || !exp) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setAssessmentContext(data);
        await connectToAgent();
        if (transcript.length === 0) {
          try {
            const response = await aiMockInterview({
              role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: 1, history: [],
              targetCompany: company,
              resumeSkills: data.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
              resumeProjects: data.resumeAnalysis?.sections?.projects || [],
              resumeSummary: data.resumeAnalysis?.summary || "",
              aptitudePerformance: data.aptitudeReport?.recommendation || "N/A",
              codingPerformance: data.codingReport?.finalRecommendation || "N/A",
              difficultyLevel: "MEDIUM",
              askedQuestions: [],
              debugMode: data.debugMode || false
            });
            setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
            setAskedQuestions([response.nextQuestion]);
            setTimeout(() => handleInterviewerResponse(response.nextQuestion), 3000);
          } catch (e) {
            toast({ variant: "destructive", title: "Arena Handshake Failed" });
          } finally {
            setIsInitializing(false);
          }
        } else {
          setIsInitializing(false);
        }
      } else {
        router.push('/interview');
      }
    }
    init();
    return () => { if (agent) agent.disconnect(); };
  }, [user, db, role, company, exp, round]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isMicActive) recognitionRef.current.stop();
    else { setUserAnswer(""); recognitionRef.current.start(); }
  };

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete || isAvatarSpeaking || isAvatarSynthesizing) return;
    if (isMicActive && recognitionRef.current) recognitionRef.current.stop();
    setIsProcessing(true);
    const newEntry = { role: 'candidate' as const, text: userAnswer };
    const updatedTranscript = [...transcript, newEntry];
    setTranscript(updatedTranscript);
    const currentAns = userAnswer;
    setUserAnswer("");
    try {
      const response = await aiMockInterview({
        role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: currentIdx + 1,
        history: updatedTranscript.map((t, i) => t.role === 'candidate' ? { question: updatedTranscript[i-1]?.text || "", answer: t.text } : null).filter(Boolean) as any,
        userAnswer: currentAns,
        targetCompany: company,
        resumeSkills: assessmentContext.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
        resumeProjects: assessmentContext.resumeAnalysis?.sections?.projects || [],
        aptitudePerformance: assessmentContext.aptitudeReport?.recommendation || "N/A",
        codingPerformance: assessmentContext.codingReport?.finalRecommendation || "N/A",
        difficultyLevel: difficulty,
        askedQuestions: askedQuestions,
        debugMode: assessmentContext.debugMode || false
      });
      const finalFullTranscript = [...updatedTranscript, { role: 'interviewer' as const, text: response.nextQuestion }];
      setTranscript(finalFullTranscript);
      setAskedQuestions(prev => [...prev, response.nextQuestion]);
      setCurrentIdx(prev => prev + 1);
      if (response.isInterviewComplete || (assessmentContext.debugMode && currentIdx >= 5) || currentIdx >= 15) finalizeSession(finalFullTranscript);
      else await handleInterviewerResponse(response.nextQuestion);
    } catch (error) {
      toast({ variant: "destructive", title: "Transmission Error" });
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
        },
        aptitudeContext: {
          overallScore: assessmentContext.aptitudeReport?.overallScore || 0,
          quantitative: assessmentContext.aptitudeReport?.categoryScores?.quantitative || 0,
          logical: assessmentContext.aptitudeReport?.categoryScores?.logical || 0,
          english: assessmentContext.aptitudeReport?.categoryScores?.english || 0,
          status: assessmentContext.aptitudeReport?.status || 'N/A',
        },
        codingContext: {
          score: assessmentContext.codingReport?.score || 0,
          readability: assessmentContext.codingReport?.audit?.readabilityScore || 0,
          timeComplexity: assessmentContext.codingReport?.audit?.timeComplexity || 'N/A',
          spaceComplexity: assessmentContext.codingReport?.audit?.spaceComplexity || 'N/A',
          status: assessmentContext.codingReport?.status || 'N/A',
        }
      });
      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        userId: user.uid, role, company, experienceLevel: exp, round,
        history: currentTranscript, overallScore: finalAudit.overallScore,
        feedback: finalAudit, createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'users', user.uid, 'journey', 'active'), { step: 11, finalReportId: docRef.id }, { merge: true });
      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Master Audit Synthesis Failed" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleResetSession = async () => {
    if (!user || !db) return;
    if (agent) agent.disconnect();
    
    // Purge temp session
    await deleteDoc(doc(db, 'users', user.uid, 'journey', 'active'));
    localStorage.removeItem("resumeAnalysis");
    
    router.push('/interview');
    toast({ title: "Session Reset", description: "Neural state purged. Returning to initialization." });
  };

  const handleGoHome = async () => {
    if (!user || !db) return;
    if (agent) agent.disconnect();
    
    await deleteDoc(doc(db, 'users', user.uid, 'journey', 'active'));
    localStorage.removeItem("resumeAnalysis");
    
    router.push('/dashboard');
    toast({ title: "Session Aborted", description: "Progress cleared. Returning to Dashboard." });
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <audio ref={audioRef} onEnded={() => setIsAvatarSpeaking(false)} hidden />
      
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
           <Command className="w-5 h-5 text-accent" />
           <div>
             <h1 className="text-sm font-bold uppercase tracking-widest">{company}</h1>
             <p className="text-[10px] text-muted-foreground uppercase font-bold">Node {currentIdx}/{assessmentContext?.debugMode ? '5' : '15'}</p>
           </div>
        </div>
        <div className="flex items-center gap-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="h-10 px-4 glass border-white/5 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest gap-2">
                <RefreshCcw className="w-3.5 h-3.5" /> Restart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-white/10 bg-[#0b0e1a] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Restart Interview?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">Terminate this session and return to initialization. Current progress will be lost. Account stays logged in. Confirm?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent text-white border-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetSession} className="bg-red-500 text-white">Confirm Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="px-5 py-2 glass rounded-full border-accent/20 font-mono text-accent">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8 overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 premium-card bg-black/40 p-0 overflow-hidden relative group">
            <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ${isAgentConnected ? 'opacity-100' : 'opacity-0'}`} autoPlay playsInline />
            {!isAgentConnected && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                  <User className="w-10 h-10 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent animate-pulse">Initializing Link...</p>
              </div>
            )}
            <div className="absolute bottom-6 left-6 z-30">
               <p className="text-xl font-bold">Senior Partner</p>
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-white/40 uppercase font-bold">
                   {isAvatarSynthesizing ? "Synthesizing Thought..." : isAvatarSpeaking ? "Speaking..." : "Listening"}
                 </p>
                 {(isAvatarSpeaking || isAvatarSynthesizing) && <Activity className={`w-3 h-3 ${isAvatarSynthesizing ? 'text-purple-400' : 'text-accent'} animate-pulse`} />}
               </div>
            </div>
          </Card>
          <div className="flex gap-4">
             <Button onClick={handleGoHome} variant="outline" className="flex-1 h-14 glass border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest gap-2">
               <Home className="w-4 h-4" /> Dashboard
             </Button>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <Card className="premium-card bg-[#0b0e1a]/80 p-8 border-glow-premium">
             <h2 className="text-xl md:text-2xl font-bold leading-tight">
               {isSimulationComplete ? "Gauntlet Complete." : isProcessing ? "Synthesizing next node..." : isAvatarSynthesizing ? "Architecting logic..." : isAvatarSpeaking ? "Listening..." : transcript.filter(t => t.role === 'interviewer').slice(-1)[0]?.text || "Initializing session..."}
             </h2>
          </Card>
          
          <Card className="flex-1 premium-card bg-black/40 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-2xl border ${msg.role === 'candidate' ? 'bg-accent/10 border-accent/20' : 'glass border-white/5'}`}>
                  <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </Card>

          <div className="h-24 glass rounded-[2rem] p-4 flex items-center gap-4">
             <Button onClick={toggleMic} disabled={isAvatarSpeaking || isAvatarSynthesizing || isProcessing || isSimulationComplete || !isAgentConnected} className={`w-14 h-14 rounded-2xl transition-all ${isMicActive ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/10 text-red-400'}`}>
               <Mic className="w-6 h-6" />
             </Button>
             <input disabled={isProcessing || isAvatarSpeaking || isAvatarSynthesizing || isSimulationComplete || !isAgentConnected} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent outline-none px-6 text-sm font-light" placeholder={isAvatarSpeaking ? "Interviewer is speaking..." : "Speak or type your reasoning..."} />
             <Button onClick={handleSend} disabled={!userAnswer.trim() || isProcessing || isAvatarSpeaking || isAvatarSynthesizing || isSimulationComplete || !isAgentConnected} className="h-14 px-10 btn-premium rounded-2xl">Transmit</Button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isSimulationComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent mx-auto shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
                <ShieldCheck className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
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
