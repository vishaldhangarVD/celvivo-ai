'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NavigationControlsProps {
  className?: string;
  onHome?: () => void;
  onBack?: () => void;
}

export default function NavigationControls({ 
  className,
  onHome,
  onBack 
}: NavigationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const isInterviewPage = pathname?.startsWith('/interview');

  const handleTotalReset = async () => {
    // If a custom onHome handler is provided (e.g. from Journey page), use it.
    if (onHome) {
      onHome();
      return;
    }

    // Default Reset Logic
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      await deleteDoc(docRef);
    }
    
    // Clear simulation-specific state only
    localStorage.removeItem("resumeAnalysis");
    sessionStorage.removeItem("activeInterviewId");
    
    toast({ title: "Neural Cleanup", description: "Simulation session state has been purged." });
    router.push('/dashboard');
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("fixed top-28 left-4 md:left-8 z-[60] flex flex-col gap-4", className)}>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white/70 group-hover:text-accent" />
        </Button>
      </motion.div>

      {isInterviewPage ? (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
                title="Return Home & Reset"
              >
                <Home className="w-5 h-5 text-white/70 group-hover:text-accent" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-white/10 bg-[#0b0e1a] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Abandon Simulation?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Returning to the Home Hub will terminate your active session and purge current draft data. Historical records will be preserved. Your account will remain signed in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent text-white border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTotalReset} className="bg-red-500 text-white hover:bg-red-600 transition-colors">Confirm Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      ) : (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
            title="Dashboard"
          >
            <Home className="w-5 h-5 text-white/70 group-hover:text-accent" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
