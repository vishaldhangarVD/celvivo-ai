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
 * Designed to fit within the 100vh constraint with an expensive, professional aesthetic.
 */

export default function SpecialHRInterviewPanel({ 
  status, 
  uploadStatus, 
  fileName, 
  onFileSelect, 
  onResetResume
}: SpecialHRInterviewPanelProps) {
  return (
    <Card className="premium-card bg-white/[0.01] border-white/5 p-8 h-full flex flex-col gap-8 relative overflow-hidden">
      
      {/* Subtle Side Accent */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
        <FileSearch className="w-48 h-48 text-white" />
      </div>

      <div className="space-y-2 relative z-10">
        <Badge className="bg-accent/20 text-accent border-none px-3 py-0.5 text-[9px] tracking-widest font-black uppercase mb-3">Identity Context</Badge>
        <h2 className="text-2xl font-bold tracking-tighter text-premium">Dossier Calibration</h2>
        <p className="text-xs text-white/40 font-light">Verify your professional nodes before initializing.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        
        {/* Role Metadata */}
        <div className="space-y-3">
           {[
             { icon: Target, label: "Deployment Track", value: "Senior Executive HR" },
             { icon: GraduationCap, label: "Seniority Grade", value: "Expert Tier" },
             { icon: Activity, label: "Protocol State", value: status.replace('_', ' ') }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
               <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                 <item.icon className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{item.label}</p>
                 <p className="text-xs font-bold text-white/80">{item.value}</p>
               </div>
             </div>
           ))}
        </div>

        {/* Dedicated Resume Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Executive Blueprint</span>
            {uploadStatus === 'SUCCESS' && <ShieldCheck className="w-4 h-4 text-green-400" />}
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
      <div className="p-4 glass rounded-2xl border-white/5 bg-white/[0.01] relative z-10">
        <p className="text-[9px] font-medium text-white/30 leading-relaxed uppercase tracking-widest italic">
          "Neural processing of uploaded blueprints occurs within a restricted sandbox for elite privacy."
        </p>
      </div>
    </Card>
  );
}
