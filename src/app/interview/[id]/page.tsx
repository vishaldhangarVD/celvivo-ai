
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
  RotateCw, 
  ChevronRight, 
  Timer, 
  User, 
  Video, 
  Activity, 
  Wifi, 
  Calculator, 
  FileEdit, 
  Award, 
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
  
  // Neural Avatar Pipeline State
  const [currentSimStage, setCurrentSimStage] = useState<string>("INTRODUCTION");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
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

  const executeSpeechTrigger = (text: string) => {
    if (!text) return;
    setIsAiSpeaking(true);
  };

  useEffect(() => {
    const lastMsg = [...transcript].reverse().find(t => t.role === 'interviewer');
    if (lastMsg && !isInitializing && !isSimulationComplete) {
      executeSpeechTrigger(lastMsg.text);
    }
  }, [transcript, isInitializing, isSimulationComplete]);

  useEffect(() => {
    if (isInitializing || isSimulationComplete || isGeneratingReport) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, isSimulationComplete, isGeneratingReport]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = mediaStream;
      if (userVideoRef.current) userVideoRef.current.srcObject = mediaStream;
    } catch (error: any) {
      setCameraError(error?.message || "Camera access required.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => mediaStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

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

  useEffect(() => {
    async function init() {
      if (!user || !db || !role || !company) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (transcript.length === 0) {
          const response = await aiMockInterview({
            role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: 1, 
            history: [], targetCompany: company,
            candidateName: data.resumeAnalysis?.personalInfo?.fullName || user.displayName || undefined,
            resumeSkills: data.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
            resumeProjects: data.resumeAnalysis?.sections?.projects || [],
            resumeSummary: data.resumeAnalysis?.summary || "",
            aptitudeScore: data.aptitudeReport?.overallScore || 0,
            codingScore: data.codingReport?.score || 0,
            askedQuestions: [],
            debugMode: data.debugMode,
            currentStage: "INTRODUCTION",
            currentDifficulty: "MEDIUM",
            hintUsed: false
          });
          setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
          setAskedQuestions([response.nextQuestion]);
          setCurrentSimStage(response.stage);
        }
        setIsInitializing(false);
      } else {
        router.push('/interview');
      }
    }
    init();
  }, [user, db, role, company, exp, round, router]);

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
        role, experienceLevel: exp, roundType: round, currentMainQuestionIndex: currentIdx,
        history: chatHistory, userAnswer: currentAns, targetCompany: company,
        candidateName: formattedName,
        resumeSkills: journey?.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
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

      if (response.isInterviewComplete) {
        setIsSimulationComplete(true);
        setTimeout(() => finalizeSession(updatedTranscript), 5000);
      } else {
        setAskedQuestions(prev => [...prev, response.nextQuestion]);
        setCurrentIdx(prev => prev + 1);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Neural Link Sync Fault" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSession = async (currentTranscript: any[]) => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);
    try {
      const finalAudit = await generateInterviewFeedback({
        role, company, experienceLevel: exp, 
        interviewTranscript: currentTranscript.map(t => `${t.role}: ${t.text}`).join('\n\n'),
        resumeContext: {
          atsScore: journey?.resumeAnalysis?.atsScore || 0,
          strengths: journey?.resumeAnalysis?.analysis?.strengths || [],
          weaknesses: journey?.resumeAnalysis?.analysis?.weaknesses || [],
          missingSkills: journey?.resumeAnalysis?.analysis?.missingSkills || [],
        }
      });
      const docRef = await addDoc(collection(db, 'users', user!.uid, 'interviews'), {
        role, company, experienceLevel: exp, history: currentTranscript, 
        overallScore: finalAudit.overallScore, feedback: finalAudit, createdAt: serverTimestamp(),
      });
      await deleteDoc(journeyRef!);
      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="h-screen w-full max-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      
      <header className="h-16 border-b border-white/5 bg-[#0b0e1a] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">N</div>
           <div><h1 className="text-xs font-black uppercase text-white">NEXVOROAI</h1><p className="text-[9px] text-white/40 uppercase font-black">{formattedName}</p></div>
        </div>
        <div className="px-3 py-1 glass rounded-lg border-accent/20 font-mono text-accent flex items-center gap-2"><Timer className="w-3.5 h-3.5" /> {timeLeft}s</div>
        <div className="flex items-center gap-4">
          <Button onClick={() => finalizeSession(transcript)} className="h-9 px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] uppercase font-bold">End Interview</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[72px] border-r border-white/5 bg-[#0b0e1a] flex flex-col items-center py-6 gap-8 shrink-0">
          <Link href="/"><Button variant="ghost" size="icon" className="text-white/20"><Home className="w-5" /></Button></Link>
          <Button variant="ghost" size="icon" className="text-accent bg-accent/10 rounded-xl"><Mic className="w-5" /></Button>
        </div>

        <div className="flex-1 flex flex-col p-3 space-y-1.5 overflow-hidden">
          <div className="flex-1 min-0 relative rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
            <video ref={userVideoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", !isCameraOn && "hidden")} style={{ transform: 'scaleX(-1)' }} />
            
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white/80 py-1.5 px-4 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">LIVE SESSION</span>
              </Badge>
            </div>

            {/* AVATAR CONTROLS: MICROPHONE AND CAMERA TOGGLES */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 glass rounded-full border-white/10 shadow-2xl z-40">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleMic}
                 className={cn(
                   "w-12 h-12 rounded-full transition-all",
                   isMicOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/40"
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
                   isCameraOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/40"
                 )}
               >
                 {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
               </Button>
            </div>

            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#050816]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                    <VideoOff className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Visual Feed Deactivated</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 shrink-0 pb-1">
            <Card className="glass border-white/5 p-2 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-accent" /> <span className="text-[11px] font-bold">{Math.round((currentIdx/10)*100)}% Complete</span></Card>
            <Card className="glass border-white/5 p-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-purple-400" /> <span className="text-[11px] font-bold">{currentSimStage}</span></Card>
          </div>
        </div>

        <div className="w-[300px] xl:w-[350px] border-l border-white/5 bg-[#0b0e1a] flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 p-3 flex flex-col space-y-3 overflow-hidden">
             <div className="flex justify-between items-end px-1 shrink-0">
               <h3 className="text-[9px] font-black uppercase text-white/30 tracking-widest">Question {currentIdx}</h3>
               <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-tighter">AI Node Active</Badge>
             </div>

             <Card className="glass border-white/10 bg-[#08090D]/95 p-4 rounded-2xl relative overflow-hidden shrink-0 shadow-lg">
                <div className="absolute top-0 right-0 p-2 opacity-10"><MessageSquare className="w-8 h-8 text-accent" /></div>
                <p className="text-[14px] font-light text-white leading-relaxed relative z-10">
                  {transcript[transcript.length-1]?.role === 'interviewer' ? transcript[transcript.length-1].text : "..."}
                </p>
             </Card>

             <div className="flex-1 min-h-[300px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40 group">
                <HolographicInterviewer 
                  isSpeaking={isAiSpeaking} 
                  isGenerating={isInitializing}
                  currentQuestion={transcript[transcript.length-1]?.text} 
                  onSpeechEnd={() => setIsAiSpeaking(false)}
                  className="rounded-2xl"
                />
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
               placeholder="Synthesize your response..." 
               className="min-h-[80px] rounded-xl glass border-white/10 bg-transparent p-3 text-sm font-light resize-none focus:border-accent/50 transition-all" 
             />
             <Button 
               onClick={handleSend} 
               disabled={isProcessing || !userAnswer.trim()} 
               className="w-full h-11 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl group"
             >
               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SUBMIT ANSWER <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" /></>}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VirtualArena() {
  return <Suspense fallback={<div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}><VirtualArenaContent /></Suspense>;
}
