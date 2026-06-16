"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic, 
  Send, 
  ChevronRight, 
  Clock, 
  User, 
  Bot, 
  Loader2,
  LogOut,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Command,
  Bug,
  Code2,
  X,
  AlertTriangle
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const TOTAL_QUESTIONS = 10;

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Senior';
  const round = searchParams.get('round') || 'Technical';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [nextOutput, setNextOutput] = useState<AiMockInterviewOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Debug State
  const [debugMode, setDebugMode] = useState(false);
  const [lastDebugPrompt, setLastDebugPrompt] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const officeImg = PlaceHolderImages.find(img => img.id === 'office-bg')?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80";
  const hrImg = PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || "https://picsum.photos/seed/nexvoro_hr/800/1000";

  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      try {
        const output = await aiMockInterview({
          role,
          experienceLevel: exp,
          roundType: round,
          currentMainQuestionIndex: 1,
          history: [],
          debugMode
        });
        setNextOutput(output);
        if (output.debugPrompt) setLastDebugPrompt(output.debugPrompt);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    };
    startInterview();

    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [role, exp, round]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, nextOutput, isProcessing]);

  const handleSend = async () => {
    if (!userAnswer.trim() && !debugMode && isProcessing) return;

    const currentAnswer = userAnswer || "[DEBUG INPUT]";
    setUserAnswer('');

    // Pre-update history for immediate UI feedback
    const turn = {
      question: nextOutput?.nextQuestion || '',
      answer: currentAnswer,
      aiFeedback: nextOutput?.feedbackOnLastAnswer,
      isMock: nextOutput?.isMock
    };
    
    const newHistory = [...history, turn];
    setHistory(newHistory);

    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);

    // Skip loader in debug mode for instant feel
    if (!debugMode) setIsProcessing(true);

    try {
      const output = await aiMockInterview({
        role,
        experienceLevel: exp,
        roundType: round,
        currentMainQuestionIndex: nextIdx + 1,
        history: newHistory,
        userAnswer: currentAnswer,
        debugMode
      });

      setNextOutput(output);
      if (output.debugPrompt) setLastDebugPrompt(output.debugPrompt);
      
      if (output.isInterviewComplete && !debugMode) {
        setIsComplete(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishInterview = async () => {
    if (!user || !db || debugMode) return;
    setIsSaving(true);

    const interviewData = {
      userId: user.uid,
      role,
      experienceLevel: exp,
      round,
      history: history.map(h => ({
        question: h.question,
        answer: h.answer,
      })),
      duration: timer,
      createdAt: serverTimestamp(),
      overallScore: 0,
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), interviewData);
      router.push(`/feedback/${docRef.id}`);
    } catch (err: any) {
      setIsSaving(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `/users/${user.uid}/interviews`,
        operation: 'create',
        requestResourceData: interviewData
      } satisfies any));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050816] overflow-hidden text-white relative">
      <div className="particles-bg" />
      
      <header className="h-20 border-b border-white/5 glass flex items-center justify-between px-10 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Command className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{role} • {round}</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">Neural Session Active</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {nextOutput?.isMock && (
            <Badge className="bg-orange-500/20 text-orange-400 border-none px-4 py-2 font-black tracking-widest text-[10px] animate-pulse">
              [MOCK MODE ACTIVE]
            </Badge>
          )}

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <Bug className={`w-4 h-4 ${debugMode ? 'text-red-400' : 'text-white/20'}`} />
              <Label htmlFor="debug-mode" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Debug Engine</Label>
            </div>
            <Switch 
              id="debug-mode" 
              checked={debugMode} 
              onCheckedChange={setDebugMode}
              className="data-[state=checked]:bg-red-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
            <Clock className="w-4 h-4 text-accent" />
            <span className="tabular-nums text-accent tracking-widest">{formatTime(timer)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-[10px] font-bold tracking-widest uppercase text-white/40">
            <LogOut className="w-4 h-4 mr-2" />
            Abort
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Debug Overlay */}
        <AnimatePresence>
          {debugMode && lastDebugPrompt && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute right-0 top-0 bottom-0 w-[40%] z-[60] glass border-l border-white/10 p-10 overflow-y-auto custom-scrollbar shadow-2xl bg-[#0b0e1a]/95"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-bold tracking-tighter uppercase">Neural Intercept</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setLastDebugPrompt(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Target Role</p>
                    <p className="text-sm font-bold text-accent">{role}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Experience Grade</p>
                    <p className="text-sm font-bold text-accent">{exp}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Simulation Round</p>
                    <p className="text-sm font-bold text-accent">{round}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60">Intercepted Signal Output</p>
                  <pre className="p-6 rounded-2xl bg-black/50 border border-white/5 text-[11px] leading-relaxed font-mono whitespace-pre-wrap text-white/70">
                    {lastDebugPrompt}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className={`${debugMode ? 'w-[30%]' : 'w-[40%]'} relative border-r border-white/5 bg-black/20 transition-all duration-500`}>
          <div className="absolute inset-0">
            <Image src={officeImg} alt="Office" fill className="object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-12 z-10">
            <motion.div 
              animate={{ scale: isProcessing ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative w-full max-w-sm aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 glass shadow-[0_0_100px_rgba(147,51,234,0.1)]"
            >
              <Image src={hrImg} alt="Interviewer" fill className="object-cover brightness-110" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <AnimatePresence>
                {nextOutput?.nextQuestion && !isProcessing && !isComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 left-8 right-8 z-20"
                  >
                    <div className="glass p-6 rounded-3xl border-accent/40 bg-accent/10 backdrop-blur-2xl">
                      <p className="text-sm font-medium leading-relaxed">{nextOutput.nextQuestion}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        <section className="flex-1 flex flex-col">
          <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                <span className="text-xs font-bold tabular-nums text-accent">{currentQuestionIndex} / {TOTAL_QUESTIONS}</span>
              </div>
              <Progress value={(currentQuestionIndex / TOTAL_QUESTIONS) * 100} className="h-1.5 bg-white/5" />
            </div>
            {debugMode && (
              <Badge variant="outline" className="ml-6 border-red-500/40 text-red-400 uppercase tracking-widest font-bold text-[8px] animate-pulse">
                Neural Bypass Active
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {history.map((turn, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex flex-row-reverse gap-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="p-6 glass rounded-2xl rounded-tr-none flex-1 max-w-[80%] text-right bg-white/[0.05]">
                      <p className="text-lg leading-relaxed text-white/90">{turn.answer}</p>
                    </div>
                  </div>
                  
                  {turn.aiFeedback && (
                    <div className="flex gap-6 items-start">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="p-6 glass rounded-2xl rounded-tl-none max-w-[80%] bg-purple-500/5 border-purple-500/10">
                        <p className="text-base font-light italic text-white/70">
                          {turn.isMock && <span className="text-orange-400 font-bold block mb-2">[MOCK MODE ACTIVE]</span>}
                          "{turn.aiFeedback}"
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex gap-6 items-center">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center animate-pulse">
                    <BrainCircuit className="w-5 h-5 text-accent" />
                  </div>
                  <div className="px-6 py-4 glass rounded-2xl border-white/10 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      Analyzing Intelligence...
                    </span>
                  </div>
                </div>
              )}

              {isComplete && !debugMode && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card p-16 text-center space-y-8 bg-accent/[0.02]">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl border border-accent/20">
                    <ShieldCheck className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-bold tracking-tighter">Interview Terminated.</h2>
                    <p className="text-muted-foreground font-light uppercase tracking-widest text-[10px]">Session complete. Generating performance audit.</p>
                  </div>
                  <Button onClick={finishInterview} disabled={isSaving} className="h-16 px-12 btn-premium text-sm font-bold uppercase tracking-widest">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : "Access Audit Report"}
                    {!isSaving && <ChevronRight className="ml-2 w-5 h-5" />}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-20" />
          </div>

          {!isComplete && (
            <footer className="p-8 glass shrink-0">
              <div className="max-w-4xl mx-auto flex items-end gap-6">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={debugMode ? "DEBUG: Press Enter to transmit signal..." : "Type your answer here... (Press Enter to transmit)"}
                  rows={2}
                  className={`flex-1 bg-white/5 border rounded-2xl p-6 text-lg font-light focus:outline-none transition-all resize-none custom-scrollbar ${debugMode ? 'border-red-500/20 focus:border-red-500' : 'border-white/10 focus:border-accent'}`}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isProcessing}
                  className={`h-20 w-20 rounded-2xl shrink-0 shadow-2xl ${debugMode ? 'bg-red-600 hover:bg-red-700' : 'btn-premium'}`}
                >
                  {debugMode ? <Bug className="w-6 h-6" /> : <Send className="w-6 h-6" />}
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
