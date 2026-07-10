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
  MicOff,
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
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

function TechnicalArenaContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const role = searchParams.get("role") || "Software Engineer";
  const company = searchParams.get("company") || "Standard Tech";
  const exp = searchParams.get("exp") || "Senior";
  const round = searchParams.get("round") || "Technical Round";

  const [currentIdx, setCurrentIdx] = useState(1);
  const [transcript, setTranscript] = useState<{role: 'interviewer' | 'candidate', text: string}[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // AI State Tracking
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<any>("INTRODUCTION");
  const [difficulty, setDifficulty] = useState<any>("MEDIUM");

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Resume context from local storage (synced during screening)
  const resumeContext = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem("resumeAnalysis");
    return stored ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await aiMockInterview({
          role,
          experienceLevel: exp,
          roundType: round,
          currentMainQuestionIndex: 1,
          history: [],
          targetCompany: company,
          resumeSkills: resumeContext?.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
          resumeProjects: resumeContext?.analysis?.sections?.projects || [],
          resumeSummary: resumeContext?.analysis?.summary || "",
          interviewStage: "INTRODUCTION",
          difficultyLevel: "MEDIUM"
        });

        setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
        setAskedQuestions([response.nextQuestion]);
        setCurrentStage(response.nextInterviewStage);
      } catch (error) {
        console.error("Initialization Failed:", error);
        toast({ variant: "destructive", title: "Neural Sync Failed", description: "Could not initialize simulation persona." });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [role, company, exp, round, resumeContext, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete) return;
    
    setIsProcessing(true);
    const newEntry = { role: 'candidate' as const, text: userAnswer };
    const updatedHistory = [...transcript, newEntry].map(t => ({
      question: t.role === 'interviewer' ? t.text : '',
      answer: t.role === 'candidate' ? t.text : ''
    })).filter(h => h.question || h.answer);

    setTranscript(prev => [...prev, newEntry]);
    const currentAnswer = userAnswer;
    setUserAnswer("");

    try {
      const response = await aiMockInterview({
        role,
        experienceLevel: exp,
        roundType: round,
        currentMainQuestionIndex: currentIdx + 1,
        history: updatedHistory as any,
        userAnswer: currentAnswer,
        targetCompany: company,
        askedQuestions,
        interviewStage: currentStage,
        difficultyLevel: difficulty,
        resumeSkills: resumeContext?.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
        resumeProjects: resumeContext?.analysis?.sections?.projects || []
      });

      setTranscript(prev => [...prev, { role: 'interviewer', text: response.nextQuestion }]);
      setAskedQuestions(prev => [...prev, response.nextQuestion]);
      setCurrentStage(response.nextInterviewStage);
      setCurrentIdx(prev => prev + 1);
      
      if (response.isInterviewComplete || currentIdx >= 9) {
        setIsSimulationComplete(true);
        archiveSession([...transcript, newEntry, { role: 'interviewer', text: response.nextQuestion }]);
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      toast({ variant: "destructive", title: "Neural Link Dropped", description: "Retrying connection to simulation host..." });
    } finally {
      setIsProcessing(false);
    }
  };

  const archiveSession = async (finalTranscript: any[]) => {
    if (!user || !db) return;
    try {
      const interviewData = {
        userId: user.uid,
        role,
        experienceLevel: exp,
        company,
        round,
        history: finalTranscript,
        createdAt: serverTimestamp(),
        overallScore: 0, // Calculated in feedback phase
      };
      await addDoc(collection(db, 'users', user.uid, 'interviews'), interviewData);
    } catch (e) {
      console.error("Archive Failure:", e);
    }
  };

  const toggleMic = () => setIsMicActive(!isMicActive);

  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <BrainCircuit className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium">Establishing Neural Link...</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">Calibrating {company} Simulation Persona</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Command className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">{company} • Live Arena</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{role} • Round {currentIdx}/9</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 px-5 py-2 glass rounded-full border-accent/20">
            <Timer className="w-4 h-4 text-accent" />
            <span className="font-mono text-lg font-bold text-accent">{formatTime(timeLeft)}</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" /> Abort Session
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 flex flex-col lg:grid lg:grid-cols-12 gap-8 overflow-hidden">
        
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          <Card className="flex-1 premium-card bg-black/40 border-white/5 p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
              <Badge className="bg-accent/20 text-accent border-none uppercase text-[8px] font-bold tracking-widest px-3 py-1">Neural Host Connected</Badge>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            
            <div className="h-full flex items-center justify-center bg-[#0b0e1a]">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-2 border-accent/20 flex items-center justify-center animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-accent opacity-20" />
                </div>
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-accent/50" />
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-20">
              <p className="text-xl font-bold text-white">Senior Recruiter</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nexvoro Engine v7.2</p>
            </div>
          </Card>

          <Card className="h-48 premium-card bg-black/40 border-white/5 p-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <User className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Candidate Deployment Feed</p>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center glass border-white/10 ${isMicActive ? 'text-accent' : 'text-red-400'}`}>
                {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glass border-white/10 text-white/20">
                <Video className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          
          <Card className="premium-card bg-[#0b0e1a]/80 border-glow-premium p-8 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <Badge className="bg-purple-500/20 text-purple-400 border-none uppercase text-[8px] font-bold tracking-[0.3em] px-3 py-1">Mission Node {currentIdx} / 9</Badge>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
                <Activity className="w-3 h-3 text-accent" /> Analyzing Semantic Vectors
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-white/90">
              {isProcessing ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-muted-foreground animate-pulse font-light italic">Synthesizing next probe...</span>
                </div>
              ) : (
                transcript.filter(t => t.role === 'interviewer').slice(-1)[0]?.text
              )}
            </h2>
          </Card>

          <Card className="flex-1 premium-card bg-black/40 border-white/5 p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Terminal className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Neural Transcript Matrix</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              {transcript.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-5 rounded-2xl border ${
                    msg.role === 'candidate' 
                    ? 'bg-accent/10 border-accent/20 text-white rounded-tr-none' 
                    : 'glass border-white/5 text-white/70 rounded-tl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.role === 'candidate' ? 'text-accent' : 'text-purple-400'}`}>
                        {msg.role === 'candidate' ? 'Identity Verified Candidate' : `${company} Senior Interviewer`}
                      </span>
                    </div>
                    <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </Card>

          <div className="h-24 glass rounded-[2.5rem] border-white/10 p-4 flex items-center gap-4 bg-[#0b0e1a]/80 shadow-2xl relative">
            <div className="flex items-center gap-2 px-4 border-r border-white/5 h-full">
              <Button 
                onClick={toggleMic}
                variant="ghost" 
                size="icon" 
                className={`w-12 h-12 rounded-2xl transition-all ${isMicActive ? 'bg-accent text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-red-500/10 text-red-400'}`}
              >
                {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
            </div>
            
            <div className="flex-1 h-full relative">
              <input 
                disabled={isProcessing || isSimulationComplete}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isProcessing ? "Processing response vectors..." : isMicActive ? "Neural audio link active... speak clearly" : "Transcribe your technical reasoning..."}
                className="w-full h-full bg-transparent outline-none border-none text-white px-4 text-sm font-light placeholder:text-white/20 disabled:opacity-50"
              />
              {isMicActive && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [8, 20, 8] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 bg-accent rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pr-2">
              <Button 
                onClick={handleSend}
                disabled={!userAnswer.trim() || isProcessing || isSimulationComplete}
                className="h-14 px-8 btn-premium rounded-2xl group"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="ml-3 text-[10px] font-bold uppercase tracking-widest">Transmit</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isSimulationComplete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <ShieldCheck className="w-12 h-12 text-accent" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Arena Protocol Complete</h2>
                <p className="text-muted-foreground font-light text-lg">Simulation terminated. Technical performance nodes for {company} have been archived.</p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full h-18 btn-premium text-xs font-bold tracking-[0.3em] uppercase"
              >
                Finalize Performance Audit <ChevronRight className="ml-3 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TechnicalArena() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    }>
      <TechnicalArenaContent />
    </Suspense>
  );
}