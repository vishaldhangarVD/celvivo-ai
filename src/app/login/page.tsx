'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, ArrowLeft, Chrome, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Authentication service is unavailable. Please try again later.",
      });
      return;
    }

    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth || !email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your email address first.",
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Link Sent",
        description: "Please check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading) {
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
            {!auth && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                Service initializing...
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                disabled={!auth || isLoading}
                className="h-14 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-3"
              >
                <Chrome className="w-5 h-5 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sign in with Google</span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-[#050816] px-4">OR USE PROTOCOL</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identification</Label>
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
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Encryption Key</Label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={isResetting || !auth}
                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-80 disabled:opacity-50"
                  >
                    {isResetting ? "Sending..." : "Forgot?"}
                  </button>
                </div>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-white px-6" 
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !auth}
                className="w-full h-16 btn-premium text-xs font-bold tracking-[0.2em] uppercase mt-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access System"}
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
