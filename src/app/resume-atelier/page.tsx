"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  ArrowRight,
  Target,
  Sparkles,
  Command,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------- TYPES ---------- */
interface ResumeEntry {
  company?: string;
  role?: string;
  dates?: string;
  bullets?: string;
  name?: string;
  desc?: string;
  school?: string;
  degree?: string;
}

interface ResumeData {
  id?: string;
  title: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  loc: string;
  summary: string;
  skills: string[];
  experience: ResumeEntry[];
  projects: ResumeEntry[];
  education: ResumeEntry[];
  theme: string;
}

/* ---------- CONSTANTS ---------- */
const STEPS = ["Measure", "Tailor", "Fit", "Cut", "Press"];
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

const THEMES = [
  { id: 'windsor', name: 'The Windsor', tag: 'Centered · Serif · Timeless', accent: '#7a2531' },
  { id: 'savile', name: 'The Savile', tag: 'Dark bureau · Two columns', accent: '#3a5a40' },
  { id: 'regent', name: 'The Regent', tag: 'Ink band · Executive split', accent: '#8a723a' },
  { id: 'bond', name: 'The Bond', tag: 'Chronological thread', accent: '#4a4e69' },
];

const INITIAL_DATA: ResumeData = {
  title: "New Resume",
  name: "Ananya Kulkarni",
  role: "Product Designer",
  email: "ananya@email.com",
  phone: "+91 90000 00000",
  loc: "Pune, IN",
  summary: "Product designer with 3+ years shipping B2B dashboards. Led design for a fintech onboarding flow that cut drop-off by 27%.",
  skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
  experience: [
    { company: "Vaultly Fintech", role: "Product Designer", dates: "2023–Present", bullets: "Redesigned onboarding flow, cutting drop-off by 27%\nBuilt a design system used across 6 product teams" }
  ],
  projects: [
    { name: "Onboarding Revamp", desc: "End-to-end redesign of KYC flow reducing steps from 9 to 4" }
  ],
  education: [
    { school: "MIT WPU, Pune", degree: "B.Des — Interaction Design", dates: "2019–2023" }
  ],
  theme: "windsor"
};

/* ---------- UTILS ---------- */
const STOP_WORDS = new Set("the a an and or of to in on for with is are we our your you will must have has this that as be an at by from experience looking".split(' '));

function tokenize(str: string) {
  return (str || '').toLowerCase().match(/[a-z0-9+.#]+/g)?.filter(w => w.length > 2 && !STOP_WORDS.has(w)) || [];
}

export default function ResumeAtelierPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [view, setView] = useState<'list' | 'editor'>('list');
  const [currentStep, setCurrentStep] = useState(1);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [jd, setJd] = useState("");
  const [atsResult, setAtsResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Firestore Queries
  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes_atelier'), orderBy('updatedAt', 'desc'));
  }, [db, user?.uid]);

  const { data: savedResumes, loading: resumesLoading } = useCollection(resumesQuery);

  // Auto-save logic
  useEffect(() => {
    if (view === 'editor' && activeResumeId && user && db) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
          const docRef = doc(db, 'users', user.uid, 'resumes_atelier', activeResumeId);
          await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Auto-save failed:", e);
        } finally {
          setIsSaving(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data, activeResumeId, user, db, view]);

  const handleCreateNew = async () => {
    if (!user || !db) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'resumes_atelier'), {
        ...INITIAL_DATA,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setActiveResumeId(docRef.id);
      setData({ ...INITIAL_DATA, id: docRef.id });
      setView('editor');
      setCurrentStep(1);
    } catch (e) {
      toast({ variant: "destructive", title: "Creation Failed", description: "Could not initialize new blueprint." });
    }
  };

  const handleEdit = (resume: any) => {
    setActiveResumeId(resume.id);
    setData(resume);
    setView('editor');
    setCurrentStep(1);
    setAtsResult(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !db) return;
    if (!confirm("Are you sure you want to purge this blueprint from the atelier?")) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'resumes_atelier', id));
      toast({ title: "Blueprint Purged", description: "Record removed from archives." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const runAts = () => {
    const resumeText = [
      data.summary, 
      data.skills.join(' '),
      data.experience.map(e => `${e.role} ${e.company} ${e.bullets}`).join(' '),
      data.projects.map(p => `${p.name} ${p.desc}`).join(' ')
    ].join(' ');

    const jdWords = Array.from(new Set(tokenize(jd)));
    const resumeWords = new Set(tokenize(resumeText));
    const matched = jdWords.filter(w => resumeWords.has(w));
    const missing = jdWords.filter(w => !resumeWords.has(w)).slice(0, 8);
    const score = jdWords.length ? Math.round((matched.length / jdWords.length) * 100) : 0;

    setAtsResult({ score, matched, missing });
  };

  if (authLoading || resumesLoading) return (
    <div className="min-h-screen bg-[#0c0b09] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#c9a24d] animate-spin" />
    </div>
  );

  if (!user) {
    router.push('/login?redirectTo=/resume-atelier');
    return null;
  }

  return (
    <div className="atelier-root min-h-screen bg-[#0c0b09] text-[#ece7db] font-sans selection:bg-[#c9a24d]/30">
      <style jsx global>{`
        :root {
          --ink: #0c0b09; --panel: #151210; --panel-2: #1c1814; --hair: #332c22;
          --gold: #c9a24d; --gold-dim: #8a723a; --burgundy: #7a2531;
          --ivory: #f7f2e6; --ivory-dim: #cfc7b4; --text: #ece7db;
          --disp: 'Fraunces', serif; --body: 'Inter', sans-serif; --mono: 'JetBrains Mono', monospace;
        }
        .font-disp { font-family: var(--disp); }
        .font-mono { font-family: var(--mono); }
        
        .atelier-root {
          background: radial-gradient(1200px 500px at 50% -20%, rgba(201,162,77,.07), transparent 60%), var(--ink);
        }

        .paper-shell {
          background: var(--ivory); min-height: 842px; width: 595px; margin: 0 auto;
          box-shadow: 0 2px 0 #e4dcc6, 0 4px 0 #d8cfb4, 0 60px 90px -40px rgba(0,0,0,.7);
          position: relative; transform-origin: top center;
        }

        /* WINDSOR */
        .rs-windsor { padding: 46px 42px; color: #241f18; }
        .rs-windsor .name { font-family: var(--disp); font-size: 29px; font-weight: 600; color: #1c1811; text-align: center; }
        .rs-windsor .role { font-size: 11.5px; color: var(--c-accent); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 5px; text-align: center; }
        .rs-windsor .contact { font-size: 10.5px; color: #8a8072; margin-top: 10px; text-align: center; }
        .rs-windsor .summary { font-size: 11.5px; color: #4a4438; line-height: 1.75; margin-top: 16px; font-style: italic; text-align: center; }
        .rs-windsor .sec-title { font-family: var(--disp); font-size: 12px; font-weight: 600; color: #1c1811; border-bottom: 1px solid var(--c-accent); padding-bottom: 4px; margin: 22px 0 11px; text-transform: uppercase; }
        .rs-windsor .job-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #241f18; }
        .rs-windsor .bul { font-size: 11px; color: #4a4438; line-height: 1.6; margin-left: 14px; margin-top: 2px; }

        /* SAVILE */
        .rs-savile { display: grid; grid-template-columns: 33% 67%; min-height: 842px; }
        .rs-savile .side { background: #1c1811; color: #e8e2d3; padding: 36px 24px; }
        .rs-savile .main { padding: 36px 32px; color: #241f18; }
        .rs-savile .crest2 { width: 44px; height: 44px; border: 1px solid var(--c-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--disp); font-weight: 600; font-size: 16px; color: var(--c-accent); margin-bottom: 18px; }

        @media print {
          body * { visibility: hidden; }
          #resume-paper, #resume-paper * { visibility: visible; }
          #resume-paper { position: absolute; top: 0; left: 0; width: 100%; transform: scale(1) !important; }
        }
      `}</style>

      <Navbar />

      <div className="max-w-[1220px] mx-auto px-6 pt-24 pb-32">
        {view === 'list' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <header className="text-center space-y-4">
              <Badge className="bg-[#c9a24d]/20 text-[#c9a24d] border-none px-6 py-1 font-mono text-[10px] tracking-[0.4em] uppercase">Private Collection</Badge>
              <h1 className="font-disp text-6xl font-medium text-[#f7f2e6] tracking-tight">The Atelier Archive</h1>
              <p className="text-[#cfc7b4] font-light max-w-xl mx-auto">Access your bespoke career blueprints. Every document is cut to measure and preserved in the cloud matrix.</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                onClick={handleCreateNew}
                className="h-[280px] bg-transparent border-dashed border-2 border-[#332c22] hover:border-[#c9a24d]/40 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-[#c9a24d]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-[#c9a24d]" />
                </div>
                <p className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-[#8a723a]">Initialize New Order</p>
              </Card>

              {savedResumes?.map((resume: any) => (
                <Card 
                  key={resume.id}
                  onClick={() => handleEdit(resume)}
                  className="h-[280px] bg-[#151210] border-[#332c22] p-8 flex flex-col justify-between hover:border-[#c9a24d]/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDelete(e, resume.id)} className="text-[#7a2531] hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c9a24d]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-disp text-xl text-[#f7f2e6] line-clamp-1">{resume.title || "Untitled Blueprint"}</h3>
                      <p className="text-[#8a723a] font-mono text-[10px] tracking-widest uppercase mt-1">{resume.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#332c22] pt-6">
                    <div className="flex items-center gap-2 text-[#cfc7b4]/40 text-[9px] font-mono uppercase">
                      <Clock className="w-3 h-3" /> 
                      {resume.updatedAt?.seconds ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString() : "Recent"}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c9a24d] translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="editor-view">
            <header className="flex items-center justify-between mb-12">
              <Button onClick={() => setView('list')} variant="ghost" className="text-[#8a723a] hover:text-[#c9a24d] gap-2 font-mono text-[10px] uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Archive
              </Button>
              <div className="flex items-center gap-4">
                {isSaving && <span className="text-[9px] font-mono uppercase text-[#8a723a] animate-pulse">Syncing nodes...</span>}
                <Input 
                  value={data.title}
                  onChange={e => setData({...data, title: e.target.value})}
                  className="bg-transparent border-none text-right font-disp text-xl focus-visible:ring-0 max-w-[300px]"
                />
              </div>
            </header>

            <div className="ticket-wrap py-10 mb-12">
              <div className="ticket relative flex justify-between max-w-[900px] mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#332c22] -translate-y-1/2" />
                {STEPS.map((label, i) => {
                  const n = i + 1;
                  const isActive = n === currentStep;
                  const isDone = n < currentStep;
                  return (
                    <div 
                      key={label} 
                      onClick={() => setCurrentStep(n)}
                      className={cn("seal relative z-10 flex flex-col items-center cursor-pointer group", isActive && "active")}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full bg-[#0c0b09] border flex items-center justify-center font-disp text-sm transition-all duration-500",
                        isActive ? "border-[#c9a24d] text-[#c9a24d] shadow-[0_0_20px_rgba(201,162,77,0.2)]" :
                        isDone ? "bg-[#c9a24d] border-[#c9a24d] text-[#0c0b09]" : "border-[#332c22] text-[#cfc7b4]/40 group-hover:border-[#cfc7b4]/40"
                      )}>
                        {isDone ? "✓" : ROMAN_NUMERALS[i]}
                      </div>
                      <span className={cn(
                        "mt-4 text-[9px] font-mono tracking-widest uppercase",
                        isActive ? "text-[#c9a24d]" : "text-[#cfc7b4]/40"
                      )}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr,600px] gap-12 items-start">
              <div className="panel-side space-y-8">
                <Card className="bg-[#151210] border-[#332c22] p-10">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Chapter I</p>
                          <h3 className="font-disp text-3xl font-medium">The Measure</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Take your particulars precisely. This is the foundation.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Full Name</Label>
                            <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Target Role</Label>
                            <Input value={data.role} onChange={e => setData({...data, role: e.target.value})} className="atelier-input" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Email</Label>
                            <Input value={data.email} onChange={e => setData({...data, email: e.target.value})} className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Phone</Label>
                            <Input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Location</Label>
                            <Input value={data.loc} onChange={e => setData({...data, loc: e.target.value})} className="atelier-input" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Professional Summary</Label>
                          <Textarea value={data.summary} onChange={e => setData({...data, summary: e.target.value})} className="atelier-textarea" rows={4} />
                        </div>
                        <Button onClick={() => setCurrentStep(2)} className="w-full h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] transition-colors rounded-none font-mono text-[11px] uppercase tracking-[0.2em]">Proceed to Tailoring →</Button>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Chapter II</p>
                          <h3 className="font-disp text-3xl font-medium">The Tailoring</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Cut your experience into nodes the machine can parse.</p>
                        </div>
                        
                        <div className="space-y-6">
                          {data.experience.map((exp, i) => (
                            <div key={i} className="p-6 border border-[#332c22] bg-[#1c1814] relative group">
                              <button onClick={() => {
                                const n = [...data.experience]; n.splice(i, 1); setData({...data, experience: n});
                              }} className="absolute top-4 right-4 text-[#cfc7b4]/40 hover:text-[#7a2531]"><Trash2 className="w-4 h-4" /></button>
                              <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Company</Label>
                                <input value={exp.company} onChange={e => {
                                  const n = [...data.experience]; n[i].company = e.target.value; setData({...data, experience: n});
                                }} className="ghost-input" /></div>
                                <div><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Title</Label>
                                <input value={exp.role} onChange={e => {
                                  const n = [...data.experience]; n[i].role = e.target.value; setData({...data, experience: n});
                                }} className="ghost-input" /></div>
                              </div>
                              <div className="mt-4"><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Dates</Label>
                              <input value={exp.dates} onChange={e => {
                                const n = [...data.experience]; n[i].dates = e.target.value; setData({...data, experience: n});
                              }} className="ghost-input" /></div>
                              <div className="mt-4"><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Bullets</Label>
                              <textarea value={exp.bullets} onChange={e => {
                                const n = [...data.experience]; n[i].bullets = e.target.value; setData({...data, experience: n});
                              }} className="ghost-textarea" rows={3} /></div>
                            </div>
                          ))}
                          <button onClick={() => setData({...data, experience: [...data.experience, {company:"",role:"",dates:"",bullets:""}]})} className="w-full py-4 border border-dashed border-[#332c22] text-[#8a723a] text-[10px] font-mono uppercase tracking-widest hover:border-[#c9a24d]/40">+ Add Position</button>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1 h-14 border-[#332c22] text-[#cfc7b4] rounded-none font-mono text-[11px] uppercase tracking-widest">← Back</Button>
                          <Button onClick={() => setCurrentStep(3)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] rounded-none font-mono text-[11px] uppercase tracking-widest">Proceed to Fitting →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Chapter III</p>
                          <h3 className="font-disp text-3xl font-medium">The Fitting</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Skills are the thread. They must be visible to the machine.</p>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                             <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Skills Archive</Label>
                             <div className="flex flex-wrap gap-2">
                               {data.skills.map((s, i) => (
                                 <Badge key={i} className="bg-transparent border border-[#332c22] text-[#cfc7b4] px-3 py-1.5 rounded-none font-light gap-2">
                                   {s} <button onClick={() => {
                                     const n = [...data.skills]; n.splice(i, 1); setData({...data, skills: n});
                                   }} className="text-[#c9a24d] hover:text-white">×</button>
                                 </Badge>
                               ))}
                             </div>
                             <div className="flex gap-2 pt-2">
                               <Input id="skill-add" placeholder="Type skill..." className="atelier-input" onKeyDown={e => {
                                 if (e.key === 'Enter') {
                                   const val = (e.target as HTMLInputElement).value;
                                   if (val.trim()) { setData({...data, skills: [...data.skills, val.trim()]}); (e.target as HTMLInputElement).value = ""; }
                                 }
                               }} />
                             </div>
                           </div>

                           <div className="space-y-4">
                             <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Education</Label>
                             {data.education.map((ed, i) => (
                               <div key={i} className="p-4 border border-[#332c22] bg-[#1c1814]">
                                 <input value={ed.school} placeholder="School" onChange={e => {
                                   const n = [...data.education]; n[i].school = e.target.value; setData({...data, education: n});
                                 }} className="ghost-input font-bold" />
                                 <div className="grid grid-cols-2 gap-4 mt-2">
                                   <input value={ed.degree} placeholder="Degree" onChange={e => {
                                     const n = [...data.education]; n[i].degree = e.target.value; setData({...data, education: n});
                                   }} className="ghost-input text-xs" />
                                   <input value={ed.dates} placeholder="Dates" onChange={e => {
                                     const n = [...data.education]; n[i].dates = e.target.value; setData({...data, education: n});
                                   }} className="ghost-input text-xs text-right" />
                                 </div>
                               </div>
                             ))}
                             <button onClick={() => setData({...data, education: [...data.education, {school:"",degree:"",dates:""}]})} className="w-full py-3 border border-dashed border-[#332c22] text-[9px] font-mono text-[#8a723a] uppercase">+ Add School</button>
                           </div>
                        </div>

                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1 h-14 border-[#332c22] rounded-none font-mono text-[11px] uppercase">← Back</Button>
                          <Button onClick={() => setCurrentStep(4)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] rounded-none font-mono text-[11px] uppercase">Choose a Cut →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Chapter IV</p>
                          <h3 className="font-disp text-3xl font-medium">The Cut</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Select your silhouette. Genuinely different house styles.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {THEMES.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => setData({...data, theme: t.id})}
                              className={cn(
                                "p-6 border transition-all cursor-pointer bg-[#1c1814] group",
                                data.theme === t.id ? "border-[#c9a24d] ring-1 ring-[#c9a24d]" : "border-[#332c22] hover:border-[#8a723a]"
                              )}
                            >
                              <div className="h-20 bg-white/5 mb-4 relative overflow-hidden flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="font-disp text-[8px] text-[#c9a24d] font-bold uppercase tracking-widest">Cut Thumb</span>
                              </div>
                              <h4 className="font-disp text-sm text-[#f7f2e6]">{t.name}</h4>
                              <p className="text-[9px] font-mono text-[#8a723a] uppercase mt-1">{t.tag}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(3)} variant="outline" className="flex-1 h-14 border-[#332c22] rounded-none font-mono text-[11px] uppercase">← Back</Button>
                          <Button onClick={() => setCurrentStep(5)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] rounded-none font-mono text-[11px] uppercase">Fit Check →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div key="step5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Chapter V</p>
                          <h3 className="font-disp text-3xl font-medium">The Fit Check</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Hold the garment against the machine's light.</p>
                        </div>

                        <div className="space-y-4">
                           <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Job Description</Label>
                           <Textarea 
                             value={jd} 
                             onChange={e => setJd(e.target.value)} 
                             placeholder="Paste posting here..." 
                             className="atelier-textarea" 
                             rows={6} 
                           />
                           <Button onClick={runAts} className="w-full h-12 bg-transparent border border-[#c9a24d] text-[#c9a24d] hover:bg-[#c9a24d] hover:text-[#0c0b09] font-mono text-[10px] uppercase tracking-widest">Analyze Fit →</Button>
                        </div>

                        {atsResult && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 border border-[#332c22] bg-[#1c1814] space-y-8">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-full flex items-center justify-center relative border-4 border-[#332c22]" style={{ borderColor: atsResult.score > 70 ? "#34d399" : "#c9a24d" }}>
                                <span className="font-disp text-xl">{atsResult.score}%</span>
                              </div>
                              <div>
                                <h4 className="font-disp text-lg">System Match</h4>
                                <p className="text-[10px] font-mono text-[#8a723a] uppercase tracking-widest">
                                  {atsResult.score > 75 ? "Excellent Fit" : atsResult.score > 40 ? "Fair Match" : "Needs Tailoring"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                               <div>
                                 <p className="text-[9px] font-mono uppercase text-[#8a723a] mb-2">Matched Threads</p>
                                 <div className="flex flex-wrap gap-2">
                                   {atsResult.matched.map((w: string) => <span key={w} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] border border-green-500/20">{w}</span>)}
                                 </div>
                               </div>
                               <div>
                                 <p className="text-[9px] font-mono uppercase text-[#8a723a] mb-2">Missing Threads</p>
                                 <div className="flex flex-wrap gap-2">
                                   {atsResult.missing.map((w: string) => <span key={w} className="px-3 py-1 bg-[#7a2531]/20 text-red-300 text-[10px] border border-[#7a2531]/40">{w}</span>)}
                                 </div>
                               </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button onClick={() => setCurrentStep(4)} variant="outline" className="flex-1 h-14 border-[#332c22] rounded-none font-mono text-[11px] uppercase">← Back</Button>
                          <Button onClick={() => window.print()} className="flex-[2] h-14 bg-[#7a2531] text-white hover:bg-red-800 rounded-none font-mono text-[11px] uppercase tracking-widest shadow-xl">Press & Deliver (PDF) →</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              <div className="preview-side sticky top-[100px]">
                <div className="flex justify-between items-end mb-4 px-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8a723a]">Live Preview</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#c9a24d]">{THEMES.find(t=>t.id===data.theme)?.name.toUpperCase()}</span>
                </div>
                <div id="resume-paper" className="paper-shell overflow-hidden">
                   <ResumePreview data={data} theme={data.theme} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-40">
        <p className="text-[8px] font-mono tracking-[0.8em] uppercase text-[#cfc7b4]">Authentic Neural Craftsmanship</p>
      </div>

      <style jsx>{`
        .atelier-input {
          background: transparent; border: none; border-bottom: 1px solid var(--hair);
          padding: 8px 0; color: var(--ivory); font-family: var(--body); font-size: 14px;
          border-radius: 0; outline: none; transition: .2s;
        }
        .atelier-input:focus { border-bottom-color: var(--gold); }
        
        .atelier-textarea {
          background: transparent; border: 1px solid var(--hair); padding: 12px;
          color: var(--ivory); font-family: var(--body); font-size: 13px; line-height: 1.6;
          border-radius: 0; outline: none; transition: .2s; resize: none;
        }
        .atelier-textarea:focus { border-color: var(--gold); }

        .ghost-input {
          width: 100%; background: transparent; border: none; font-family: var(--body);
          color: var(--ivory); font-size: 13px; outline: none; padding: 4px 0;
          border-bottom: 1px solid transparent;
        }
        .ghost-input:focus { border-bottom-color: var(--gold-dim); }

        .ghost-textarea {
          width: 100%; background: transparent; border: none; font-family: var(--body);
          color: var(--ivory-dim); font-size: 12px; outline: none; resize: none;
          line-height: 1.5; padding: 4px 0;
        }
      `}</style>
    </div>
  );
}

/* ---------- PREVIEW RENDERER ---------- */
function ResumePreview({ data, theme }: { data: ResumeData, theme: string }) {
  const accent = THEMES.find(t => t.id === theme)?.accent || '#c9a24d';
  const vars = { '--c-accent': accent } as React.CSSProperties;

  const Bullets = ({ str }: { str: string }) => (
    <div className="space-y-1 mt-1">
      {str.split('\n').filter(x => x.trim()).map((b, i) => (
        <div key={i} className="bul flex gap-2 text-[#4a4438] leading-tight">
          <span className="shrink-0">—</span> <span>{b}</span>
        </div>
      ))}
    </div>
  );

  if (theme === 'windsor') {
    return (
      <div className="rs-windsor h-full" style={vars}>
        <div className="name">{data.name}</div>
        <div className="role">{data.role}</div>
        <div className="contact">{data.email} · {data.phone} · {data.loc}</div>
        <div className="summary">{data.summary}</div>
        
        <div className="sec-title">Experience</div>
        {data.experience.map((e, i) => (
          <div key={i} className="mb-4">
            <div className="job-head"><span>{e.role}, {e.company}</span><span>{e.dates}</span></div>
            <Bullets str={e.bullets || ""} />
          </div>
        ))}

        {data.projects.length > 0 && (
          <>
            <div className="sec-title">Projects</div>
            {data.projects.map((p, i) => (
              <div key={i} className="mb-3">
                <div className="font-bold text-[12px]">{p.name}</div>
                <div className="text-[11px] text-[#4a4438] mt-1">{p.desc}</div>
              </div>
            ))}
          </>
        )}

        <div className="sec-title">Education</div>
        {data.education.map((ed, i) => (
          <div key={i} className="job-head"><span>{ed.degree}, {ed.school}</span><span>{ed.dates}</span></div>
        ))}

        <div className="sec-title">Skills</div>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s, i) => (
            <span key={i} className="border border-[#ddd3ba] px-2 py-0.5 text-[9.5px] font-semibold text-[#4a4438] uppercase tracking-wider">{s}</span>
          ))}
        </div>
      </div>
    );
  }

  if (theme === 'savile') {
    return (
      <div className="rs-savile h-full" style={vars}>
        <div className="side flex flex-col">
          <div className="crest2">{data.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
          <div className="font-disp text-lg font-bold">{data.name}</div>
          <div className="text-[10px] text-[var(--c-accent)] uppercase tracking-wider mt-1">{data.role}</div>
          
          <div className="mt-8 space-y-1">
             <div className="text-[9px] uppercase tracking-widest text-[var(--c-accent)] font-bold mb-2">Contact</div>
             <div className="text-[10.5px] text-[#cfc7b4]">{data.email}</div>
             <div className="text-[10.5px] text-[#cfc7b4]">{data.phone}</div>
             <div className="text-[10.5px] text-[#cfc7b4]">{data.loc}</div>
          </div>

          <div className="mt-8">
             <div className="text-[9px] uppercase tracking-widest text-[var(--c-accent)] font-bold mb-2">Technical</div>
             <div className="flex flex-wrap gap-1">
               {data.skills.map(s => <span key={s} className="border border-white/10 px-2 py-0.5 text-[9px] text-[#cfc7b4]">{s}</span>)}
             </div>
          </div>
        </div>
        <div className="main">
           <div className="mb-6">
             <div className="font-disp text-[12px] font-bold border-bottom border-[#e4dcc6] pb-1 mb-2 uppercase">Summary</div>
             <div className="text-[11.5px] italic text-[#4a4438] leading-relaxed">{data.summary}</div>
           </div>
           <div>
             <div className="font-disp text-[12px] font-bold border-bottom border-[#e4dcc6] pb-1 mb-3 uppercase">Experience</div>
             {data.experience.map((e, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between font-bold text-[12px]"><span>{e.role}</span><span>{e.dates}</span></div>
                  <div className="text-[10.5px] text-[#8a8072] italic mb-1">{e.company}</div>
                  <Bullets str={e.bullets || ""} />
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // Fallback to Windsor for other themes to keep preview simple but correctable if needed
  return (
    <div className="rs-windsor h-full" style={vars}>
      <div className="name">{data.name}</div>
      <div className="role">{data.role}</div>
      <div className="contact">{data.email} · {data.phone} · {data.loc}</div>
      <div className="summary">{data.summary}</div>
      <div className="sec-title uppercase">Experience</div>
      {data.experience.map((e, i) => (
        <div key={i} className="mb-4">
          <div className="job-head"><span>{e.role}, {e.company}</span><span>{e.dates}</span></div>
          <Bullets str={e.bullets || ""} />
        </div>
      ))}
    </div>
  );
}
