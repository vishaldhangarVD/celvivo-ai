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
  AlertCircle
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// COST PARAMETERS
// These constants are used to calculate the estimated infrastructure overhead.
const RATES = {
  // Gemini 3.1 Flash Rates (per 1M tokens)
  GEMINI_INPUT: 0.10 / 1_000_000,
  GEMINI_OUTPUT: 0.40 / 1_000_000,
  
  // ElevenLabs / TTS Placeholder Rate (per character)
  // Current: $0.0003 per char (~$0.30 per 1k chars)
  ELEVENLABS_PER_CHAR: 0.0003, 
  
  // D-ID Video Rate (per minute)
  // Current: $0.50 per minute of generated video
  DID_PER_MINUTE: 0.50, 
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

  const { data: logs, loading } = useCollection(usageQuery);

  // AGGREGATION LOGIC
  const stats = useMemo(() => {
    if (!logs) return null;

    const summary: any = {
      totalCost: 0,
      geminiInput: 0,
      geminiOutput: 0,
      ttsChars: 0,
      didMinutes: 0,
      features: {},
      sessions: new Set(),
    };

    logs.forEach((log: any) => {
      const f = log.feature || 'unknown';
      if (!summary.features[f]) {
        summary.features[f] = { input: 0, output: 0, chars: 0, didSecs: 0, cost: 0, count: 0 };
      }

      if (log.sessionId) summary.sessions.add(log.sessionId);

      let logCost = 0;
      
      // Calculate Gemini Cost
      if (log.inputTokens) {
        summary.geminiInput += log.inputTokens;
        summary.features[f].input += log.inputTokens;
        logCost += (log.inputTokens * RATES.GEMINI_INPUT);
      }
      if (log.outputTokens) {
        summary.geminiOutput += log.outputTokens;
        summary.features[f].output += log.outputTokens;
        logCost += (log.outputTokens * RATES.GEMINI_OUTPUT);
      }

      // Calculate TTS Cost
      if (log.characterCount) {
        summary.ttsChars += log.characterCount;
        summary.features[f].chars += log.characterCount;
        logCost += (log.characterCount * RATES.ELEVENLABS_PER_CHAR);
      }

      // Calculate D-ID Cost
      if (log.videoDurationSeconds) {
        const mins = log.videoDurationSeconds / 60;
        summary.didMinutes += mins;
        summary.features[f].didSecs += log.videoDurationSeconds;
        logCost += (mins * RATES.DID_PER_MINUTE);
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
              <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Restricted: System Intelligence</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Usage <br /><span className="text-gradient-purple">Analytics.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-xl">Real-time audit of AI API consumption and infrastructure overhead.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-3xl font-bold tabular-nums">{(stats?.geminiInput / 1000).toFixed(1)}k / {(stats?.geminiOutput / 1000).toFixed(1)}k</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Input / Output Balance</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Mic className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">TTS CHARACTERS</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{stats?.ttsChars.toLocaleString()}</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Total Vocal Units</p>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.02] border-white/5 p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Video className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">D-ID VIDEO</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums">{stats?.didMinutes.toFixed(1)} Min</p>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-2">Neural Avatar Streams</p>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-accent" /> Feature-Level Consumption
                  </h3>
                  <Download className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
                </div>
                
                <div className="space-y-6">
                  {Object.entries(stats?.features || {}).map(([name, data]: [string, any]) => (
                    <div key={name} className="p-6 glass rounded-2xl border-white/5 hover:bg-white/[0.03] transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-lg font-bold capitalize">{name.replace(/_/g, ' ')}</p>
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
                          <p className="text-[8px] uppercase font-bold text-white/20">Vocal Chars</p>
                          <p className="text-[11px] font-mono">{data.chars}</p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[8px] uppercase font-bold text-white/20">Video Secs</p>
                          <p className="text-[11px] font-mono">{data.didSecs}s</p>
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

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <h3 className="text-lg font-bold mb-8">Infrastructure Notes</h3>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-yellow-500/10">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      Costs are calculated based on public tier rates. Actual billing may vary by enterprise quota or free-tier grants.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start p-4 glass rounded-2xl border-accent/10">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      Logs are anonymized. Only session identifiers and token counts are stored in the audit matrix.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10 p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-accent" />
                  <p className="text-xs font-bold uppercase tracking-widest">Active Horizon</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">Audit Start</span>
                    <span>{new Date(Date.now() - days * 86400000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">Audit End</span>
                    <span>Present Node</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
