"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Loader2, 
  Star, 
  ShieldAlert,
  MessageSquare,
  Filter,
  User,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const feedbackQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'userFeedback'),
      where('status', '==', filter),
      orderBy('createdAt', 'desc')
    );
  }, [db, filter]);

  const { data: feedbacks, loading: feedbacksLoading } = useCollection(feedbackQuery);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!profileLoading && profile && profile.role !== 'founder') router.push('/dashboard');
  }, [user, authLoading, profile, profileLoading, router]);

  const updateStatus = async (id: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'userFeedback', id), { status });
      toast({ title: "Node Updated", description: `Feedback status changed to ${status}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Write Error", description: "Failed to update feedback status." });
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'userFeedback', id));
      toast({ title: "Node Purged", description: "Feedback removed from archives." });
    } catch (e) {
      toast({ variant: "destructive", title: "Write Error", description: "Failed to delete feedback." });
    }
  };

  if (authLoading || profileLoading || (user && profile?.role !== 'founder')) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Restricted: Founder Intel</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Feedback <span className="text-gradient-purple">Moderation.</span></h1>
              <p className="text-muted-foreground font-light max-w-xl">Review and authorize community feedback for public deployment.</p>
            </div>

            <div className="flex p-1 glass rounded-2xl border-white/5 gap-2">
              {(['pending', 'approved', 'rejected'] as const).map(f => (
                <Button
                  key={f}
                  onClick={() => setFilter(f)}
                  variant="ghost"
                  className={cn(
                    "h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter === f ? "bg-accent/20 text-accent" : "text-white/20 hover:text-white"
                  )}
                >
                  {f}
                </Button>
              ))}
            </div>
          </header>

          {feedbacksLoading ? (
            <div className="py-32 flex justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>
          ) : feedbacks && feedbacks.length > 0 ? (
            <div className="grid gap-6">
              {feedbacks.map((f: any) => (
                <motion.div layout key={f.id}>
                  <Card className="glass p-8 rounded-[2rem] border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-3.5 h-3.5", i < f.rating ? "fill-current" : "opacity-20")} />
                              ))}
                            </div>
                            <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] uppercase">{f.status}</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white/90 leading-tight">"{f.feedback}"</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Author</p>
                           <p className="text-xs font-bold text-white/70 flex items-center gap-2"><User className="w-3 h-3" /> {f.name}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Role</p>
                           <p className="text-xs font-bold text-accent">{f.role}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Target Org</p>
                           <p className="text-xs font-bold text-white/70">{f.company || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Date</p>
                           <p className="text-xs font-bold text-white/70 flex items-center gap-2"><Clock className="w-3 h-3" /> {f.createdAt?.seconds ? new Date(f.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 shrink-0">
                      {f.status !== 'approved' && (
                        <Button 
                          onClick={() => updateStatus(f.id, 'approved')}
                          className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </Button>
                      )}
                      {f.status !== 'rejected' && (
                        <Button 
                          onClick={() => updateStatus(f.id, 'rejected')}
                          className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/20"
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      )}
                      <Button 
                        onClick={() => deleteFeedback(f.id)}
                        className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
              <MessageSquare className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No Intel in Archive</h3>
              <p className="text-muted-foreground font-light max-w-sm mx-auto">
                The moderation pipeline is currently clear of any pending community feedback nodes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}