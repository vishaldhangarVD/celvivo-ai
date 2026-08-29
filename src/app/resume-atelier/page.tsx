"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ChevronRight,
  Loader2,
  Clock,
  Zap,
  Target,
  Cpu,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Search,
  CheckCircle2,
  Check,
  User,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { runAtsCheck } from '@/ai/flows/ai-resume-ats-check';

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
const STEPS = ["Design", "Details", "Experience", "Skills", "Finish"];
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

const TEMPLATES = [
  {id:'windsor',    name:'The Windsor',    tag:'Centered · Serif · Timeless',        accent:'#7a2531', family:'single'},
  {id:'savile',     name:'The Savile',     tag:'Dark bureau · Two columns',          accent:'#3a5a40', family:'sidebar-l'},
  {id:'regent',     name:'The Regent',     tag:'Ink band · Executive split',         accent:'#8a723a', family:'band'},
  {id:'bond',       name:'The Bond',       tag:'Chronological thread',               accent:'#4a4e69', family:'timeline'},
  {id:'harrow',     name:'The Harrow',     tag:'Minimal · ATS-safest',               accent:'#4a4438', family:'single', variant:'v-minimal'},
  {id:'kensington', name:'The Kensington', tag:'Light sidebar · Right column',       accent:'#2f6f6f', family:'sidebar-r'},
  {id:'oxford',     name:'The Oxford',     tag:'Equal split · Light aside',          accent:'#2f4f6f', family:'twocol'},
  {id:'piccadilly', name:'The Piccadilly', tag:'Skills up top · Tag cloud',          accent:'#b5542f', family:'single', variant:'v-tagcloud'},
  {id:'highgate',   name:'The Highgate',   tag:'Compact one-pager',                 accent:'#6b2d3c', family:'single', variant:'v-dense'},
  {id:'camden',     name:'The Camden',     tag:'Avatar · Timeline',                 accent:'#5b4a8a', family:'timeline', variant:'v-avatar'},
  {id:'ashford',    name:'The Ashford',    tag:'Avatar header · Single column',      accent:'#2d5f8a', family:'single', variant:'v-avatar'},
  {id:'belgrave',   name:'The Belgrave',   tag:'Pill section headers',               accent:'#2f7a5e', family:'single', variant:'v-pillheaders'},
  {id:'mayfair',    name:'The Mayfair',    tag:'Accent border sections',             accent:'#7a3f6b', family:'single', variant:'v-accentborder'},
  {id:'chelsea',    name:'The Chelsea',    tag:'Boxed sections',                     accent:'#8a5a2f', family:'single', variant:'v-boxed'},
];

const INITIAL_DATA: ResumeData = {
  title: "New Resume",
  name: "",
  role: "",
  email: "",
  phone: "",
  loc: "",
  summary: "",
  skills: [],
  experience: [
    { company: "", role: "", dates: "", bullets: "" }
  ],
  projects: [],
  education: [
    { school: "", degree: "", dates: "" }
  ],
  theme: "windsor"
};

/* ---------- MINIATURE PREVIEW COMPONENT ---------- */
const CutThumbnail = ({ template }: { template: any }) => {
  const a = template.accent;
  
  if (template.family === 'sidebar-l' || template.family === 'sidebar-r') {
    const sideBlock = <div style={{ background: template.family === 'sidebar-l' ? '#1c1811' : '#f6f3ea' }} />;
    const mainBlock = (
      <div style={{ padding: '12px 10px' }}>
        <div style={{ width: '55%', height: '5px', background: a, marginBottom: '7px' }} />
        <div style={{ width: '80%', height: '2.5px', background: '#e4dcc6', marginBottom: '5px' }} />
        <div style={{ width: '65%', height: '2.5px', background: '#e4dcc6' }} />
      </div>
    );
    return (
      <div style={{ display: 'grid', gridTemplateColumns: template.family === 'sidebar-l' ? '35% 65%' : '65% 35%', height: '100%' }}>
        {template.family === 'sidebar-l' ? <>{sideBlock}{mainBlock}</> : <>{mainBlock}{sideBlock}</>}
      </div>
    );
  }

  if (template.family === 'band') {
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: '32%', background: '#1c1811', borderBottom: `2px solid ${a}` }} />
        <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '60% 40%', gap: '8px' }}>
          <div>
            <div style={{ width: '85%', height: '2.5px', background: '#e4dcc6', marginBottom: '5px' }} />
            <div style={{ width: '65%', height: '2.5px', background: '#e4dcc6' }} />
          </div>
          <div style={{ borderLeft: `2px solid ${a}`, paddingLeft: '6px' }}>
            <div style={{ width: '80%', height: '2.5px', background: '#e4dcc6' }} />
          </div>
        </div>
      </div>
    );
  }

  if (template.family === 'timeline') {
    return (
      <div style={{ padding: '12px 10px' }}>
        {template.variant === 'v-avatar'
          ? <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: a, marginBottom: '8px' }} />
          : <div style={{ width: '45%', height: '6px', background: '#1c1811', marginBottom: '10px' }} />}
        <div style={{ borderLeft: '1.5px solid #ddd3ba', paddingLeft: '12px', marginLeft: '2px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: a, marginLeft: '-16.5px', marginBottom: '5px' }} />
          <div style={{ width: '75%', height: '2.5px', background: '#e4dcc6', marginBottom: '9px' }} />
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: a, marginLeft: '-16.5px', marginBottom: '5px' }} />
          <div style={{ width: '55%', height: '2.5px', background: '#e4dcc6' }} />
        </div>
      </div>
    );
  }

  if (template.family === 'twocol') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', height: '100%' }}>
        <div style={{ background: '#f6f3ea', padding: '10px' }}>
          <div style={{ width: '60%', height: '2.5px', background: a, marginBottom: '6px' }} />
          <div style={{ width: '70%', height: '2px', background: '#ddd3ba' }} />
        </div>
        <div style={{ padding: '10px' }}>
          <div style={{ width: '80%', height: '2.5px', background: '#e4dcc6', marginBottom: '5px' }} />
          <div style={{ width: '65%', height: '2.5px', background: '#e4dcc6' }} />
        </div>
      </div>
    );
  }

  if (template.family === 'single' && template.variant === 'v-avatar') {
    return (
      <div style={{ padding: '14px', textAlign: 'center' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: a, margin: '0 auto 8px' }} />
        <div style={{ width: '60%', height: '2.5px', background: '#e4dcc6', margin: '0 auto 5px' }} />
        <div style={{ width: '88%', height: '1px', background: '#e4dcc6', margin: '8px auto' }} />
        <div style={{ width: '78%', height: '2.5px', background: '#e4dcc6', margin: '0 auto 5px' }} />
      </div>
    );
  }

  // default single/minimal
  return (
    <div style={{ padding: '14px', textAlign: 'center' }}>
      <div style={{ width: '48%', height: '6px', background: '#1c1811', margin: '0 auto 9px' }} />
      <div style={{ width: '65%', height: '2.5px', background: '#e4dcc6', margin: '0 auto 5px' }} />
      <div style={{ width: '40%', height: '2.5px', background: a, margin: '0 auto 11px' }} />
      <div style={{ width: '88%', height: '1px', background: '#e4dcc6', margin: '0 auto 9px' }} />
      <div style={{ width: '78%', height: '2.5px', background: '#e4dcc6', margin: '0 auto 5px' }} />
      <div style={{ width: '60%', height: '2.5px', background: '#e4dcc6', margin: '0 auto' }} />
    </div>
  );
};

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
  const [isAtsLoading, setIsAtsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick ATS Modal State
  const [isQuickAtsOpen, setIsQuickAtsOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [quickAtsResume, setQuickAtsResume] = useState<ResumeData | null>(null);
  const [quickAtsJd, setQuickAtsJd] = useState("");
  const [quickAtsResult, setQuickAtsResult] = useState<any>(null);
  const [isQuickAtsLoading, setIsQuickAtsLoading] = useState(false);

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
      toast({ variant: "destructive", title: "Creation Failed", description: "Could not initialize new resume." });
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
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'resumes_atelier', id));
      toast({ title: "Resume Deleted", description: "Record removed from archives." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const handleGlobalAtsAction = () => {
    if (!savedResumes || savedResumes.length === 0) {
      toast({ title: "Archival Record Missing", description: "Please create at least one career blueprint to initialize the neural audit." });
      return;
    }

    if (savedResumes.length === 1) {
      setQuickAtsResume(savedResumes[0] as ResumeData);
      setQuickAtsJd("");
      setQuickAtsResult(null);
      setIsQuickAtsOpen(true);
    } else {
      setIsPickerOpen(true);
    }
  };

  const handlePickResume = (resume: any) => {
    setQuickAtsResume(resume);
    setQuickAtsJd("");
    setQuickAtsResult(null);
    setIsPickerOpen(false);
    setIsQuickAtsOpen(true);
  };

  const handleRunAts = async (resume: ResumeData, jdText: string, setResults: any, setLoading: any) => {
    if (!jdText.trim()) {
      toast({ variant: "destructive", title: "Intelligence Gap", description: "Please provide a job description protocol to calibrate the audit." });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const result = await runAtsCheck({
        resumeData: {
          name: resume.name,
          role: resume.role,
          summary: resume.summary,
          skills: resume.skills,
          experience: resume.experience,
          projects: resume.projects,
          education: resume.education,
        },
        jobDescription: jdText
      });
      setResults(result);
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Neural Sync Failure", 
        description: e.message || "Couldn't complete the ATS check — please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || resumesLoading) return (
    <div className="min-h-screen bg-[#0c0b09] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#c9a24d] animate-spin" />
    </div>
  );

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

        /* Generic Resume Document System Primitives */
        .doc-name{font-family:var(--disp); font-size:27px; font-weight:600; color:#1c1811;}
        .doc-role-badge{display:inline-block; background:var(--c-accent); color:#fff; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; padding:5px 14px; border-radius:100px; margin-top:8px;}
        .doc-role-badge-inv{background:rgba(255,255,255,.16); color:#fff;}
        .doc-contact{font-size:10.5px; color:#8a8072; margin-top:9px;}
        .doc-contact-inline span{white-space:nowrap;}
        .doc-contact-inline .doc-dot{margin:0 8px; opacity:.5;}
        .doc-ic{display:inline-block; width:14px; margin-right:2px; opacity:.85;}
        .doc-summary{font-size:11.5px; color:#4a4438; line-height:1.75; margin-top:14px; font-style:italic;}
        .doc-sec{margin-top:20px;}
        .doc-sectitle{font-family:var(--disp); font-size:12px; font-weight:600; letter-spacing:.4px; color:#1c1811; border-bottom:2px solid var(--c-accent); padding-bottom:6px; margin-bottom:10px; position:relative; padding-left:12px;}
        .doc-sectitle::before{content:''; position:absolute; left:0; top:2px; width:5px; height:12px; background:var(--c-accent); border-radius:1px;}
        .doc-job{margin-bottom:12px;}
        .doc-jobhead{display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#241f18;}
        .doc-jobsub{font-size:10.5px; color:#8a8072; font-style:italic; margin-bottom:5px;}
        .doc-bul{font-size:11px; color:#4a4438; line-height:1.65; margin-left:14px;}
        .doc-pill{display:inline-block; background:var(--c-accent); color:#fff; font-size:9.5px; font-weight:600; padding:5px 12px; border-radius:100px; margin:2px 5px 2px 0;}
        .doc-avatar{width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--disp); font-weight:600; font-size:18px; color:#fff; background:var(--c-accent); flex-shrink:0;}
        .doc-avatar-lg{width:76px; height:76px; font-size:24px; margin:0 auto 12px; border:3px solid rgba(255,255,255,.35); box-shadow:0 4px 14px rgba(0,0,0,.25);}
        .doc-avatar-band{width:58px; height:58px; font-size:20px; border:3px solid rgba(255,255,255,.35); flex-shrink:0;}
        .doc-header-row{display:flex; align-items:center; gap:16px; margin-bottom:4px;}

        .doc-side-dark{background:#1c1811; color:#e8e2d3; padding:36px 24px;}
        .doc-side-dark .doc-sidetitle{font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--c-accent); font-weight:700; margin-bottom:9px; border-bottom:1px solid rgba(255,255,255,.12); padding-bottom:6px;}
        .doc-side-dark .doc-sideline{font-size:10.5px; color:#b5ac98; margin-bottom:7px; line-height:1.55;}
        .doc-side-dark .doc-sideline-ic{font-size:10px; color:#c9c2b0; margin-bottom:9px; line-height:1.5; word-break:break-word;}
        .doc-side-dark .doc-sidepill{display:inline-block; background:var(--c-accent); font-size:9.5px; padding:4px 10px; margin:2px 5px 2px 0; color:#fff; border-radius:100px; font-weight:600;}

        .doc-side-light{background:#f6f3ea; padding:30px 26px;}
        .doc-side-light .doc-sidetitle{font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--c-accent); font-weight:700; margin-bottom:9px; border-bottom:1px solid #e4dcc6; padding-bottom:6px;}
        .doc-side-light .doc-sideline{font-size:10.5px; color:#4a4438; margin-bottom:7px; line-height:1.55;}
        .doc-side-light .doc-sideline-ic{font-size:10px; color:#4a4438; margin-bottom:9px; line-height:1.5; word-break:break-word;}
        .doc-side-light .doc-sidepill{display:inline-block; background:var(--c-accent); font-size:9.5px; padding:4px 10px; margin:2px 5px 2px 0; color:#fff; border-radius:100px; font-weight:600;}

        .shell-single{padding:44px 40px; font-family:'Inter',sans-serif; color:#241f18;}
        .shell-sidebar-l{display:grid; grid-template-columns:33% 67%; min-height:640px; font-family:'Inter',sans-serif; color:#241f18;}
        .shell-sidebar-l .doc-main{padding:36px 32px;}
        .shell-sidebar-r{display:grid; grid-template-columns:67% 33%; min-height:640px; font-family:'Inter',sans-serif; color:#241f18;}
        .shell-sidebar-r .doc-main{padding:36px 32px;}
        .shell-band{font-family:'Inter',sans-serif; color:#241f18;}
        .shell-band .doc-band{background:#1c1811; padding:30px 38px; color:var(--ivory); border-bottom:3px solid var(--c-accent); display:flex; align-items:center; gap:18px;}
        .shell-band .doc-band .doc-name{color:var(--ivory);}
        .shell-band .doc-band .doc-contact{color:#a89f8c;}
        .shell-band .doc-body{display:grid; grid-template-columns:63% 37%; padding:28px 38px; gap:28px;}
        .shell-timeline{padding:44px 40px; font-family:'Inter',sans-serif; color:#241f18;}
        .shell-timeline .doc-tl{position:relative; padding-left:22px; border-left:1px solid #ddd3ba; margin-top:6px;}
        .shell-timeline .doc-tl-item{position:relative; margin-bottom:18px;}
        .shell-timeline .doc-tl-item::before{content:''; position:absolute; left:-27px; top:4px; width:8px; height:8px; border-radius:50%; background:var(--c-accent); border:2px solid var(--ivory); box-shadow:0 0 0 1px var(--c-accent);}
        .shell-twocol{display:grid; grid-template-columns:50% 50%; min-height:640px; font-family:'Inter',sans-serif; color:#241f18;}
        .shell-twocol .doc-main{padding:36px 32px;}

        .v-minimal .doc-name{font-family:'Inter',sans-serif; letter-spacing:.3px;}
        .v-minimal .doc-sectitle{border-bottom:1px solid #ddd3ba; color:#1c1811;}
        .v-dense{padding:30px 30px !important;}
        .v-dense .doc-sec{margin-top:12px;}
        .v-dense .doc-name{font-size:21px;}
        .v-dense .doc-bul, .v-dense .doc-jobhead, .v-dense .doc-jobsub, .v-dense .doc-contact{font-size:10px;}
        .v-pillheaders .doc-sectitle{display:inline-block; background:var(--c-accent); color:#fff; border:none; padding:5px 14px; border-radius:100px; font-size:9.5px; letter-spacing:1px;}
        .v-accentborder .doc-sec{border-left:2px solid var(--c-accent); padding-left:14px;}
        .v-boxed .doc-sec{background:#f6f3ea; padding:14px 16px; border-radius:6px;}

        .atelier-input {
          background: transparent; border: none; border-bottom: 1px solid var(--hair);
          padding: 8px 0; color: var(--ivory); font-family: var(--body); font-size: 14px;
          border-radius: 0; outline: none; transition: .2s;
        }
        .atelier-input:focus { border-bottom-color: var(--gold); }
        .atelier-input::placeholder { color: #5a5348; opacity: 0.6; }
        
        .atelier-textarea {
          background: transparent; border: 1px solid var(--hair); padding: 12px;
          color: var(--ivory); font-family: var(--body); font-size: 13px; line-height: 1.6;
          border-radius: 0; outline: none; transition: .2s; resize: none;
        }
        .atelier-textarea:focus { border-color: var(--gold); }
        .atelier-textarea::placeholder { color: #5a5348; opacity: 0.6; }

        .ghost-input {
          width: 100%; background: transparent; border: none; font-family: var(--body);
          color: var(--ivory); font-size: 13px; outline: none; padding: 4px 0;
          border-bottom: 1px solid transparent;
        }
        .ghost-input:focus { border-bottom-color: var(--gold-dim); }
        .ghost-input::placeholder { color: #5a5348; opacity: 0.6; }

        .ghost-textarea {
          width: 100%; background: transparent; border: none; font-family: var(--body);
          color: var(--ivory-dim); font-size: 12px; outline: none; resize: none;
          line-height: 1.5; padding: 4px 0;
        }
        .ghost-textarea::placeholder { color: #5a5348; opacity: 0.6; }

        .fit-ring {
          width: 76px; height: 76px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: conic-gradient(var(--gold) var(--pct,0%), var(--hair) 0);
          transition: background 1s ease;
        }
        .fit-ring-inner {
          width: 60px; height: 60px; border-radius: 50%; background: var(--panel-2);
          display: flex; align-items: center; justify-content: center; font-family: var(--disp);
          font-size: 16px; font-weight: 500; color: var(--gold);
        }

        @media print {
          body * { visibility: hidden; }
          #resume-paper, #resume-paper * { visibility: visible; }
          #resume-paper { position: absolute; top: 0; left: 0; width: 100%; transform: scale(1) !important; }
        }
      `}</style>

      <Navbar />
      <NavigationControls />

      <div className="max-w-[1220px] mx-auto px-6 pt-24 pb-32">
        {view === 'list' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                <Badge className="bg-[#c9a24d]/20 text-[#c9a24d] border-none px-6 py-1 font-mono text-[10px] tracking-[0.4em] uppercase">Private Collection</Badge>
                <h1 className="font-disp text-6xl font-medium text-[#f7f2e6] tracking-tight">The Atelier Archive</h1>
                <p className="text-[#cfc7b4] font-light max-w-xl">Access your bespoke career blueprints. Every document is cut to measure and preserved in the cloud matrix.</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleGlobalAtsAction}
                  className="h-16 px-10 rounded-2xl glass border-[#c9a24d]/20 text-[#c9a24d] hover:bg-[#c9a24d]/10 hover:border-[#c9a24d]/50 flex gap-3 text-[10px] tracking-widest uppercase transition-all shadow-2xl"
                >
                  <Target className="w-5 h-5" />
                  Check ATS Score
                </Button>
              </div>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                onClick={handleCreateNew}
                className="h-[320px] bg-transparent border-dashed border-2 border-[#332c22] hover:border-[#c9a24d]/40 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-[#c9a24d]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-[#c9a24d]" />
                </div>
                <p className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-[#8a723a]">Initialize New Resume</p>
              </Card>

              {savedResumes?.map((resume: any) => (
                <Card 
                  key={resume.id}
                  onClick={() => handleEdit(resume)}
                  className="h-[320px] bg-[#151210] border-[#332c22] p-8 flex flex-col justify-between hover:border-[#c9a24d]/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDelete(e, resume.id)} className="text-[#7a2531] hover:text-red-400 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c9a24d]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-disp text-xl text-[#f7f2e6] line-clamp-1">{resume.title || "Untitled Resume"}</h3>
                      <p className="text-[#8a723a] font-mono text-[10px] tracking-widest uppercase mt-1">{resume.role || "No Role Defined"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-t border-[#332c22] pt-4">
                      <div className="flex items-center gap-2 text-[#cfc7b4]/40 text-[9px] font-mono uppercase">
                        <Clock className="w-3 h-3" /> 
                        {resume.updatedAt?.seconds ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString() : "Recent"}
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#c9a24d] translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resume Picker Modal */}
            <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <DialogContent className="bg-[#0b0e1a] border-[#332c22] text-[#ece7db] max-w-xl rounded-[2.5rem] overflow-hidden">
                <DialogHeader className="mb-8">
                  <DialogTitle className="font-disp text-3xl">Pick a Blueprint</DialogTitle>
                  <p className="text-sm text-[#cfc7b4] font-light">Select the career track you wish to benchmark against current job protocols.</p>
                </DialogHeader>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedResumes?.map((resume: any) => (
                    <button 
                      key={resume.id} 
                      onClick={() => handlePickResume(resume)}
                      className="w-full p-6 glass border-white/5 hover:border-[#c9a24d]/40 rounded-2xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-[#c9a24d]/10 flex items-center justify-center text-[#c9a24d]">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-disp text-lg text-white group-hover:text-[#c9a24d] transition-colors">{resume.title || "Untitled"}</p>
                          <p className="text-[10px] font-mono uppercase text-[#8a723a] tracking-widest">{resume.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono uppercase text-white/20">{resume.updatedAt?.seconds ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString() : "Recent"}</span>
                        <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-[#c9a24d] transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Global Quick ATS Modal */}
            <Dialog open={isQuickAtsOpen} onOpenChange={setIsQuickAtsOpen}>
              <DialogContent className="bg-[#0b0e1a] border-[#332c22] text-[#ece7db] max-w-2xl rounded-[2.5rem] overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-8">
                  <div className="flex items-center gap-6 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#c9a24d]/10 flex items-center justify-center text-[#c9a24d]">
                       <Target className="w-6 h-6" />
                    </div>
                    <DialogTitle className="font-disp text-3xl">Neural ATS Check</DialogTitle>
                  </div>
                  {quickAtsResume && (
                    <div className="flex items-center gap-3 px-1">
                      <Badge variant="outline" className="border-[#c9a24d]/30 text-[#c9a24d] text-[8px] uppercase tracking-widest font-black">Active Blueprint: {quickAtsResume.title}</Badge>
                      {savedResumes && savedResumes.length > 1 && (
                        <button onClick={() => { setIsQuickAtsOpen(false); setIsPickerOpen(true); }} className="text-[8px] uppercase font-bold text-white/30 hover:text-white transition-colors underline decoration-white/10">Switch Track</button>
                      )}
                    </div>
                  )}
                </DialogHeader>

                <div className="space-y-8">
                  {!quickAtsResult && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-mono uppercase text-[#8a723a] tracking-widest ml-1">Job Description Protocol</Label>
                      <Textarea 
                        value={quickAtsJd}
                        onChange={e => setQuickAtsJd(e.target.value)}
                        placeholder="Paste the job requirements here..."
                        className="atelier-textarea h-40"
                      />
                      <Button 
                        onClick={() => handleRunAts(quickAtsResume!, quickAtsJd, setQuickAtsResult, setIsQuickAtsLoading)}
                        disabled={isQuickAtsLoading || !quickAtsJd.trim()}
                        className="w-full h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] rounded-none font-mono text-[11px] uppercase tracking-widest shadow-xl"
                      >
                        {isQuickAtsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Neural Audit →"}
                      </Button>
                    </div>
                  )}

                  {quickAtsResult && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="p-8 border border-[#332c22] bg-[#1c1814] space-y-10">
                        <div className="flex items-center gap-8">
                          <div className="fit-ring" style={{ '--pct': `${quickAtsResult.score}%` } as any}>
                            <div className="fit-ring-inner">{quickAtsResult.score}%</div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono text-[#8a723a] uppercase tracking-widest">Match Verdict</p>
                            <h4 className="font-disp text-2xl text-[#f7f2e6]">{quickAtsResult.verdict}</h4>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <div className="space-y-3">
                               <p className="text-[9px] font-mono uppercase text-green-400/60 tracking-widest">Matched Keywords</p>
                               <div className="flex flex-wrap gap-2">
                                 {quickAtsResult.matchedKeywords?.map((w: string) => <span key={w} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] border border-green-500/20">{w}</span>)}
                               </div>
                             </div>
                             <div className="space-y-3">
                               <p className="text-[9px] font-mono uppercase text-red-400/60 tracking-widest">Missing Requirements</p>
                               <div className="flex flex-wrap gap-2">
                                 {quickAtsResult.missingKeywords?.map((w: string) => <span key={w} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">{w}</span>)}
                               </div>
                             </div>
                          </div>
                          <div className="space-y-6">
                             <p className="text-[9px] font-mono uppercase text-[#c9a24d] tracking-widest">Strategic Recommendations</p>
                             <div className="space-y-4">
                               {quickAtsResult.suggestions?.map((s: string, i: number) => (
                                 <div key={i} className="flex gap-4 items-start group">
                                   <div className="w-1.5 h-1.5 rounded-full bg-[#c9a24d] mt-1.5 shrink-0" />
                                   <p className="text-xs font-light text-[#cfc7b4] leading-relaxed italic">"{s}"</p>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button 
                          variant="ghost" 
                          onClick={() => { setQuickAtsResult(null); setQuickAtsJd(""); }}
                          className="flex-1 h-12 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5"
                        >
                          New Audit
                        </Button>
                        <Button 
                          onClick={() => handleEdit(quickAtsResume)}
                          className="flex-1 h-12 bg-[#c9a24d] text-black hover:bg-[#f7f2e6] rounded-xl text-[10px] font-bold uppercase tracking-widest"
                        >
                          Refine Blueprint
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          <div className="editor-view">
            <header className="flex items-center justify-between mb-12">
              <Button onClick={() => setView('list')} variant="ghost" className="text-[#8a723a] hover:text-[#c9a24d] gap-2 font-mono text-[10px] uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Archive
              </Button>
              <div className="flex items-center gap-4">
                {isSaving && <span className="text-[9px] font-mono uppercase text-[#8a723a] animate-pulse">Syncing...</span>}
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
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Step 1 of 5</p>
                          <h3 className="font-disp text-3xl font-medium">Choose Your Design</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Pick a resume layout before you add your details. Four house styles — each a genuinely different structure, not just a different colour.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {TEMPLATES.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => setData({...data, theme: t.id})}
                              className={cn(
                                "p-6 border transition-all cursor-pointer bg-[#1c1814] group",
                                data.theme === t.id ? "border-[#c9a24d] ring-1 ring-[#c9a24d]" : "border-[#332c22] hover:border-[#8a723a]"
                              )}
                            >
                              <div className="h-[100px] bg-white mb-4 relative overflow-hidden">
                                <CutThumbnail template={t} />
                              </div>
                              <h4 className="font-disp text-sm text-[#f7f2e6]">{t.name}</h4>
                              <p className="text-[9px] font-mono text-[#8a723a] uppercase mt-1">{t.tag}</p>
                            </div>
                          ))}
                        </div>

                        <Button onClick={() => setCurrentStep(2)} className="w-full h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] transition-colors rounded-none font-mono text-[11px] uppercase tracking-[0.2em]">Continue to Your Details →</Button>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Step 2 of 5</p>
                          <h3 className="font-disp text-3xl font-medium">Your Details</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Let's start with the basics — your name, contact info, and a short summary.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Full Name</Label>
                            <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="eg:- Ananya Birla" className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Target Role</Label>
                            <Input value={data.role} onChange={e => setData({...data, role: e.target.value})} placeholder="eg:- Data Analyst" className="atelier-input" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Email</Label>
                            <Input value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="eg:- ananya@email.com" className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Phone</Label>
                            <Input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} placeholder="eg:- +91 90000 00000" className="atelier-input" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-mono uppercase text-[#8a723a]">City</Label>
                            <Input value={data.loc} onChange={e => setData({...data, loc: e.target.value})} placeholder="eg:- Pune, IN" className="atelier-input" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Professional Summary</Label>
                          <Textarea value={data.summary} onChange={e => setData({...data, summary: e.target.value})} placeholder="eg:- Data analyst with 3+ years turning raw data into dashboards leadership actually uses." className="atelier-textarea" rows={4} />
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1 h-14 border-[#332c22] text-[#cfc7b4] rounded-none font-mono text-[11px] uppercase tracking-widest">← Back</Button>
                          <Button onClick={() => setCurrentStep(3)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] rounded-none font-mono text-[11px] uppercase tracking-widest">Continue to Experience →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Step 3 of 5</p>
                          <h3 className="font-disp text-3xl font-medium">Your Experience</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Add your work experience and projects in a format ATS systems can scan cleanly.</p>
                        </div>
                        
                        <div className="space-y-6">
                          {data.experience.map((exp, i) => (
                            <div key={i} className="p-6 border border-[#332c22] bg-[#1c1814] relative group">
                              {data.experience.length > 1 && (
                                <button onClick={() => {
                                  const n = [...data.experience]; n.splice(i, 1); setData({...data, experience: n});
                                }} className="absolute top-4 right-4 text-[#cfc7b4]/40 hover:text-[#7a2531]"><Trash2 className="w-4 h-4" /></button>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Company</Label>
                                  <input value={exp.company} placeholder="eg:- Vaultly Fintech" onChange={e => {
                                    const n = [...data.experience]; n[i].company = e.target.value; setData({...data, experience: n});
                                  }} className="ghost-input" />
                                </div>
                                <div>
                                  <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Title</Label>
                                  <input value={exp.role} placeholder="eg:- Data Analyst" onChange={e => {
                                    const n = [...data.experience]; n[i].role = e.target.value; setData({...data, experience: n});
                                  }} className="ghost-input" />
                                </div>
                              </div>
                              <div className="mt-4">
                                <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Dates</Label>
                                <input value={exp.dates} placeholder="eg:- 2023–Present" onChange={e => {
                                  const n = [...data.experience]; n[i].dates = e.target.value; setData({...data, experience: n});
                                }} className="ghost-input" />
                              </div>
                              <div className="mt-4">
                                <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Bullet Points (one per line)</Label>
                                <textarea value={exp.bullets} placeholder="eg:- Built dashboards that cut reporting time by 40%" onChange={e => {
                                  const n = [...data.experience]; n[i].bullets = e.target.value; setData({...data, experience: n});
                                }} className="ghost-textarea" rows={3} />
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setData({...data, experience: [...data.experience, {company:"",role:"",dates:"",bullets:""}]})} className="w-full py-4 border border-dashed border-[#332c22] text-[#8a723a] text-[10px] font-mono uppercase tracking-widest hover:border-[#c9a24d]/40">+ Add Another Position</button>
                        </div>
                        <div id="proj-list" className="space-y-6">
                           <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Projects (Optional)</Label>
                           {data.projects.map((p, i) => (
                             <div key={i} className="p-6 border border-[#332c22] bg-[#1c1814] relative group">
                               <button onClick={() => {
                                 const n = [...data.projects]; n.splice(i, 1); setData({...data, projects: n});
                               }} className="absolute top-4 right-4 text-[#cfc7b4]/40 hover:text-[#7a2531]"><Trash2 className="w-4 h-4" /></button>
                               <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Project Name</Label>
                               <input value={p.name} placeholder="eg:- Sales Dashboard Revamp" onChange={e => {
                                 const n = [...data.projects]; n[i].name = e.target.value; setData({...data, projects: n});
                               }} className="ghost-input" />
                               <div className="mt-4"><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Description</Label>
                               <textarea value={p.desc} placeholder="eg:- Rebuilt the sales dashboard, cutting report time by 40%" onChange={e => {
                                 const n = [...data.projects]; n[i].desc = e.target.value; setData({...data, projects: n});
                               }} className="ghost-textarea" rows={2} /></div>
                             </div>
                           ))}
                           <button onClick={() => setData({...data, projects: [...data.projects, {name:"",desc:""}]})} className="w-full py-4 border border-dashed border-[#332c22] text-[#8a723a] text-[10px] font-mono uppercase tracking-widest hover:border-[#c9a24d]/40">+ Add a Project</button>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1 h-14 border-[#332c22] text-[#cfc7b4] rounded-none font-mono text-[11px] uppercase tracking-widest">← Back</Button>
                          <Button onClick={() => setCurrentStep(4)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] hover:bg-[#f7f2e6] rounded-none font-mono text-[11px] uppercase tracking-widest">Continue to Skills →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Step 4 of 5</p>
                          <h3 className="font-disp text-3xl font-medium">Skills & Education</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Skills are the first thing an ATS system searches for — add yours, then your education.</p>
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
                               <Input id="skill-add" placeholder="eg:- Excel, SQL, Power BI" className="atelier-input" onKeyDown={e => {
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
                               <div key={i} className="p-4 border border-[#332c22] bg-[#1c1814] relative">
                                 {data.education.length > 1 && (
                                   <button onClick={() => {
                                     const n = [...data.education]; n.splice(i, 1); setData({...data, education: n});
                                   }} className="absolute top-4 right-4 text-[#cfc7b4]/40 hover:text-[#7a2531]"><Trash2 className="w-4 h-4" /></button>
                                 )}
                                 <Label className="text-[8px] font-mono uppercase text-[#8a723a]">Institution</Label>
                                 <input value={ed.school} placeholder="eg:- Sant Gadge Baba Amravati University" onChange={e => {
                                   const n = [...data.education]; n[i].school = e.target.value; setData({...data, education: n});
                                 }} className="ghost-input font-bold" />
                                 <div className="grid grid-cols-2 gap-4 mt-2">
                                   <div><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Degree</Label>
                                   <input value={ed.degree} placeholder="eg:- B.Tech — Computer Science" onChange={e => {
                                     const n = [...data.education]; n[i].degree = e.target.value; setData({...data, education: n});
                                   }} className="ghost-input text-xs" /></div>
                                   <div><Label className="text-[8px] font-mono uppercase text-[#8a723a]">Dates</Label>
                                   <input value={ed.dates} placeholder="eg:- 2019–2023" onChange={e => {
                                     const n = [...data.education]; n[i].dates = e.target.value; setData({...data, education: n});
                                   }} className="ghost-input text-xs text-right" /></div>
                                 </div>
                               </div>
                             ))}
                             <button onClick={() => setData({...data, education: [...data.education, {school:"",degree:"",dates:""}]})} className="w-full py-3 border border-dashed border-[#332c22] text-[9px] font-mono text-[#8a723a] uppercase">+ Add Education</button>
                           </div>
                        </div>

                        <div className="flex gap-4">
                          <Button onClick={() => setCurrentStep(3)} variant="outline" className="flex-1 h-14 border-[#332c22] rounded-none font-mono text-[11px] uppercase">← Back</Button>
                          <Button onClick={() => setCurrentStep(5)} className="flex-[2] h-14 bg-[#c9a24d] text-[#0c0b09] rounded-none font-mono text-[11px] uppercase">Continue to ATS Check →</Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div key="step5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] tracking-[0.3em] text-[#c9a24d] uppercase">Step 5 of 5</p>
                          <h3 className="font-disp text-3xl font-medium">ATS Check & Download</h3>
                          <p className="text-[#cfc7b4] text-sm font-light italic">Paste a job description below to see how well your resume matches it.</p>
                        </div>

                        <div className="space-y-4">
                           <Label className="text-[9px] font-mono uppercase text-[#8a723a]">Job Description</Label>
                           <Textarea 
                             value={jd} 
                             onChange={e => setJd(e.target.value)} 
                             placeholder="eg:- paste the job posting text here..." 
                             className="atelier-textarea" 
                             rows={6} 
                           />
                           <Button 
                             onClick={() => handleRunAts(data, jd, setAtsResult, setIsAtsLoading)} 
                             disabled={isAtsLoading || !jd.trim()}
                             className="w-full h-12 bg-transparent border border-[#c9a24d] text-[#c9a24d] hover:bg-[#c9a24d] hover:text-[#0c0b09] font-mono text-[10px] uppercase tracking-widest"
                           >
                             {isAtsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Neural Audit →"}
                           </Button>
                        </div>

                        {atsResult && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 border border-[#332c22] bg-[#1c1814] space-y-10">
                            <div className="flex items-center gap-8">
                              <div className={cn("fit-ring", isAtsLoading && "animate-pulse")} style={{ '--pct': `${atsResult.score}%` } as any}>
                                <div className="fit-ring-inner">{atsResult.score}%</div>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-[#8a723a] uppercase tracking-widest">Neural Verdict</p>
                                <h4 className="font-disp text-2xl text-[#f7f2e6]">{atsResult.verdict}</h4>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                               <div className="space-y-6">
                                 <div className="space-y-3">
                                   <p className="text-[9px] font-mono uppercase text-green-400/60 tracking-widest">Matched Keywords</p>
                                   <div className="flex flex-wrap gap-2">
                                     {atsResult.matchedKeywords?.length > 0 ? atsResult.matchedKeywords.map((w: string) => <span key={w} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] border border-green-500/20">{w}</span>) : <span className="text-[10px] text-[#cfc7b4]/40 italic">No matches detected</span>}
                                   </div>
                                 </div>
                                 <div className="space-y-3">
                                   <p className="text-[9px] font-mono uppercase text-red-400/60 tracking-widest">Critical Gaps</p>
                                   <div className="flex flex-wrap gap-2">
                                     {atsResult.missingKeywords?.length > 0 ? atsResult.missingKeywords.map((w: string) => <span key={w} className="px-3 py-1 bg-[#7a2531]/20 text-red-300 text-[10px] border border-[#7a2531]/40">{w}</span>) : <span className="text-[10px] text-[#cfc7b4]/40 italic">All nodes covered</span>}
                                   </div>
                                 </div>
                               </div>

                               <div className="space-y-6">
                                 <p className="text-[9px] font-mono uppercase text-[#c9a24d] tracking-widest">Strategic Recommendations</p>
                                 <div className="space-y-4">
                                   {atsResult.suggestions?.map((s: string, i: number) => (
                                     <div key={i} className="flex gap-4 items-start group">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#c9a24d] mt-1.5 shrink-0" />
                                       <p className="text-xs font-light text-[#cfc7b4] leading-relaxed italic">"{s}"</p>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button onClick={() => setCurrentStep(4)} variant="outline" className="flex-1 h-14 border-[#332c22] rounded-none font-mono text-[11px] uppercase">← Back</Button>
                          <Button onClick={() => window.print()} className="flex-[2] h-14 bg-[#7a2531] text-white hover:bg-red-800 rounded-none font-mono text-[11px] uppercase tracking-widest shadow-xl">Download PDF →</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              <div className="preview-side sticky top-[100px]">
                <div className="flex justify-between items-end mb-4 px-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8a723a]">Live Preview</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#c9a24d]">{TEMPLATES.find(t=>t.id===data.theme)?.name.toUpperCase()}</span>
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
    </div>
  );
}

/* ---------- PREVIEW RENDERER ---------- */
function ResumePreview({ data, theme }: { data: ResumeData, theme: string }) {
  const t = TEMPLATES.find(x => x.id === theme) || TEMPLATES[0];
  const accent = t.accent;
  const vars = { '--c-accent': accent } as React.CSSProperties;
  const variant = t.variant || '';

  const bulletsHtml = (str: string) => {
    return (str || '').split('\n').filter(x => x.trim()).map((b, i) => (
      <div key={i} className="doc-bul">— {b}</div>
    ));
  };

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts.map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  };

  const contactRows = (cls: string) => (
    <>
      {data.email && <div className={cls}><span className="doc-ic">✉</span>{data.email}</div>}
      {data.phone && <div className={cls}><span className="doc-ic">☎</span>{data.phone}</div>}
      {data.loc && <div className={cls}><span className="doc-ic">📍</span>{data.loc}</div>}
    </>
  );

  const contactInline = () => {
    const items = [data.email, data.phone, data.loc].filter(Boolean);
    return items.map((v, i) => (
      <span key={i}>
        {v}{i < items.length - 1 && <span className="doc-dot">•</span>}
      </span>
    ));
  };

  const expItems = () => data.experience.map((e, i) => (
    <div key={i} className="doc-job">
      <div className="doc-jobhead"><span>{e.role || 'Title'}{e.company ? `, ${e.company}` : ''}</span><span>{e.dates}</span></div>
      {bulletsHtml(e.bullets || '')}
    </div>
  ));

  const projItems = () => data.projects.map((p, i) => (
    <div key={i} className="doc-job">
      <div className="doc-jobhead"><span>{p.name || 'Project Name'}</span></div>
      <div className="doc-bul" style={{ marginLeft: 0 }}>{p.desc}</div>
    </div>
  ));

  const eduItems = () => data.education.map((ed, i) => (
    <div key={i} className="doc-jobhead" style={{ marginBottom: '8px' }}>
      <span>{ed.degree}{ed.degree && ed.school ? ', ' : ''}{ed.school}</span><span>{ed.dates}</span>
    </div>
  ));

  const eduSideItems = () => data.education.map((ed, i) => (
    <div key={i} className="doc-sideline"><b>{ed.degree}</b><br />{ed.school}<br />{ed.dates}</div>
  ));

  const skillsItems = (cls?: string) => data.skills.map((s, i) => (
    <span key={i} className={cls || 'doc-pill'}>{s}</span>
  ));

  const timelineItems = () => {
    const items = [
      ...data.experience.map(e => ({ head: `${e.role || 'Title'}${e.company ? ', ' + e.company : ''}`, dates: e.dates, bullets: e.bullets })),
      ...data.education.map(ed => ({ head: `${ed.degree}${ed.degree && ed.school ? ', ' + ed.school : ''}`, dates: ed.dates, bullets: '' })),
    ];
    return items.map((it, i) => (
      <div key={i} className="doc-tl-item">
        <div className="doc-jobhead"><span>{it.head}</span><span>{it.dates}</span></div>
        {bulletsHtml(it.bullets || "")}
      </div>
    ));
  };

  const headerBasic = (
    <div className="mb-6">
      <div className="doc-name">{data.name || 'Your Name'}</div>
      <div className="doc-role-badge">{data.role || 'Target Role'}</div>
      <div className="doc-contact doc-contact-inline">{contactInline()}</div>
      {data.summary && <div className="doc-summary">{data.summary}</div>}
    </div>
  );

  const headerAvatar = (
    <div className="mb-6">
      <div className="doc-header-row">
        <div className="doc-avatar">{getInitials(data.name)}</div>
        <div>
          <div className="doc-name">{data.name || 'Your Name'}</div>
          <div className="doc-role-badge">{data.role || 'Target Role'}</div>
        </div>
      </div>
      <div className="doc-contact doc-contact-inline">{contactInline()}</div>
      {data.summary && <div className="doc-summary">{data.summary}</div>}
    </div>
  );

  const renderShell = () => {
    switch (t.family) {
      case 'sidebar-l':
        return (
          <div className="shell-sidebar-l">
            <div className="doc-side-dark">
              <div className="doc-avatar doc-avatar-lg">{getInitials(data.name)}</div>
              <div className="doc-name" style={{ color: '#fff', fontSize: '19px', textAlign: 'center' }}>{data.name || 'Your Name'}</div>
              <div className="doc-role-badge" style={{ margin: '6px auto 0', display: 'block', textAlign: 'center' }}>{data.role || 'Target Role'}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Contact</div>{contactRows('doc-sideline-ic')}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Skills</div>{skillsItems('doc-sidepill')}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Education</div>{eduSideItems()}</div>
            </div>
            <div className="doc-main">
              {data.summary && <div className="doc-sec" style={{ marginTop: 0 }}><div className="doc-sectitle">Summary</div><div className="doc-summary" style={{ marginTop: 0 }}>{data.summary}</div></div>}
              <div className="doc-sec"><div className="doc-sectitle">Experience</div>{expItems()}</div>
              {data.projects.length > 0 && <div className="doc-sec"><div className="doc-sectitle">Projects</div>{projItems()}</div>}
            </div>
          </div>
        );
      case 'sidebar-r':
        return (
          <div className="shell-sidebar-r">
            <div className="doc-main">
              {headerBasic}
              <div className="doc-sec"><div className="doc-sectitle">Experience</div>{expItems()}</div>
              {data.projects.length > 0 && <div className="doc-sec"><div className="doc-sectitle">Projects</div>{projItems()}</div>}
            </div>
            <div className="doc-side-light">
              <div className="doc-avatar doc-avatar-lg" style={{ margin: '0 auto 14px' }}>{getInitials(data.name)}</div>
              <div className="doc-sec" style={{ marginTop: 0 }}><div className="doc-sidetitle">Skills</div>{skillsItems('doc-sidepill')}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Education</div>{eduSideItems()}</div>
            </div>
          </div>
        );
      case 'band':
        return (
          <div className="shell-band">
            <div className="doc-band">
              <div className="doc-avatar doc-avatar-band">{getInitials(data.name)}</div>
              <div>
                <div className="doc-name">{data.name || 'Your Name'}</div>
                <div className="doc-role-badge doc-role-badge-inv">{data.role || 'Target Role'}</div>
                <div className="doc-contact doc-contact-inline" style={{ color: '#c9c2b0' }}>{contactInline()}</div>
              </div>
            </div>
            <div className="doc-body">
              <div>
                {data.summary && <div className="doc-sec" style={{ marginTop: 0 }}><div className="doc-sectitle">Summary</div><div className="doc-summary" style={{ marginTop: 0 }}>{data.summary}</div></div>}
                <div className="doc-sec"><div className="doc-sectitle">Experience</div>{expItems()}</div>
              </div>
              <div>
                <div className="doc-sec" style={{ marginTop: 0 }}><div className="doc-sectitle">Skills</div>{skillsItems()}</div>
                <div className="doc-sec"><div className="doc-sectitle">Education</div>{eduItems()}</div>
                {data.projects.length > 0 && <div className="doc-sec"><div className="doc-sectitle">Projects</div>{projItems()}</div>}
              </div>
            </div>
          </div>
        );
      case 'timeline':
        return (
          <div className="shell-timeline">
            {variant === 'v-avatar' ? headerAvatar : headerBasic}
            <div className="doc-sectitle" style={{ marginTop: '20px' }}>Experience & Education</div>
            <div className="doc-tl">{timelineItems()}</div>
            <div className="doc-sec"><div className="doc-sectitle">Skills</div>{skillsItems()}</div>
          </div>
        );
      case 'twocol':
        return (
          <div className="shell-twocol">
            <div className="doc-side-light">
              <div className="doc-avatar doc-avatar-lg" style={{ margin: '0 auto 12px' }}>{getInitials(data.name)}</div>
              <div className="doc-name" style={{ fontSize: '19px', textAlign: 'center' }}>{data.name || 'Your Name'}</div>
              <div className="doc-role-badge" style={{ margin: '6px auto 0', display: 'block', textAlign: 'center' }}>{data.role || 'Target Role'}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Contact</div>{contactRows('doc-sideline-ic')}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Skills</div>{skillsItems('doc-sidepill')}</div>
              <div className="doc-sec"><div className="doc-sidetitle">Education</div>{eduSideItems()}</div>
            </div>
            <div className="doc-main">
              {data.summary && <div className="doc-sec" style={{ marginTop: 0 }}><div className="doc-sectitle">Summary</div><div className="doc-summary" style={{ marginTop: 0 }}>{data.summary}</div></div>}
              <div className="doc-sec"><div className="doc-sectitle">Experience</div>{expItems()}</div>
              {data.projects.length > 0 && <div className="doc-sec"><div className="doc-sectitle">Projects</div>{projItems()}</div>}
            </div>
          </div>
        );
      default:
        return (
          <div className={cn("shell-single", variant)}>
            {variant === 'v-avatar' ? headerAvatar : headerBasic}
            {variant === 'v-tagcloud' && <div className="doc-sec" style={{ marginTop: '12px' }}>{skillsItems()}</div>}
            <div className="doc-sec"><div className="doc-sectitle">Experience</div>{expItems()}</div>
            {data.projects.length > 0 && <div className="doc-sec"><div className="doc-sectitle">Projects</div>{projItems()}</div>}
            <div className="doc-sec"><div className="doc-sectitle">Education</div>{eduItems()}</div>
            {variant !== 'v-tagcloud' && <div className="doc-sec"><div className="doc-sectitle">Skills</div>{skillsItems()}</div>}
          </div>
        );
    }
  };

  return (
    <div className="resume-content" style={vars}>
      {renderShell()}
    </div>
  );
}
