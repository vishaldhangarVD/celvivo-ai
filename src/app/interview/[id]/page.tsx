
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2,
  LogOut,
  Zap,
  ShieldCheck,
  Command,
  Timer,
  AlertTriangle,
  Info,
  Mic,
  Video,
  Settings,
  MessageSquare
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

const TOTAL_QUESTIONS = 5;
const QUESTION_TIMEOUT = 120;

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
  const [resumeReady, setResumeReady] = useState(false);
  const [cachedAnalysis, setCachedAnalysis] = useState<any>(null);

  // Diagnostic Video Monitoring
  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.addEventListener('loadeddata', () => {
        console.log("[RESUME-AWARE] Video avatar loaded successfully");
      });
      videoElement.addEventListener('error', (e) => {
        console.error("[RESUME-AWARE] Video avatar failed to load. Ensure file is at public/vishal.mp4");
      });
    }
  }, []);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("resumeAnalysis");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCachedAnalysis(parsed);
          console.log("[RESUME LOADED] Identified in local cache.");
          setResumeReady(true);
        } catch (e) {
          console.error("Failed to parse cached resume analysis", e);
        }
      }
    }
  }, []);

  // Resume Ingestion (Firestore Fallback)
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user?.uid]);
  const { data: resumes, loading: resumesLoading } = useCollection(resumeQuery);

  // Fallback Sync
  useEffect(() => {
    if (!resumeReady && !resumesLoading) {
      console.log("[RESUME LOADED] Synchronization protocol complete.");
      setResumeReady(true);
    }
  }, [resumeReady, resumesLoading]);

  const resumeContext = useMemo(() => {
    if (cachedAnalysis) {
      return {
        skills: cachedAnalysis.skillAnalysis?.map((s: any) => s.skill) || [],
        projects: cachedAnalysis.sections?.projects || [],
        experienceSummary: cachedAnalysis.sections?.experience?.[0] || "",
        certifications: cachedAnalysis.sections?.certifications || []
      };
    }
    const r = resumes?.[0];
    if (!r) return undefined;
    return {
      skills: r.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
      projects: r.analysis?.sections?.projects || [],
      experienceSummary: r.analysis?.sections?.experience?.[0] || "",
      certifications: r.analysis?.sections?.certifications || []
    };
  }, [resumes, cachedAnalysis]);

  useEffect(() => {
    if (!resumeReady) return;

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
            resumeSkills: resumeContext?.skills,
            resumeProjects: resumeContext?.projects,
            resumeSummary: resumeContext?.experienceSummary,
            debugMode: debugEnabled
          });
          setNextOutput(output);
          console.log("[INTERVIEW INITIALIZED] Intelligence nodes synced.");
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    start();

    const t = setInterval(() => setTotalTimer(s => s + 1), 1000);
    const qt = setInterval(() => setQuestionTimer(s => Math.max(0, s - 1)), 1000);
    return () => { clearInterval(t); clearInterval(qt); };
  }, [resumeReady, resumeContext, debugEnabled, role, exp, round, nextOutput, isProcessing]);

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
        resumeSkills: resumeContext?.skills,
        resumeProjects: resumeContext?.projects,
        resumeSummary: resumeContext?.experienceSummary,
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
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* LAYER 0: CINEMATIC AVATAR BACKGROUND */}
      <video
        src="/vishal.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 bg-[#050816]"
      />

      {/* LAYER 10: MINIMAL NEURAL OVERLAY (Subtle for maximum background visibility) */}
      <div className="fixed inset-0 bg-black/5 z-10 pointer-events-none" />

      {/* LAYER 20: HUD & INTERFACE CONTENT */}
      <div className="relative z-20 flex flex-col h-full w-full">
        {!resumeReady ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-16 h-16 text-accent animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent/60">Establishing Secure Neural Link...</p>
          </div>
        ) : (
          <>
            {/* HUD HEADER PROTOCOLS */}
            <header className="px-10 py-6 flex flex-col gap-4 bg-gradient-to-b from-black/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <Command className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white tracking-tight">{role} • {round}</h1>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                        {nextOutput?.isMock ? "Mock Survival Mode" : "Neural Arena Active"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {nextOutput?.isMock && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2 text-[8px] font-black tracking-widest uppercase">
                      <AlertTriangle className="w-3 h-3 mr-2" /> [MOCK MODE]
                    </Badge>
                  )}
                  {!nextOutput?.isMock && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-2 text-[8px] font-black tracking-widest uppercase backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 mr-2" /> [RESUME-AWARE]
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
                    <Timer className={`w-4 h-4 ${questionTimer < 15 ? 'text-red-500 animate-bounce' : 'text-accent'}`} />
                    <span className="tabular-nums font-bold text-sm tracking-widest text-white">{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}</span>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="h-10 rounded-xl glass border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <LogOut className="w-4 h-4 mr-2" /> Abort
                  </Button>
                </div>
              </div>
            </header>

            {/* FLOATING BRIEFING PANEL (TOP-LEFT HUD) */}
            <AnimatePresence mode="wait">
              {!isComplete && nextOutput?.nextQuestion && (
                <motion.div 
                  key={currentIdx}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="fixed top-32 left-10 z-30 w-80 pointer-events-none"
                >
                  <div className="bg-[#0a0a0a]/45 backdrop-blur-[8px] border border-accent/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] pointer-events-auto">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent text-black text-[8px] font-black px-2 py-0.5 rounded-sm">NODE {Math.min(currentIdx + 1, TOTAL_QUESTIONS)}</Badge>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Inquiry Protocol</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    </div>
                    <p className="text-white/90 text-sm md:text-[15px] font-medium leading-relaxed tracking-tight">
                      {isProcessing && !nextOutput?.nextQuestion ? "Recalibrating Neural Vectors..." : nextOutput.nextQuestion}
                    </p>

                    {/* SUBTLE HUD FEEDBACK */}
                    {nextOutput?.feedbackOnLastAnswer && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span className="text-[9px] font-bold text-purple-400/80 uppercase tracking-widest italic truncate">
                          "{nextOutput.feedbackOnLastAnswer}"
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN PERFORMANCE STAGE (Completely clear for Avatar focus) */}
            <main className="flex-1 pointer-events-none">
              <AnimatePresence>
                {isComplete && (
                  <div className="flex items-center justify-center h-full w-full px-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="premium-card bg-black/60 backdrop-blur-3xl border-accent/20 p-16 text-center space-y-8 pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                        <ShieldCheck className="w-12 h-12 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold tracking-tighter text-premium">Simulation Finalized.</h2>
                        <p className="text-white/60 font-light mt-2 max-w-md mx-auto">Your technical vectors have been archived. The performance auditor is synthesizing your final report.</p>
                      </div>
                      <Button onClick={finish} disabled={isSaving} className="h-16 px-12 btn-premium uppercase tracking-[0.3em] font-bold text-xs shadow-2xl">
                        {isSaving ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Archiving...</>
                        ) : (
                          "Deploy Performance Audit"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </main>

            {/* INPUT DOCK (Bottom persistent synthesis layer) */}
            {!isComplete && (
              <div className="w-full max-w-5xl mx-auto pb-12 px-6 relative z-30">
                {/* PROGRESS HUD */}
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentIdx / TOTAL_QUESTIONS) * 100}%` }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 mb-4">
                  <div className="h-8 px-4 glass rounded-full flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <Mic className="w-3 h-3" /> Voice Active
                  </div>
                  <div className="h-8 px-4 glass rounded-full flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <Video className="w-3 h-3" /> Stream Encrypted
                  </div>
                </div>

                <div className="glass bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] p-4 flex items-center gap-4 border border-white/10 shadow-[0_-20px_100px_rgba(0,0,0,0.5)] pointer-events-auto">
                  <textarea 
                    value={userAnswer} 
                    onChange={e => setUserAnswer(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} 
                    placeholder="Synthesize your professional response..." 
                    rows={1} 
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-none rounded-3xl px-6 py-4 text-lg font-light text-white focus:outline-none resize-none transition-all placeholder:text-white/20 disabled:opacity-50" 
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isProcessing || !userAnswer.trim()} 
                    className="h-14 w-14 rounded-2xl btn-premium shrink-0 shadow-2xl flex items-center justify-center group"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* CONTROLS SIDE-DOCK */}
            <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
              {[
                { icon: Mic, label: "Mute" },
                { icon: Video, label: "Video" },
                { icon: Settings, label: "Config" }
              ].map((btn, i) => (
                <button key={i} className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all group shadow-2xl">
                  <btn.icon className="w-5 h-5" />
                  <span className="absolute right-16 px-3 py-1 rounded-md bg-black/80 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{btn.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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
