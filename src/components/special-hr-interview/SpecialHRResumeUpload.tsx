'use client';

import React, { useRef } from 'react';
import { Upload, CheckCircle2, RotateCcw, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRResumeUploadProps {
  onFileSelect: (file: File) => void;
  status: SpecialHRUploadStatus;
  fileName?: string;
  onReset: () => void;
}

/**
 * @fileOverview SpecialHRResumeUpload - Minimalist, professional blueprint registration.
 */

export default function SpecialHRResumeUpload({ onFileSelect, status, fileName, onReset }: SpecialHRResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      onClick={() => status === 'IDLE' && fileInputRef.current?.click()}
      className={cn(
        "relative group glass rounded-[2.5rem] border-dashed border-2 p-10 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center",
        status === 'IDLE' ? "border-white/10 hover:border-accent/40 hover:bg-white/[0.02]" : "border-accent/20 bg-accent/[0.01] cursor-default"
      )}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleChange} />
      
      {status === 'IDLE' && (
        <>
          <div className="w-16 h-16 rounded-[1.5rem] bg-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-accent/20">
            <Upload className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white/90">Select Professional Blueprint</p>
            <p className="text-[10px] uppercase tracking-widest text-white/30">PDF or DOCX • Max 10MB</p>
          </div>
        </>
      )}

      {status === 'UPLOADING' && (
        <div className="space-y-6 py-6">
          <div className="relative mx-auto w-12 h-12">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Syncing Knowledge Nodes...</p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 w-full">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-green-400/60 tracking-[0.3em]">Blueprint Verified</p>
            <p className="text-sm font-bold text-white/90 truncate max-w-[280px] mx-auto flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-white/30" /> {fileName}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all mx-auto pt-2 hover:translate-y-[-1px]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RE-UPLOAD NODE
          </button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="space-y-4 py-4 text-red-400">
           <p className="text-xs font-bold">Registration Fault</p>
           <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="text-[10px] underline">Retry</button>
        </div>
      )}
    </div>
  );
}
