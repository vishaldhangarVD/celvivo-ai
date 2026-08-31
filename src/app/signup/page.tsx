'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, ArrowLeft, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
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

  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const ensureUserProfile = async (authUser: any) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: authUser.uid,
          displayName: authUser.displayName || "Operator",
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
        });
      }
    } catch (e) {
      console.error("[Profile Sync] Failed to reconcile user dossier:", e);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await ensureUserProfile(result.user);
        setIsLoading(false);
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error("[Auth] Google Signup Attempt Error:", error.code, error.message);
      
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || !email || !password || !name) return;

    // VALIDATION PROTOCOL: Require full name (at least two words)
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setNameError("Please enter your full name (First and Last name).");
      return;
    }

    // VALIDATION PROTOCOL: Password match
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
      
      // Strict initialization for user profile and subscription metadata
      const userProfile = {
        uid: userCredential.user.uid ?? "",
        displayName: name ?? "Operator",
        email: email ?? "",
        photoURL: null,
        jobReadinessScore: 0,
        totalInterviews: 0,
        
        // Subscription Protocol Initial State
        plan: "free",
        subscriptionStatus: "active",
        freeJourneyUsed: false,
        isFreeAccess: false, // Default to no override
        subscriptionId: null,
        paymentId: null,
        subscriptionStart: null,
        subscriptionEnd: null,

        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      toast({
        title: "Account Created",
        description: "Welcome to Nexvoro AI. Your identity has been initialized.",
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
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Welcome to Nexvoro AI.</h1>
          <p className="text-muted-foreground font-light">Join the elite network of performance-ready engineers.</p>
        </div>

        <Card className="premium-card bg-white/[0.02] border-white/5 p-12">
          <CardContent className="space-y-10 p-0">
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
                    placeholder="e.g. Kunal Dhangar" 
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
                    required
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
                  By initializing, you agree to our Neural Privacy Policy and Protocol Terms. Your data is encrypted and anonymized for neural training.
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