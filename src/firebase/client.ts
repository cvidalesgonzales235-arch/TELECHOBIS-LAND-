import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PlayerSave } from '../types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function sanitizeDisplayName(rawName: string | null | undefined): string {
  const trimmed = (rawName || 'Guardia Nocturno').trim();
  const clean = trimmed.slice(0, 100);
  return clean.length > 0 ? clean : 'Guardia Nocturno';
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

export function subscribeToPlayerSave(
  userId: string,
  onSave: (save: PlayerSave | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `saves/${userId}`;
  const ref = doc(db, 'saves', userId);
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onSave(snapshot.data() as PlayerSave);
      } else {
        onSave(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function getPlayerSave(userId: string): Promise<PlayerSave | null> {
  const path = `saves/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'saves', userId));
    return snap.exists() ? (snap.data() as PlayerSave) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function ensureNewGameSave(user: User): Promise<PlayerSave> {
  const path = `saves/${user.uid}`;
  const ref = doc(db, 'saves', user.uid);
  const displayName = sanitizeDisplayName(user.displayName);

  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      const initialPayload = {
        userId: user.uid,
        displayName,
        currentNight: 1,
        completedNights: 0,
        night6Completed: false,
        extrasUnlocked: false,
        totalDeaths: 0,
        totalHoursSurvived: 0,
        bestNightPowerRemaining: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, initialPayload);
      return {
        ...initialPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      const current = existing.data() as PlayerSave;
      await updateDoc(ref, {
        currentNight: 1,
        updatedAt: serverTimestamp(),
      });
      return {
        ...current,
        currentNight: 1,
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveNightVictory(
  user: User,
  nightNumber: number,
  remainingPower: number
): Promise<void> {
  const path = `saves/${user.uid}`;
  const ref = doc(db, 'saves', user.uid);
  const clampedNight = Math.max(1, Math.min(6, Math.floor(nightNumber)));
  const cleanPower = Math.max(0, Math.min(100, Number(remainingPower.toFixed(1))));

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await ensureNewGameSave(user);
    }
    const freshSnap = await getDoc(ref);
    const data = freshSnap.data() as PlayerSave;

    const nextCompleted = Math.min(
      6,
      Math.max(data.completedNights, Math.min(data.completedNights + 1, clampedNight))
    );
    const nextNight = clampedNight < 6 ? clampedNight + 1 : 6;
    const night6Done = nextCompleted === 6;

    await updateDoc(ref, {
      currentNight: nextNight,
      completedNights: nextCompleted,
      night6Completed: night6Done,
      extrasUnlocked: night6Done,
      totalHoursSurvived: data.totalHoursSurvived + 6,
      bestNightPowerRemaining: Math.max(data.bestNightPowerRemaining, cleanPower),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordPlayerDeath(
  user: User,
  hoursSurvivedThisRun: number
): Promise<void> {
  const path = `saves/${user.uid}`;
  const ref = doc(db, 'saves', user.uid);
  const safeHours = Math.max(0, Math.min(6, Math.floor(hoursSurvivedThisRun)));

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as PlayerSave;
    await updateDoc(ref, {
      totalDeaths: data.totalDeaths + 1,
      totalHoursSurvived: data.totalHoursSurvived + safeHours,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
