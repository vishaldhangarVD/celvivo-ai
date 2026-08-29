"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import {
  ShieldCheck, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Sparkles, Mic, MessageSquare, Target, Award, Brain, ArrowRight, Loader2
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

const bg = "#07040f";
const primary = "#818cf8";
const secondary = "#fbbf24";
const green = "#34d399";
const weak = "#fb7185";
const glassBg = "rgba(255,255,255,0.03)";
const glassBorder = "rgba(255,255,255,0.1)";

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ScoreGauge({ score }: { score: number }) {
  const animated = useCountUp(score);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const bracket = { position: "absolute" as const, width: 24, height: 24, borderColor: `${primary}66` };

  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle, ${primary}33, ${secondary}22 70%, transparent 100%)`,
        filter: "blur(30px)"
      }} />
      <svg viewBox="0 0 220 220" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="110" cy="110" r={radius} fill="none"
          stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
        <span style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{animated}</span>
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Composite Score</span>
      </div>
      <div style={{ ...bracket, top: -10, left: -10, borderTop: "2px solid", borderLeft: "2px solid", borderTopLeftRadius: 12 }} />
      <div style={{ ...bracket, top: -10, right: -10, borderTop: "2px solid", borderRight: "2px solid", borderTopRightRadius: 12 }} />
      <div style={{ ...bracket, bottom: -10, left: -10, borderBottom: "2px solid", borderLeft: "2px solid", borderBottomLeftRadius: 12 }} />
      <div style={{ ...bracket, bottom: -10, right: -10, borderBottom: "2px solid", borderRight: "2px solid", borderBottomRightRadius: 12 }} />
    </div>
  );
}

function TranscriptCard({ item }: { item: { stage: string; question: string; answer: string; note: string; tag: "strong" | "weak" } }) {
  const [open, setOpen] = useState(false);
  const isStrong = item.tag === "strong";
  const tone = isStrong ? green : weak;

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${glassBorder}`, background: glassBg, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 16, padding: 20,
          textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: "inherit"
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, background: `${tone}1a`, color: tone
        }}>
          {isStrong ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{
              fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em",
              color: `${secondary}cc`, border: `1px solid ${secondary}33`, borderRadius: 999, padding: "2px 8px"
            }}>{item.stage}</span>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.question}</p>
        </div>
        {open ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ display: "flex", gap: 12, paddingTop: 16 }}>
            <MessageSquare size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>"{item.answer}"</p>
          </div>
          <div style={{ display: "flex", gap: 12, borderRadius: 12, padding: 12, marginTop: 12, background: `${tone}0d`, border: `1px solid ${tone}22` }}>
            <Sparkles size={16} color={tone} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 300, margin: 0 }}>{item.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpecialHRInterviewResult() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: isLoading } = useDoc(journeyRef);
  const result = (journey as any)?.specialHRResult;
  const candidateName = (journey as any)?.specialHRResumeAnalysis?.personalInfo?.fullName || user?.displayName || "Candidate";

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color={primary} size={40} />
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, textAlign: "center" }}>
        <ShieldCheck color="rgba(255,255,255,0.2)" size={48} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, maxWidth: 360 }}>
          No completed Special HR interview result found yet. Complete an interview first to see your report here.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            height: 48, padding: "0 28px", borderRadius: 14, background: `linear-gradient(90deg, ${primary}, ${secondary})`,
            border: "none", color: bg, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer"
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { overallScore, verdict, categoryScores, strengths, improvements, annotatedTranscript } = result;

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: bg, color: "#fff", position: "relative", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ position: "absolute", top: 0, left: "30%", width: 500, height: 500, background: `${secondary}14`, borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "20%", width: 400, height: 400, background: `${primary}1a`, borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 20px", borderRadius: 999,
            background: glassBg, border: `1px solid ${secondary}4d`, boxShadow: `0 0 20px ${secondary}26`, marginBottom: 20
          }}>
            <ShieldCheck size={14} color={secondary} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#fde68a" }}>Neural Debrief · Special HR</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Session Complete, <span style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{candidateName}.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300, maxWidth: 480, margin: "0 auto", fontSize: 16 }}>
            Here's how the calibration engine read your Special HR round — resume-grounded, question by question.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 40, marginBottom: 56, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ScoreGauge score={overallScore} />
            <span style={{
              fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#c7d2fe",
              background: `${primary}1a`, border: `1px solid ${primary}33`, borderRadius: 999, padding: "6px 16px"
            }}>{verdict}</span>
          </div>

          <div style={{ borderRadius: 24, border: `1px solid ${glassBorder}`, background: glassBg, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, color: "rgba(255,255,255,0.4)" }}>
              <Target size={16} />
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Category Breakdown</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={categoryScores} outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Radar dataKey="score" stroke={primary} fill={primary} fillOpacity={0.28} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 56 }}>
          <div style={{ borderRadius: 24, border: `1px solid ${green}26`, background: `${green}08`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: green }}>
              <Award size={16} />
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>What landed well</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {strengths.map((s: string, i: number) => (
                <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 300, lineHeight: 1.6 }}>
                  <span style={{ color: green }}>·</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ borderRadius: 24, border: `1px solid ${weak}26`, background: `${weak}08`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: weak }}>
              <Brain size={16} />
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Worth sharpening</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {improvements.map((s: string, i: number) => (
                <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 300, lineHeight: 1.6 }}>
                  <span style={{ color: weak }}>·</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: "rgba(255,255,255,0.4)" }}>
            <Mic size={16} />
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Full Session Transcript · {annotatedTranscript.length} of {annotatedTranscript.length} exchanges</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {annotatedTranscript.map((item: any, i: number) => (
              <TranscriptCard key={i} item={item} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              height: 56, padding: "0 40px", borderRadius: 16, background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              border: "none", color: bg, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
              boxShadow: `0 10px 40px ${secondary}40`
            }}
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
