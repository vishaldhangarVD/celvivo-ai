
'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Trophy,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useMemo } from 'react';

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      where('overallScore', '>=', 70),
      orderBy('overallScore', 'desc')
    );
  }, [db, user?.uid]);
  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="text-center">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Credential Vault</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Certificates</h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-4">
              Verified performance credentials for elite technical sessions exceeding 70% accuracy.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviewsLoading ? (
              <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>
            ) : interviews && interviews.length > 0 ? (
              interviews.map((cert: any, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-8 relative">
                      <Award className="w-10 h-10 text-accent" />
                      <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{cert.role} Mastery</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-6">Verified: {cert.createdAt?.seconds ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    
                    <div className="w-full p-4 glass rounded-2xl border-white/5 mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Efficiency Rating</span>
                        <span className="text-lg font-bold text-accent">{cert.overallScore}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${cert.overallScore}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full relative z-10">
                      <Button className="flex-1 h-12 rounded-xl bg-white text-[#050816] font-bold hover:bg-white/90">
                        <Download className="w-4 h-4 mr-2" /> PDF
                      </Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl glass border-white/10">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
                <Trophy className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">No Credentials Found</h3>
                <p className="text-muted-foreground font-light max-w-sm mx-auto">
                  Achieve an Efficiency Rating of 70% or higher in any arena simulation to unlock a verified mastery certificate.
                </p>
                <Link href="/interview" className="mt-8 block">
                  <Button className="btn-premium h-14 px-8 uppercase tracking-widest text-xs font-bold">Initialize Session</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
