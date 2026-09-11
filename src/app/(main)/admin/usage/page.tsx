'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart4, 
  DollarSign, 
  Clock, 
  Cpu, 
  Mic, 
  Video, 
  TrendingUp,
  Loader2,
  Calendar,
  Filter,
  Download,
  ShieldCheck,
  AlertCircle,
  Terminal
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Usage Analytics Dashboard v4.0.
 * Calibrated for Gemini 3.6 Flash official pricing and JDoodle credit mapping.
 */

// COST PARAMETERS (USD)
const RATES = {
  GEMINI_INPUT: 0.75 / 1_000_000,
  GEMINI_OUTPUT: 3.75 / 1_000_000,
  TTS_PER_CHAR: 16 / 1_000_000, 
  DID_PER_MINUTE: 0.55, 
  JDOODLE_PER_CREDIT: 0.01,
};

// Feature Display Name Mapper
const FEATURE_MAP: Record<string, string> = {
  'special_interview': 'Special HR Interview',
  'ai_interview': 'AI Virtual Arena',
  'coding_round': 'Coding Assessment',
  'aptitude_generation': 'Aptitude Questioning',
  'aptitude_evaluation': 'Aptitude Auditing',
  'jdoodle_execution': 'Code Execution (JDoodle)',
  'resume_analysis': 'Resume Intelligence',
  'resume_ats_check': 'ATS Compatibility Check'
};

export default function UsageAnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [days, setDays] = useState(30);

  const usageQuery = useMemo(() => {
    if (!db) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return query(
      collection(db, 'usage_logs'),
      where('timestamp', '>=', Timestamp.fromDate(cutoff)),
      orderBy('timestamp', 'desc')
    );
  }, [db, days]);

  const { data: logs, loading, error } = useCollection(usageQuery);

  const stats = useMemo(() => {
    if (!logs) return null;

    const summary: any = {
      totalCost: 0,
      geminiInput: 0,
      geminiOutput: 0,
      ttsChars: 0,
      didMinutes: 0,
      jdoodleCredits: 0,
      jdoodleCost: 0,
      features: {},
      sessions: new Set(),
    };

    logs.forEach((log: any) => {
      const f = log.feature || 'unknown';
      const provider = log.provider || 'unknown';

      if (!summary.features[f]) {
        summary.features[f] = { input: 0, output: 0, chars: 0, didSecs: 0, credits: 0, cost: 0, count: 0 };
      }

      if (log.sessionId) summary.sessions.add(log.sessionId);

      let logCost = 0;
      
      const input = log.inputTokens || log.promptTokenCount || 0;
      const output = log.outputTokens || log.candidatesTokenCount || 0;

      if (input) {
        summary.geminiInput += input;
        summary.features[f].input += input;
        logCost += (input * RATES.GEMINI_INPUT);
      }
      if (output) {
        summary.geminiOutput += output;
        summary.features[f].output += output;
        logCost += (output * RATES.GEMINI_OUTPUT);
      }

      if (log.characterCount) {
        summary.ttsChars += log.characterCount;
        summary.features[f].chars += log.characterCount;
        if (provider !== 'gemini') {
          logCost += (log.characterCount * RATES.TTS_PER_CHAR);
        }
      }

      if (log.videoDurationSeconds) {
        const mins = log.videoDurationSeconds / 60;
        summary.didMinutes += mins;
        summary.features[f].didSecs += log.videoDurationSeconds;
        logCost += (mins * RATES.DID_PER_MINUTE);
      }

      if (log.creditsUsed) {
        const count = Number(log.creditsUsed);
        summary.jdoodleCredits += count;
        summary.features[f].credits += count;
        const jCost = (count * RATES.JDOODLE_PER_CREDIT);
        summary.jdoodleCost += jCost;
        logCost += jCost;
      }

      summary.totalCost += logCost;
      summary.features[f].cost += logCost;
      summary.features[f].count++;
    });

    const sessionCount = summary.sessions.size || 1;
    summary.avgSessionCost = summary.totalCost / sessionCount;

    return summary;
  }, [logs]);

  if (loading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Restricted: System Analytics</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Usage <br /><span className="text-gradient-purple">Analytics.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-xl">Real-time audit of AI API consumption and infrastructure overhead.</p>
            </div>
            
            <div className="flex gap-4 glass p-2 rounded-2xl border-white/5">
              {[7, 30, 90].map(d => (
                <Button 
                  key={d}
                  onClick={() => setDays(d)}
                  variant="ghost" 
                  className={cn(
                    "h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    days === d ? "bg-accent/20 text-accent" : "text-white/40 hover:text-white"
                  )}
                >
                  {d}D
                </Button>
              ))}
            </div>
          </header>

          {error && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400">
               <AlertCircle className="w-6 h-6" />
               <div className="space-y-1">
                 <p className="text-sm font-bold uppercase tracking-widest">Query Error</p>
                 <p className="text-xs font-light">{error.message}</p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card className="premium-card bg-accent/5 border-accent/20 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <DollarSign className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">EST. TOTAL COST</Badge>
              </div>
              <div>
                <p className="text-4xl font-black tabular-nums">${stats?.totalCost.toFixed(2)}</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Avg Session: ${stats?.avgSessionCost.toFixed(3)}</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">GEMINI TOKENS</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{Math.round((stats?.geminiInput || 0) / 1000)}k / {Math.round((stats?.geminiOutput || 0) / 1000)}k</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Input / Output Balance</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Mic className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">G. CLOUD TTS</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{(stats?.ttsChars || 0).toLocaleString()}</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Neural2 Characters</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Video className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">AI AVATAR</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{(stats?.didMinutes || 0).toFixed(1)} Min</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">D-ID Streaming</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">JD EXECUTION</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{stats?.jdoodleCredits || 0} (${(stats?.jdoodleCost || 0).toFixed(2)})</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">JDoodle Credits</p>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-12 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-accent" /> Feature-Level Consumption
                  </h3>
                  <Download className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(stats?.features || {}).map(([name, data]: [string, any]) => (
                    <div key={name} className="p-6 glass rounded-2xl border-white/5 hover:bg-white/[0.03] transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-lg font-bold">{FEATURE_MAP[name] || name.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">{data.count} Interactions</p>
                        </div>
                        <p className="text-xl font-bold text-accent">${data.cost.toFixed(3)}</p>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-bold text-white/20">Tokens (I/O)</p>
                          <p className="text-[11px] font-mono">{Math.round(data.input / 1000)}k / {Math.round(data.output / 1000)}k</p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[8px] uppercase font-bold text-white/20">Voice Chars</p>
                          <p className="text-[11px] font-mono">{data.chars}</p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[8px] uppercase font-bold text-white/20">
                            {name === 'jdoodle_execution' ? 'Credits' : 'Video Secs'}
                          </p>
                          <p className="text-[11px] font-mono">
                            {name === 'jdoodle_execution' ? data.credits : `${data.didSecs}s`}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[8px] uppercase font-bold text-white/20">Unit Efficiency</p>
                          <p className="text-[11px] font-mono text-accent">${(data.cost / (data.count || 1)).toFixed(3)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
             <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <h3 className="text-lg font-bold mb-8">Infrastructure Notes</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-accent/10">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      <strong>Gemini 3.6 Flash</strong> rates ($0.75/$3.75 per 1M) are verified against official introductory pricing.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-accent/10">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      <strong>Google Cloud TTS</strong> (Neural2) is verified at $16.00 per 1M characters.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-[#c9a24d]/10">
                    <ShieldCheck className="w-5 h-5 text-[#c9a24d] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      <strong>JDoodle</strong> rate verified at $0.01 per credit. Submissions consume 2 credits, single runs consume 1.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-yellow-500/10">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      <strong>D-ID</strong> rate ($0.55/min) is a plan-dependent estimate for real-time streaming.
                    </p>
                  </div>
                </div>
              </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
