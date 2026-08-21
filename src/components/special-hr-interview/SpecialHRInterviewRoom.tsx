'use client';

import React, { useState } from 'react';
import SpecialHRInterviewerAgent from './SpecialHRInterviewerAgent';
import SpecialHRResumeUpload from './SpecialHRResumeUpload';
import SpecialHRControls from './SpecialHRControls';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';
import { uploadSpecialHRResume } from '@/lib/special-hr-interview/resume-service';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * @fileOverview SpecialHRInterviewRoom - The high-fidelity executive interview environment.
 * Single-viewport layout with ephemeral side panel for resume upload.
 */

export default function SpecialHRInterviewRoom() {
  const [interviewStatus, setInterviewStatus] = useState<SpecialHRInterviewStatus>('AWAITING_RESUME');
  const [uploadStatus, setUploadStatus] = useState<SpecialHRUploadStatus>('IDLE');
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

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

  const handleResetResume = () => {
    setResumeFileName(undefined);
    setUploadStatus('IDLE');
    setInterviewStatus('AWAITING_RESUME');
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden relative">
      {/* Main Interview Area */}
      <div className="flex-1 relative flex gap-4 min-h-0">
        
        {/* Central Interview Stage - Dominant Area */}
        <div className="flex-1 h-full relative">
          <SpecialHRInterviewerAgent 
            isInterviewStarted={interviewStatus === 'IN_PROGRESS' || interviewStatus === 'INTERVIEW_STARTING'} 
            status={interviewStatus}
          />
        </div>

        {/* Ephemeral Resume Sidebar - Disappears after upload */}
        <AnimatePresence>
          {interviewStatus === 'AWAITING_RESUME' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-[320px] shrink-0 h-full"
            >
              <div className="glass bg-white/[0.01] border-white/5 p-6 rounded-[2.5rem] h-full flex flex-col gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-accent">Protocol Input</h3>
                  <p className="text-[10px] text-white/40 uppercase">Awaiting Professional Blueprint</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <SpecialHRResumeUpload 
                    onFileSelect={handleResumeSelect} 
                    status={uploadStatus} 
                    fileName={resumeFileName} 
                    onReset={handleResetResume} 
                  />
                </div>
                
                <div className="text-[9px] text-white/20 uppercase tracking-widest italic border-t border-white/5 pt-4">
                  * Upload is mandatory to enter the executive room.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Navigation - Bottom Layer */}
      <div className="h-16 shrink-0">
        <SpecialHRControls 
          status={interviewStatus}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onToggleMic={() => setIsMicOn(!isMicOn)}
          onToggleCamera={() => setIsCameraOn(!isCameraOn)}
          onStart={() => setInterviewStatus('IN_PROGRESS')}
          onEnd={() => setInterviewStatus('COMPLETED')}
          canStart={uploadStatus === 'SUCCESS'}
        />
      </div>
    </div>
  );
}
