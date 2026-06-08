'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative">
      <div className="particles-bg" />
      
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Nexus
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
            <Command className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Initialize Identity.</h1>
          <p className="text-muted-foreground font-light">Join the elite network of performance-ready engineers.</p>
        </div>

        <Card className="premium-card bg-white/[0.02] border-white/5 p-12">
          <CardContent className="space-y-10 p-0">
            <form className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input placeholder="John Doe" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity Email</Label>
                <Input placeholder="email@domain.com" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Token</Label>
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Token</Label>
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              
              <div className="md:col-span-2 flex items-start gap-4 p-6 glass rounded-2xl border-white/5">
                <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
                <p className="text-[10px] font-medium leading-relaxed text-white/50 tracking-wider">
                  By initializing, you agree to our Neural Privacy Policy and Protocol Terms. Your data is encrypted and anonymized for neural training.
                </p>
              </div>

              <Button type="button" className="md:col-span-2 h-16 btn-premium text-xs font-bold tracking-[0.2em] uppercase mt-4">
                Initialize Personal Protocol
              </Button>
            </form>

            <p className="text-center text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Already verified? <Link href="/login" className="text-accent hover:underline">Access Dashboard</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
