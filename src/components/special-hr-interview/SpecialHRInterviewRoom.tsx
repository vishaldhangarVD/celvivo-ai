'use client';

import React, { useState } from 'react';
import SpecialHRInterviewerAgent from './SpecialHRInterviewerAgent';
import SpecialHRInterviewPanel from './SpecialHRInterviewPanel';
import SpecialHRControls from './SpecialHRControls';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';
import { uploadSpecialHRResume } from '@/lib/special-hr-interview/resume-service';

/**
 * @fileOverview SpecialHRInterviewRoom - The high-fidelity executive interview environment.
 * Orchestrates the single-viewport layout and isolated session state.
 */

export default function SpecialHRInterviewRoom() {
  const [interviewStatus, setInterviewStatus] = useState<SpecialHRInterviewStatus>('AWAITING_RESUME');
  const [uploadStatus, setUploadStatus] = useState<SpecialHRUploadStatus>('IDLE');
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();
  
  // Hardware States
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

  const handleStartInterview = () => {
    setInterviewStatus('INTERVIEW_STARTING');
    setTimeout(() => {
      setInterviewStatus('IN_PROGRESS');
    }, 2000);
  };

  const handleEndInterview = () => {
    setInterviewStatus('COMPLETED');
  };

  return (
    <div className="h-full flex flex-col px-6 py-4 gap-4 overflow-hidden min-h-0">
      {/* Upper Logic Section */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Main AI Agent Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <SpecialHRInterviewerAgent 
            isInterviewStarted={interviewStatus === 'IN_PROGRESS' || interviewStatus === 'INTERVIEW_STARTING'} 
            status={interviewStatus}
          />
        </div>

        {/* Identity & Resume Panel */}
        <div className="lg:w-[380px] shrink-0 h-full overflow-hidden">
          <SpecialHRInterviewPanel 
            status={interviewStatus}
            uploadStatus={uploadStatus}
            fileName={resumeFileName}
            onFileSelect={handleResumeSelect}
            onResetResume={handleResetResume}
          />
        </div>
      </div>

      {/* Bottom Control Protocol */}
      <div className="h-20 shrink-0">
        <SpecialHRControls 
          status={interviewStatus}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onToggleMic={() => setIsMicOn(!isMicOn)}
          onToggleCamera={() => setIsCameraOn(!isCameraOn)}
          onStart={handleStartInterview}
          onEnd={handleEndInterview}
          canStart={uploadStatus === 'SUCCESS' && interviewStatus === 'READY'}
        />
      </div>
    </div>
  );
}
