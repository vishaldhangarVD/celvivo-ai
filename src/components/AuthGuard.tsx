
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview AuthGuard - Session Enforcer for protected routes.
 * Optimized for root layout usage with exclusion logic for public and specialized routes.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Exclude auth pages, landing, and specialized information pages from redirection
  const isPublicRoute = pathname === '/' || 
                        pathname === '/login' || 
                        pathname === '/signup' ||
                        pathname === '/about' ||
                        pathname === '/pricing' ||
                        pathname === '/contact' ||
                        pathname === '/features' ||
                        pathname === '/question-bank';
                        
  const isArenaRoute = pathname.startsWith('/interview/') || 
                       pathname.startsWith('/special-hr-interview');
                       
                       useEffect(() => {
                        const markSiteExit = () => {
                          try {
                            localStorage.setItem('celvivo_site_left', 'true');
                          } catch {
                            // Ignore storage errors
                          }
                        };
                      
                        window.addEventListener('pagehide', markSiteExit);
                      
                        return () => {
                          window.removeEventListener('pagehide', markSiteExit);
                        };
                      }, []);
                      
  useEffect(() => {
    // If auth state is settled and no user exists on a protected route, redirect to login
    if (!loading && !user && !isPublicRoute && !isArenaRoute) {
      router.replace('/login');
    }
  }, [user, loading, router, isPublicRoute, isArenaRoute]);

  // Show loading state while checking authentication for protected routes
  if (loading && !isPublicRoute && !isArenaRoute) {
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

  return <>{children}</>;
}
