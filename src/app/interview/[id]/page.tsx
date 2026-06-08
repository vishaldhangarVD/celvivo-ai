"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Sparkles
} from 'lucide-react';
import { aiMockInterview, type AiMockInterviewOutput, type AiMockInterviewInput } from '@/ai/flows/ai-mock-interview';

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'Frontend Developer';
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

    // Update history with user's answer
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
      // Automatically navigate to feedback after a small delay if interview is done
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishInterview = () => {
    // Save history to state/db and go to feedback
    router.push(`/feedback/last?role=${role}&exp=${exp}&data=${encodeURIComponent(JSON.stringify(history))}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{role}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{exp} Level Interview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timer)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-xs text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Quit
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-white/10 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Progress</span>
          <Progress value={(currentQuestionIndex / 5) * 100} className="h-2 bg-white/5" />
          <span className="text-xs font-bold whitespace-nowrap">{currentQuestionIndex} / 5</span>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          {history.map((turn, i) => (
            <div key={i} className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div className="glass-card p-5 rounded-2xl rounded-tl-none border-white/5 bg-white/5 flex-1 max-w-[85%]">
                  <p className="text-sm leading-relaxed">{turn.question}</p>
                </div>
              </div>
              <div className="flex flex-row-reverse gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="bg-primary/20 p-5 rounded-2xl rounded-tr-none border border-primary/20 flex-1 max-w-[85%] text-right">
                  <p className="text-sm leading-relaxed">{turn.answer}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Current Question */}
          {nextOutput?.nextQuestion && !isComplete && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="glass-card p-6 rounded-2xl rounded-tl-none border-primary/20 bg-primary/5">
                  <p className="text-lg font-medium leading-relaxed">{nextOutput.nextQuestion}</p>
                </div>
                {nextOutput.feedbackOnLastAnswer && (
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-xs italic">
                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-blue-200">{nextOutput.feedbackOnLastAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">AI Interviewer is thinking...</span>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="glass-card p-10 rounded-[3rem] text-center space-y-6 animate-in zoom-in duration-700">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Interview Complete!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Excellent work! Your interview has been analyzed. Click below to view your performance report and learning roadmap.
              </p>
              <Button onClick={finishInterview} size="lg" className="bg-gradient-premium px-12 h-14 rounded-2xl">
                View Feedback Report
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Footer Input */}
      {!isComplete && (
        <footer className="p-6 bg-background/80 backdrop-blur-xl border-t border-white/10 shrink-0">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl opacity-20 group-focus-within:opacity-40 transition-opacity blur"></div>
            <div className="relative flex items-end gap-3 glass-card p-2 rounded-[1.5rem] border-white/10">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your answer here..."
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm max-h-32"
              />
              <div className="flex items-center gap-2 pb-1.5 pr-1.5">
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-white/5">
                  <Mic className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={!userAnswer.trim() || isProcessing}
                  className="bg-primary hover:opacity-90 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center mt-4 text-muted-foreground">Press Shift+Enter for new line. Enter to send.</p>
        </footer>
      )}
    </div>
  );
}
