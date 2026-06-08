'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, we want to see the full error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }

      // In production, show a toast
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
