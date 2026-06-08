import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App, Firestore, and Auth instances.
 * Ensures that the app is only initialized once.
 */
export function initializeFirebase() {
  if (!firebaseConfig.projectId || firebaseConfig.projectId === 'placeholder-project-id') {
    throw new Error("Firebase Project ID is missing. Please check your environment variables or config.ts.");
  }

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
