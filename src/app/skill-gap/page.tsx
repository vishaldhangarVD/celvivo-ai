'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  BrainCircuit, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Loader2,
  Activity,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { analyzeSkillGap, type SkillGapOutput } from '@/ai/flows/ai-skill-gap-analysis';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Java Developer",
  "Python Developer", "Data Analyst", "Data Scientist", "DevOps Engineer",
  "Cloud Engineer", "Cybersecurity Analyst", "QA Engineer", "UI/UX Designer", "Product Manager"
];

export default function SkillGapPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapOutput | null>(null);

  // Fetch the latest resume to extract skills
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestResumes } = useCollection(resumeQuery);

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStartAnalysis = async (role: string) => {
    if (!user || !db) return;
    
    setSelectedRole(role);
    setIsAnalyzing(true);

    try {
      const userSkills = latestResumes?.[0]?.analysis?.skillAnalysis?.map((s: any) => s.skill) || [];
      
      const result = await analyzeSkillGap({
        targetRole: role,
        userSkills
      });

      setAnalysis(result);

      // Save to Firestore
      const gapRef = collection(db, 'users', user.uid, 'skill_gap');
      const analysisData = {
        userId: user.uid,
        ...result,
        createdAt: serverTimestamp(),
      };

      await addDoc(gapRef, analysisData);

      toast({
        title: "Analysis Synchronized",
        description: `Neural gap report for ${role} is now active.`,
      });

    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "System failed to calibrate skill vectors.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = useMemo(() => {
    if (!analysis) return [];
    return [
      { name: 'Existing', value: analysis.existingSkills.length, color: '#22d3ee' },
      { name: 'Missing', value: analysis.missingSkills.length, color: '#f87171' }
    ];
  }, [analysis]);

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40">
        <header className="max-w-4xl mx-auto text-center mb-24">
          <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Skill Audit</Badge>
          <h1 className="text-6xl font-bold tracking-tighter text-premium">Skill Gap <span className="text-gradient-purple">Analysis.</span></h1>
          <p className="text-xl text-muted-foreground font-light mt-4">Benchmark your technical vectors against elite hiring tracks.</p>
        </header>

        {!analysis ? (
          <div className="max-w-3xl mx-auto space-y-12">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
              <div className="space-y-8">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input 
                    placeholder="Search industry tracks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-18 pl-16 rounded-2xl glass border-white/10 bg-transparent focus:outline-none focus:border-accent transition-all text-lg font-light text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleStartAnalysis(role)}
                      disabled={isAnalyzing}
                      className="h-16 rounded-2xl border border-white/5 glass hover:bg-white/5 transition-all text-left px-8 font-bold text-xs uppercase tracking-widest flex items-center justify-between group"
                    >
                      {role}
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {isAnalyzing && (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                  <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Extracting Knowledge Nodes...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.02] border-white/5 p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12">
                  <div className="text-7xl font-bold text-gradient-purple">{analysis.skillMatchPercentage}%</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold text-right mt-2">Skill Vector Match</div>
                </div>

                <div className="space-y-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                      <Target className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight">{analysis.role}</h2>
                      <p className="text-muted-foreground font-light uppercase tracking-widest text-xs mt-1">Neural Compatibility Report</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-green-400">
                        <CheckCircle2 className="w-6 h-6" /> Existing Vectors
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {analysis.existingSkills.map((s, i) => (
                          <Badge key={i} className="bg-green-400/10 text-green-400 border-green-400/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-6 h-6" /> Missing Nodes
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {analysis.missingSkills.map((s, i) => (
                          <Badge key={i} className="bg-red-400/10 text-red-400 border-red-400/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
                <CardHeader className="p-0 mb-10">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                    Neural Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#050816', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-12">
              <Card className="glass p-10 rounded-[3rem] border-red-500/10 bg-red-500/[0.01]">
                <h4 className="text-xl font-bold mb-8 text-red-400 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" /> Critical Deltas
                </h4>
                <div className="space-y-6">
                  {analysis.criticalMissingSkills.map((s, i) => (
                    <div key={i} className="p-5 glass rounded-2xl border-white/5 text-sm font-light">
                      <span className="font-bold text-red-400 mr-2">!</span> Priority Node: <b>{s}</b>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10 p-10">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-accent" /> Acquisition Roadmap
                </h4>
                <div className="space-y-8">
                  {analysis.recommendedRoadmap.map((step, i) => (
                    <div key={i} className="flex gap-5 items-start">
                      <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center font-bold text-accent shrink-0 text-xs">0{i+1}</div>
                      <p className="text-sm font-light leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
                <Link href="/roadmap" className="mt-12 block">
                  <Button className="w-full h-14 btn-premium text-[10px] font-bold uppercase tracking-widest">
                    Initialize Roadmap <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </Link>
              </Card>

              <Button 
                onClick={() => setAnalysis(null)}
                variant="ghost" 
                className="w-full h-14 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white"
              >
                Reset System Audit
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}