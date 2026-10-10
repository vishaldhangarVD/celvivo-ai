'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Barlow_Condensed, Barlow } from 'next/font/google';
import { Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';

const cond = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700'] });
const body = Barlow({ subsets: ['latin'], weight: ['400', '500'] });
const cd = `${cond.className} font-bold`;
const ACCENT = '#FF6B1A';
const MONO = "'JetBrains Mono', monospace";

type Student = {
  uid: string; name: string; email: string; lastActiveAt: number | null;
  aptitudeScore: number | null; aptitudeResult: string | null;
  coding: number | null;
  mockCount: number; mockBest: number | null;
  hrCount: number; hrScore: number | null; hrVerdict: string | null;
  certificates: number; readiness: number;
};
type Stats = {
  institute: { id: string; name: string };
  summary: { totalStudents: number; activeToday: number; active7d: number; neverActive: number; avgReadiness: number };
  students: Student[];
};

// Small label text: 11px -> 13px, colour thoda ujjval
const M = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[13px] uppercase tracking-[0.12em] text-[#A8A59C] ${className}`} style={{ fontFamily: MONO }}>
    {children}
  </span>
);

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

const ago = (ms: number | null) => {
  if (!ms) return 'Never';
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 2) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
};

const aptitudeText = (s: Student) =>
  s.aptitudeScore === null ? '—' : `${s.aptitudeScore}%${s.aptitudeResult ? ` · ${s.aptitudeResult}` : ''}`;
const codingText = (s: Student) => (s.coding === null ? '—' : `Done · ${s.coding}`);
const mockText = (s: Student) => (s.mockCount === 0 ? '—' : `${s.mockCount} · best ${s.mockBest}%`);
const hrText = (s: Student) =>
  s.hrScore !== null ? `${s.hrScore}%${s.hrVerdict ? ` · ${s.hrVerdict}` : ''}` : s.hrCount > 0 ? `${s.hrCount} done` : '—';

// Table cell: padding vadhavli
const td = 'py-5 px-3';

export default function InstitutePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const qs = typeof window !== 'undefined' ? window.location.search : '';
        const res = await fetch('/api/institute/stats' + qs, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(res.status === 403 ? 'forbidden' : json.error || 'Failed to load');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading]);

  const top = useMemo(
    () => (data ? [...data.students].filter((s) => s.readiness > 0).sort((a, b) => b.readiness - a.readiness).slice(0, 5) : []),
    [data]
  );

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const exportCsv = () => {
    if (!data) return;
    const rows = [['#', 'Name', 'Email', 'Last active', 'Aptitude', 'Coding', 'Mock interviews', 'Special HR', 'Certificates', 'Readiness score']];
    data.students.forEach((s, i) =>
      rows.push([String(i + 1), s.name, s.email, s.lastActiveAt ? new Date(s.lastActiveAt).toISOString() : '',
        aptitudeText(s), codingText(s), mockText(s), hrText(s), String(s.certificates), String(s.readiness)])
    );
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${data.institute.name}-students.csv`;
    a.click();
  };

  const copyNeverOpened = async () => {
    if (!data) return;
    const list = data.students.filter((s) => !s.lastActiveAt && s.mockCount === 0 && s.hrCount === 0 && s.aptitudeScore === null && s.coding === null).map((s) => `${s.name} <${s.email}>`).join('\n');
    await navigator.clipboard.writeText(list);
  };

  const shell = `min-h-screen bg-[#0C0C0E] text-[#F4F1EA] ${body.className}`;

  if (error) {
    return (
      <div className={`${shell} flex items-center justify-center p-8 text-center`}>
        <div>
          <p className="text-2xl">{error === 'forbidden' ? 'This page is for institute TPOs only.' : error}</p>
          <a href="/" className="mt-4 inline-block underline" style={{ color: ACCENT }}>Back to home</a>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className={`${shell} flex items-center justify-center`}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  const { institute, summary, students } = data;
  const nums = [
    { label: 'Students active today', value: summary.activeToday, accent: false },
    { label: 'Students active this week', value: summary.active7d, accent: true },
    { label: 'Total students', value: summary.totalStudents, accent: false },
    { label: 'Placement readiness (avg out of 100)', value: summary.avgReadiness, accent: false },
  ];

  return (
    <div className={shell}>
      {/* max-w-[1280px] kadhla -> aata full width, fakt thodi padding */}
      <div className="w-full max-w-[2200px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

        <header className="flex flex-wrap items-center justify-between gap-5 pb-6 border-b border-[#26262C]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/LOGO.png" alt="Celvivo AI" className="w-11 h-11 rounded-lg object-contain" />
              <span className={`${cd} text-2xl tracking-[0.16em]`}>CELVIVO AI</span>
            </div>
            <span className="text-[26px] text-[#5A5A66]">×</span>
            <div className="flex items-center gap-3">
              <div className={`${cd} w-11 h-11 rounded-full border-[1.5px] flex items-center justify-center text-base`}
                   style={{ borderColor: ACCENT, color: ACCENT }}>
                {initials(institute.name)}
              </div>
              <div>
                <div className="text-xl font-medium">{institute.name}</div>
                <M className="!text-[12px]">Training &amp; Placement Cell</M>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <M>Updated just now</M>
            <button onClick={handleLogout} className="min-h-11 px-5 rounded-lg border border-[#3A3A42] text-base hover:bg-white/5 transition-colors">Log out</button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#26262C]">
          {nums.map((n, i) => (
            <div key={n.label} className={`py-8 pr-6 ${i > 0 ? 'md:border-l md:border-[#26262C] md:pl-6' : ''} ${i === 2 ? 'max-md:border-t max-md:border-[#26262C]' : ''}`}>
              <M>{n.label}</M>
              <div className={`${cd} text-[clamp(64px,8vw,120px)] leading-[0.95] mt-3`} style={n.accent ? { color: ACCENT } : undefined}>
                {n.value}
              </div>
            </div>
          ))}
        </div>

        {top.length > 0 && (
          <section className="py-9 border-b border-[#26262C]">
            <M>Top students · readiness score</M>
            <div className="mt-4">
              {top.map((s, i) => (
                <div key={s.uid} className="grid grid-cols-[64px_1fr_90px] items-center gap-4 py-4 border-t border-[#26262C]">
                  <div className={`${cd} text-5xl`} style={{ color: i === 0 ? ACCENT : '#8A877E' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="text-2xl font-medium mb-2">{s.name}</div>
                    <div className="h-2 rounded bg-[#26262C] overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.min(100, s.readiness)}%`, background: ACCENT }} />
                    </div>
                  </div>
                  <div className={`${cd} text-5xl text-right`}>{s.readiness}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-9">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <M>All students · most recently active first</M>
            <button onClick={exportCsv} className="min-h-12 px-7 rounded-[10px] font-semibold text-base text-[#0C0C0E] hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>
              Export CSV
            </button>
          </div>
          {students.length === 0 ? (
            <p className="text-lg text-[#A8A59C]">No students have joined yet. Share your institute code with them.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-[17px]">
                <thead>
                  <tr>
                    {['#', 'Student', 'Last active', 'Aptitude', 'Coding', 'Mock interview', 'Special HR', 'Certificates', 'Readiness'].map((h) => (
                      <th key={h} className="text-left pb-4 px-3 font-medium"><M>{h}</M></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.uid} className="border-t border-[#26262C] hover:bg-white/[0.03] transition-colors">
                      <td className={`${td} text-[#A8A59C]`}>{i + 1}</td>
                      <td className={`${td} text-[19px]`}>
                        <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-[#1C1C22] border border-[#33333B] text-sm font-medium mr-3 align-middle">
                          {initials(s.name)}
                        </span>
                        {s.name}
                      </td>
                      <td className={td}>{ago(s.lastActiveAt)}</td>
                      <td className={td}>{aptitudeText(s)}</td>
                      <td className={td}>{codingText(s)}</td>
                      <td className={td}>{mockText(s)}</td>
                      <td className={td}>{hrText(s)}</td>
                      <td className={td} style={s.certificates > 0 ? { color: ACCENT, fontWeight: 500 } : undefined}>{s.certificates}</td>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          {s.readiness}
                          <div className="w-28 h-2 rounded bg-[#26262C] overflow-hidden">
                            <div className="h-full" style={{ width: `${Math.min(100, s.readiness)}%`, background: ACCENT }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {summary.neverActive > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-5 p-7 rounded-2xl bg-[#151519] border border-[#26262C]">
            <div>
              <div className={`${cd} text-[36px] leading-[1.1]`}>
                {summary.neverActive} {summary.neverActive === 1 ? 'student has' : 'students have'} not opened Celvivo yet.
              </div>
              <M className="block mt-2">Send them the invite link before the next drive</M>
            </div>
            <button onClick={copyNeverOpened} className="min-h-12 px-7 rounded-[10px] font-semibold text-base text-[#0C0C0E] hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>
              Copy reminder list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
