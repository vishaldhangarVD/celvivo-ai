
'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Trophy,
  History,
  Activity,
  Calendar,
  Clock,
  Award,
  Zap,
  Linkedin,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * @fileOverview Nexvoro AI Achievement Vault.
 * Unified result tracking for Standard Arena and Special HR sessions.
 * Implements the high-fidelity Navy & Gold certificate design.
 */

const MASTERY_THRESHOLD = 70;

// Reusable Certificate Template Component
const CertificateTemplate = ({ data }: { data: any }) => {
  const logoMark = (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#7c5cff"/>
          <stop offset="100%" stopColor="#d8b374"/>
        </linearGradient>
      </defs>
      <path d="M6 32 V8 L20 24 V8" stroke="url(#lgGrad)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M26 32 V8" stroke="url(#lgGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" opacity=".55"/>
      <circle cx="34" cy="7" r="3" fill="#d8b374"/>
    </svg>
  );

  const signatureBase64 = "data:image/png;base64,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 ...";

  return (
    <div className="certificate-container" style={{ padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div id="capture-cert" className="cert relative w-[1100px] aspect-[1.7/1] bg-gradient-to-br from-[#0c0f1a] via-[#070911] to-[#0a0c16] rounded-sm shadow-2xl overflow-hidden p-[30px]"
           style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Watermark Grid */}
        <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 opacity-[0.025] pointer-events-none">
          {Array.from({ length: 35 }).map((_, i) => (
            <span key={i} className="flex items-center justify-center font-serif font-semibold text-[15px] tracking-widest text-[#d8b374] -rotate-[14deg]">N</span>
          ))}
        </div>

        {/* Ornamental Border */}
        <div className="absolute inset-[16px] border border-[#d8b374]/30 rounded-sm pointer-events-none" />
        <div className="absolute inset-[21px] border border-[#d8b374]/15 rounded-[1px] pointer-events-none" />
        
        {/* Corner Diamonds */}
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 top-[12.5px] left-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 top-[12.5px] right-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] left-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] right-[12.5px] opacity-80" />

        <div className="inner relative z-10 h-full flex flex-col justify-between py-[20px] px-[56px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#171a2e] to-[#0d0f1c] border border-[#d8b374]/25 flex items-center justify-center shrink-0">
                {logoMark}
              </div>
              <div className="brand-text">
                <div className="font-headline font-bold text-[13px] tracking-widest text-[#f1eee4]">NEXVORO<span className="text-[#d8b374]">AI</span></div>
                <div className="text-[7.5px] tracking-[2.5px] text-[#8b8a94] uppercase mt-0.5">AI Career Tools</div>
              </div>
            </div>
            <div className="font-mono text-[8.5px] tracking-[2.5px] text-[#d8b374] uppercase border border-[#d8b374]/30 px-4 py-1.5 rounded-[1px]">
              Neural Performance Verification
            </div>
          </div>

          {/* Body Content */}
          <div className="flex flex-col items-center text-center">
            <div className="text-[11px] text-[#8b8a94] italic tracking-tight">This credential certifies that</div>
            <div className="font-serif font-semibold text-[38px] text-[#f0d9a8] tracking-tight mt-3 leading-none">
              {data.userName}
            </div>
            <div className="w-[120px] h-[1px] bg-gradient-to-r from-transparent via-[#d8b374] to-transparent my-4" />
            <div className="text-[11px] text-[#8b8a94]">has demonstrated mastery in the simulation for</div>
            <div className="font-serif font-semibold text-[21px] text-[#f1eee4] mt-1.5 tracking-tight">
              {data.role} Mastery
            </div>
          </div>

          {/* Footer Group */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[7.5px] tracking-widest text-[#8b8a94] uppercase font-mono">Date of Issue</span>
                <span className="text-[10.5px] text-[#f1eee4] font-mono">{data.date}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[7.5px] tracking-widest text-[#8b8a94] uppercase font-mono">Verification ID</span>
                <span className="text-[10.5px] text-[#f1eee4] font-mono uppercase">{data.certId}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[7.5px] tracking-widest text-[#8b8a94] uppercase font-mono">Verify at</span>
                <span className="text-[10.5px] text-[#d8b374] font-mono">nexvoro.ai</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4 border-t border-[#d8b374]/15 w-full max-w-[500px]">
              {/* Seal */}
              <div className="seal w-24 text-center shrink-0">
                <div className="w-[70px] h-[70px] mx-auto rounded-full bg-radial-at-tl from-[#2a2210] to-[#0a0c16] border-[1.5px] border-[#d8b374] flex items-center justify-center relative">
                  <div className="absolute inset-[5px] border border-dashed border-[#d8b374]/50 rounded-full" />
                  <span className="text-[19px] text-[#d8b374]">★</span>
                </div>
                <div className="flex justify-center -mt-1">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[15px] border-t-[#8a7146] mr-[-2px]" />
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[15px] border-t-[#8a7146]" />
                </div>
              </div>
              
              {/* Signature Block */}
              <div className="w-[210px] text-center">
                <img src={signatureBase64} alt="Signature" className="h-11 w-auto mx-auto object-contain block" />
                <div className="w-full h-[1px] bg-[#d8b374]/35 mt-2" />
                <div className="text-[7.5px] tracking-widest text-[#8b8a94] uppercase mt-1.5 font-mono">Founder & CEO, Nexvoro AI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Unified data sources
  const standardInterviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const specialHRQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'specialHRInterviews'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: standardData, loading: standardLoading } = useCollection(standardInterviewsQuery);
  const { data: specialData, loading: specialLoading } = useCollection(specialHRQuery);

  const allSessions = useMemo(() => {
    const combined = [
      ...(standardData || []).map(s => ({ ...s, stream: 'standard' })),
      ...(specialData || []).map(s => ({ ...s, stream: 'special', role: s.role || 'Special HR Interview' }))
    ];
    return combined.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [standardData, specialData]);

  const bestCertified = useMemo(() => {
    const certified = allSessions.filter((s: any) => (s.overallScore || 0) >= MASTERY_THRESHOLD);
    if (certified.length === 0) return null;
    return [...certified].sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0))[0];
  }, [allSessions]);

  const handleDownload = async (cert: any) => {
    if (!user || !cert || isExporting) return;
    setIsExporting(true);
    
    try {
      const element = document.getElementById('capture-cert');
      if (!element) throw new Error("Capture element not found.");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#05070d',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Nexvoro_Mastery_${cert.id?.substring(0, 8)}.pdf`);
      
      toast({ title: "Credential Exported", description: "Your high-fidelity PDF is ready." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://nexvoro.ai')}`;
    window.open(url, '_blank');
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-20">
          
          <header className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 blur-[100px] opacity-50 -z-10 animate-pulse" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Achievement Vault</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Career <span className="text-gradient-purple">Credentials.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Verified interview mastery records, issued directly from high-fidelity simulations.
              </p>
            </motion.div>
          </header>

          {standardLoading || specialLoading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Syncing Intelligence Nodes...</p>
            </div>
          ) : (
            <div className="space-y-24">
              
              {/* PRIMARY VERIFIED CREDENTIAL OR EMPTY STATE */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Verified Mastery Node</h3>
                  {bestCertified && (
                    <Badge className="bg-green-500/20 text-green-400 border-none font-bold text-[10px] tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTICATED
                    </Badge>
                  )}
                </div>

                {bestCertified ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="flex flex-col items-center gap-10">
                      <div className="scale-75 md:scale-100 origin-top">
                        <CertificateTemplate data={{
                          userName: user?.displayName || 'Elite Candidate',
                          role: bestCertified.role,
                          date: bestCertified.createdAt?.seconds 
                            ? new Date(bestCertified.createdAt.seconds * 1000).toLocaleDateString() 
                            : new Date().toLocaleDateString(),
                          certId: bestCertified.id?.substring(0, 20).toUpperCase() || 'NEX-PROTO-IDENTITY-X'
                        }} />
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-4">
                        <Button onClick={() => handleDownload(bestCertified)} disabled={isExporting} className="h-16 px-12 btn-premium text-[10px] font-black uppercase tracking-widest shadow-2xl group">
                          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5 mr-3 transition-transform group-hover:-translate-y-1" /> Download Master PDF</>}
                        </Button>
                        <Button onClick={() => handleShareToLinkedIn(bestCertified)} variant="outline" className="h-16 px-8 glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 flex gap-3">
                          <Linkedin className="w-5 h-5 text-[#0077b5]" /> Add to LinkedIn
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="py-24 text-center glass rounded-[3rem] border-white/5 border-dashed bg-white/[0.01] max-w-4xl mx-auto space-y-8 shadow-[0_0_50px_rgba(255,255,255,0.01)]">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto relative overflow-hidden group">
                        <Trophy className="w-10 h-10 text-white/10 group-hover:text-accent/40 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight text-white">No Certificates Yet</h3>
                        <p className="text-muted-foreground font-light max-w-md mx-auto text-sm">
                          Score 70% or higher in any interview round to earn a verified certificate.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <Link href="/interview/setup">
                          <Button className="btn-premium h-14 px-8 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl">
                            Technical Track <Zap className="ml-2 w-3.5 h-3.5 fill-current" />
                          </Button>
                        </Link>
                        <Link href="/special-hr-resume-upload">
                          <Button variant="outline" className="h-14 px-8 glass border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                            Special HR Arena <Sparkles className="ml-2 w-3.5 h-3.5 text-purple-400" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* RECENT SESSION HISTORY */}
              <section className="space-y-10">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                     <History className="w-6 h-6 text-accent" /> Intelligence Archive
                   </h3>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{allSessions.length} Nodes Captured</span>
                </div>
                
                {allSessions.length > 0 ? (
                  <div className="grid gap-4">
                    {allSessions.map((session: any, i) => {
                      const isCertified = (session.overallScore || 0) >= MASTERY_THRESHOLD;
                      return (
                        <motion.div key={session.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i % 10) * 0.05 }}>
                          <Card className="glass px-8 py-6 rounded-2xl border-white/5 hover:border-accent/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                            <div className="flex items-center gap-8 w-full md:w-auto">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                                isCertified ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/30"
                              )}>
                                {isCertified ? <Award className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                              </div>
                              <div className="text-left">
                                 <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors">{session.role}</h4>
                                 <div className="flex gap-4 items-center mt-1">
                                    <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-2">
                                      <Calendar className="w-3 h-3" /> {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-2">
                                      <Clock className="w-3 h-3" /> {session.stream === 'special' ? 'D-ID Arena' : session.round || 'Arena'}
                                    </span>
                                 </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Score Index</p>
                                <p className={cn("text-xl font-black tabular-nums", isCertified ? "text-accent" : "text-white/40")}>{session.overallScore || 0}%</p>
                              </div>
                              <Badge className={cn(
                                "px-4 py-1 border-none text-[8px] font-black uppercase tracking-widest",
                                isCertified ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"
                              )}>
                                {isCertified ? "Certified" : "Practice Attempt"}
                              </Badge>
                              <Link href={session.stream === 'special' ? `/special-hr-interview-result` : `/feedback/${session.id}`}>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-3xl border-white/5 border-dashed">
                    <p className="text-sm text-white/20 font-bold uppercase tracking-widest">No interview sessions yet — complete a round to see your history.</p>
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-6 mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em]">Vault Engine v5.3.0 &middot; {new Date().getFullYear()}</p>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Authenticated Nodes</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

