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
        "relative group glass rounded-2xl border-dashed border-2 p-6 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center",
        status === 'IDLE' ? "border-white/10 hover:border-accent/40 hover:bg-white/[0.02]" : "border-accent/20 bg-accent/[0.01] cursor-default"
      )}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleChange} />
      
      {status === 'IDLE' && (
        <>
          <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-accent/20">
            <Upload className="w-6 h-6 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white/90">Select Blueprint</p>
            <p className="text-[9px] uppercase tracking-widest text-white/30">PDF or DOCX</p>
          </div>
        </>
      )}

      {status === 'UPLOADING' && (
        <div className="space-y-4 py-2">
          <div className="relative mx-auto w-10 h-10">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">Syncing Nodes...</p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="space-y-4 animate-in fade-in zoom-in duration-500 w-full py-2">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-green-400/60 tracking-[0.2em]">Verified</p>
            <p className="text-xs font-bold text-white/90 truncate max-w-[200px] mx-auto flex items-center justify-center gap-2">
              {fileName}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all mx-auto pt-1"
          >
            <RotateCcw className="w-3 h-3" /> RE-UPLOAD
          </button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="space-y-2 py-2 text-red-400">
           <p className="text-xs font-bold uppercase tracking-widest">Fault</p>
           <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="text-[8px] underline uppercase font-black">Retry</button>
        </div>
      )}
    </div>
  );
}
