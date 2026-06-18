"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Clock, 
  User, 
  Loader2,
  LogOut,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Command,
  Timer,
  ChevronRight,
  AlertTriangle,
  Terminal,
  Code2,
  Info
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

const TOTAL_QUESTIONS = 5;
const QUESTION_TIMEOUT = 120; // Increased to 120s for more complex 5-node questions

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Senior';
  const round = searchParams.get('round') || 'Technical';
  const debugEnabled = searchParams.get('debug') === 'true';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [nextOutput, setNextOutput] = useState<AiMockInterviewOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalTimer, setTotalTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(QUESTION_TIMEOUT);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hrImg = PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || "";

  // Resume Ingestion
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user?.uid]);
  const { data: resumes } = useCollection(resumeQuery);

  const resumeContext = useMemo(() => {
    const r = resumes?.[0];
    if (!r) return undefined;
    return {
      skills: r.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
      projects: r.analysis?.sections?.projects || [],
      experienceSummary: r.analysis?.sections?.experience?.[0] || "",
      certifications: r.analysis?.sections?.certifications || []
    };
  }, [resumes]);

  useEffect(() => {
    const start = async () => {
      if (!nextOutput && !isProcessing) {
        setIsProcessing(true);
        try {
          const output = await aiMockInterview({
            role, 
            experienceLevel: exp, 
            roundType: round, 
            currentMainQuestionIndex: 1, 
            history: [], 
            resumeContext,
            debugMode: debugEnabled
          });
          setNextOutput(output);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    start();

    const t = setInterval(() => setTotalTimer(s => s + 1), 1000);
    const qt = setInterval(() => setQuestionTimer(s => Math.max(0, s - 1)), 1000);
    return () => { clearInterval(t); clearInterval(qt); };
  }, [resumeContext, resumes, debugEnabled, role, exp, round]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isProcessing]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing) return;
    const ans = userAnswer;
    setUserAnswer('');
    
    const turn = { 
      question: nextOutput?.nextQuestion || '', 
      answer: ans, 
      feedback: nextOutput?.feedbackOnLastAnswer 
    };
    const newHistory = [...history, turn];
    setHistory(newHistory);
    setCurrentIdx(i => i + 1);
    setQuestionTimer(QUESTION_TIMEOUT);
    setIsProcessing(true);

    try {
      const output = await aiMockInterview({
        role, 
        experienceLevel: exp, 
        roundType: round, 
        currentMainQuestionIndex: newHistory.length + 1, 
        history: newHistory, 
        userAnswer: ans, 
        resumeContext,
        debugMode: debugEnabled
      });
      setNextOutput(output);
      if (output.isInterviewComplete) setIsComplete(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const finish = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        userId: user.uid, 
        role, 
        experienceLevel: exp, 
        round, 
        history, 
        duration: totalTimer, 
        createdAt: serverTimestamp(), 
        overallScore: 0
      });
      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden text-white">
      <div className="particles-bg" />
      
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg"><Command className="w-5 h-5" /></div>
          <div>
            <h1 className="text-sm font-bold">{role} • {round}</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <p className="text-[8px] font-black uppercase tracking-widest text-accent">
                {nextOutput?.isMock ? "Mock Survival Mode Active" : "Optimized 5-Node Protocol"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {nextOutput?.isMock && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2 text-[8px] font-black tracking-widest uppercase animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-2" /> [MOCK MODE ACTIVE]
            </Badge>
          )}
          {!nextOutput?.isMock && (
             <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-2 text-[8px] font-black tracking-widest uppercase">
              <ShieldCheck className="w-3 h-3 mr-2" /> [RESUME-AWARE INTERVIEW]
            </Badge>
          )}
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <Timer className={`w-4 h-4 ${questionTimer < 15 ? 'text-red-500 animate-bounce' : 'text-accent'}`} />
            <span className="tabular-nums font-bold text-xs tracking-widest">{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-[10px] font-bold uppercase tracking-widest text-white/40"><LogOut className="w-4 h-4 mr-2" /> Abort</Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-[35%] relative border-r border-white/5 bg-black/20 flex flex-col items-center justify-center p-12">
          <motion.div 
            animate={{ scale: isProcessing ? [1, 1.02, 1] : 1 }} 
            transition={{ duration: 3, repeat: Infinity }} 
            className="relative w-full max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 glass"
          >
            <Image src={hrImg} alt="Interviewer" fill className="object-cover brightness-110" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <AnimatePresence>
              {nextOutput?.nextQuestion && !isProcessing && !isComplete && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 left-8 right-8 z-20">
                  <div className="glass p-6 rounded-3xl border-accent/40 bg-accent/10 backdrop-blur-2xl text-sm font-medium leading-relaxed">
                    {nextOutput.nextQuestion}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <div className="mt-8 flex items-center gap-4 px-6 py-4 glass rounded-2xl border-white/5 bg-white/[0.02]">
            <Info className="w-4 h-4 text-accent" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Turn {Math.min(currentIdx + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS} • High Fidelity Node
            </p>
          </div>
        </section>

        <section className="flex-1 flex flex-col">
          <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Velocity</span>
                <span className="text-xs font-bold tabular-nums text-accent">{currentIdx} / {TOTAL_QUESTIONS}</span>
              </div>
              <Progress value={(currentIdx / TOTAL_QUESTIONS) * 100} className="h-1.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12 custom-scrollbar">
            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-row-reverse gap-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-accent" /></div>
                  <div className="p-6 glass rounded-2xl rounded-tr-none flex-1 max-w-[80%] text-right bg-white/[0.05] text-lg font-light leading-relaxed">
                    {h.answer}
                  </div>
                </div>
                {h.feedback && (
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400 shrink-0"><Zap className="w-5 h-5" /></div>
                    <div className="p-6 glass rounded-2xl rounded-tl-none max-w-[80%] bg-purple-500/5 border-purple-500/10 italic text-white/60">
                      "{h.feedback}"
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-4 items-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Recalibrating Arena Logic...</span>
              </div>
            )}
            
            {isComplete && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="premium-card p-16 text-center space-y-8 bg-accent/[0.02]">
                <ShieldCheck className="w-16 h-16 text-accent mx-auto" />
                <h2 className="text-4xl font-bold tracking-tighter text-premium">Simulation Terminated.</h2>
                <p className="text-muted-foreground font-light">Your session transcript has been archived. Deploying final performance audit.</p>
                <Button onClick={finish} disabled={isSaving} className="h-16 px-12 btn-premium uppercase tracking-[0.3em] font-bold text-xs">
                  {isSaving ? "Finalizing Audit..." : "Synthesize Performance Report"}
                </Button>
              </motion.div>
            )}
            <div ref={chatEndRef} className="h-20" />
          </div>

          {!isComplete && (
            <footer className="p-8 glass bg-[#050816]/80 backdrop-blur-3xl">
              <div className="max-w-4xl mx-auto flex items-end gap-6">
                <textarea 
                  value={userAnswer} 
                  onChange={e => setUserAnswer(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} 
                  placeholder="Transmit your response..." 
                  rows={2} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg font-light focus:outline-none focus:border-accent resize-none transition-all placeholder:text-white/20" 
                />
                <Button onClick={handleSend} disabled={isProcessing || !userAnswer.trim()} className="h-20 w-20 rounded-2xl btn-premium shrink-0 shadow-2xl flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </Button>
              </div>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}