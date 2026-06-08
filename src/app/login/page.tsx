'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, ArrowLeft, Github, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
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
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
            <Command className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Welcome Back.</h1>
          <p className="text-muted-foreground font-light">Access your personal intelligence dashboard.</p>
        </div>

        <Card className="premium-card bg-white/[0.02] border-white/5 p-8">
          <CardContent className="space-y-8 p-0">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-3">
                <Chrome className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-3">
                <Github className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Github</span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-[#050816] px-4">OR USE PROTOCOL</span>
              </div>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identification</Label>
                <Input placeholder="email@domain.com" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Encryption Key</Label>
                  <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-80">Forgot?</Link>
                </div>
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" />
              </div>
              <Button type="button" className="w-full h-16 btn-premium text-xs font-bold tracking-[0.2em] uppercase mt-4">
                Access System
              </Button>
            </form>

            <p className="text-center text-[10px] font-bold tracking-widest uppercase text-muted-foreground pt-4">
              New to the platform? <Link href="/signup" className="text-accent hover:underline">Register Session</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
