
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
  Timer,
  User,
  Video,
  Activity,
  Wifi,
  Calculator,
  FileEdit,
  Award,
  Lightbulb,
  MoreHorizontal,
  Clock
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="h-dvh bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      
      {/* HEADER SECTION */}
      <header className="h-[72px] border-b border-white/5 bg-[#0b0e1a] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 font-black text-xl">G</div>
           <div>
             <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">{company.toUpperCase()} ARENA</h1>
             <p className="text-[10px] text-white/40 uppercase font-black mt-1">Protocol Node {currentIdx}</p>
           </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Time Remaining</p>
          <div className="px-4 py-1.5 glass rounded-lg border-accent/20 font-mono text-lg text-accent tabular-nums flex items-center gap-3">
            <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><HelpCircle className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><MessageSquare className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Flag className="w-5 h-5" /></Button>
          <Button 
            onClick={() => finalizeSession(transcript)}
            className="h-10 px-6 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            End Interview
          </Button>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><MoreHorizontal className="w-5 h-5" /></Button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Sidebar Icons */}
        <div className="w-[72px] border-r border-white/5 bg-[#0b0e1a] flex flex-col items-center py-8 gap-10 shrink-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Home className="w-5 h-5" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-accent bg-accent/10 rounded-xl"><Mic className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><BarChart4 className="w-5 h-5" /></Button>
          <div className="mt-auto flex flex-col gap-6">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><HelpCircle className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Settings className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* CENTER COLUMN: Video Arena */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex-1 min-h-[400px] relative rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
            {cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a] text-center p-12 space-y-6">
                <VideoOff className="w-16 h-16 text-red-400" />
                <h3 className="text-xl font-bold text-white">Camera Access Required</h3>
                <Button onClick={startCamera} className="btn-premium">Enable Camera</Button>
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

            {/* Status Badges */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 glass rounded-full border-green-500/20 text-green-400">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Secure Connection</span>
            </div>
            
            <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 glass rounded-full border-white/10 text-white/60">
              <User className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">You</span>
            </div>

            {/* Floating Interviewer PiP */}
            <div className="absolute bottom-6 right-6 w-[240px] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0e1a]">
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
              <div className="absolute bottom-2 left-2 px-2 py-0.5 glass rounded-lg border-white/10">
                <span className="text-[8px] font-black tracking-widest uppercase text-white/60">Interviewer</span>
              </div>
            </div>

            {/* Floating Question Overlay Card */}
            <Card className="absolute top-6 right-6 w-[340px] bg-[#08090D]/95 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl z-20">
               <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-accent to-purple-600 rounded-full" />
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest">Question {currentIdx} / 10</Badge>
                  </div>
                  <p className="text-sm font-light text-white leading-relaxed pr-2">{currentInterviewerQuestion}</p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                       AI Interviewer is asking...
                    </p>
                  </div>
               </div>
            </Card>

            {/* Video Area Bottom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full glass hover:bg-white/10 text-white"><Mic className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full glass hover:bg-white/10 text-white"><Video className="w-5 h-5" /></Button>
            </div>
          </div>

          {/* Metrics & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <Card className="glass border-white/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Activity className="w-5 h-5" /></div>
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Interview Progress</p>
                <p className="text-sm font-bold text-white leading-none">{Math.round((currentIdx / 10) * 100)}% Complete</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Time Elapsed</p>
                <p className="text-sm font-bold text-white leading-none">05:24</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400"><Wifi className="w-5 h-5" /></div>
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Connection</p>
                <p className="text-sm font-bold text-white leading-none">98ms Latency</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full glass border-white/10 hover:bg-white/5 p-0"><Calculator className="w-3.5 h-3.5" /></Button>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full glass border-white/10 hover:bg-white/5 p-0"><FileEdit className="w-3.5 h-3.5" /></Button>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full glass border-white/10 hover:bg-white/5 p-0"><MessageSquare className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="ml-4">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Quick Actions</p>
                <p className="text-[10px] font-bold text-white/60 uppercase leading-none">Tools Active</p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Interview Panel */}
        <div className="w-full lg:w-[28%] border-l border-white/5 bg-[#0b0e1a] flex flex-col shrink-0">
          <div className="h-14 border-b border-white/5 flex items-center px-4 gap-4">
             <button className="text-[10px] font-black uppercase tracking-widest text-accent border-b-2 border-accent h-full px-2">Interview</button>
             <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white px-2">Notes</button>
             <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white px-2">Transcript</button>
          </div>
          
          <div className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white/30">Question {currentIdx} of 10</h3>
                  <span className="text-[11px] font-black text-accent uppercase tracking-widest">{currentIdx}0%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${currentIdx}0%` }} />
                </div>
             </div>

             <Card className="glass border-white/10 bg-white/[0.02] p-6 space-y-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Brain className="w-8 h-8 text-accent" /></div>
                <p className="text-base font-light text-white leading-relaxed pr-6">{currentInterviewerQuestion}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Prep Time</span>
                  <div className="flex items-center gap-2 text-accent">
                     <Timer className="w-3 h-3" />
                     <span className="text-xs font-mono">00:45</span>
                  </div>
                </div>
             </Card>

             <Card className="glass border-purple-500/10 bg-purple-500/[0.02] p-5 space-y-2 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-400">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Simulation Tip</span>
                </div>
                <p className="text-xs text-white/60 font-light leading-relaxed">Structure your response using the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
             </Card>

             <div className="flex-1" />

             {/* Answer Submission Hub */}
             <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="relative group">
                  <Textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your strategic response here..."
                    className="min-h-[140px] rounded-2xl glass border-white/10 bg-transparent p-4 text-sm font-light resize-none focus:border-accent transition-all pr-12 custom-scrollbar"
                  />
                  <button 
                    onClick={toggleMic}
                    className={cn(
                      "absolute right-4 bottom-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isMicActive ? "bg-red-500 text-white animate-pulse shadow-lg" : "bg-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={isProcessing || !userAnswer.trim()}
                  className="w-full h-14 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl group"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Answer <Send className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" /></>}
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER: Global Tips Bar */}
      <footer className="h-16 border-t border-white/5 bg-[#0b0e1a] flex items-center px-8 gap-12 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Interview Tips:</span>
        </div>
        <div className="flex-1 flex items-center gap-12 overflow-hidden">
          {[
            "Think before you speak",
            "Structure your answers",
            "Be specific & metrics-driven",
            "Stay calm & confident"
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{tip}</span>
            </div>
          ))}
        </div>
      </footer>

      {/* OVERLAYS: Initializing & Finalizing */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent mx-auto" />
                <Brain className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white">Calibrating Arena</h2>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Synthesizing First Node...</span>
              </div>
            </div>
          </motion.div>
        )}

        {isSimulationComplete && isGeneratingReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent mx-auto" />
                <ShieldCheck className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white">Finalizing Audit</h2>
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
