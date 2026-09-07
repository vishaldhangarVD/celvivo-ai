'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ShieldCheck, 
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
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { generateCertificatePDF } from '@/lib/certificate-generator';

const MASTERY_THRESHOLD = 70;

type SessionRecord = {
  id: string;
  role: string;
  overallScore?: number;
  createdAt?: { seconds: number };
  stream: 'standard' | 'special';
  round?: string;
  [key: string]: any;
};

const CertificateTemplate = ({ data }: { data: any }) => {
  const logoMark = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgGrad" x1="0" y1="0" x2="40" x2="40">
          <stop offset="0%" stopColor="#7c5cff"/>
          <stop offset="100%" stopColor="#d8b374"/>
        </linearGradient>
      </defs>
      <path d="M6 32 V8 L20 24 V8" stroke="url(#lgGrad)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M26 32 V8" stroke="url(#lgGrad)" strokeWidth="4.2" strokeLinecap="round" fill="none" opacity=".55"/>
      <circle cx="34" cy="7" r="3" fill="#d8b374"/>
    </svg>
  );

  return (
    <div className="certificate-container" style={{ padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cert relative w-[1180px] aspect-[1.62/1] bg-gradient-to-br from-[#0c0f1a] via-[#070911] to-[#0a0c16] rounded-sm shadow-2xl overflow-hidden p-[30px]"
           style={{ fontFamily: "'Inter', sans-serif" }}>
        
        <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 opacity-[0.025] pointer-events-none">
          {Array.from({ length: 35 }).map((_, i) => (
            <span key={i} className="flex items-center justify-center font-serif font-semibold text-[15px] tracking-widest text-[#d8b374] -rotate-[14deg]">N</span>
          ))}
        </div>

        <div className="absolute inset-[16px] border border-[#d8b374]/30 rounded-sm pointer-events-none" />
        <div className="absolute inset-[21px] border border-[#d8b374]/15 rounded-[1px] pointer-events-none" />
        
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 top-[12.5px] left-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 top-[12.5px] right-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] left-[12.5px] opacity-80" />
        <div className="absolute w-[9px] height-[9px] bg-[#d8b374] rotate-45 bottom-[12.5px] right-[12.5px] opacity-80" />

        <div className="inner relative z-10 h-full flex flex-col justify-between py-[20px] px-[56px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#171a2e] to-[#0d0f1c] border border-[#d8b374]/25 flex items-center justify-center shrink-0">
                {logoMark}
              </div>
              <div className="brand-text">
                <div className="font-headline font-bold text-[20px] tracking-widest text-[#f1eee4]">CELVIVO<span className="text-[#d8b374]">AI</span></div>
                <div className="text-[10px] tracking-[2.5px] text-[#8b8a94] uppercase mt-0.5">AI Career Tools</div>
              </div>
            </div>
            <div className="font-mono text-[12px] tracking-[2.5px] text-[#d8b374] uppercase border border-[#d8b374]/30 px-5 py-2 rounded-[1px]">
              Neural Performance Verification
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="text-[15px] text-[#8b8a94] italic tracking-tight">This credential certifies that</div>
            <div className="font-serif font-semibold text-[64px] text-[#f0d9a8] tracking-tight mt-3 leading-none">
              {data.userName}
            </div>
            <div className="w-[140px] h-[1px] bg-gradient-to-r from-transparent via-[#d8b374] to-transparent my-4" />
            <div className="text-[15px] text-[#8b8a94]">has demonstrated mastery in the simulation for</div>
            <div className="font-serif font-semibold text-[32px] text-[#f1eee4] mt-1.5 tracking-tight">
              {data.role} Mastery
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] tracking-widest text-[#8b8a94] uppercase font-mono">Date of Issue</span>
                <span className="text-[15px] text-[#f1eee4] font-mono">{data.date}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] tracking-widest text-[#8b8a94] uppercase font-mono">Verification ID</span>
                <span className="text-[15px] text-[#f1eee4] font-mono uppercase">{data.certId}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] tracking-widest text-[#8b8a94] uppercase font-mono">Verify at</span>
                <span className="text-[15px] text-[#d8b374] font-mono">celvivo.ai</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4 border-t border-[#d8b374]/15 w-full max-w-[560px]">
              <div className="seal w-28 text-center shrink-0">
                <div className="w-[100px] h-[100px] mx-auto rounded-full bg-radial-at-tl from-[#2a2210] to-[#0a0c16] border-[2px] border-[#d8b374] flex items-center justify-center relative">
                  <div className="absolute inset-[5px] border border-dashed border-[#d8b374]/50 rounded-full" />
                  <span className="text-[28px] text-[#d8b374]">★</span>
                </div>
              </div>
              
              <div className="w-[280px] text-center">
                <img src="/certificate-signature.png" alt="Signature" className="h-16 w-auto mx-auto object-contain block" />
                <div className="w-full h-[1px] bg-[#d8b374]/35 mt-2" />
                <div className="text-[15px] font-bold tracking-widest text-[#d8b374] uppercase mt-1.5">Vishal Dhangar</div>
                <div className="text-[10px] tracking-widest text-[#8b8a94] uppercase mt-1 font-mono">Founder & CEO, Celvivo AI</div>
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
  const router = useRouter();

  // Fetch Full Name from Profile
  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  const fullName = useMemo(() => {
    return profile?.displayName || user?.displayName || 'Elite Candidate';
  }, [profile, user]);

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

  const allSessions = useMemo((): SessionRecord[] => {
    const combined: SessionRecord[] = [
      ...(standardData || []).map((s: any) => ({ ...s, stream: 'standard' as const })),
      ...(specialData || []).map((s: any) => ({ ...s, stream: 'special' as const, role: s.role || 'Special HR Interview' }))
    ];
    return combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [standardData, specialData]);

  const bestCertified = useMemo((): SessionRecord | null => {
    const certified = allSessions.filter((s) => (s.overallScore || 0) >= MASTERY_THRESHOLD);
    if (certified.length === 0) return null;
    return [...certified].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0];
  }, [allSessions]);

  const handleDownload = async (cert: any) => {
    if (!user || !cert || isExporting) return;
    setIsExporting(true);
    
    try {
      await generateCertificatePDF({
        userName: fullName,
        role: cert.role,
        score: cert.overallScore,
        date: cert.createdAt?.seconds 
          ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString() 
          : new Date().toLocaleDateString(),
        certId: cert.id?.substring(0, 20).toUpperCase()
      });
      
      toast({ title: "Credential Exported", description: "Your high-fidelity PDF is ready." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://celvivo.ai')}`;
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
      
      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-20">
          
          <header className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 blur-[100px] opacity-50 -z-10 animate-pulse" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Achievement Vault</Badge>
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
                      <div className="w-full flex justify-center overflow-visible py-10 min-h-[300px] sm:min-h-[500px] md:min-h-[728px]">
                        <div className="scale-[0.35] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top transform-gpu transition-transform duration-700">
                          <CertificateTemplate data={{
                            userName: fullName,
                            role: bestCertified.role,
                            date: bestCertified.createdAt?.seconds 
                              ? new Date(bestCertified.createdAt.seconds * 1000).toLocaleDateString() 
                              : new Date().toLocaleDateString(),
                            certId: bestCertified.id?.substring(0, 20).toUpperCase() || 'NEX-PROTO-IDENTITY-X'
                          }} />
                        </div>
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
                    <div className="py-24 text-center glass rounded-[3rem] border-white/5 border-dashed bg-white/[0.01] max-w-5xl mx-auto space-y-8 shadow-[0_0_50px_rgba(255,255,255,0.01)]">
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

              <section className="space-y-10">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                     <History className="w-6 h-6 text-accent" /> Intelligence Archive
                   </h3>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{allSessions.length} Nodes Captured</span>
                </div>
                
                {allSessions.length > 0 ? (
                  <div className="grid gap-4">
                    {allSessions.map((session: any, i: number) => {
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
                              <Button 
                                onClick={() => handleDownload(session)}
                                size="icon" 
                                variant="ghost" 
                                className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
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
