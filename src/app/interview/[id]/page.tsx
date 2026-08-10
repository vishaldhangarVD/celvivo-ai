"use client";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Send, 
  Mic, 
  Command, 
  ShieldCheck,
  VideoOff,
  AlertCircle,
  Brain,
  Home,
  MessageSquare,
  BarChart4,
  HelpCircle,
  Settings,
  PhoneOff,
  MicOff,
  StickyNote,
  RotateCw,
  Frown,
  Flag,
  ChevronRight,
  Timer
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function VirtualArenaContent() {
  const router = useRouter();
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
  const [assessmentContext, setAssessmentContext] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const aiVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentInterviewerQuestion = useMemo(() => {
    const lastInterviewer = [...transcript].reverse().find(t => t.role === 'interviewer');
    return lastInterviewer?.text || "Initializing session...";
  }, [transcript]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (userVideoRef.current?.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      userVideoRef.current.srcObject = null;
    }

    if (userVideoRef.current) {
      try {
        userVideoRef.current.pause();
      } catch (e) {}
      userVideoRef.current.srcObject = null;
    }
  };

  const playAiVideo = async () => {
    const video = aiVideoRef.current;
    if (!video) return;

    try {
      if (video.readyState >= 2) {
        video.currentTime = 0;
        await video.play();
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.warn("AI video playback failed:", error);
      }
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not available in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      mediaStreamRef.current = mediaStream;

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = mediaStream;
        try {
          await userVideoRef.current.play();
        } catch (error: any) {
          if (error?.name !== "AbortError") {
            console.error("Camera video playback error:", error);
          }
        }
      }
    } catch (error: any) {
      console.error("CAMERA START ERROR:", error);
      setCameraError(error?.message || "Unable to access camera. Please check your permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    const handlePageHide = () => stopCamera();
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  useEffect(() => {
    const initRecognition = async () => {
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
    initRecognition();
  }, []);

  useEffect(() => {
    if (isSimulationComplete) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSimulationComplete]);

  useEffect(() => {
    async function init() {
      if (!user || !db || !role || !company) return;
      
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setAssessmentContext(data);
        
        try {
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
            playAiVideo();
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
  }, [user, db, role, company, exp, round, router, transcript.length]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete) return;
    
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

      playAiVideo();

      if (response.isInterviewComplete) {
        finalizeSession(updatedTranscript);
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
        codingContext: {
          score: assessmentContext.codingReport?.score || 0,
          readability: 85,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          status: assessmentContext.codingReport?.status || "N/A"
        }
      });

      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        userId: user.uid, 
        role, 
        company, 
        experienceLevel: exp, 
        round,
        history: currentTranscript, 
        overallScore: finalAudit.overallScore,
        codingScore: assessmentContext.codingReport?.score || 0,
        feedback: finalAudit, 
        createdAt: serverTimestamp(),
      });
      
      await deleteDoc(doc(db, 'users', user.uid, 'journey', 'active'));
      stopCamera();
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-dvh bg-black flex overflow-hidden">
      <div className="particles-bg" />
      
      {/* LEFT SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-[#0b0e1a] flex flex-col items-center py-10 gap-10 z-[60]">
        <Link href="/">
          <Button variant="ghost" size="icon" onClick={stopCamera} className="w-12 h-12 rounded-2xl glass hover:bg-accent/10 hover:text-accent transition-all">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/20">
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl glass hover:bg-white/5 text-white/40">
          <BarChart4 className="w-5 h-5" />
        </Button>
        <div className="mt-auto flex flex-col gap-6">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl glass hover:bg-white/5 text-white/40">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl glass hover:bg-white/5 text-white/40">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-[10vh] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50 shrink-0">
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 font-black text-xl">G</div>
             <div>
               <h1 className="text-sm font-black uppercase tracking-widest text-premium">{company.toUpperCase()} ARENA</h1>
               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Protocol Node {currentIdx}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Button 
              onClick={() => router.push('/interview/coding')} 
              variant="ghost" 
              className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent"
            >
              Skip → Coding
            </Button>
            <div className="px-6 py-2 glass rounded-xl border-accent/20 font-mono text-xl text-accent tabular-nums flex items-center gap-3">
              <Timer className="w-5 h-5" /> {formatTime(timeLeft)}
            </div>
          </div>
        </header>

        {/* MAIN VIDEO AREA */}
        <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-[#050816]">
          <div className="flex-1 min-h-0 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full h-full max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
              {cameraError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a] text-center p-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <VideoOff className="w-10 h-10 text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Camera Access Required</h3>
                    <p className="text-muted-foreground font-light max-w-md">Please enable camera and microphone permissions in your browser to proceed with the neural interview simulation.</p>
                  </div>
                  <button onClick={startCamera} className="btn-premium px-8 py-3 rounded-full text-white font-bold">Enable Camera</button>
                </div>
              ) : (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}

              {/* QUESTION CARD */}
              <div className="absolute top-1/2 -translate-y-1/2 left-10 z-40">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={currentIdx}
                  className="glass p-10 rounded-[2.5rem] border-white/10 w-[420px] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-accent group-hover:shadow-[0_0_20px_#22d3ee] transition-all" />
                  <div className="space-y-2">
                    <Badge className="bg-accent/20 text-accent border-none text-[10px] font-black uppercase tracking-widest px-4 py-1">QUESTION {currentIdx} / 10</Badge>
                    <h3 className="text-2xl font-bold text-white leading-tight tracking-tight mt-4">
                      {currentInterviewerQuestion}
                    </h3>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">AI Interviewer is asking...</span>
                  </div>
                </motion.div>
              </div>

              {/* AI INTERVIEWER FLOATING BOX */}
              <div
                className="
                  absolute
                  bottom-8
                  right-8
                  z-30
                  w-[280px]
                  sm:w-[320px]
                  aspect-video
                  rounded-[2.5rem]
                  overflow-hidden
                  border border-white/10
                  shadow-2xl
                  bg-[#0b0e1a]
                "
              >
                <video
                  ref={aiVideoRef}
                  src="/interviewer-female.mp4"
                  poster="/hr.png.png"
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  autoPlay
                  muted
                />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black tracking-widest uppercase px-3 py-1">
                    AI INTERVIEWER
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTROL BAR */}
          <footer className="h-[12vh] shrink-0 bg-[#0b0e1a]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between px-12 z-50">
             <div className="flex items-center gap-6">
               <Button 
                onClick={() => finalizeSession(transcript)}
                className="h-14 px-8 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold text-[10px] uppercase tracking-widest flex gap-3 group"
               >
                 <PhoneOff className="w-4 h-4 group-hover:animate-bounce" /> End Interview
               </Button>
               <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl glass hover:bg-white/5 text-white/40">
                 <MicOff className="w-5 h-5" />
               </Button>
             </div>

             <div className="flex-1 flex justify-center">
                <Button 
                  onClick={toggleMic} 
                  disabled={isProcessing} 
                  className={cn(
                    "w-24 h-24 rounded-full transition-all duration-500 flex items-center justify-center shadow-2xl relative",
                    isMicActive ? "bg-red-500 text-white animate-pulse" : "btn-premium text-white"
                  )}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping opacity-20" />
                  {isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10" />}
                </Button>
             </div>

             <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl glass hover:bg-white/5 text-white/40"><StickyNote className="w-4 h-4" /></Button>
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl glass hover:bg-white/5 text-white/40"><RotateCw className="w-4 h-4" /></Button>
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl glass hover:bg-white/5 text-white/40"><Frown className="w-4 h-4" /></Button>
               <div className="w-px h-8 bg-white/5 mx-2" />
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl glass hover:bg-white/5 text-white/40"><Flag className="w-4 h-4" /></Button>
             </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {isInitializing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent mx-auto" />
                <Brain className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Calibrating Arena</h2>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Synthesizing First Node...</span>
              </div>
            </div>
          </motion.div>
        )}

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
