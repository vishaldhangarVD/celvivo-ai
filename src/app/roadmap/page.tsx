'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Award, 
  BrainCircuit,
  Rocket,
  ArrowRight,
  Loader2,
  Lock,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  BookOpen,
  Plus,
  RefreshCcw,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLearningRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useToast } from '@/hooks/use-toast';

export default function CareerRoadmap() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTier, setActiveTier] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);

  const roadmapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'roadmaps'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestRoadmaps, loading: roadmapLoading } = useCollection(roadmapQuery);

  const gapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'skill_gap'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestGaps } = useCollection(gapQuery);

  const handleGenerateRoadmap = async () => {
    if (!user || !db) return;
    setIsGenerating(true);

    try {
      const gap = latestGaps?.[0];
      const result = await generateLearningRoadmap({
        role: gap?.role || "Senior IT Engineer",
        experienceLevel: "Senior",
        existingSkills: gap?.existingSkills || [],
        missingSkills: gap?.missingSkills || []
      });

      // Strict sanitization for Firestore write
      const roadmapData = {
        userId: user.uid ?? "",
        role: gap?.role || "Senior IT Engineer",
        plans: {
          thirtyDay: result.plans?.thirtyDay ?? [],
          sixtyDay: result.plans?.sixtyDay ?? [],
          ninetyDay: result.plans?.ninetyDay ?? []
        },
        recommendedProjects: result.recommendedProjects ?? [],
        interviewPrepTasks: result.interviewPrepTasks ?? [],
        createdAt: serverTimestamp()
      };

      // Debug: Detect undefined
      Object.entries(roadmapData).forEach(([key, val]) => {
        if (val === undefined) console.warn(`[Firestore Debug] Field "${key}" is undefined in roadmapData`);
      });

      await addDoc(collection(db, 'users', user.uid, 'roadmaps'), roadmapData);
      
      toast({
        title: "Growth Architecture Generated",
        description: "Your 90-day evolution path has been synchronized.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Protocol Failed",
        description: "Could not generate roadmap. Ensure skill gap analysis is complete.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  const currentRoadmap = latestRoadmaps?.[0];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="text-center">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Personalized Growth Architecture</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Neural Roadmap</h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-4">
              Your dynamically calculated evolution path. Calibrated every session to bridge your professional gaps.
            </p>
          </header>
          {/* ... UI Content Unchanged ... */}
        </div>
      </main>
    </div>
  );
}
