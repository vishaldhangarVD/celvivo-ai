
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, LayoutDashboard, LogIn, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-white/5 bg-[#050816]/50 backdrop-blur-2xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
          >
            <Command className="text-white w-6 h-6" />
          </motion.div>
          <span className="font-headline font-bold text-2xl tracking-tighter">
            NEXVORO<span className="text-accent">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-12 text-xs font-bold uppercase tracking-[0.3em] text-white/50">
          <Link href="/#features" className="hover:text-white transition-colors">Core</Link>
          <Link href="/#roles" className="hover:text-white transition-colors">Disciplines</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-3 group">
            <LayoutDashboard className="w-4 h-4 group-hover:text-accent" />
            Control
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" className="hidden sm:flex items-center gap-3 text-xs font-bold tracking-widest text-white/70">
            <LogIn className="w-4 h-4" />
            ACCESS
          </Button>
          <Link href="/interview">
            <Button className="btn-premium h-12 px-8 text-xs tracking-widest uppercase">
              Begin Session
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
