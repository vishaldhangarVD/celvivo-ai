import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  // Only initialize if we have a valid project ID to avoid initialization errors
  const isValidConfig = firebaseConfig.projectId && firebaseConfig.projectId !== "placeholder-project-id";
  
  const firebaseApp = !getApps().length 
    ? initializeApp(firebaseConfig) 
    : getApp();
    
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
