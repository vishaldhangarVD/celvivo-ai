'use client';

import React from 'react';

interface CertificateTemplateProps {
  userName: string;
  role: string;
  date: string;
  certId: string;
}

/**
 * @fileOverview High-fidelity Certificate Template for client-side PDF generation.
 * Recreates the Navy & Gold design exactly as envisioned.
 */
export default function CertificateTemplate({ 
  userName, 
  role, 
  date, 
  certId 
}: CertificateTemplateProps) {
  return (
    <div 
      id="certificate-render-node"
      className="relative w-[1180px] h-[728px] bg-gradient-to-br from-[#0c0f1a] via-[#070911] to-[#0a0c16] text-[#f1eee4] p-[30px] overflow-hidden flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ornamental Border */}
      <div className="absolute inset-[16px] border border-[#d8b374]/30 rounded-sm pointer-events-none" />
      <div className="absolute inset-[21px] border border-[#d8b374]/15 rounded-[1px] pointer-events-none" />
      
      {/* Corner Diamonds */}
      <div className="absolute w-[9px] h-[9px] bg-[#d8b374] rotate-45 top-[12.5px] left-[12.5px] opacity-80" />
      <div className="absolute w-[9px] h-[9px] bg-[#d8b374] rotate-45 top-[12.5px] right-[12.5px] opacity-80" />
      <div className="absolute w-[9px] h-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] left-[12.5px] opacity-80" />
      <div className="absolute w-[9px] h-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] right-[12.5px] opacity-80" />

      <div className="relative z-10 h-full flex flex-col justify-between py-[20px] px-[56px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="font-bold text-[16px] tracking-widest text-[#f1eee4]">
              NEXVORO<span className="text-[#d8b374]">AI</span>
            </div>
            <div className="text-[9px] tracking-[2.5px] text-[#8b8a94] uppercase mt-0.5">AI Career Tools</div>
          </div>
          <div className="font-mono text-[10px] tracking-[2.5px] text-[#d8b374] uppercase border border-[#d8b374]/30 px-4 py-1.5 rounded-[1px]">
            Neural Performance Verification
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-col items-center text-center">
          <div className="text-[13px] text-[#8b8a94] italic tracking-tight">This credential certifies that</div>
          <div className="font-serif font-semibold text-[50px] text-[#f0d9a8] tracking-tight mt-3 leading-none" style={{ fontFamily: "'Fraunces', serif" }}>
            {userName}
          </div>
          <div className="w-[120px] h-[1px] bg-gradient-to-r from-transparent via-[#d8b374] to-transparent my-4" />
          <div className="text-[13px] text-[#8b8a94]">has demonstrated mastery in the simulation for</div>
          <div className="font-serif font-semibold text-[26px] text-[#f1eee4] mt-1.5 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            {role} Mastery
          </div>
        </div>

        {/* Footer Details */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-12 w-full">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] tracking-widest text-[#8b8a94] uppercase font-mono">Date of Issue</span>
              <span className="text-[13px] text-[#f1eee4] font-mono">{date}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] tracking-widest text-[#8b8a94] uppercase font-mono">Verification ID</span>
              <span className="text-[13px] text-[#f1eee4] font-mono uppercase">{certId}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] tracking-widest text-[#8b8a94] uppercase font-mono">Verify at</span>
              <span className="text-[13px] text-[#d8b374] font-mono">nexvoro.ai</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4 border-t border-[#d8b374]/15 w-full max-w-[500px]">
            {/* Seal */}
            <div className="seal w-24 text-center shrink-0">
              <div className="w-[86px] h-[86px] mx-auto rounded-full bg-radial-at-tl from-[#2a2210] to-[#0a0c16] border-[2px] border-[#d8b374] flex items-center justify-center relative">
                <div className="absolute inset-[5px] border border-dashed border-[#d8b374]/50 rounded-full" />
                <span className="text-[24px] text-[#d8b374]">★</span>
              </div>
            </div>
            
            {/* Signature Block */}
            <div className="w-[250px] text-center">
              <img src="/certificate-signature.png" alt="Signature" className="h-14 w-auto mx-auto object-contain block" />
              <div className="w-full h-[1px] bg-[#d8b374]/35 mt-2" />
              <div className="text-[13px] font-bold tracking-widest text-[#d8b374] uppercase mt-1.5">Vishal Dhangar</div>
              <div className="text-[9px] tracking-widest text-[#8b8a94] uppercase mt-1 font-mono">Founder & CEO, Nexvoro AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
