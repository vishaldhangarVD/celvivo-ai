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
  Command,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput } from '@/ai/flows/ai-mock-interview';

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Senior';

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
    <div className="flex flex-col h-screen bg-[#050816] overflow-hidden text-white font-body">
      <div className="particles-bg" />
      
      {/* Header */}
      <header className="h-20 border-b border-white/5 glass backdrop-blur-3xl flex items-center justify-between px-10 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Command className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{role} Simulation</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold">Neural Engine v4.2 Active</p>
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
            Abort Session
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Large AI HR Avatar in Corporate Setting */}
        <section className="w-[45%] relative border-r border-white/5 overflow-hidden group">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
              alt="Corporate Office"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-[#050816]/50"></div>
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-12 z-10">
            <motion.div 
              animate={{ 
                scale: isProcessing ? [1, 1.02, 1] : 1,
                y: isProcessing ? [0, -5, 0] : 0
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(147,51,234,0.15)] bg-white/[0.02] glass"
            >
              <Image 
                src="https://picsum.photos/seed/elite_hr/800/1000"
                alt="AI Interviewer"
                fill
                className="object-cover opacity-90 brightness-110"
                data-ai-hint="professional businessman suit"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
              
              {/* Speech Bubble Overlay */}
              <AnimatePresence>
                {nextOutput?.nextQuestion && !isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-12 right-12 left-12"
                  >
                    <div className="glass p-6 rounded-[2rem] rounded-tl-none border-accent/30 bg-accent/5 backdrop-blur-xl shadow-2xl">
                      <div className="flex gap-3 items-start mb-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Neural Directives</span>
                      </div>
                      <p className="text-base font-light leading-relaxed tracking-tight text-white/90">
                        {nextOutput.nextQuestion}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Speaker Waves */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ 
                      height: isProcessing ? ["20%", "80%", "20%"] : "20%" 
                    }}
                    transition={{ 
                      duration: 0.5 + Math.random(), 
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    className="w-1.5 bg-accent/60 rounded-full"
                  />
                ))}
              </div>
            </motion.div>

            <div className="mt-12 text-center">
              <Badge className="bg-white/5 text-white/40 border-white/10 px-6 py-1.5 font-bold tracking-[0.3em] text-[10px] uppercase">
                Synchronizing Neural Logic
              </Badge>
            </div>
          </div>
        </section>

        {/* Right Side: Performance Dashboard & Chat */}
        <section className="flex-1 flex flex-col bg-[#050816]/40">
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-8 flex-1">
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Progress</span>
                  <span className="text-xs font-bold tabular-nums text-accent">{currentQuestionIndex} / 5</span>
                </div>
                <Progress value={(currentQuestionIndex / 5) * 100} className="h-1.5 bg-white/5" />
              </div>
              <div className="w-px h-10 bg-white/5"></div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Confidence</p>
                  <p className="text-xl font-bold text-accent">92%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Accuracy</p>
                  <p className="text-xl font-bold text-purple-400">88%</p>
                </div>
              </div>
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
                  <div className="flex flex-row-reverse gap-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/[0.03] p-8 rounded-[2rem] rounded-tr-none border border-white/5 flex-1 max-w-[80%] text-right">
                      <p className="text-base leading-relaxed font-light">{turn.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex gap-6 items-center">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center animate-pulse">
                    <Cpu className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex items-center gap-4 p-4 glass rounded-full border-white/5">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Analyzing Neural Data...</span>
                  </div>
                </div>
              )}

              {isComplete && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="premium-card p-16 text-center space-y-8 border-accent/20 bg-accent/[0.02]"
                >
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl border border-accent/30">
                    <Sparkles className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight">Session Concluded.</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto uppercase tracking-widest text-xs">
                      All protocols completed. Performance audit generated.
                    </p>
                  </div>
                  <Button onClick={finishInterview} size="lg" className="h-16 px-12 btn-premium text-base font-bold uppercase tracking-widest">
                    Access Neural Audit
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-32" />
          </div>

          {/* Footer Interface */}
          {!isComplete && (
            <footer className="p-10 glass border-t-0 shrink-0 z-50">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-accent/30 rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl"></div>
                  <div className="relative flex items-end gap-6 glass p-2.5 rounded-[2.5rem] border-white/10 bg-white/[0.01]">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Input your technical insight..."
                      rows={1}
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-5 px-8 text-lg font-light max-h-40 placeholder:text-white/20 custom-scrollbar"
                    />
                    <div className="flex items-center gap-3 pb-2.5 pr-2.5">
                      <Button variant="ghost" size="icon" className="rounded-2xl w-14 h-14 hover:bg-white/5 transition-all group/btn">
                        <Mic className="w-6 h-6 text-muted-foreground group-hover/btn:text-accent transition-colors" />
                      </Button>
                      <Button 
                        onClick={handleSend} 
                        disabled={!userAnswer.trim() || isProcessing}
                        className="btn-premium rounded-2xl w-14 h-14 flex items-center justify-center"
                      >
                        <Send className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Shift+Enter for newline</p>
                  <Button 
                    onClick={handleSend}
                    disabled={!userAnswer.trim() || isProcessing}
                    variant="link" 
                    className="text-xs font-bold text-accent uppercase tracking-widest p-0 h-auto flex items-center gap-2 group"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
