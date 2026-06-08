import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App, Firestore, and Auth instances.
 * This should be called only in a client-side context.
 */
export function initializeFirebase(): { firebaseApp: FirebaseApp | null; firestore: Firestore | null; auth: Auth | null } {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
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
