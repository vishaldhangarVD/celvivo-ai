
"use client";
import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Mic, 
  Home, 
  MessageSquare, 
  PhoneOff, 
  MicOff, 
  ChevronRight, 
  Timer, 
  Video, 
  VideoOff,
  Activity, 
  Award, 
  Clock,
  User
} from "lucide-react";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import CandidateHologram from "@/components/CandidateHologram";
import HolographicInterviewer from "@/components/HolographicInterviewer";
import { INTERVIEW_STAGES } from "@/lib/interview-stages";

const MAX_QUESTIONS = 12;

function VirtualArenaContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const sessionId = params.id as string;

  const [currentIdx, setCurrentIdx] = useState(1);
  const [transcript, setTranscript] = useState<{role: 'interviewer' | 'candidate', text: string}[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); 
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const [currentSimStage, setCurrentSimStage] = useState<string>("INTRODUCTION");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [pendingFinalize, setPendingFinalize] = useState<any[] | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // Refs to track state for speech recognition event handlers (avoiding stale closures)
  const isMicOnRef = useRef(isMicOn);
  const isProcessingRef = useRef(isProcessing);
  const isSimulationCompleteRef = useRef(isSimulationComplete);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const isRecognitionActiveRef = useRef(false);

  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { isSimulationCompleteRef.current = isSimulationComplete; }, [isSimulationComplete]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  const formattedName = useMemo(() => {
    const resumeName = journey?.resumeAnalysis?.personalInfo?.fullName;
    if (resumeName) return resumeName;
    if (!user) return 'Candidate';
    const name = user.displayName || user.email?.split('@')[0] || 'Candidate';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user, journey]);

  // Speech Recognition Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          isRecognitionActiveRef.current = true;
          console.log("[Speech] Recognition session started");
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript || interimTranscript) {
            console.log("[Speech] Transcript detected:", { final: finalTranscript, interim: interimTranscript });
          }

          if (finalTranscript) {
            setUserAnswer(prev => {
              const cleanedBase = prev.trim();
              return cleanedBase ? `${cleanedBase} ${finalTranscript.trim()}` : finalTranscript.trim();
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.log("[Speech] Recognition error:", event.error);
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
        };

        recognitionRef.current.onend = () => {
          isRecognitionActiveRef.current = false;
          const shouldRestart = isMicOnRef.current && !isProcessingRef.current && !isSimulationCompleteRef.current && !isAiSpeakingRef.current;
          console.log("[Speech] Recognition session ended, restarting:", shouldRestart);
          
          // Automatically restart if conditions are still met
          if (shouldRestart) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn("[Speech] Auto-restart failed:", e);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Control recognition based on mic state and processing state
  useEffect(() => {
    if (recognitionRef.current) {
      const shouldRun = isMicOn && !isProcessing && !isSimulationComplete && !isAiSpeaking;
      
      if (shouldRun) {
        if (!isRecognitionActiveRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("[Speech] Start attempted but failed:", e);
          }
        }
      } else {
        if (isRecognitionActiveRef.current) {
          recognitionRef.current.stop();
        }
      }
    }
  }, [isMicOn, isProcessing, isSimulationComplete, isAiSpeaking]);

  useEffect(() => {
    if (isInitializing || isSimulationComplete || isGeneratingReport) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, isSimulationComplete, isGeneratingReport]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = mediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error("Camera access required.", error);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Ensure stream is attached to local video when camera is toggled or init completes
  useEffect(() => {
    if (isCameraOn && localVideoRef.current && mediaStreamRef.current && !isInitializing) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOn, isInitializing]);

  useEffect(() => {
    async function init() {
      if (!user || !db || !journey) return;
      
      if (transcript.length === 0) {
        try {
          const response = await aiMockInterview({
            role: journey.role, 
            experienceLevel: journey.experience, 
            roundType: journey.roundType || "Final HR Round", 
            currentMainQuestionIndex: 1, 
            history: [], 
            targetCompany: journey.company,
            candidateName: journey.resumeAnalysis?.personalInfo?.fullName || user.displayName || undefined,
            resumeSkills: journey?.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || journey?.resumeAnalysis?.missingSkills || [],
            resumeProjects: journey?.resumeAnalysis?.sections?.projects || [],
            resumeSummary: journey.resumeAnalysis?.summary || "",
            aptitudeScore: journey.aptitudeReport?.overallScore || 0,
            codingScore: journey.codingReport?.score || 0,
            askedQuestions: [],
            currentStage: "INTRODUCTION",
            currentDifficulty: "MEDIUM",
            hintUsed: false
          });
          
          setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
          setAskedQuestions([response.nextQuestion]);
          setCurrentSimStage(response.stage);
          setIsAiSpeaking(true);

          await updateDoc(journeyRef!, { currentStage: INTERVIEW_STAGES.HR_INTERVIEW });
        } catch (e) {
          console.error("AI Init Error:", e);
          setTranscript([{ role: 'interviewer', text: "Hello. Welcome to today's interview. Could you please introduce yourself and share a bit about your journey?" }]);
          setIsAiSpeaking(true);
        }
      }
      setTimeout(() => setIsInitializing(false), 1500);
    }
    init();
  }, [user, db, journey, journeyRef, transcript.length]);

  const handleSpeechEnd = useCallback(() => {
    setIsAiSpeaking(false);
  }, []);

  const finalizeSession = useCallback(async (currentTranscript: any[]) => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);
    try {
      const finalAudit = await generateInterviewFeedback({
        role: journey!.role, 
        company: journey!.company, 
        experienceLevel: journey!.experience, 
        interviewTranscript: currentTranscript.map(t => `${t.role}: ${t.text}`).join('\n\n'),
        resumeContext: {
          atsScore: journey?.resumeAnalysis?.atsScore || 0,
          strengths: journey?.resumeAnalysis?.strengths || [],
          weaknesses: journey?.resumeAnalysis?.weaknesses || [],
          missingSkills: journey?.resumeAnalysis?.missingSkills || [],
        },
        aptitudeContext: journey?.aptitudeReport ? {
          overallScore: journey.aptitudeReport.overallScore,
          status: journey.aptitudeReport.status
        } : undefined,
        codingContext: journey?.codingReport ? {
          score: journey.codingReport.score,
          status: journey.codingReport.status
        } : undefined
      });

      const docRef = await addDoc(collection(db, 'users', user!.uid, 'interviews'), {
        role: journey!.role, 
        company: journey!.company, 
        experienceLevel: journey!.experience, 
        history: currentTranscript, 
        overallScore: finalAudit.overallScore, 
        feedback: finalAudit, 
        createdAt: serverTimestamp(),
      });

      await updateDoc(journeyRef!, {
        currentStage: INTERVIEW_STAGES.COMPLETED,
        step: 9,
        updatedAt: serverTimestamp()
      });

      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      console.error("Master Audit Error:", e);
      setIsGeneratingReport(false);
      toast({ variant: "destructive", title: "Audit Generation Failed" });
    }
  }, [db, journey, journeyRef, router, toast, user, isGeneratingReport]);

  // Monitor for completion triggers
  useEffect(() => {
    if (pendingFinalize && !isAiSpeaking) {
      finalizeSession(pendingFinalize);
      setPendingFinalize(null);
    }
  }, [pendingFinalize, isAiSpeaking, finalizeSession]);

  // Fallback safety for completion
  useEffect(() => {
    if (!pendingFinalize) return;
    const fallback = setTimeout(() => {
      if (pendingFinalize) {
        finalizeSession(pendingFinalize);
        setPendingFinalize(null);
      }
    }, 10000);
    return () => clearTimeout(fallback);
  }, [pendingFinalize, finalizeSession]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete) return;
    setIsProcessing(true);
    const newTranscript = [...transcript, { role: 'candidate' as const, text: userAnswer }];
    setTranscript(newTranscript);
    const currentAns = userAnswer;
    setUserAnswer("");

    try {
      const chatHistory = newTranscript.filter(t => t.role === 'candidate').map((t) => {
        const idx = newTranscript.indexOf(t);
        return { question: newTranscript[idx - 1]?.text || "Intro", answer: t.text };
      });

      const response = await aiMockInterview({
        role: journey!.role, 
        experienceLevel: journey!.experience, 
        roundType: journey!.roundType || "Final HR Round", 
        currentMainQuestionIndex: currentIdx + 1,
        history: chatHistory, 
        userAnswer: currentAns, 
        targetCompany: journey!.company,
        candidateName: formattedName,
        resumeSkills: journey?.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || journey?.resumeAnalysis?.missingSkills || [],
        resumeProjects: journey?.resumeAnalysis?.sections?.projects || [],
        resumeSummary: journey?.resumeAnalysis?.summary || "",
        aptitudeScore: journey?.aptitudeReport?.overallScore || 0,
        codingScore: journey?.codingReport?.score || 0,
        askedQuestions: askedQuestions,
        currentStage: currentSimStage as any,
        currentDifficulty: "MEDIUM"
      });

      const updatedTranscript = [...newTranscript, { role: 'interviewer' as const, text: response.nextQuestion }];
      setTranscript(updatedTranscript);
      setCurrentSimStage(response.stage);
      setIsAiSpeaking(true);

      if (response.isInterviewComplete) {
        setIsSimulationComplete(true);
        setPendingFinalize(updatedTranscript);
      } else {
        setAskedQuestions(prev => [...prev, response.nextQuestion]);
        setCurrentIdx(prev => prev + 1);
      }
    } catch (error) {
      console.error("AI Turn Error:", error);
      toast({ variant: "destructive", title: "Neural Link Sync Fault" });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-[#050816] flex items-center justify-center relative overflow-hidden">
        <CandidateHologram isLoader={true} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      
      <header className="h-16 border-b border-white/5 bg-[#0b0e1a] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">N</div>
           <div><h1 className="text-xs font-black uppercase text-white">CELVIVO AI</h1><p className="text-[9px] text-white/40 uppercase font-black">{formattedName}</p></div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => finalizeSession(transcript)} className="h-9 px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] uppercase font-bold">End Interview</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[72px] border-r border-white/5 bg-[#0b0e1a] flex flex-col items-center py-6 gap-8 shrink-0">
          <Link href="/"><Button variant="ghost" size="icon" className="text-white/20"><Home className="w-5" /></Button></Link>
          <Button variant="ghost" size="icon" className="text-accent bg-accent/10 rounded-xl"><Mic className="w-5" /></Button>
        </div>

        <div className="flex-1 flex flex-col p-3 space-y-1.5 overflow-hidden h-full">
          <div className="flex-1 min-0 relative rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl h-full">
            <CandidateHologram 
              active={true}
              speaking={isAiSpeaking}
              stage={currentSimStage}
              sessionId={sessionId}
              currentQuestionIndex={currentIdx}
              totalQuestions={MAX_QUESTIONS}
              className="w-full h-full"
            />
            
            <div className="absolute top-6 left-6 flex items-center gap-3 z-40">
              <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white/80 py-1.5 px-4 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">LIVE SESSION</span>
              </Badge>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 glass rounded-full border-white/10 shadow-2xl z-40">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleMic}
                 className={cn(
                   "w-12 h-12 rounded-full transition-all",
                   isMicOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                 )}
               >
                 {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
               </Button>

               <div className="w-px h-6 bg-white/10" />

               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleCamera}
                 className={cn(
                   "w-12 h-12 rounded-full transition-all",
                   isCameraOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                 )}
               >
                 {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 shrink-0 pb-1">
            <Card className="glass border-white/5 p-2 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-accent" /> <span className="text-[11px] font-bold">{Math.round((currentIdx/MAX_QUESTIONS)*100)}% Complete</span></Card>
            <Card className="glass border-white/5 p-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-purple-400" /> <span className="text-[11px] font-bold">{currentSimStage}</span></Card>
          </div>
        </div>

        <div className="w-[300px] xl:w-[350px] border-l border-white/5 bg-[#0b0e1a] flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 p-3 flex flex-col space-y-3 overflow-hidden h-full">
             <div className="flex justify-between items-end px-1 shrink-0">
               <h3 className="text-[9px] font-black uppercase text-white/30 tracking-widest">Question {currentIdx} OF {MAX_QUESTIONS}</h3>
               <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-tighter">INTERVIEWER ACTIVE</Badge>
             </div>

             <Card className="glass border-white/10 bg-[#08090D]/95 p-4 rounded-2xl relative overflow-hidden shrink-0 shadow-lg">
                <div className="absolute top-0 right-0 p-2 opacity-10"><MessageSquare className="w-8 h-8 text-accent" /></div>
                <p className="text-[14px] font-light text-white leading-relaxed relative z-10">
                  {transcript[transcript.length-1]?.role === 'interviewer' ? transcript[transcript.length-1].text : "..."}
                </p>
             </Card>

             <div className="flex-1 min-h-[300px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40 group h-full">
                {/* Hidden Interviewer for Audio Logic Execution */}
                <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                  <HolographicInterviewer 
                    isSpeaking={isAiSpeaking}
                    currentQuestion={transcript[transcript.length-1]?.role === 'interviewer' ? transcript[transcript.length-1].text : ""}
                    onSpeechEnd={handleSpeechEnd}
                    stage={currentSimStage}
                    sessionId={sessionId}
                    currentQuestionIndex={currentIdx}
                    totalQuestions={MAX_QUESTIONS}
                  />
                </div>

                {isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ filter: 'none' }}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#050816] gap-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-10 h-10 text-white/10" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Camera Protocol Offline</p>
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/10">Vocal Node Only</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
             </div>
          </div>

          <div className="p-3 space-y-2 border-t border-white/5 bg-[#0b0e1a] shrink-0">
             <div className="flex items-center justify-between px-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">Candidate Input</label>
                <div className="flex items-center gap-1.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", isProcessing ? "bg-accent animate-pulse" : "bg-white/10")} />
                   <span className="text-[7px] font-bold text-white/20 uppercase">{isProcessing ? "PROCESSING" : "READY"}</span>
                </div>
             </div>
             <Textarea 
               value={userAnswer} 
               onChange={(e) => setUserAnswer(e.target.value)} 
               placeholder="Type your answer here..." 
               className="min-h-[80px] rounded-xl glass border-white/10 bg-transparent p-3 text-sm font-light resize-none focus:border-accent/50 transition-all" 
             />
             <Button 
               onClick={handleSend} 
               disabled={isProcessing || isSimulationComplete || !userAnswer.trim()} 
               className="w-full h-11 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl group"
             >
               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SUBMIT ANSWER <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" /></>}
             </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGeneratingReport && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
             <div className="relative mb-12">
                <div className="w-40 h-40 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Award className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
             </div>
             <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">INTERVIEW COMPLETED</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent animate-pulse mt-4">PREPARING YOUR INTERVIEW RESULTS...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VirtualArena() {
  return <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}><VirtualArenaContent /></Suspense>;
}
