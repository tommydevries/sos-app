import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  PlayerState, PlayerProfile, QuestCompletion, MorningLaunchCompletion,
  DebriefEntry, Quest, SkillTree, FamilySettings, ActiveReward, RewardClaim,
} from '../types';
import { DEFAULT_FAMILY_SETTINGS } from '../types';
import { QUESTS } from '../data/quests';
import { MORNING_LAUNCH_XP, STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP } from '../data/morningLaunch';
import { savePlayerData, loadPlayerData, saveFamilySettings } from '../lib/db';

const DEBRIEF_XP   = 15;
const BALANCE_BONUS = 50;

// ── Local fallback (used while Firebase loads, or if offline) ─────────────────
const LOCAL_KEY = 'sos-player-state';

function loadLocal(): PlayerState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.familySettings) parsed.familySettings = { ...DEFAULT_FAMILY_SETTINGS };
      return parsed;
    }
  } catch {}
  return {
    profile: null,
    questCompletions: [],
    morningLaunches: [],
    debriefs: [],
    customQuests: [],
    familySettings: { ...DEFAULT_FAMILY_SETTINGS },
  };
}

function saveLocal(state: PlayerState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseStoreOptions {
  uid?: string;         // Firebase UID — if provided, syncs with Firestore
  familyCode?: string;  // for family-level settings (rewards)
  isParent?: boolean;
}

export function useStore({ uid, familyCode, isParent }: UseStoreOptions = {}) {
  const [state, setState] = useState<PlayerState>(loadLocal);
  const [synced, setSynced] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Firestore on mount if we have a UID
  useEffect(() => {
    if (!uid) { setSynced(true); return; }
    loadPlayerData(uid).then(remote => {
      if (remote) {
        setState(remote);
        saveLocal(remote);
      }
      setSynced(true);
    });
  }, [uid]);

  // Debounced save to Firestore + always save locally
  const persist = useCallback((next: PlayerState) => {
    saveLocal(next);
    if (!uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePlayerData(uid, next);
    }, 800); // batch writes — save 800ms after last change
  }, [uid]);

  const update = useCallback((fn: (prev: PlayerState) => PlayerState) => {
    setState(prev => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, [persist]);

  // ── Profile ──────────────────────────────────────────────────────────────
  const setProfile = useCallback((profile: PlayerProfile) => {
    update(s => ({ ...s, profile }));
  }, [update]);

  // ── Morning Launch ────────────────────────────────────────────────────────
  const completeMorningLaunch = useCallback((completion: MorningLaunchCompletion) => {
    update(s => ({
      ...s,
      morningLaunches: [
        ...s.morningLaunches.filter(m => m.date !== completion.date),
        completion,
      ],
    }));
  }, [update]);

  const getTodayLaunch = useCallback((): MorningLaunchCompletion | undefined => {
    return state.morningLaunches.find(m => m.date === getToday());
  }, [state.morningLaunches]);

  // ── Quests ────────────────────────────────────────────────────────────────
  const completeQuest = useCallback((questId: string, note?: string) => {
    const completion: QuestCompletion = { questId, date: getToday(), note };
    update(s => ({ ...s, questCompletions: [...s.questCompletions, completion] }));
  }, [update]);

  const addCustomQuest = useCallback((quest: Quest) => {
    update(s => ({ ...s, customQuests: [...s.customQuests, quest] }));
  }, [update]);

  const allQuests = useMemo(() => [...QUESTS, ...state.customQuests], [state.customQuests]);

  const getQuestCompletionsToday = useCallback((): QuestCompletion[] => {
    return state.questCompletions.filter(c => c.date === getToday());
  }, [state.questCompletions]);

  // ── Debrief ───────────────────────────────────────────────────────────────
  const submitDebrief = useCallback((entry: DebriefEntry) => {
    update(s => ({
      ...s,
      debriefs: [...s.debriefs.filter(d => d.date !== entry.date), entry],
    }));
  }, [update]);

  const getTodayDebrief = useCallback((): DebriefEntry | undefined => {
    return state.debriefs.find(d => d.date === getToday());
  }, [state.debriefs]);

  // ── XP ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const launchXp = state.morningLaunches.length * MORNING_LAUNCH_XP;
    const launchDates = state.morningLaunches.map(m => m.date).sort();

    let currentStreak = 0;
    if (launchDates.length > 0) {
      const today = getToday();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (launchDates.includes(today) || launchDates.includes(yesterday)) {
        currentStreak = 1;
        let checkDate = launchDates.includes(today) ? today : yesterday;
        for (let i = 1; i < 365; i++) {
          const prev = new Date(new Date(checkDate + 'T00:00:00').getTime() - 86400000).toISOString().split('T')[0];
          if (launchDates.includes(prev)) { currentStreak++; checkDate = prev; }
          else break;
        }
      }
    }

    let streakXp = 0;
    const weekGroups = new Map<string, number>();
    for (const d of [...launchDates].sort()) {
      const week = getWeekStart(d);
      const n = (weekGroups.get(week) || 0) + 1;
      weekGroups.set(week, n);
      if (n > 1) streakXp += Math.min(STREAK_BONUS_PER_DAY * (n - 1), STREAK_BONUS_CAP);
    }

    const treeXp: Record<SkillTree, number> = { create: 0, move: 0, grow: 0, explore: 0, connect: 0 };
    let questXp = 0;
    for (const c of state.questCompletions) {
      const q = allQuests.find(q => q.id === c.questId);
      if (q) { treeXp[q.tree] += q.xp; questXp += q.xp; }
    }

    const debriefXp = state.debriefs.length * DEBRIEF_XP;

    let balanceXp = 0;
    const weeklyTrees = new Map<string, Set<SkillTree>>();
    for (const c of state.questCompletions) {
      const q = allQuests.find(q => q.id === c.questId);
      if (q) {
        const week = getWeekStart(c.date);
        if (!weeklyTrees.has(week)) weeklyTrees.set(week, new Set());
        weeklyTrees.get(week)!.add(q.tree);
      }
    }
    for (const trees of weeklyTrees.values()) {
      if (trees.size === 5) balanceXp += BALANCE_BONUS;
    }

    const thisWeekTrees = weeklyTrees.get(getWeekStart(getToday())) || new Set<SkillTree>();
    const totalXp = launchXp + streakXp + questXp + debriefXp + balanceXp;

    return {
      totalXp, launchXp, streakXp, questXp, debriefXp, balanceXp,
      treeXp, currentStreak, thisWeekTrees,
      totalLaunches: state.morningLaunches.length,
      totalQuests: state.questCompletions.length,
      totalDebriefs: state.debriefs.length,
    };
  }, [state, allQuests]);

  // ── Family / Rewards ──────────────────────────────────────────────────────
  // Family settings (rewards) are saved at the family level, not per-kid
  const setFamilySettings = useCallback((settings: FamilySettings) => {
    update(s => ({ ...s, familySettings: settings }));
    if (familyCode && isParent) saveFamilySettings(familyCode, settings);
  }, [update, familyCode, isParent]);

  const setActiveRewards = useCallback((rewards: ActiveReward[]) => {
    update(s => {
      const next = { ...s, familySettings: { ...s.familySettings, activeRewards: rewards } };
      if (familyCode && isParent) saveFamilySettings(familyCode, next.familySettings);
      return next;
    });
  }, [update, familyCode, isParent]);

  const setPinnedReward = useCallback((id: string | null) => {
    update(s => ({ ...s, familySettings: { ...s.familySettings, pinnedRewardId: id } }));
  }, [update]);

  const claimReward = useCallback((rewardId: string) => {
    update(s => {
      const reward = s.familySettings.activeRewards.find(r => r.id === rewardId);
      if (!reward) return s;
      const claim: RewardClaim = {
        id: Date.now().toString(),
        rewardId,
        rewardName: reward.name,
        rewardEmoji: reward.emoji,
        claimedAt: new Date().toISOString(),
      };
      const next = {
        ...s,
        familySettings: {
          ...s.familySettings,
          claimedRewards: [...s.familySettings.claimedRewards, claim],
          pinnedRewardId: null,
        },
      };
      if (familyCode && isParent) saveFamilySettings(familyCode, next.familySettings);
      return next;
    });
  }, [update, familyCode, isParent]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(LOCAL_KEY);
    const blank: PlayerState = {
      profile: null, questCompletions: [], morningLaunches: [],
      debriefs: [], customQuests: [], familySettings: { ...DEFAULT_FAMILY_SETTINGS },
    };
    setState(blank);
    if (uid) savePlayerData(uid, blank);
  }, [uid]);

  return {
    state, stats, synced,
    setProfile, completeMorningLaunch, getTodayLaunch,
    completeQuest, addCustomQuest, allQuests, getQuestCompletionsToday,
    submitDebrief, getTodayDebrief,
    setFamilySettings, setActiveRewards, setPinnedReward, claimReward,
    resetAll,
  };
}
