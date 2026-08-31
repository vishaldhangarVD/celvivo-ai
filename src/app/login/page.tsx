'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, ArrowLeft, Chrome, Loader2, AlertCircle, Zap, ShieldCheck, Mail, Lock, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmNameMode, setConfirmNameMode] = useState(false);
  const [socialUser, setSocialUser] = useState<any>(null);
  const [newName, setNewName] = useState('');
  
  const redirectProcessed = useRef(false);

  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  /**
   * Profile Synchronization Protocol
   * Ensures the user has a consistent dossier in Firestore.
   */
  const ensureUserProfile = useCallback(async (authUser: any, customName?: string) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: authUser.uid,
          displayName: customName || authUser.displayName || "Operator",
          email: authUser.email || "",
          photoURL: authUser.photoURL || null,
          jobReadinessScore: 0,
          totalInterviews: 0,
          plan: "free",
          subscriptionStatus: "active",
          freeJourneyUsed: false,
          isFreeAccess: false,
          subscriptionId: null,
          paymentId: null,
          subscriptionStart: null,
          subscriptionEnd: null,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (e) {
      console.error("[Profile Sync] Failed to reconcile user dossier:", e);
    }
  }, [db]);

  /**
   * Redirect Result Handler
   */
  useEffect(() => {
    if (!auth || !db || redirectProcessed.current) return;
    
    async function handleRedirect() {
      if (!auth) return;
      try {
        const result = await getRedirectResult(auth);
        redirectProcessed.current = true;
        
        if (result?.user) {
          setIsLoading(true);
          const name = result.user.displayName || "";
          if (name.trim().split(/\s+/).filter(Boolean).length < 2) {
            setSocialUser(result.user);
            setNewName(name);
            setConfirmNameMode(true);
            setIsLoading(false);
          } else {
            await ensureUserProfile(result.user);
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        console.error("[Auth] Redirect Result Error:", error);
        setIsLoading(false);
        
        if (error.code !== 'auth/no-auth-event' && error.code !== 'auth/cancelled-popup-request') {
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message || "Could not complete the login handshake.",
          });
        }
      }
    }
    
    handleRedirect();
  }, [auth, db, ensureUserProfile, toast]);

  /**
   * Redirection Protocol
   */
  useEffect(() => {
    if (user && !authLoading && !isLoading && !confirmNameMode) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, isLoading, router, redirectTo, confirmNameMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) return;
    
    setIsLoading(true);
    // Diagnostic Telemetry (Temporary)
    console.log("[Auth Debug] Attempting login with email:", trimmedEmail, "password length:", password.length);
    
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      setIsLoading(false);
    } catch (error: any) {
      console.error("[Auth] Password Login Error:", error);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid identification or security token.",
      });
      setIsLoading(false);
    }
  };

  /**
   * Google Authentication Protocol
   */
  const handleGoogleLogin = async () => {
    if (!auth) return;
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const name = result.user.displayName || "";
        // VALIDATION: If social provider name is incomplete, force confirmation
        if (name.trim().split(/\s+/).filter(Boolean).length < 2) {
          setSocialUser(result.user);
          setNewName(name);
          setConfirmNameMode(true);
          setIsLoading(false);
        } else {
          await ensureUserProfile(result.user);
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error("[Auth] Google Login Attempt Error:", error.code, error.message);
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          console.error("[Auth] Redirect Fallback Failed:", redirectError);
          toast({
            variant: "destructive",
            title: "Protocol Failure",
            description: "System could not initialize redirect handshake.",
          });
          setIsLoading(false);
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: "Handshake Failed",
          description: error.message || "Google authentication encountered a critical fault.",
        });
        setIsLoading(false);
      }
    }
  };

  const handleConfirmName = async () => {
    if (!socialUser || !auth?.currentUser) return;
    
    if (newName.trim().split(/\s+/).filter(Boolean).length < 2) {
      toast({
        variant: "destructive",
        title: "Full Name Required",
        description: "Please provide both your first and last name to proceed.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { updateProfile: fbUpdateProfile } = await import('firebase/auth');
      await fbUpdateProfile(auth.currentUser, { displayName: newName });
      await ensureUserProfile(socialUser, newName);
      setConfirmNameMode(false);
      // Redirection useEffect will handle navigation now
    } catch (e: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth || !email) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Enter your identity email to receive recovery instructions.",
      });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Recovery Protocol Sent", description: "Check your terminal (inbox) for reset instructions." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading || (isLoading && !user && !confirmNameMode)) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <Loader2 className="w-full h-full text-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="particles-bg" />
      
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="absolute top-12 left-12 z-50 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-white/40 hover:text-white transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-white/70" />
        Back to Nexus
      </Link>

      <div className="w-full max-w-[480px] relative z-10">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ rotate: 90 }}
            className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(147,51,234,0.3)] cursor-pointer"
          >
            <Command className="text-white w-10 h-10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-5xl font-bold tracking-tighter text-premium">
              {confirmNameMode ? "Final Calibration." : <>Welcome to <span className="text-gradient-purple">Nexvoro AI.</span></>}
            </h1>
            <p className="text-muted-foreground font-light text-sm uppercase tracking-[0.3em]">
              {confirmNameMode ? "Complete your professional identity" : "Your Intelligent Career Companion"}
            </p>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card rounded-[2.5rem] border-glow-premium bg-white/[0.01] border-white/5 p-10 overflow-hidden relative group">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-light-streak" />
            </div>

            <CardContent className="space-y-10 p-0 relative z-10">
              <AnimatePresence mode="wait">
                {confirmNameMode ? (
                  <motion.div 
                    key="confirm-name"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="p-6 glass rounded-2xl border-accent/20 bg-accent/5 flex items-start gap-4">
                      <UserCheck className="w-6 h-6 text-accent shrink-0" />
                      <p className="text-xs text-white/70 leading-relaxed font-light">
                        To ensure your simulation reports and certificates are properly architected, please confirm your full professional name.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-2">Full Identity Name</Label>
                      <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Kunal Dhangar" 
                        className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6 font-light" 
                        required
                      />
                    </div>

                    <Button 
                      onClick={handleConfirmName}
                      disabled={isLoading}
                      className="w-full h-18 btn-premium text-[11px] font-black tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(147,51,234,0.2)]"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Session Setup"}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="login-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-10"
                  >
                    <Button 
                      variant="outline" 
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex gap-4 transition-all duration-500 group/btn overflow-hidden relative"
                    >
                      <div className="flex items-center gap-4">
                        <Chrome className="w-5 h-5 text-accent transition-transform group-hover/btn:scale-110" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Continue with Google</span>
                      </div>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                      <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.5em] text-white/20">
                        <span className="bg-[#050816] px-6">OR CONTINUE WITH EMAIL</span>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-2">Identification</Label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                          <Input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@nexus.ai" 
                            className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white font-light" 
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center ml-2">
                          <Label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30">Encryption Key</Label>
                          <button 
                            type="button" 
                            onClick={handleForgotPassword}
                            disabled={isResetting}
                            className="text-[9px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors"
                          >
                            {isResetting ? "Requesting..." : "Recover?"}
                          </button>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                          <Input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="h-14 pl-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white font-light" 
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-18 btn-premium text-[11px] font-black tracking-[0.4em] uppercase mt-4 shadow-[0_20px_50px_rgba(147,51,234,0.2)] group/submit"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span>Access System</span>
                            <Zap className="w-4 h-4 transition-transform group-hover/submit:scale-110 fill-current" />
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="pt-4 text-center">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                        New operator? <Link href="/signup" className="text-accent hover:text-white transition-colors underline decoration-accent/20 underline-offset-4">Register Session</Link>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Secure Auth</div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest"><Zap className="w-3 h-3" /> Real-time Sync</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes light-streak {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-light-streak {
          animation: light-streak 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
