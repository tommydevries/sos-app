/**
 * All Firestore read/write operations.
 *
 * Schema:
 *   /families/{familyCode}
 *     parentUid, createdAt, familySettings
 *
 *   /families/{familyCode}/kids/{kidUid}
 *     name, createdAt
 *
 *   /playerData/{uid}
 *     profile, questCompletions, morningLaunches, debriefs, customQuests, familyCode
 */

import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PlayerState, FamilySettings } from '../types';
import { DEFAULT_FAMILY_SETTINGS } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyPlayerData(familyCode: string): PlayerState {
  return {
    profile: null,
    questCompletions: [],
    morningLaunches: [],
    debriefs: [],
    customQuests: [],
    familySettings: { ...DEFAULT_FAMILY_SETTINGS },
    familyCode,
  };
}

// ── Family ───────────────────────────────────────────────────────────────────

export async function createFamily(parentUid: string): Promise<string> {
  // Generate a unique family code like HAWK-4821
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O (look like 1/0)
  const generate = () => {
    const l = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const n = String(Math.floor(1000 + Math.random() * 9000));
    return `${l}-${n}`;
  };

  let code = generate();
  // Retry if code already exists (astronomically unlikely but correct)
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(doc(db, 'families', code));
    if (!snap.exists()) break;
    code = generate();
  }

  await setDoc(doc(db, 'families', code), {
    parentUid,
    createdAt: serverTimestamp(),
    familySettings: DEFAULT_FAMILY_SETTINGS,
  });

  return code;
}

export async function getFamily(familyCode: string) {
  const snap = await getDoc(doc(db, 'families', familyCode));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getFamilyByParentUid(parentUid: string): Promise<string | null> {
  const q = query(collection(db, 'families'), where('parentUid', '==', parentUid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id; // family code is the doc ID
}

export async function saveFamilySettings(familyCode: string, settings: FamilySettings) {
  await updateDoc(doc(db, 'families', familyCode), { familySettings: settings });
}

// ── Kid membership ────────────────────────────────────────────────────────────

export async function addKidToFamily(familyCode: string, kidUid: string, name: string) {
  await setDoc(doc(db, 'families', familyCode, 'kids', kidUid), {
    name,
    createdAt: serverTimestamp(),
  });
}

export async function getFamilyKids(familyCode: string): Promise<{ uid: string; name: string }[]> {
  const snap = await getDocs(collection(db, 'families', familyCode, 'kids'));
  return snap.docs.map(d => ({ uid: d.id, name: (d.data() as { name: string }).name }));
}

// ── Player data ───────────────────────────────────────────────────────────────

export async function loadPlayerData(uid: string): Promise<PlayerState | null> {
  const snap = await getDoc(doc(db, 'playerData', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as PlayerState;
  // Ensure backward compat
  if (!data.familySettings) data.familySettings = { ...DEFAULT_FAMILY_SETTINGS };
  return data;
}

export async function savePlayerData(uid: string, state: PlayerState) {
  await setDoc(doc(db, 'playerData', uid), state, { merge: true });
}

export async function initPlayerData(uid: string, name: string, familyCode: string): Promise<PlayerState> {
  const data = emptyPlayerData(familyCode);
  data.profile = { name, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'playerData', uid), data);
  return data;
}

// ── Parent: read all kids' data ───────────────────────────────────────────────

export async function loadAllKidsData(
  familyCode: string,
): Promise<{ uid: string; name: string; data: PlayerState }[]> {
  const kids = await getFamilyKids(familyCode);
  const results = await Promise.all(
    kids.map(async k => {
      const data = await loadPlayerData(k.uid);
      return { uid: k.uid, name: k.name, data: data ?? emptyPlayerData(familyCode) };
    }),
  );
  return results;
}
