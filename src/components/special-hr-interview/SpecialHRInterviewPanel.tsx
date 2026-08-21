'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Briefcase, 
  GraduationCap, 
  Activity, 
  Target,
  FileSearch,
  ShieldCheck
} from 'lucide-react';
import SpecialHRResumeUpload from './SpecialHRResumeUpload';
import { SpecialHRInterviewStatus, SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRInterviewPanelProps {
  status: SpecialHRInterviewStatus;
  uploadStatus: SpecialHRUploadStatus;
  fileName?: string;
  onFileSelect: (file: File) => void;
  onResetResume: () => void;
}

/**
 * @fileOverview SpecialHRInterviewPanel - The right-side identity and resume control hub.
 */

export default function SpecialHRInterviewPanel({ 
  status, 
  uploadStatus, 
  fileName, 
  onFileSelect, 
  onResetResume
}: SpecialHRInterviewPanelProps) {
  return (
    <Card className="premium-card bg-white/[0.01] border-white/5 p-6 h-full flex flex-col gap-6 relative overflow-hidden">
      
      {/* Subtle Side Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
        <FileSearch className="w-32 h-32 text-white" />
      </div>

      <div className="space-y-1 relative z-10">
        <Badge className="bg-accent/20 text-accent border-none px-3 py-0.5 text-[8px] tracking-widest font-black uppercase mb-2">Identity Context</Badge>
        <h2 className="text-xl font-bold tracking-tighter text-premium">Dossier Calibration</h2>
        <p className="text-[10px] text-white/40 font-light">Verify professional nodes.</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 relative z-10 min-h-0">
        
        {/* Role Metadata */}
        <div className="space-y-2">
           {[
             { icon: Target, label: "Deployment Track", value: "Senior Executive HR" },
             { icon: GraduationCap, label: "Seniority Grade", value: "Expert Tier" },
             { icon: Activity, label: "Protocol State", value: status.replace('_', ' ') }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl border-white/5 bg-white/[0.01]">
               <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                 <item.icon className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[7px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
                 <p className="text-[11px] font-bold text-white/80">{item.value}</p>
               </div>
             </div>
           ))}
        </div>

        {/* Dedicated Resume Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Executive Blueprint</span>
            {uploadStatus === 'SUCCESS' && <ShieldCheck className="w-3 h-3 text-green-400" />}
          </div>
          <SpecialHRResumeUpload 
            onFileSelect={onFileSelect} 
            status={uploadStatus} 
            fileName={fileName} 
            onReset={onResetResume} 
          />
        </div>
      </div>

      {/* Legal/System Note */}
      <div className="p-3 glass rounded-xl border-white/5 bg-white/[0.01] relative z-10 shrink-0">
        <p className="text-[8px] font-medium text-white/20 leading-relaxed uppercase tracking-widest italic">
          "Processing occurs in restricted sandbox."
        </p>
      </div>
    </Card>
  );
}
