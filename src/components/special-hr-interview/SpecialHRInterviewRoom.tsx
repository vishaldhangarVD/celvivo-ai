'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpecialHRInterviewerAgent from './SpecialHRInterviewerAgent';
import SpecialHRInterviewPanel from './SpecialHRInterviewPanel';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';
import { uploadSpecialHRResume } from '@/lib/special-hr-interview/resume-service';

export default function SpecialHRInterviewRoom() {
  const [interviewStatus, setInterviewStatus] = useState<SpecialHRInterviewStatus>('AWAITING_RESUME');
  const [uploadStatus, setUploadStatus] = useState<SpecialHRUploadStatus>('IDLE');
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();
  const [resumeFile, setResumeFile] = useState<File | undefined>();

  const handleResumeSelect = async (file: File) => {
    setResumeFile(file);
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
    setResumeFile(undefined);
    setResumeFileName(undefined);
    setUploadStatus('IDLE');
    setInterviewStatus('AWAITING_RESUME');
  };

  const handleStartInterview = () => {
    setInterviewStatus('INTERVIEW_STARTING');
    // Prepare for agent initialization
    setTimeout(() => {
      setInterviewStatus('IN_PROGRESS');
    }, 2000);
  };

  return (
    <div className="flex-1 container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
      {/* Left Area: The AI Agent & Executive View */}
      <div className="flex-1 flex flex-col min-w-0">
        <SpecialHRInterviewerAgent 
          isInterviewStarted={interviewStatus === 'IN_PROGRESS' || interviewStatus === 'INTERVIEW_STARTING'} 
          status={interviewStatus}
        />
      </div>

      {/* Right Area: Control Panel */}
      <div className="lg:w-[450px] shrink-0">
        <SpecialHRInterviewPanel 
          status={interviewStatus}
          uploadStatus={uploadStatus}
          fileName={resumeFileName}
          onFileSelect={handleResumeSelect}
          onResetResume={handleResetResume}
          onStart={handleStartInterview}
        />
      </div>
    </div>
  );
}
