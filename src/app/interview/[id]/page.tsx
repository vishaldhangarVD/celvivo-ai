
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  Send, 
  ChevronRight, 
  Clock, 
  User, 
  Bot, 
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
  Zap,
  Activity,
  BrainCircuit,
  Command
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Mid';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [nextOutput, setNextOutput] = useState<AiMockInterviewOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startInterview = async () => {
      setIsProcessing(true);
      const output = await aiMockInterview({
        role,
        experienceLevel: exp,
        currentMainQuestionIndex: 0,
        history: [],
      });
      setNextOutput(output);
      setIsProcessing(false);
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

    const output = await aiMockInterview({
      role,
      experienceLevel: exp,
      currentMainQuestionIndex: nextIdx,
      history: newHistory,
      lastQuestionAsked: nextOutput?.nextQuestion,
      userAnswer: currentAnswer
    });

    setNextOutput(output);
    setIsProcessing(false);

    if (output.isInterviewComplete) {
      setIsComplete(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishInterview = () => {
    router.push(`/feedback/last?role=${role}&exp=${exp}&data=${encodeURIComponent(JSON.stringify(history))}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050816] overflow-hidden text-white">
      <div className="particles-bg" />
      
      {/* Premium Dashboard Header */}
      <header className="h-20 border-b border-white/5 glass backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Command className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{role}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">{exp} SIMULATION ACTIVE</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 text-sm font-bold bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <Clock className="w-4 h-4 text-accent" />
            <span className="tabular-nums text-accent">{formatTime(timer)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4 mr-2" />
            ABORT SESSION
          </Button>
        </div>
      </header>

      {/* Main Experience Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Large AI Avatar & Status */}
        <section className="w-[45%] border-r border-white/5 flex flex-col items-center justify-center p-12 bg-white/[0.01]">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-[3rem] blur-3xl animate-pulse"></div>
            <motion.div 
              animate={{ 
                scale: isProcessing ? [1, 1.02, 1] : 1,
                rotate: isProcessing ? [0, 1, 0] : 0 
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-full h-full glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <Image 
                src="https://picsum.photos/seed/nexai1/800/800"
                alt="AI Interviewer"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
              
              {/* Status Indicators overlay */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">Processor Status</p>
                  <p className="text-2xl font-bold">{isProcessing ? 'Analysing...' : 'Listening'}</p>
                </div>
                <div className="flex gap-1 h-8 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-accent rounded-full animate-bounce"
                      style={{ 
                        height: isProcessing ? `${Math.random() * 100}%` : '20%',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 w-full max-w-md grid grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border-white/5">
              <Activity className="w-5 h-5 text-purple-500 mb-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Confidence</p>
              <p className="text-xl font-bold">94.2%</p>
            </div>
            <div className="glass p-6 rounded-3xl border-white/5">
              <BrainCircuit className="w-5 h-5 text-blue-500 mb-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Nuance Level</p>
              <p className="text-xl font-bold">Expert</p>
            </div>
          </div>
        </section>

        {/* Right Side: Chat & Content */}
        <section className="flex-1 flex flex-col bg-background/50">
          <div className="px-10 py-6 border-b border-white/5">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Session Progress</span>
              <Progress value={(currentQuestionIndex / 5) * 100} className="h-1.5 bg-white/5 flex-1" />
              <span className="text-xs font-bold tabular-nums">{currentQuestionIndex} <span className="text-muted-foreground">/ 5</span></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-12 space-y-12">
            <AnimatePresence mode="popLayout">
              {history.map((turn, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex gap-6">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shrink-0 border-white/10 shadow-xl">
                      <Bot className="w-6 h-6 text-accent" />
                    </div>
                    <div className="glass p-8 rounded-[2rem] rounded-tl-none border-white/5 bg-white/[0.02] flex-1 max-w-[85%]">
                      <p className="text-lg leading-relaxed font-light">{turn.question}</p>
                    </div>
                  </div>
                  <div className="flex flex-row-reverse gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-purple-600/10 p-8 rounded-[2rem] rounded-tr-none border border-purple-600/20 flex-1 max-w-[85%] text-right shadow-2xl">
                      <p className="text-lg leading-relaxed font-light">{turn.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {nextOutput?.nextQuestion && !isComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-6"
                >
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shrink-0 border-white/10 shadow-xl">
                    <Bot className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-6 flex-1">
                    <div className="glass p-10 rounded-[2.5rem] rounded-tl-none border-accent/20 bg-accent/5 shadow-2xl">
                      <p className="text-2xl font-bold leading-tight tracking-tight">{nextOutput.nextQuestion}</p>
                    </div>
                    {nextOutput.feedbackOnLastAnswer && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-4 p-6 glass rounded-[2rem] border-blue-500/20 text-sm font-medium"
                      >
                        <Sparkles className="w-5 h-5 text-accent shrink-0 mt-1" />
                        <p className="text-blue-200/80 leading-relaxed italic">{nextOutput.feedbackOnLastAnswer}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <div className="flex gap-6">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex items-center gap-4 p-6 glass rounded-full rounded-tl-none border-white/5">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Neural Processing...</span>
                  </div>
                </div>
              )}

              {isComplete && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass p-16 rounded-[4rem] text-center space-y-10 border-accent/20 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
                >
                  <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl">
                    <Sparkles className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold tracking-tighter">Session Concluded.</h2>
                    <p className="text-xl text-muted-foreground font-light max-w-lg mx-auto">
                      All protocols completed. Your performance audit is ready for synchronization.
                    </p>
                  </div>
                  <Button onClick={finishInterview} size="lg" className="h-20 px-16 text-xl btn-premium">
                    Access Intelligence Report
                    <ChevronRight className="ml-2 w-6 h-6" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-32" />
          </div>

          {/* Footer Input */}
          {!isComplete && (
            <footer className="p-10 glass border-t-0 shrink-0 z-20">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-accent rounded-[2.5rem] opacity-20 group-focus-within:opacity-40 transition-opacity blur-xl"></div>
                <div className="relative flex items-end gap-6 glass p-3 rounded-[2.5rem] border-white/10 shadow-2xl">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Provide your technical insight..."
                    rows={1}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-4 px-6 text-xl font-light max-h-40 placeholder:text-white/20"
                  />
                  <div className="flex items-center gap-3 pb-3 pr-3">
                    <Button variant="ghost" size="icon" className="rounded-2xl w-14 h-14 hover:bg-white/5 transition-all">
                      <Mic className="w-7 h-7 text-muted-foreground hover:text-accent" />
                    </Button>
                    <Button 
                      onClick={handleSend} 
                      disabled={!userAnswer.trim() || isProcessing}
                      className="bg-accent hover:opacity-90 rounded-2xl w-14 h-14 flex items-center justify-center text-[#050816] shadow-xl shadow-accent/20"
                    >
                      <Send className="w-7 h-7" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center mt-6 text-muted-foreground uppercase tracking-[0.3em] font-bold">Press Shift+Enter for new line. Enter to broadcast.</p>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
