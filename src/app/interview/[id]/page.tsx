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
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, getDoc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import HolographicInterviewer from "@/components/HolographicInterviewer";

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
  const [timeLeft, setTimeLeft] = useState(15 * 60); 
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Neural Simulation State
  const [currentSimStage, setCurrentSimStage] = useState<any>("INTRODUCTION");
  const [currentSimDifficulty, setCurrentSimDifficulty] = useState<any>("MEDIUM");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMediaReady, setIsMediaReady] = useState(false);

  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  // ElevenLabs Audio Management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);

  // Dynamic Candidate Identity Resolution
  const formattedName = useMemo(() => {
    const resumeName = journey?.resumeAnalysis?.personalInfo?.fullName;
    if (resumeName) return resumeName;

    if (!user) return 'Candidate';
    const name = user.displayName || user.email?.split('@')[0] || 'Candidate';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user, journey]);

  const currentInterviewerQuestion = useMemo(() => {
    const lastInterviewer = [...transcript].reverse().find(t => t.role === 'interviewer');
    return lastInterviewer?.text || "Initializing session...";
  }, [transcript]);

  // ElevenLabs Neural Audio Protocol
  useEffect(() => {
    if (!currentInterviewerQuestion || currentInterviewerQuestion === "Initializing session...") {
      return;
    }

    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }

    const controller = new AbortController();
    ttsAbortControllerRef.current = controller;

    async function generateAudio() {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentInterviewerQuestion }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Neural audio sync failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsAiSpeaking(true);
        audio.onended = () => setIsAiSpeaking(false);
        
        await audio.play().catch(err => {
          console.warn('[Audio Autoplay] Restricted or interrupted:', err);
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('[ElevenLabs Integration] Fault:', error.message);
        }
      }
    }

    generateAudio();

    return () => {
      if (ttsAbortControllerRef.current) {
        ttsAbortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
    };
  }, [currentInterviewerQuestion]);

  // Interview Real-time Countdown Protocol
  useEffect(() => {
    if (isInitializing || isSimulationComplete || isGeneratingReport) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitializing, isSimulationComplete, isGeneratingReport]);

  // Auto-finalize on timeout
  useEffect(() => {
    if (timeLeft === 0 && !isSimulationComplete && !isGeneratingReport && !isInitializing) {
      finalizeSession(transcript);
    }
  }, [timeLeft, isSimulationComplete, isGeneratingReport, isInitializing, transcript]);

  const toggleMediaMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
    }
  };

  const toggleMediaCamera = async () => {
    const newState = !isCameraOn;
    
    if (newState) {
      const stream = mediaStreamRef.current;
      let videoTrack = stream?.getVideoTracks()[0];

      if (!videoTrack || videoTrack.readyState === 'ended') {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          
          if (stream) {
            stream.getVideoTracks().forEach(t => {
              t.stop();
              stream.removeTrack(t);
            });
            stream.addTrack(newVideoTrack);
          } else {
            mediaStreamRef.current = newStream;
          }
          videoTrack = newVideoTrack;
        } catch (error) {
          console.error("Failed to re-acquire camera:", error);
          setCameraError("Unable to restart camera. Please check permissions.");
          return;
        }
      } else {
        videoTrack.enabled = true;
      }

      setIsCameraOn(true);

      if (userVideoRef.current && mediaStreamRef.current) {
        userVideoRef.current.srcObject = mediaStreamRef.current;
        try {
          await userVideoRef.current.play();
        } catch (e) {
          console.warn("Play interrupted or failed:", e);
        }
      }
    } else {
      setIsCameraOn(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }
    }
  };

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

      mediaStream.getAudioTracks().forEach(t => t.enabled = isMicOn);
      mediaStream.getVideoTracks().forEach(t => t.enabled = isCameraOn);

      mediaStreamRef.current = mediaStream;
      setIsMediaReady(true);

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
      setIsMediaReady(false);
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
    async function init() {
      if (!user || !db || !role || !company) return;
      
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        
        // Simulation Context Verification
        const rs = data.resumeAnalysis?.skillAnalysis || [];
        const rp = data.resumeAnalysis?.sections?.projects || [];

        // Initialize Sim State
        const startStage = data.simStage || "INTRODUCTION";
        const startDiff = data.simDifficulty || "MEDIUM";
        setCurrentSimStage(startStage);
        setCurrentSimDifficulty(startDiff);
        
        const candidateName = data.resumeAnalysis?.personalInfo?.fullName || user.displayName || undefined;

        try {
          if (transcript.length === 0) {
            const response = await aiMockInterview({
              role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: 1, 
              history: [], targetCompany: company,
              candidateName: candidateName,
              resumeSkills: rs.map((s: any) => s.skill),
              resumeProjects: rp,
              resumeSummary: data.resumeAnalysis?.summary || "",
              aptitudeScore: data.aptitudeReport?.overallScore || 0,
              codingScore: data.codingReport?.score || 0,
              askedQuestions: [],
              debugMode: data.debugMode,
              currentStage: startStage as any,
              currentDifficulty: startDiff as any,
              hintUsed: data.hintUsed || false
            });

            setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
            setAskedQuestions([response.nextQuestion]);
            
            // Sync initial adaptive state
            setCurrentSimStage(response.stage);
            setCurrentSimDifficulty(response.difficulty);
            updateDoc(docRef, {
              simStage: response.stage,
              simDifficulty: response.difficulty
            });
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

      const rs = journey?.resumeAnalysis?.skillAnalysis || [];
      const rp = journey?.resumeAnalysis?.sections?.projects || [];

      const response = await aiMockInterview({
        role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: currentIdx,
        history: chatHistory,
        userAnswer: currentAns, targetCompany: company,
        candidateName: formattedName,
        resumeSkills: rs.map((s: any) => s.skill),
        resumeProjects: rp,
        resumeSummary: journey?.resumeAnalysis?.summary || "",
        aptitudeScore: journey?.aptitudeReport?.overallScore || 0,
        codingScore: journey?.codingReport?.score || 0,
        askedQuestions: askedQuestions,
        debugMode: journey?.debugMode,
        currentStage: currentSimStage as any,
        currentDifficulty: currentSimDifficulty as any,
        hintUsed: journey?.hintUsed || false
      });

      const updatedTranscript = [...newTranscript, { role: 'interviewer' as const, text: response.nextQuestion }];
      setTranscript(updatedTranscript);
      
      // Update persistent journey state loop
      setCurrentSimStage(response.stage);
      setCurrentSimDifficulty(response.difficulty);
      if (journeyRef) {
        updateDoc(journeyRef, {
          simStage: response.stage,
          simDifficulty: response.difficulty,
          hintUsed: !!response.isHint,
          updatedAt: serverTimestamp()
        });
      }

      if (response.isInterviewComplete) {
        // UI Lock and professional closing delay
        setIsSimulationComplete(true);
        setTimeout(() => {
          finalizeSession(updatedTranscript);
        }, 5000);
      } else if (!response.isHint) {
        setAskedQuestions(prev => [...prev, response.nextQuestion]);
        setCurrentIdx(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Neural Link Sync Fault" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSession = async (currentTranscript: any[]) => {
    if (!user || !db || !journeyRef || isGeneratingReport) return;
    setIsGeneratingReport(true);
    setIsSimulationComplete(true);
    
    try {
      const transcriptStr = currentTranscript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n\n');
      
      const aptitudeReport = journey?.aptitudeReport;
      const codingReport = journey?.codingReport;

      const finalAudit = await generateInterviewFeedback({
        role, company, experienceLevel: exp, interviewTranscript: transcriptStr,
        resumeContext: {
          atsScore: journey?.resumeAnalysis?.atsScore || 0,
          strengths: journey?.resumeAnalysis?.analysis?.strengths || [],
          weaknesses: journey?.resumeAnalysis?.analysis?.weaknesses || [],
          missingSkills: journey?.resumeAnalysis?.analysis?.missingSkills || [],
        },
        aptitudeContext: {
          overallScore: aptitudeReport?.overallScore || 0,
          quantitative: aptitudeReport?.accuracy || 0,
          logical: aptitudeReport?.accuracy || 0,
          english: aptitudeReport?.accuracy || 0,
          status: aptitudeReport?.status || "Verified"
        },
        codingContext: {
          score: codingReport?.score || 0,
          status: codingReport?.status || "N/A"
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
        codingScore: journey?.codingReport?.score || 0,
        aptitudeScore: journey?.aptitudeReport?.overallScore || 0,
        feedback: finalAudit, 
        createdAt: serverTimestamp(),
      });

      const userRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(userRef);
      const profileData = profileSnap.data();
      
      const plan = profileData?.plan || 'free';
      const alreadyUsed = profileData?.freeJourneyUsed || false;

      if (plan === 'free' && !alreadyUsed) {
        await setDoc(userRef, {
          freeJourneyUsed: true,
          plan: plan,
          subscriptionStatus: profileData?.subscriptionStatus || 'active',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      await deleteDoc(journeyRef);
      stopCamera();
      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Final Audit Protocol Failure" });
      setIsGeneratingReport(false);
      setIsSimulationComplete(false);
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
    <div className="h-screen w-full max-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      
      <header className="h-16 border-b border-white/5 bg-[#0b0e1a] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 font-black text-lg">N</div>
           <div>
             <h1 className="text-xs font-black uppercase tracking-widest text-white leading-none">NEXVOROAI</h1>
             <p className="text-[9px] text-white/40 uppercase font-black mt-1">{formattedName}</p>
           </div>
        </div>

        <div className="text-center">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Time Remaining</p>
          <div className="px-3 py-1 glass rounded-lg border-accent/20 font-mono text-base text-accent tabular-nums flex items-center gap-2">
            <Timer className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white"><HelpCircle className="w-4 lg:h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white"><MessageSquare className="w-4 lg:h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white"><Flag className="w-4 lg:h-4" /></Button>
          <Button 
            onClick={() => finalizeSession(transcript)}
            className="h-9 px-4 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold text-[9px] uppercase tracking-widest"
          >
            End Interview
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white"><MoreHorizontal className="w-4 lg:h-4" /></Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-[72px] border-r border-white/5 bg-[#0b0e1a] flex flex-col items-center py-6 gap-8 shrink-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Home className="w-5 lg:h-5" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-accent bg-accent/10 rounded-xl"><Mic className="w-5 lg:h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><BarChart4 className="w-5 lg:h-5" /></Button>
          <div className="mt-auto flex flex-col gap-6">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><HelpCircle className="w-5 lg:h-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Settings className="w-5 lg:h-5" /></Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-1.5 overflow-hidden">
          <div className="flex-1 min-0 relative rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                (!isCameraOn || !!cameraError) && "hidden"
              )}
              style={{ transform: 'scaleX(-1)' }}
            />

            {!isCameraOn && !cameraError && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a] text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <VideoOff className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Camera Paused</p>
              </div>
            )}
            
            {cameraError && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e1a] text-center p-8 space-y-4">
                <VideoOff className="w-12 h-12 text-red-400" />
                <h3 className="text-lg font-bold text-white">Camera Access Required</h3>
                <Button onClick={startCamera} className="btn-premium px-6 h-10 text-[10px]">Enable Camera</Button>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 glass rounded-full border-green-500/20 text-green-400">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secure Connection</span>
            </div>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2.5 py-1 glass rounded-full border-white/10 text-white/60">
              <User className="w-2.5 h-2.5" />
              <span className="text-[8px] font-black uppercase tracking-widest">You</span>
            </div>

            {/* UPGRADED HOLOGRAPHIC AI INTERVIEWER - Exact Reference Integration */}
            <div className="absolute bottom-4 right-4 w-[240px] xl:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-black">
              <HolographicInterviewer isSpeaking={isAiSpeaking} />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMediaMic}
                className={cn("w-9 h-9 rounded-full glass transition-all", isMicOn ? "hover:bg-white/10 text-white" : "bg-red-500/20 text-red-500 border-red-500/30")}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMediaCamera}
                className={cn("w-9 h-9 rounded-full glass transition-all", isCameraOn ? "hover:bg-white/10 text-white" : "bg-red-500/20 text-red-500 border-red-500/30")}
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0 pb-1">
            <Card className="glass border-white/5 p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><Activity className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Progress</p>
                <p className="text-[11px] font-bold text-white leading-none">{Math.round((currentIdx / 10) * 100)}%</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><Clock className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Stage</p>
                <p className="text-[11px] font-bold text-white leading-none truncate">{currentSimStage}</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400"><Wifi className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Status</p>
                <p className="text-[11px] font-bold text-white leading-none">Optimal</p>
              </div>
            </Card>
            <Card className="glass border-white/5 p-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                 <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full glass border-white/10 hover:bg-white/5 p-0"><Calculator className="w-2.5 h-2.5" /></Button>
                 <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full glass border-white/10 hover:bg-white/5 p-0"><FileEdit className="w-2.5 h-2.5" /></Button>
              </div>
              <div className="ml-1">
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none">Quick Tools</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="w-[300px] xl:w-[320px] border-l border-white/5 bg-[#0b0e1a] flex flex-col shrink-0 overflow-hidden">
          <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
             <button className="text-[8px] font-black uppercase tracking-widest text-accent border-b-2 border-accent h-full px-2">Interview</button>
             <button className="text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white px-2">Notes</button>
             <button className="text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white px-2">Log</button>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
             <div className="flex-1 p-3 flex flex-col space-y-2 overflow-hidden">
                <div className="space-y-1 shrink-0">
                   <div className="flex justify-between items-end">
                     <h3 className="text-[9px] font-black uppercase tracking-widest text-white/30">Question {currentIdx} of 10</h3>
                     <span className="text-[9px] font-black text-accent uppercase tracking-widest">{currentIdx}0%</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-accent transition-all duration-500" style={{ width: `${currentIdx}0%` }} />
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
                   <Card className="glass border-white/10 bg-[#08090D]/95 p-4 space-y-3 rounded-2xl relative overflow-hidden shadow-2xl">
                       <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-accent to-purple-600 rounded-full" />
                       <p className="text-[15px] font-light text-white leading-relaxed">{currentInterviewerQuestion}</p>
                       <div className="pt-2 border-t border-white/5 space-y-2">
                         <div className="flex items-center justify-between">
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Context</span>
                           <div className="flex items-center gap-1.5 text-accent">
                              <Badge variant="outline" className="border-accent/30 text-accent text-[7px] uppercase px-1.5 py-0">{currentSimStage}</Badge>
                           </div>
                         </div>
                         <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                           Awaiting your response...
                         </div>
                       </div>
                   </Card>
                </div>
             </div>

             <div className="p-3 space-y-2 border-t border-white/5 shrink-0 bg-[#0b0e1a]">
                <div className="relative group">
                  <Textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type response..."
                    className="min-h-[70px] xl:min-h-[90px] rounded-xl glass border-white/10 bg-transparent p-2.5 text-sm font-light resize-none focus:border-accent transition-all pr-10 custom-scrollbar"
                  />
                  <button 
                    onClick={toggleMic}
                    className={cn(
                      "absolute right-2 bottom-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                      isMicActive ? "bg-red-500 text-white animate-pulse shadow-lg" : "bg-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={isProcessing || !userAnswer.trim() || isSimulationComplete}
                  className="w-full h-10 btn-premium rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl group"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Submit Answer <Send className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" /></>}
                </Button>
             </div>
          </div>
        </div>
      </div>

      <footer className="h-10 border-t border-white/5 bg-[#0b0e1a] flex items-center px-8 gap-8 shrink-0 z-50 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <Award className="w-3.5 h-3.5 text-accent" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Interview Tips:</span>
        </div>
        <div className="flex-1 flex items-center gap-10 overflow-hidden">
          {[
            "Think Before You Speak",
            "Structure your answers",
            "Be specific & metrics-driven",
            "Stay calm & confident"
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className="w-1 rounded-full bg-accent/40" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">{tip}</span>
            </div>
          ))}
        </div>
      </footer>

      <AnimatePresence>
        {isInitializing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-full border-b-2 border-accent mx-auto" />
                <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Initializing Brain</h2>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent">Personalizing Simulation...</span>
              </div>
            </div>
          </motion.div>
        )}

        {isSimulationComplete && isGeneratingReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-full border-b-2 border-accent mx-auto" />
                <ShieldCheck className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Finalizing Audit</h2>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent">Compiling Master Dossier...</span>
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
