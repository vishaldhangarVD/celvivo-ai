'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Command, LogIn, Menu, X, LogOut, LayoutDashboard, History, Settings, ShieldCheck, Info, MessageSquare, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const formattedName = useMemo(() => {
    if (!user) return 'Operator';
    const name = user.displayName || user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

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
          <span className="font-headline font-bold text-2xl tracking-tighter uppercase text-premium">
            NEXVORO<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          <Link href="/features" className="hover:text-white transition-colors">Protocols</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Economics</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          {user && (
            <>
              <div className="w-px h-4 bg-white/10"></div>
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                Dashboard
              </Link>
              <Link href="/skill-gap" className="hover:text-white transition-colors flex items-center gap-2 text-accent">
                <BrainCircuit className="w-3 h-3" />
                Gap Audit
              </Link>
              <Link href="/user-dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                <History className="w-3 h-3" />
                Pulse
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-6">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{formattedName}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-accent">Verified Track</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-red-400 px-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
                      Access
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="btn-premium h-12 px-8 text-[10px] tracking-[0.2em] uppercase">
                      Begin Session
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-[#050816] border-b border-white/5 p-12 flex flex-col gap-8 md:hidden z-50 min-h-screen"
          >
            <Link href="/features" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70">Protocols</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70">Economics</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70">About</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70">Contact</Link>
            
            {user && (
              <>
                <div className="h-px bg-white/5 my-4"></div>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70 flex items-center gap-4">
                  <LayoutDashboard className="w-6 h-6" /> Career Dashboard
                </Link>
                <Link href="/skill-gap" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-accent flex items-center gap-4">
                  <BrainCircuit className="w-6 h-6" /> Gap Audit
                </Link>
                <Link href="/user-dashboard" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-widest uppercase text-white/70 flex items-center gap-4">
                  <History className="w-6 h-6" /> User Pulse
                </Link>
              </>
            )}
            
            <div className="pt-12 border-t border-white/5 flex flex-col gap-6">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="w-full h-16 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs text-red-400"
                >
                  Terminate Session
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-16 btn-premium font-bold uppercase tracking-widest text-xs">Start Session</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
