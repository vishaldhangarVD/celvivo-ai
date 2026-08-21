'use client';

import React, { useRef } from 'react';
import { Upload, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRResumeUploadProps {
  onFileSelect: (file: File) => void;
  status: SpecialHRUploadStatus;
  fileName?: string;
  onReset: () => void;
}

/**
 * @fileOverview SpecialHRResumeUpload - Compact, professional blueprint registration.
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
        "relative group glass rounded-[2rem] border-dashed border-2 p-8 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center",
        status === 'IDLE' ? "border-white/10 hover:border-accent/40 hover:bg-white/[0.02]" : "border-accent/20 bg-accent/[0.02] cursor-default"
      )}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleChange} />
      
      {status === 'IDLE' && (
        <>
          <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white/90">UPLOAD RESUME</p>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-black">PDF / DOCX</p>
            <p className="text-[10px] text-accent mt-4 font-bold uppercase tracking-widest group-hover:underline">Choose Resume</p>
          </div>
        </>
      )}

      {status === 'UPLOADING' && (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">Synchronizing Blueprint...</p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="space-y-4 animate-in fade-in zoom-in duration-500 w-full">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-green-400/60 tracking-widest">Blueprint Verified</p>
            <p className="text-xs font-bold text-white/90 truncate max-w-[200px] mx-auto">{fileName}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all mx-auto pt-4"
          >
            <RotateCcw className="w-3 h-3" /> Change File
          </button>
        </div>
      )}
    </div>
  );
}
