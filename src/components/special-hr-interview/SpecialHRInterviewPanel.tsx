'use child';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ShieldCheck, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  Activity, 
  Target,
  Rocket
} from 'lucide-react';
import SpecialHRResumeUpload from './SpecialHRResumeUpload';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRInterviewPanelProps {
  status: SpecialHRInterviewStatus;
  uploadStatus: SpecialHRUploadStatus;
  fileName?: string;
  onFileSelect: (file: File) => void;
  onResetResume: () => void;
  onStart: () => void;
}

export default function SpecialHRInterviewPanel({ 
  status, 
  uploadStatus, 
  fileName, 
  onFileSelect, 
  onResetResume, 
  onStart 
}: SpecialHRInterviewPanelProps) {
  const isStartDisabled = uploadStatus !== 'SUCCESS' || status !== 'READY';

  return (
    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 h-full flex flex-col justify-between relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
        <Briefcase className="w-32 h-32 text-white" />
      </div>

      <div className="space-y-12 relative z-10">
        <header className="space-y-4">
          <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Executive Track v1.0</Badge>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter text-premium">Interview Panel</h2>
            <p className="text-xs text-white/40 font-light">Calibrate your professional identity for the session.</p>
          </div>
        </header>

        <div className="space-y-8">
          {/* Metadata Section */}
          <div className="space-y-4">
             {[
               { icon: Target, label: "Deployment", value: "Senior Executive HR" },
               { icon: GraduationCap, label: "Seniority", value: "Expert Tier" },
               { icon: Activity, label: "Session State", value: status.replace('_', ' ') }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-4 p-5 glass rounded-2xl border-white/5">
                 <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                   <item.icon className="w-5 h-5" />
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">{item.label}</p>
                   <p className="text-sm font-bold text-white/90">{item.value}</p>
                 </div>
               </div>
             ))}
          </div>

          <SpecialHRResumeUpload 
            onFileSelect={onFileSelect} 
            status={uploadStatus} 
            fileName={fileName} 
            onReset={onResetResume} 
          />
        </div>
      </div>

      <div className="pt-12 space-y-6 relative z-10">
        <div className="p-4 glass rounded-2xl border-purple-500/20 bg-purple-500/[0.02] flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-[9px] font-medium text-white/40 leading-relaxed uppercase tracking-wider">
            By initializing this session, you grant authorization for neural blueprint processing within the executive secure sandbox.
          </p>
        </div>

        <Button 
          onClick={onStart}
          disabled={isStartDisabled}
          className="w-full h-20 btn-premium rounded-[2rem] text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(147,51,234,0.3)] group transition-all"
        >
          {status === 'INTERVIEW_STARTING' ? 'Initializing...' : (
            <>Start HR Interview <Rocket className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" /></>
          )}
        </Button>
      </div>
    </Card>
  );
}
