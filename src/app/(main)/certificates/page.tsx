'use client';

import { motion } from 'framer-motion';
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { generateCertificatePDF } from '@/lib/certificate-generator';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';

const MASTERY_THRESHOLD = 85;

type SessionRecord = {
  id: string;
  role: string;
  overallScore?: number;
  createdAt?: { seconds: number };
  stream: 'standard' | 'special';
  round?: string;
  [key: string]: any;
};

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  // Single place that builds certificate data (preview + PDF + verify record)
  const buildCertData = (cert: any) => ({
    userName: fullName,
    role: cert.role,
    score: cert.overallScore || 0,
    date: cert.createdAt?.seconds
      ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB'),
    certId: (cert.id || '').substring(0, 20).toUpperCase(),
  });

  const handleDownload = async (cert: any) => {
    if (!user || !db || !cert || isExporting) return;
    setIsExporting(true);

    try {
      const certData = buildCertData(cert);

      // Public verification record (used by QR code -> /verify/[id])
      const certRef = doc(db, 'certificates', certData.certId);
      const existing = await getDoc(certRef);
      if (!existing.exists()) {
        await setDoc(certRef, { ...certData, uid: user.uid, createdAt: new Date() });
      }

      await generateCertificatePDF(certData);

      toast({ title: "Certificate Downloaded", description: "Your certificate PDF is ready." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Download Error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://celvivoai.com')}`;
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
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">My Certificates</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Career <span className="text-gradient-purple">Credentials.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Verified interview mastery records and your external professional achievements.
              </p>
            </motion.div>
          </header>

          {standardLoading || specialLoading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Loading Interview History...</p>
            </div>
          ) : (
            <div className="space-y-24">
              
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Top AI-Verified Credential</h3>
                  {bestCertified && (
                    <Badge className="bg-green-500/20 text-green-400 border-none font-bold text-[10px] tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                    </Badge>
                  )}
                </div>

                {bestCertified ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="flex flex-col items-center gap-10">
                      <div className="w-full flex justify-center overflow-hidden py-4 h-[270px] sm:h-[440px] md:h-[580px] lg:h-[730px]">
                        <div className="scale-[0.35] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top transform-gpu transition-transform duration-700 shrink-0">
                          <CertificateTemplate {...buildCertData(bestCertified)} />
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
                        <h3 className="text-2xl font-bold tracking-tight text-white">No AI-Verified Certificates Yet</h3>
                        <p className="text-muted-foreground font-light max-md mx-auto text-sm">
                        Score {MASTERY_THRESHOLD}% or higher in an interview simulation to earn an AI-verified credential.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <Link href="/interview/setup">
                          <Button className="btn-premium h-14 px-8 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl">
                            Start Technical Interview <Zap className="ml-2 w-3.5 h-3.5 fill-current" />
                          </Button>
                        </Link>
                        <Link href="/special-hr-resume-upload">
                          <Button variant="outline" className="h-14 px-8 glass border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                            Start HR Interview <Sparkles className="ml-2 w-3.5 h-3.5 text-purple-400" />
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
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{allSessions.length} Sessions Complete</span>
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
                                      <Clock className="w-3 h-3" /> {session.stream === 'special' ? 'Special HR Interview' : session.round || 'Interview'}
                                    </span>
                                 </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Session Index</p>
                                <p className={cn("text-xl font-black tabular-nums", isCertified ? "text-accent" : "text-white/40")}>{session.overallScore || 0}%</p>
                              </div>
                              <Badge className={cn(
                                "px-4 py-1 border-none text-[8px] font-black uppercase tracking-widest",
                                isCertified ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"
                              )}>
                                {isCertified ? "Verified Mastery" : "Protocol Practice"}
                              </Badge>
                              {isCertified ? (
                                <Button 
                                  onClick={() => handleDownload(session)}
                                  disabled={isExporting}
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              ) : (
                                <div className="h-10 w-10" />
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center glass rounded-3xl border-white/5 border-dashed">
                    <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Archive set empty — complete a simulation to initialize history.</p>
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-6 mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em]">Credential Ledger v6.2.0 &middot; {new Date().getFullYear()}</p>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Verified Multi-Round Simulation</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
