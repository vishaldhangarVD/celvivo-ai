"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Send, 
  Mic, 
  Command, 
  ShieldCheck,
  VideoOff,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const aiVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // User Webcam Setup
  useEffect(() => {
    async function startCamera() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err: any) {
        console.error("Camera Access Denied:", err);
        setCameraError(err.message || "Camera access denied");
        toast({
          variant: "destructive",
          title: "Hardware Node Fault",
          description: "Camera and Microphone permissions are required for the Neural Arena."
        });
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Speech Recognition Setup
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

  // Timer Logic
  useEffect(() => {
    if (isInitializing || isSimulationComplete) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isSimulationComplete]);

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
            
            if (aiVideoRef.current) {
              aiVideoRef.current.play().catch(e => console.warn("AI Video playback blocked", e));
            }
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

      if (aiVideoRef.current) {
        aiVideoRef.current.currentTime = 0;
        aiVideoRef.current.play().catch(e => console.warn("AI Video playback blocked", e));
      }

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
          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={() => router.push('/interview/coding')}
              variant="ghost" 
              className="h-9 px-4 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent"
            >
              Skip → Coding
            </Button>
          )}
          <div className="px-5 py-2 glass rounded-full border-accent/20 font-mono text-accent">
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="w-full h-full max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            {/* User Live Camera Feed (Large Area) */}
            {cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a] text-center p-12 space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <VideoOff className="w-10 h-10 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Camera Access Required</h3>
                  <p className="text-muted-foreground font-light max-w-md">Please enable camera and microphone permissions in your browser to proceed with the neural interview simulation.</p>
                </div>
                <Button onClick={() => window.location.reload()} className="btn-premium px-8">Retry Neural Link</Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}

            {/* AI Interviewer (Small Floating Box) */}
            <div className="absolute bottom-10 right-10 w-80 aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-20 bg-[#0b0e1a]">
               <video 
                 ref={aiVideoRef}
                 src="/interviewer-female.mp4"
                 poster="/hr.png.png"
                 className="w-full h-full object-cover"
                 loop
                 playsInline
               />
               <div className="absolute bottom-4 left-4">
                 <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black tracking-widest uppercase">AI Interviewer</Badge>
               </div>
            </div>
          </div>
        </div>

        <div className="h-[15vh] bg-[#0b0e1a]/95 backdrop-blur-2xl border-t border-white/5 flex items-center px-10 gap-6 z-50">
           <Button onClick={toggleMic} disabled={isProcessing} className={`w-16 h-16 rounded-[1.5rem] shrink-0 transition-all ${isMicActive ? 'bg-red-500 text-white shadow-xl animate-pulse' : 'bg-white/5 text-white/40'}`}>
             <Mic className="w-6 h-6" />
           </Button>
           
           <div className="flex-1 relative group">
             <input 
               disabled={isProcessing} 
               value={userAnswer} 
               onChange={(e) => setUserAnswer(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
               className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl outline-none px-8 text-lg font-light placeholder:text-white/20 focus:border-accent/30 focus:bg-white/[0.05] transition-all" 
               placeholder="Provide your professional reasoning..." 
             />
             <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
           </div>

           <Button onClick={handleSend} disabled={!userAnswer.trim() || isProcessing} className="h-16 px-12 btn-premium rounded-2xl uppercase tracking-widest text-xs font-bold shrink-0 shadow-2xl">
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