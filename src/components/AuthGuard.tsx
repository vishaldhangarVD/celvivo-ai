'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview AuthGuard - Session Enforcer for protected routes.
 * Monitors Firebase Auth state and redirects unauthenticated users to the login portal.
 * Preserves the target destination using the 'redirectTo' query parameter.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is settled and no user exists, redirect to login
    if (!loading && !user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content during redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
