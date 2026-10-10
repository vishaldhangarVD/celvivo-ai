'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Copy, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type Inst = {
  id: string; name: string; code: string; studentLimit: number | null; active: boolean;
  students: number; tpos: { uid: string; name: string; email: string }[];
};
type Api = (path: string, init?: RequestInit) => Promise<any>;

function InstituteCard({ inst, api, onChanged }: { inst: Inst; api: Api; onChanged: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const link = `${base}/signup?inst=${inst.code}`;

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: label });
  };

  const assign = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const j = await api('/api/founder/institutes/assign-tpo', {
        method: 'POST',
        body: JSON.stringify({ instituteId: inst.id, email }),
      });
      toast({ title: 'TPO assigned', description: `${j.name} can now open /institute.` });
      setEmail('');
      onChanged();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not assign TPO', description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass border-white/10 bg-white/[0.02] p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{inst.name}</h3>
          <p className="text-xs text-white/50 mt-1">
            {inst.students}{inst.studentLimit ? ` / ${inst.studentLimit}` : ''} students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm px-3 py-1 rounded-lg border border-accent/40 text-accent tracking-widest">
            {inst.code}
          </span>
          <Link href={`/institute?instituteId=${inst.id}`} target="_blank"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
            Open dashboard <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student signup link</Label>
        <div className="flex gap-2">
          <Input readOnly value={link} className="h-11 bg-transparent border-white/10 text-white/80 text-xs" />
          <Button variant="outline" className="h-11 border-white/10" onClick={() => copy(link, 'Signup link copied')}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TPO</Label>
        {inst.tpos.length === 0 ? (
          <p className="text-sm text-white/40">No TPO assigned yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {inst.tpos.map((t) => (
              <li key={t.uid}>{t.name || 'TPO'} <span className="text-white/40">· {t.email}</span></li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 pt-1">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="TPO's email (they must have signed up)"
            className="h-11 bg-transparent border-white/10 text-white text-sm"
          />
          <Button onClick={assign} disabled={busy || !email.trim()} className="h-11 btn-premium text-xs font-bold uppercase tracking-widest">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Make TPO'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function FounderInstitutesPage() {
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [list, setList] = useState<Inst[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('500');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const api: Api = useCallback(async (path, init) => {
    const token = await user!.getIdToken();
    const res = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(res.status === 403 ? 'forbidden' : json.error || 'Request failed');
    return json;
  }, [user]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const j = await api('/api/founder/institutes');
      setList(j.institutes);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [user, api]);

  useEffect(() => {
    if (!loading && user) load();
  }, [loading, user, load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const j = await api('/api/founder/institutes', {
        method: 'POST',
        body: JSON.stringify({ name, studentLimit: Number(limit) || 0, code }),
      });
      toast({ title: 'Institute created', description: `Code: ${j.code}` });
      setName(''); setCode('');
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not create institute', description: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (error === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-8 text-center">
        <p className="text-xl">This page is for founders only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link href="/founder" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Founder Console
          </Link>
          <h1 className="text-4xl font-bold tracking-tighter mt-4">Institutes</h1>
          <p className="text-white/50 mt-2">Create a college, give its TPO access, and share the student signup link.</p>
        </div>

        <Card className="glass border-white/10 bg-white/[0.02] p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/60">New institute</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">College / institute name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sample College of Engineering"
                     className="h-12 bg-transparent border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student limit</Label>
              <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                     className="h-12 bg-transparent border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code (optional)</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Auto-generated"
                     className="h-12 bg-transparent border-white/10 text-white uppercase" />
            </div>
            <div className="flex items-end">
              <Button onClick={create} disabled={busy || !name.trim()} className="w-full h-12 btn-premium text-xs font-bold uppercase tracking-widest">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create institute'}
              </Button>
            </div>
          </div>
        </Card>

        {error && error !== 'forbidden' && <p className="text-red-400 text-sm">{error}</p>}

        {!list && !error ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : (
          <div className="space-y-6">
            {list?.length === 0 && <p className="text-white/40">No institutes yet.</p>}
            {list?.map((inst) => <InstituteCard key={inst.id} inst={inst} api={api} onChanged={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}
