import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  createFamily, getFamilyByParentUid, getFamily,
  addKidToFamily, initPlayerData, loadPlayerData,
} from '../lib/db';

export type UserRole = 'parent' | 'kid' | null;

interface AuthState {
  user:       User | null;
  role:       UserRole;
  familyCode: string | null;
  loading:    boolean;
}

interface AuthActions {
  signUpParent:  (email: string, password: string) => Promise<void>;
  signInParent:  (email: string, password: string) => Promise<void>;
  joinAsKid:     (familyCode: string, name: string) => Promise<void>;
  signOut:       () => Promise<void>;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

// Kid sessions store their UID + familyCode in localStorage so they auto-rejoin
const KID_SESSION_KEY = 'sos-kid-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, role: null, familyCode: null, loading: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) {
        setState({ user: null, role: null, familyCode: null, loading: false });
        return;
      }

      // Check if this is a known kid session
      try {
        const kidSession = localStorage.getItem(KID_SESSION_KEY);
        if (kidSession) {
          const { uid, familyCode } = JSON.parse(kidSession);
          if (uid === user.uid) {
            setState({ user, role: 'kid', familyCode, loading: false });
            return;
          }
        }
      } catch {}

      // Otherwise check if they're a parent
      if (!user.isAnonymous) {
        try {
          const familyCode = await getFamilyByParentUid(user.uid);
          setState({ user, role: 'parent', familyCode, loading: false });
          return;
        } catch {}
      }

      setState({ user, role: null, familyCode: null, loading: false });
    });
    return unsub;
  }, []);

  const signUpParent = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const familyCode = await createFamily(cred.user.uid);
    setState(s => ({ ...s, role: 'parent', familyCode }));
  };

  const signInParent = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const familyCode = await getFamilyByParentUid(cred.user.uid);
    setState(s => ({ ...s, role: 'parent', familyCode }));
  };

  const joinAsKid = async (rawCode: string, name: string) => {
    const familyCode = rawCode.toUpperCase().trim();
    const family = await getFamily(familyCode);
    if (!family) throw new Error('Family code not found. Check with your parent.');

    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;

    await addKidToFamily(familyCode, uid, name);

    // Check if this kid already has data; if not, initialise
    const existing = await loadPlayerData(uid);
    if (!existing) {
      await initPlayerData(uid, name, familyCode);
    }

    localStorage.setItem(KID_SESSION_KEY, JSON.stringify({ uid, familyCode }));
    setState({ user: cred.user, role: 'kid', familyCode, loading: false });
  };

  const signOut = async () => {
    localStorage.removeItem(KID_SESSION_KEY);
    await firebaseSignOut(auth);
    setState({ user: null, role: null, familyCode: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signUpParent, signInParent, joinAsKid, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
