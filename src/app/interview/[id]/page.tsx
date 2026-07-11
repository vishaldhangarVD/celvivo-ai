
"use client";

import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Send, 
  Mic, 
  Video, 
  LogOut, 
  Timer, 
  ShieldCheck, 
  Command, 
  ChevronRight,
  User,
  BrainCircuit,
  Terminal,
  Activity,
  Volume2,
  Cpu
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { aiMockInterview } from "@/ai/flows/ai-mock-interview-v2";
import { generateInterviewFeedback } from "@/ai/flows/ai-interview-feedback";
import { synthesizeAudio } from "@/ai/flows/ai-audio-synthesis";
import { createTalk, getTalkStatus } from "@/services/did";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, collection, addDoc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

function VirtualArenaContent() {
  const router = useRouter();
  const params = useParams();
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
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isAvatarSynthesizing, setIsAvatarSynthesizing] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [assessmentContext, setAssessmentContext] = useState<any>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const interviewerImg = useMemo(() => {
    return PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || "https://picsum.photos/seed/nexvoro_hr/800/1000";
  }, []);

  // Initialize Web Speech API for Speech-to-Text
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setUserAnswer(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onstart = () => setIsMicActive(true);
      recognition.onend = () => setIsMicActive(false);
      recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setIsMicActive(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast({ variant: "destructive", title: "STT Unsupported", description: "Browser does not support speech recognition." });
      return;
    }

    if (isMicActive) {
      recognitionRef.current.stop();
    } else {
      setUserAnswer("");
      recognitionRef.current.start();
    }
  };

  const handleInterviewerResponse = async (text: string) => {
    try {
      setIsAvatarSynthesizing(true);
      setIsAvatarSpeaking(false);
      
      // 1. Attempt D-ID Synthesis
      const talkReq = await createTalk(text, interviewerImg);
      
      if (talkReq.success && talkReq.talkId) {
        // Poll for D-ID result
        const pollStatus = async () => {
          const status = await getTalkStatus(talkReq.talkId!);
          if (status.status === 'done' && status.videoUrl) {
            setAvatarVideoUrl(status.videoUrl);
            setIsAvatarSynthesizing(false);
            setIsAvatarSpeaking(true);
          } else if (status.status === 'error') {
            throw new Error("D-ID processing failed.");
          } else {
            setTimeout(pollStatus, 2000);
          }
        };
        pollStatus();
      } else {
        throw new Error("D-ID Bypass");
      }
    } catch (error) {
      // 2. Fallback to Neural TTS (Audio Only)
      console.warn("[Arena] Falling back to Neural TTS.");
      setIsAvatarSynthesizing(false);
      setIsAvatarSpeaking(true);
      const audioUri = await synthesizeAudio(text);
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.play();
      }
    }
  };

  // Turn-based logic: Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    async function init() {
      if (!user || !db) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setAssessmentContext(data);
        
        try {
          const response = await aiMockInterview({
            role,
            experienceLevel: exp,
            roundType: round,
            currentMainQuestionIndex: 1,
            history: [],
            targetCompany: company,
            resumeSkills: data.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
            resumeProjects: data.resumeAnalysis?.sections?.projects || [],
            resumeSummary: data.resumeAnalysis?.summary || "",
            aptitudePerformance: data.aptitudeReport?.recommendation || "N/A",
            codingPerformance: data.codingReport?.finalRecommendation || "N/A",
            difficultyLevel: "MEDIUM"
          });

          setTranscript([{ role: 'interviewer', text: response.nextQuestion }]);
          await handleInterviewerResponse(response.nextQuestion);
        } catch (e) {
          toast({ variant: "destructive", title: "Arena Handshake Failed" });
        } finally {
          setIsInitializing(false);
        }
      }
    }
    init();
  }, [user, db, role, company, exp, round]);

  const handleSend = async () => {
    if (!userAnswer.trim() || isProcessing || isSimulationComplete || isAvatarSpeaking || isAvatarSynthesizing) return;
    
    // Stop mic if active
    if (isMicActive && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsProcessing(true);
    const newEntry = { role: 'candidate' as const, text: userAnswer };
    const updatedTranscript = [...transcript, newEntry];
    setTranscript(updatedTranscript);
    
    const currentAnswer = userAnswer;
    setUserAnswer("");
    setAvatarVideoUrl(null); 

    try {
      const response = await aiMockInterview({
        role,
        experienceLevel: exp,
        roundType: round,
        currentMainQuestionIndex: currentIdx + 1,
        history: updatedTranscript.map(t => ({
          question: t.role === 'interviewer' ? t.text : '',
          answer: t.role === 'candidate' ? t.text : ''
        })).filter(h => h.question || h.answer) as any,
        userAnswer: currentAnswer,
        targetCompany: company,
        resumeSkills: assessmentContext.resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
        resumeProjects: assessmentContext.resumeAnalysis?.sections?.projects || [],
        aptitudePerformance: assessmentContext.aptitudeReport?.recommendation || "N/A",
        codingPerformance: assessmentContext.codingReport?.finalRecommendation || "N/A",
        difficultyLevel: "MEDIUM"
      });

      setTranscript(prev => [...prev, { role: 'interviewer', text: response.nextQuestion }]);
      setCurrentIdx(prev => prev + 1);
      await handleInterviewerResponse(response.nextQuestion);

      if (response.isInterviewComplete || currentIdx >= 15) {
        setIsSimulationComplete(true);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Transmission Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSession = async () => {
    if (!user || !db || isGeneratingReport) return;
    setIsGeneratingReport(true);
    
    try {
      const transcriptStr = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n\n');
      const finalAudit = await generateInterviewFeedback({
        role,
        company,
        experienceLevel: exp,
        interviewTranscript: transcriptStr,
        resumeContext: {
          atsScore: assessmentContext.resumeAnalysis?.atsScore || 0,
          strengths: assessmentContext.resumeAnalysis?.analysis?.strengths || [],
          weaknesses: assessmentContext.resumeAnalysis?.analysis?.weaknesses || [],
          missingSkills: assessmentContext.resumeAnalysis?.analysis?.missingSkills || [],
        },
        aptitudeContext: {
          overallScore: assessmentContext.aptitudeReport?.overallScore || 0,
          quantitative: assessmentContext.aptitudeReport?.categoryScores?.quantitative || 0,
          logical: assessmentContext.aptitudeReport?.categoryScores?.logical || 0,
          english: assessmentContext.aptitudeReport?.categoryScores?.english || 0,
          status: assessmentContext.aptitudeReport?.status || 'N/A',
        },
        codingContext: {
          score: assessmentContext.codingReport?.score || 0,
          readability: assessmentContext.codingReport?.audit?.readabilityScore || 0,
          timeComplexity: assessmentContext.codingReport?.audit?.timeComplexity || 'N/A',
          spaceComplexity: assessmentContext.codingReport?.audit?.spaceComplexity || 'N/A',
          status: assessmentContext.codingReport?.status || 'N/A',
        }
      });

      const interviewData = {
        userId: user.uid,
        role,
        company,
        experienceLevel: exp,
        round,
        history: transcript,
        overallScore: finalAudit.overallScore,
        feedback: finalAudit,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), interviewData);
      
      await setDoc(doc(db, 'users', user.uid, 'journey', 'active'), {
        step: 11,
        finalReportId: docRef.id
      }, { merge: true });

      router.push(`/feedback/${docRef.id}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <audio ref={audioRef} onEnded={() => setIsAvatarSpeaking(false)} hidden />
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
           <Command className="w-5 h-5 text-accent" />
           <div>
             <h1 className="text-sm font-bold uppercase tracking-widest">{company}</h1>
             <p className="text-[10px] text-muted-foreground uppercase font-bold">Node {currentIdx}/15</p>
           </div>
        </div>
        <div className="px-5 py-2 glass rounded-full border-accent/20 font-mono text-accent">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8 overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 premium-card bg-black/40 p-0 overflow-hidden relative group">
            <AnimatePresence mode="wait">
              {avatarVideoUrl ? (
                <motion.video
                  key="avatar-video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  ref={videoRef}
                  onEnded={() => setIsAvatarSpeaking(false)}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  autoPlay
                />
              ) : (
                <motion.div key="avatar-image" className="absolute inset-0 w-full h-full">
                   <Image src={interviewerImg} alt="Interviewer" fill className={`object-cover transition-all duration-700 ${isAvatarSpeaking ? 'opacity-100 scale-105 saturate-100' : 'opacity-40 saturate-0'}`} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute bottom-6 left-6 z-20">
               <p className="text-xl font-bold">Senior Partner</p>
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-white/40 uppercase font-bold">
                   {isAvatarSynthesizing ? "Synthesizing Neural Node..." : "Simulation Matrix Active"}
                 </p>
                 {(isAvatarSpeaking || isAvatarSynthesizing) && <Activity className={`w-3 h-3 ${isAvatarSynthesizing ? 'text-purple-400' : 'text-accent'} animate-pulse`} />}
               </div>
            </div>

            {isAvatarSynthesizing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-30 space-y-4">
                <Cpu className="w-10 h-10 text-purple-400 animate-spin" />
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-purple-400">Architecting Avatar Node...</span>
              </div>
            )}
          </Card>
          <Card className="h-40 glass flex items-center justify-center text-center p-6"><p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.4em]">Candidate Feed Shielded</p></Card>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <Card className="premium-card bg-[#0b0e1a]/80 p-8 border-glow-premium">
             <h2 className="text-xl md:text-2xl font-bold leading-tight">
               {isProcessing ? "Synthesizing next node..." : isAvatarSynthesizing ? "Analyzing response..." : isAvatarSpeaking ? "Listening..." : transcript.filter(t => t.role === 'interviewer').slice(-1)[0]?.text}
             </h2>
          </Card>
          <Card className="flex-1 premium-card bg-black/40 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-2xl border ${msg.role === 'candidate' ? 'bg-accent/10 border-accent/20' : 'glass border-white/5'}`}>
                  <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </Card>
          <div className="h-24 glass rounded-[2rem] p-4 flex items-center gap-4">
             <Button onClick={toggleMic} disabled={isAvatarSpeaking || isAvatarSynthesizing || isProcessing} className={`w-12 h-12 rounded-xl transition-all ${isMicActive ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/10 text-red-400'}`}><Mic className="w-5 h-5" /></Button>
             <input disabled={isProcessing || isAvatarSpeaking || isAvatarSynthesizing} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent outline-none px-4 text-sm font-light placeholder:text-white/20" placeholder={isMicActive ? "Listening..." : "Type your professional reasoning..."} />
             <Button onClick={handleSend} disabled={!userAnswer.trim() || isProcessing || isAvatarSpeaking || isAvatarSynthesizing} className="h-14 px-8 btn-premium rounded-xl">Transmit</Button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isSimulationComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/95 backdrop-blur-2xl">
            <div className="max-w-md w-full text-center space-y-8">
              <ShieldCheck className="w-16 h-16 text-accent mx-auto animate-pulse" />
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Gauntlet Complete</h2>
              <p className="text-muted-foreground">Your multi-dimensional technical and behavioral vectors are being audited.</p>
              <Button onClick={finalizeSession} disabled={isGeneratingReport} className="w-full h-18 btn-premium uppercase font-bold text-xs">
                {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : "Synthesize Final AI Report"}
              </Button>
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
