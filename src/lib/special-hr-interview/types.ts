export type SpecialHRInterviewStatus = 
  | 'AWAITING_RESUME'
  | 'READY'
  | 'INTERVIEW_STARTING'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type SpecialHRUploadStatus = 
  | 'IDLE'
  | 'UPLOADING'
  | 'SUCCESS'
  | 'ERROR';

export interface SpecialHRInterviewSession {
  id: string;
  status: SpecialHRInterviewStatus;
  resumeFileName?: string;
  resumeFile?: File;
  photoUrl?: string;
  position: string;
  experienceLevel: string;
  isAgentReady: boolean;
}
