'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App, Firestore, Auth, and Storage instances as singletons.
 * This should be called only in a client-side context.
 */
export function initializeFirebase(): { 
  firebaseApp: FirebaseApp; 
  firestore: Firestore; 
  auth: Auth; 
  storage: FirebaseStorage 
} {
  const firebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  return { firebaseApp, firestore, auth, storage };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
