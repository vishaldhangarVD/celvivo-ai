"use client";

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';
import { Loader2, Database, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';

export default function SeedRepositoryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!db) return;
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, 'codingQuestions');

      MASTER_QUESTIONS.forEach((q) => {
        const docRef = doc(collectionRef, q.id);
        batch.set(docRef, q);
      });

      await batch.commit();
      
      setSeedResult(`SUCCESS: Successfully synchronized ${MASTER_QUESTIONS.length} intelligence nodes with Firestore.`);
      toast({ title: "Repository Synced", description: "All elite coding challenges are now live." });
    } catch (e: any) {
      console.error(e);
      setSeedResult(`FAILURE: Neural link interrupted. ${e.message}`);
      toast({ variant: "destructive", title: "Sync Fault", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <main className="container mx-auto px-6 pt-40 flex flex-col items-center justify-center">
        <Card className="premium-card max-w-2xl w-full p-12 bg-white/[0.01] border-white/5 space-y-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-[2.5rem] bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <Database className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">Repository Seeding Node</h1>
            <p className="text-muted-foreground font-light text-sm uppercase tracking-[0.3em]">Initialize Global Question Matrix</p>
          </div>

          <div className="p-8 glass rounded-2xl border-white/5 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/40">
               <span>Total Nodes Found</span>
               <span className="text-accent">{MASTER_QUESTIONS.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {["Easy", "Medium", "Hard"].map(diff => (
                 <div key={diff} className="p-4 glass rounded-xl text-center space-y-1">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{diff}</p>
                   <p className="text-lg font-bold">10</p>
                 </div>
               ))}
            </div>
          </div>

          {seedResult && (
            <div className={`p-6 rounded-2xl flex gap-4 items-start ${seedResult.includes('SUCCESS') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {seedResult.includes('SUCCESS') ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{seedResult}</p>
            </div>
          )}

          <Button 
            onClick={handleSeed} 
            disabled={isSeeding} 
            className="w-full h-20 btn-premium text-sm font-black tracking-[0.3em] uppercase shadow-[0_20px_60px_rgba(34,211,238,0.2)]"
          >
            {isSeeding ? <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Synchronizing...</> : "Commit To Cloud Matrix"}
          </Button>
        </Card>
      </main>
    </div>
  );
}
