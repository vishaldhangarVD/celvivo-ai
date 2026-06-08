"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Send, 
  ChevronRight, 
  Clock, 
  User, 
  Bot, 
  Loader2,
  LogOut,
  Sparkles,
  Zap,
  Activity,
  BrainCircuit,
  Command,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Senior';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [nextOutput, setNextOutput] = useState<AiMockInterviewOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      try {
        const output = await aiMockInterview({
          role,
          experienceLevel: exp,
          currentMainQuestionIndex: 0,
          history: [],
        });
        setNextOutput(output);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    };
    startInterview();

    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [role, exp]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, nextOutput, isProcessing]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing) return;

    const currentAnswer = userAnswer;
    setUserAnswer('');
    setIsProcessing(true);

    const newHistory = [...history, {
      question: nextOutput?.nextQuestion || '',
      answer: currentAnswer,
      aiFeedback: nextOutput?.feedbackOnLastAnswer
    }];
    setHistory(newHistory);

    const nextIdx = nextOutput?.questionType === 'main' ? currentQuestionIndex + 1 : currentQuestionIndex;
    if (nextOutput?.questionType === 'main') setCurrentQuestionIndex(nextIdx);

    try {
      const output = await aiMockInterview({
        role,
        experienceLevel: exp,
        currentMainQuestionIndex: nextIdx,
        history: newHistory,
        lastQuestionAsked: nextOutput?.nextQuestion,
        userAnswer: currentAnswer
      });

      setNextOutput(output);
      if (output.isInterviewComplete) {
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
    if (!user || !db) return;
    setIsSaving(true);

    const interviewData = {
      userId: user.uid,
      role,
      experienceLevel: exp,
      history,
      duration: timer,
      createdAt: serverTimestamp(),
      overallScore: 0, // Placeholder, updated in reports
    };

    const interviewsRef = collection(db, 'users', user.uid, 'interviews');
    addDoc(interviewsRef, interviewData)
      .then(() => {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          totalInterviews: increment(1)
        }).catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { totalInterviews: increment(1) }
          }));
        });

        router.push(`/feedback/last?role=${encodeURIComponent(role)}&exp=${exp}&data=${encodeURIComponent(JSON.stringify(history))}`);
      })
      .catch(async (err) => {
        setIsSaving(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: interviewsRef.path,
          operation: 'create',
          requestResourceData: interviewData
        }));
      });
  };

  return (
    <div className="flex flex-col h-screen bg-[#050816] overflow-hidden text-white font-body">
      <div className="particles-bg" />
      
      {/* Header */}
      <header className="h-20 border-b border-white/5 glass backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Command className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{role} Session</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">Neural Protocol v4.2 Active</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 text-xs font-bold bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
            <Clock className="w-4 h-4 text-accent" />
            <span className="tabular-nums text-accent tracking-widest">{formatTime(timer)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4 mr-2" />
            Abort Simulation
          </Button>
        </div>
      </header>

      {/* Main split interface */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: AI HR Avatar */}
        <section className="w-[45%] relative border-r border-white/5 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'office-bg')?.imageUrl || ''}
              alt="Corporate Office"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-[#050816]/50"></div>
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-12 z-10">
            <motion.div 
              animate={{ 
                scale: isProcessing ? [1, 1.01, 1] : 1,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-md aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(147,51,234,0.15)] bg-white/[0.02] glass"
            >
              <Image 
                src={PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || ''}
                alt="AI Interviewer"
                fill
                className="object-cover opacity-90 brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
              
              <AnimatePresence>
                {nextOutput?.nextQuestion && !isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-12 left-12 right-12"
                  >
                    <div className="glass p-8 rounded-[2.5rem] rounded-tl-none border-accent/40 bg-accent/5 backdrop-blur-2xl shadow-2xl">
                      <div className="flex gap-3 items-center mb-4">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Neural Directives</span>
                      </div>
                      <p className="text-lg font-light leading-relaxed tracking-tight text-white/95">
                        {nextOutput.nextQuestion}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-2 h-16">
                {[...Array(16)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ 
                      height: isProcessing ? ["20%", "90%", "20%"] : "20%" 
                    }}
                    transition={{ 
                      duration: 0.6 + Math.random(), 
                      repeat: Infinity,
                      delay: i * 0.05
                    }}
                    className="w-1.5 bg-accent/40 rounded-full"
                  />
                ))}
              </div>
            </motion.div>

            <div className="mt-12 text-center">
              <Badge className="bg-white/5 text-white/40 border-white/10 px-8 py-2 font-bold tracking-[0.4em] text-[10px] uppercase">
                Neural Sync Verified
              </Badge>
            </div>
          </div>
        </section>

        {/* Right: Interaction Dashboard */}
        <section className="flex-1 flex flex-col bg-[#050816]/40 backdrop-blur-md">
          <div className="px-12 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-12 flex-1">
              <div className="space-y-3 flex-1 max-w-md">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Simulation Velocity</span>
                  <span className="text-xs font-bold tabular-nums text-accent">{currentQuestionIndex + 1} / 5</span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / 5) * 100} className="h-2 bg-white/5" />
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="flex gap-12">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-accent">94%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Logic Rank</p>
                  <p className="text-2xl font-bold text-purple-400">Top 5%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-16 space-y-16 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {history.map((turn, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="flex flex-row-reverse gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="premium-card p-10 rounded-tr-none border-white/10 bg-white/[0.03] flex-1 max-w-[85%] text-right shadow-2xl">
                      <p className="text-lg leading-relaxed font-light text-white/90">{turn.answer}</p>
                    </div>
                  </div>
                  
                  {turn.aiFeedback && (
                    <div className="flex gap-8 items-start">
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-accent shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="glass p-8 rounded-[2.5rem] rounded-tl-none border-accent/20 bg-accent/5 max-w-[85%]">
                        <p className="text-sm font-light leading-relaxed text-accent/80 italic">
                          " {turn.aiFeedback} "
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex gap-8 items-center">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center animate-pulse">
                    <BrainCircuit className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex items-center gap-6 p-6 glass rounded-[2rem] border-white/10 bg-white/[0.02]">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">Analyzing Neural Logic...</span>
                  </div>
                </div>
              )}

              {isComplete && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="premium-card p-20 text-center space-y-10 border-accent/30 bg-accent/[0.02] shadow-[0_0_80px_rgba(34,211,238,0.1)]"
                >
                  <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl border border-accent/30">
                    <ShieldCheck className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold tracking-tighter">Protocol Terminated.</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto uppercase tracking-[0.3em] text-xs">
                      Simulation complete. Comprehensive performance audit initialized.
                    </p>
                  </div>
                  <Button 
                    onClick={finishInterview} 
                    disabled={isSaving}
                    size="lg" 
                    className="h-20 px-16 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                  >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : "Access Neural Audit"}
                    {!isSaving && <ChevronRight className="ml-3 w-6 h-6" />}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-40" />
          </div>

          {!isComplete && (
            <footer className="p-12 glass border-t-0 shrink-0 z-50">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-accent/30 rounded-[3rem] opacity-0 group-focus-within:opacity-100 transition-opacity blur-2xl"></div>
                  <div className="relative flex items-end gap-8 glass p-4 rounded-[3rem] border-white/20 bg-[#0b0e1a]/80 shadow-2xl backdrop-blur-3xl">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Input technical insight..."
                      rows={1}
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-6 px-10 text-xl font-light max-h-48 placeholder:text-white/20 custom-scrollbar"
                    />
                    <div className="flex items-center gap-4 pb-4 pr-4">
                      <Button variant="ghost" size="icon" className="rounded-3xl w-16 h-16 hover:bg-white/10 transition-all group/btn">
                        <Mic className="w-8 h-8 text-muted-foreground group-hover/btn:text-accent transition-colors" />
                      </Button>
                      <Button 
                        onClick={handleSend} 
                        disabled={!userAnswer.trim() || isProcessing}
                        className="btn-premium rounded-3xl w-16 h-16 flex items-center justify-center shadow-2xl"
                      >
                        <Send className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
