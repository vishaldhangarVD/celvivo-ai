
'use client';

import React, { useState } from 'react';
import SpecialHRInterviewerAgent from './SpecialHRInterviewerAgent';
import SpecialHRResumeUpload from './SpecialHRResumeUpload';
import SpecialHRControls from './SpecialHRControls';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';
import { uploadSpecialHRResume } from '@/lib/special-hr-interview/resume-service';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, ShieldCheck, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview SpecialHRInterviewRoom - The high-fidelity executive interview environment.
 * Features 3D hologram identity calibration flow.
 */

export default function SpecialHRInterviewRoom() {
  const { toast } = useToast();
  const [interviewStatus, setInterviewStatus] = useState<SpecialHRInterviewStatus>('AWAITING_RESUME');
  const [uploadStatus, setUploadStatus] = useState<SpecialHRUploadStatus>('IDLE');
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleResumeSelect = async (file: File) => {
    setResumeFileName(file.name);
    setUploadStatus('UPLOADING');
    
    const result = await uploadSpecialHRResume(file);
    if (result.success) {
      setUploadStatus('SUCCESS');
      setInterviewStatus('READY');
    } else {
      setUploadStatus('ERROR');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPhotoUrl(url);
        toast({ title: "Identity Registered", description: "3D Visual nodes synthesized." });
      } else {
        toast({ variant: "destructive", title: "Format Error", description: "Please upload an identity image." });
      }
    }
  };

  const handleResetResume = () => {
    setResumeFileName(undefined);
    setUploadStatus('IDLE');
    setInterviewStatus('AWAITING_RESUME');
  };

  const startInterview = () => {
    if (!photoUrl) {
      toast({ variant: "destructive", title: "Calibration Required", description: "Upload identity photo to synthesize hologram." });
      return;
    }
    setInterviewStatus('IN_PROGRESS');
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden relative bg-[#050816]">
      <div className="flex-1 relative flex gap-4 min-h-0">
        
        {/* Central Interview Stage - Dominant Area */}
        <div className="flex-1 h-full relative">
          <SpecialHRInterviewerAgent 
            isInterviewStarted={interviewStatus === 'IN_PROGRESS' || interviewStatus === 'INTERVIEW_STARTING'} 
            status={interviewStatus}
            photoUrl={photoUrl}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Ephemeral Calibration Sidebar */}
        <AnimatePresence>
          {interviewStatus !== 'IN_PROGRESS' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-[360px] shrink-0 h-full overflow-y-auto custom-scrollbar pr-1"
            >
              <div className="glass bg-white/[0.01] border-white/5 p-8 rounded-[2.5rem] flex flex-col gap-10">
                <div className="space-y-1">
                  <Badge className="bg-accent/20 text-accent border-none text-[8px] uppercase tracking-widest px-3 mb-2">Simulation Calibration</Badge>
                  <h3 className="text-xl font-bold tracking-tighter text-white">Visual Identity</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Synthesize 3D Hologram Nodes</p>
                </div>
                
                {/* Photo Calibration Section */}
                <div className="space-y-4">
                  <div 
                    onClick={() => document.getElementById('photo-input')?.click()}
                    className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden
                      ${photoUrl ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}
                    `}
                  >
                    <input type="file" id="photo-input" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    {photoUrl ? (
                      <>
                        <img src={photoUrl} className="w-full h-full object-cover opacity-60 grayscale brightness-125" />
                        <div className="absolute inset-0 flex items-center justify-center bg-accent/20 backdrop-blur-sm">
                           <div className="text-center space-y-2">
                             <ShieldCheck className="w-8 h-8 text-white mx-auto drop-shadow-lg" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Identity Locked</span>
                           </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setPhotoUrl(undefined); }} className="absolute top-4 right-4 w-8 h-8 rounded-full glass border-white/20 flex items-center justify-center text-white/40 hover:text-white transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-white/20 border border-white/10">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Front-Facing Portrait</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-white/5" />
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Professional Blueprint</p>
                  <SpecialHRResumeUpload 
                    onFileSelect={handleResumeSelect} 
                    status={uploadStatus} 
                    fileName={resumeFileName} 
                    onReset={handleResetResume} 
                  />
                </div>
                
                <div className="pt-4">
                   <Button 
                    onClick={startInterview}
                    disabled={!photoUrl || uploadStatus !== 'SUCCESS'}
                    className="w-full h-18 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-20"
                   >
                     ENTER ARENA
                   </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Navigation */}
      <div className="h-16 shrink-0 flex items-center justify-center">
        <div className="w-full max-w-4xl h-full">
          <SpecialHRControls 
            status={interviewStatus}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            onToggleMic={() => setIsMicOn(!isMicOn)}
            onToggleCamera={() => setIsCameraOn(!isCameraOn)}
            onStart={startInterview}
            onEnd={() => setInterviewStatus('COMPLETED')}
            canStart={uploadStatus === 'SUCCESS' && !!photoUrl}
          />
        </div>
        
        {/* Simulated Vocal Trigger for Testing */}
        {interviewStatus === 'IN_PROGRESS' && (
           <div className="absolute bottom-8 right-8">
             <Button 
               onClick={() => setIsSpeaking(!isSpeaking)}
               className={`h-10 px-6 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${isSpeaking ? 'bg-accent/20 border-accent text-accent animate-pulse' : 'glass border-white/10 text-white/40'}`}
             >
               {isSpeaking ? "STOP SPEAKING" : "TRIGGER VOCAL NODES"}
             </Button>
           </div>
        )}
      </div>
    </div>
  );
}
