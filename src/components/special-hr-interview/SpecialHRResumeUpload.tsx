'use client';

import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SpecialHRUploadStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRResumeUploadProps {
  onFileSelect: (file: File) => void;
  status: SpecialHRUploadStatus;
  fileName?: string;
  onReset: () => void;
}

export default function SpecialHRResumeUpload({ onFileSelect, status, fileName, onReset }: SpecialHRResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Executive Blueprint</label>
      
      <div 
        onClick={() => status === 'IDLE' && fileInputRef.current?.click()}
        className={cn(
          "relative group glass rounded-[2rem] border-dashed border-2 p-8 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center",
          status === 'IDLE' ? "border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02]" : "border-purple-500/20 bg-purple-500/[0.02] cursor-default"
        )}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleChange} />
        
        {status === 'IDLE' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm font-bold text-white/80">Select Career Blueprint</p>
            <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">PDF or DOCX required</p>
          </>
        )}

        {status === 'UPLOADING' && (
          <div className="space-y-4 py-4">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse">Syncing Knowledge Nodes...</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-green-400 tracking-widest">Blueprint Verified</p>
              <p className="text-xs font-bold text-white/90 truncate max-w-[200px] mx-auto">{fileName}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors mx-auto mt-2"
            >
              <RotateCcw className="w-3 h-3" /> Replace Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
