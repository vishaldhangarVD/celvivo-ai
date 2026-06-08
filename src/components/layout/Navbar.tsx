'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Command, LogIn, Menu, X, LogOut, LayoutDashboard, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

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
          <span className="font-headline font-bold text-2xl tracking-tighter uppercase">
            NEXVORO<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          {user && (
            <>
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                Control
              </Link>
              <Link href="/user-dashboard" className="hover:text-white transition-colors flex items-center gap-2 text-accent">
                <History className="w-3 h-3" />
                Dashboard
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{user.displayName || 'Operator'}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-accent">Verified Track</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
                      <LogIn className="w-4 h-4" />
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
            className="absolute top-20 left-0 w-full bg-[#050816] border-b border-white/5 p-8 flex flex-col gap-6 md:hidden z-50"
          >
            <Link href="/features" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-widest uppercase text-white/70">Features</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-widest uppercase text-white/70">Pricing</Link>
            {user && (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-widest uppercase text-white/70">Control Center</Link>
                <Link href="/user-dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-widest uppercase text-accent">User Dashboard</Link>
              </>
            )}
            
            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="w-full h-14 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs text-red-400"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 btn-premium font-bold uppercase tracking-widest text-xs">Start Session</Button>
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
