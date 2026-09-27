'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff, Chrome, Zap, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: same "confirm full name" flow as the login page, for Google signups
  const [confirmNameMode, setConfirmNameMode] = useState(false);
  const [socialUser, setSocialUser] = useState<any>(null);
  const [newName, setNewName] = useState('');

  const redirectProcessed = useRef(false);
  const redirectTo = searchParams.get('redirectTo') || '/';

  const ensureUserProfile = useCallback(async (authUser: any, customName?: string) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: authUser.uid,
          displayName: customName || authUser.displayName || "User",
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

  // FIX 1: Signup page was missing this entirely. Without it, a user who gets
  // bounced to signInWithRedirect (popup blocked) never has their profile
  // created and never gets redirected forward when they land back here.
  useEffect(() => {
    if (!auth || !db || redirectProcessed.current) return;

    async function handleRedirect() {
      if (!auth) return;
      try {
        const result = await getRedirectResult(auth);
        redirectProcessed.current = true;

        if (result?.user) {
          setIsLoading(true);
          const resultName = result.user.displayName || "";
          if (resultName.trim().split(/\s+/).filter(Boolean).length < 2) {
            setSocialUser(result.user);
            setNewName(resultName);
            setConfirmNameMode(true);
            setIsLoading(false);
          } else {
            await ensureUserProfile(result.user);
            setIsLoading(false);
            router.push(redirectTo);
          }
        }
      } catch (error: any) {
        console.error("[Auth] Redirect Result Error:", error);
        setIsLoading(false);
        if (error.code !== 'auth/no-auth-event' && error.code !== 'auth/cancelled-popup-request') {
          toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description: error.message || "Could not complete the login handshake.",
          });
        }
      }
    }

    handleRedirect();
  }, [auth, db, ensureUserProfile, redirectTo, router, toast]);

  const handleGoogleSignup = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const resultName = result.user.displayName || "";
        // FIX 4: apply the same "need full name" check Google login already has
        if (resultName.trim().split(/\s+/).filter(Boolean).length < 2) {
          setSocialUser(result.user);
          setNewName(resultName);
          setConfirmNameMode(true);
          setIsLoading(false);
        } else {
          await ensureUserProfile(result.user);
          setIsLoading(false);
          router.push(redirectTo);
        }
      }
    } catch (error: any) {
      console.error("[Auth] Google Signup Attempt Error:", error.code, error.message);
      
      if (error.code === 'auth/popup-blocked') {
        // FIX 2: only fall back to redirect when the browser actually blocked
        // the popup — not when the user closed it on purpose.
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
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
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
      router.push(redirectTo);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || !email || !password || !name) return;

    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setNameError("Please enter your full name (First and Last name).");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setNameError(null);
    setConfirmError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userProfile = {
        uid: userCredential.user.uid ?? "",
        displayName: name ?? "Operator",
        email: email ?? "",
        photoURL: null,
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
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      toast({
        title: "Account created successfully",
        // FIX 3: removed the duplicated "Your Your"
        description: "Welcome to CELVIVO AI. Your account is ready.",
      });
      
      router.push(redirectTo);
    } catch (error: any) {
      console.error("[Auth] Signup Error:", error);
      let title = "Registration Failed";
      let description = "Something went wrong while creating your account. Please try again.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          title = "Email Already Registered";
          description = "An account with this email already exists. Try logging in instead.";
          break;
        case 'auth/weak-password':
          title = "Password Too Weak";
          description = "Please choose a password with at least 6 characters.";
          break;
        case 'auth/invalid-email':
          title = "Invalid Email";
          description = "Please enter a valid email address.";
          break;
        case 'auth/network-request-failed':
          title = "Connection Error";
          description = "Please check your internet connection and try again.";
          break;
      }

      toast({
        variant: "destructive",
        title,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && confirmNameMode === false && socialUser) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative">
      <div className="particles-bg" />
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
            <img src="/LOGO.png" alt="Celvivo AI" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">
            {confirmNameMode ? "Complete Your Profile" : "Welcome to CELVIVO AI."}
          </h1>
          <p className="text-muted-foreground font-light">
            {confirmNameMode ? "Please confirm your full name to continue." : "Create your account and start preparing for your career."}
          </p>
        </div>

        <Card className="premium-card bg-white/[0.02] border-white/5 p-12">
          <CardContent className="space-y-10 p-0">
            <AnimatePresence mode="wait">
              {confirmNameMode ? (
                // NEW: same name-confirmation UI as the login page
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
                      To ensure your simulation reports and certificates are properly generated, please confirm your full professional name.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Ananya Birla"
                      className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6"
                      required
                    />
                  </div>

                  <Button
                    onClick={handleConfirmName}
                    disabled={isLoading}
                    className="w-full h-16 btn-premium text-xs font-bold tracking-[0.2em] uppercase"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <Button 
                    variant="outline" 
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex gap-4 transition-all duration-500 group/btn overflow-hidden relative mb-8"
                  >
                    <div className="flex items-center gap-4">
                      <Chrome className="w-5 h-5 text-accent transition-transform group-hover/btn:scale-110" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Continue with Google</span>
                    </div>
                  </Button>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.5em] text-white/20">
                      <span className="bg-[#050816] px-6">OR CONTINUE WITH EMAIL</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignup} className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <div className="space-y-1">
                        <Input 
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameError) setNameError(null);
                          }}
                          placeholder="e.g. Ananya Birla" 
                          className={cn(
                            "h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6",
                            nameError && "border-red-400/50"
                          )} 
                          required
                        />
                        {nameError && (
                          <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider ml-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {nameError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email address</Label>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com" 
                        className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                      <div className="relative group">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6 pr-14" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-accent transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                      <div className="space-y-1">
                        <div className="relative group">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (confirmError) setConfirmError(null);
                            }}
                            placeholder="••••••••" 
                            className={cn(
                              "h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6 pr-14",
                              confirmError && "border-red-400/50"
                            )} 
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-accent transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmError && (
                          <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider ml-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {confirmError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-start gap-4 p-6 glass rounded-2xl border-white/5">
                      <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
                      <p className="text-[10px] font-medium leading-relaxed text-white/50 tracking-wider">
                      By creating an account, you agree to our Privacy Policy and Terms.
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="md:col-span-2 h-16 btn-premium text-xs font-bold tracking-[0.2em] uppercase mt-4"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                    </Button>
                  </form>
                  <p className="text-center text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    Already have an account? <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-accent hover:underline">Log In</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
