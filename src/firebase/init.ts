import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let firestoreInstance: Firestore | undefined;

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
} {
  const firebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      // If already initialized (common during HMR), use the existing instance
      firestoreInstance = getFirestore(firebaseApp);
    }
  }

  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  return { firebaseApp, firestore: firestoreInstance, auth, storage };
}
