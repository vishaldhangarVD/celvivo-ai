'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function NavigationControls({ className }: { className?: string }) {
  const router = useRouter();

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
          onClick={() => router.back()}
          className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white/70 group-hover:text-accent" />
        </Button>
      </motion.div>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
          title="Return to Nexus"
        >
          <Home className="w-5 h-5 text-white/70 group-hover:text-accent" />
        </Button>
      </motion.div>
    </div>
  );
}
