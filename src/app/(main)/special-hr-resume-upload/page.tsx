"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Crown,
  Cpu,
  Briefcase,
  Lock,
  Clock,
  Mic,
  Target,
  UserCircle,
  BarChart3,
  Award,
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { COMPANIES, ROLES, EXPERIENCE_LEVELS } from '@/lib/interview-options';

const serif = Playfair_Display({ subsets: ['latin'], weight: ['500', '600'] });

const MAX_SIZE = 10 * 1024 * 1024;

const STEPS = ['Target role', 'Upload resume', 'Live HR interview'];

const BENEFITS = [
  { icon: Target, title: 'Questions from your resume', text: 'Asked about your own projects, skills and gaps.' },
  { icon: UserCircle, title: 'A realistic AI interviewer', text: 'Natural voice, live follow-ups, real pressure.' },
  { icon: BarChart3, title: 'Detailed feedback report', text: 'Communication, confidence and depth, scored.' },
  { icon: Award, title: 'Premium certificate', text: 'Add your result to LinkedIn.' },
];

const labelClass = "text-xs font-medium uppercase tracking-[0.22em] text-amber-300";
const triggerClass =
  "h-14 rounded-xl border border-amber-400/30 bg-[#0d0d13] px-4 text-base font-medium text-[#f4f1ea] transition-colors hover:border-amber-300 focus:ring-amber-400/30";
const contentClass = "border-white/10 bg-[#0b0e1a] text-white";

export default function SpecialHRResumeUpload() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");

  const [file, setFile] = useState<File | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  // Pre-fill from the last setup, so the user doesn't re-pick everything
  useEffect(() => {
    if (!journey) return;
    if (journey.company) setCompany(journey.company);
    if (journey.role) setRole(journey.role);
    if (journey.experience) setExperience(journey.experience);
  }, [journey]);

  const activeSteps = isAnalyzing ? 3 : isUploaded ? 2 : 1;
  const busy = isReading || isAnalyzing;

  const processFile = async (selected: File) => {
    if (selected.type !== 'application/pdf') {
      toast({ variant: "destructive", title: "Format Error", description: "Only PDF resumes are supported." });
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
      return;
    }

    setFile(selected);
    setIsReading(true);

    const base64 = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(selected);
    });

    setResumeBase64(base64);
    setTimeout(() => {
      setIsUploaded(true);
      setIsReading(false);
      toast({ title: "Resume Uploaded", description: "Check your target role, then begin the interview." });
    }, 800);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (busy || isUploaded) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const resetFile = () => {
    setIsUploaded(false);
    setFile(null);
    setResumeBase64(null);
  };

  const handleStart = async () => {
    if (!file || !resumeBase64 || !user || !db || !journeyRef || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // Access-control gate: Special HR never has a free quota
      const accessRes = await fetch('/api/usage/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, feature: 'specialHR' }),
      });
      const accessData = await accessRes.json();
      if (!accessData.allowed) {
        toast({ variant: "destructive", title: "Upgrade Required", description: "Special HR Interview requires a credit or subscription." });
        router.push('/pricing');
        return;
      }

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeDataUri: resumeBase64,
          targetRole: role,
          experienceLevel: experience,
          targetCompany: company,
        }),
      });

      if (!response.ok) throw new Error("Resume analysis failed.");
      const analysisResult = await response.json();

      await setDoc(journeyRef, {
        specialHRResumeName: file.name,
        specialHRResumeBase64: resumeBase64,
        specialHRResumeAnalysis: JSON.parse(JSON.stringify(analysisResult)),
        specialHRCompany: company,
        specialHRRole: role,
        specialHRExperience: experience,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      router.push('/special-hr-interview');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "We couldn't read this resume. Try a different PDF.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070b] text-[#f4f1ea]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-amber-400/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[480px] w-[520px] rounded-full bg-orange-500/10 blur-[130px]" />

      <main className="relative z-10 mx-auto w-full max-w-[1180px] px-6 pb-20 pt-28">
        <header className="text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2">
            <Crown className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-amber-300">Premium · Special HR Interview</span>
          </div>
          <h1 className={cn(serif.className, "mt-7 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl")}>
            Your toughest interview,
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              rehearsed before it counts.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-[#b4aea0]">
            Pick your dream company and role, upload your resume, and face a lifelike AI HR who interviews you on your own profile.
          </p>
        </header>

        <ol className="my-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm">
          {STEPS.map((label, i) => {
            const active = i < activeSteps;
            return (
              <li key={label} className="flex items-center gap-4">
                <span className={cn("flex items-center gap-2.5", active ? "text-amber-300" : "text-stone-400")}>
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      active ? "bg-amber-400 text-[#1a1204]" : "border border-stone-600"
                    )}
                  >
                    {i + 1}
                  </span>
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className={cn("hidden h-px w-14 sm:block", i + 1 < activeSteps ? "bg-amber-500/60" : "bg-stone-700")} />}
              </li>
            );
          })}
        </ol>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Target role */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-9">
            <div className="space-y-2">
              <Label className={labelClass}>Company</Label>
              <Select value={company} onValueChange={setCompany} disabled={isAnalyzing}>
                <SelectTrigger className={triggerClass}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-sm font-semibold text-amber-300">
                      {company.charAt(0)}
                    </span>
                    <SelectValue placeholder="Select company" />
                  </div>
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {COMPANIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <SelectItemText>{c}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 space-y-2">
              <Label className={labelClass}>Job role</Label>
              <Select value={role} onValueChange={setRole} disabled={isAnalyzing}>
                <SelectTrigger className={triggerClass}>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-amber-300" />
                    <SelectValue placeholder="Select job role" />
                  </div>
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <SelectItemText>{r}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 space-y-3">
              <Label className={labelClass}>Experience level</Label>
              <div className="flex flex-wrap gap-2.5">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setExperience(l)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-sm transition-colors",
                      experience === l
                        ? "border-amber-400 bg-amber-400 font-semibold text-[#1a1204]"
                        : "border-stone-700 text-stone-400 hover:border-amber-300 hover:text-amber-200"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Resume upload */}
          <section
            onClick={() => !busy && !isUploaded && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!busy && !isUploaded) setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed p-8 text-center transition-all duration-300",
              "bg-[radial-gradient(420px_300px_at_50%_40%,rgba(245,196,81,0.12),transparent_75%)] shadow-[0_0_60px_rgba(245,196,81,0.10),0_30px_80px_rgba(0,0,0,0.5)]",
              isUploaded ? "border-amber-400/70" : "cursor-pointer border-amber-600/70 hover:border-amber-300",
              isDragging && "border-amber-300 bg-amber-400/5"
            )}
          >
            <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-amber-400" />
            <span className="pointer-events-none absolute right-4 top-4 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-amber-400" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-amber-400" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-amber-400" />

            <input ref={inputRef} type="file" className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="relative mx-auto h-24 w-24">
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-amber-400/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-r-2 border-amber-400" style={{ animationDuration: '2500ms' }} />
                    <div className="absolute inset-5 flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
                      <Cpu className="h-8 w-8 animate-pulse text-amber-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={cn(serif.className, "text-2xl")}>Reading your resume</p>
                    <p className="text-sm text-[#b4aea0]">Preparing questions for {role} at {company}…</p>
                  </div>
                </motion.div>
              ) : isReading ? (
                <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
                  <p className="text-sm text-[#b4aea0]">Checking your PDF…</p>
                </motion.div>
              ) : !isUploaded ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-600/70 bg-amber-400/10 shadow-[0_0_40px_rgba(245,196,81,0.25)]">
                    <Upload className="h-9 w-9 text-amber-300" />
                  </div>
                  <h2 className={cn(serif.className, "mt-6 text-3xl")}>Drop your resume here</h2>
                  <p className="mt-2 text-[15px] text-[#b4aea0]">PDF only · Max 10MB · Stays private</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="mt-6 h-12 rounded-xl border-amber-400 bg-transparent px-8 text-[15px] font-semibold text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
                  >
                    Choose PDF
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 shadow-[0_0_40px_rgba(245,196,81,0.25)]">
                    <CheckCircle2 className="h-10 w-10 text-amber-300" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Resume ready</p>
                    <div className="mx-auto flex max-w-[360px] items-center justify-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-stone-400" />
                      <p className="truncate text-lg font-medium">{file?.name}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); resetFile(); }}
                    className="h-10 rounded-xl border border-stone-700 px-5 text-sm text-stone-300 hover:border-amber-300 hover:bg-transparent hover:text-amber-200"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Replace resume
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Summary + start */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-5">
          <p className="text-sm text-[#b4aea0]">
            Interview for <span className="font-medium text-amber-200">{role}</span> at{' '}
            <span className="font-medium text-amber-200">{company}</span>
            <span className="text-stone-500"> · </span>
            <span className="font-medium text-amber-200">{experience}</span>
          </p>
          <Button
            type="button"
            onClick={handleStart}
            disabled={!isUploaded || isAnalyzing}
            className="h-14 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-9 text-base font-semibold text-[#1a1204] shadow-[0_10px_40px_rgba(245,196,81,0.35)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
          >
            {isUploaded ? 'Begin special HR interview' : 'Upload your resume to begin'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Benefits */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-amber-700/60">
              <Icon className="h-5 w-5 text-amber-300" />
              <h3 className="mt-4 text-[17px] font-medium">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-stone-400">
          <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-amber-300" />Resume stays private</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-300" />About 20 minutes</span>
          <span className="flex items-center gap-2"><Mic className="h-4 w-4 text-amber-300" />Mic and camera needed</span>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" />Encrypted and processed by AI only</span>
        </div>
      </main>
    </div>
  );
}
