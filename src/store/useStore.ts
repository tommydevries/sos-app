import { useState, useCallback, useMemo } from 'react';
import type { PlayerState, PlayerProfile, QuestCompletion, MorningLaunchCompletion, DebriefEntry, Quest, SkillTree, FamilySettings, ActiveReward, RewardClaim } from '../types';
import { DEFAULT_FAMILY_SETTINGS } from '../types';
import { QUESTS } from '../data/quests';
import { MORNING_LAUNCH_XP, STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP } from '../data/morningLaunch';

const STORAGE_KEY = 'sos-player-state';
const DEBRIEF_XP = 15;
const BALANCE_BONUS = 50;

function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Backward compat: add familySettings if missing
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

function saveState(state: PlayerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

export function useStore() {
  const [state, setState] = useState<PlayerState>(loadState);

  const update = useCallback((fn: (prev: PlayerState) => PlayerState) => {
    setState(prev => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  // ── Profile ──
  const setProfile = useCallback((profile: PlayerProfile) => {
    update(s => ({ ...s, profile }));
  }, [update]);

  // ── Morning Launch ──
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

  // ── Quests ──
  const completeQuest = useCallback((questId: string, note?: string) => {
    const completion: QuestCompletion = { questId, date: getToday(), note };
    update(s => ({
      ...s,
      questCompletions: [...s.questCompletions, completion],
    }));
  }, [update]);

  const addCustomQuest = useCallback((quest: Quest) => {
    update(s => ({
      ...s,
      customQuests: [...s.customQuests, quest],
    }));
  }, [update]);

  const allQuests = useMemo(() => {
    return [...QUESTS, ...state.customQuests];
  }, [state.customQuests]);

  const getQuestCompletionsToday = useCallback((): QuestCompletion[] => {
    return state.questCompletions.filter(c => c.date === getToday());
  }, [state.questCompletions]);

  // ── Debrief ──
  const submitDebrief = useCallback((entry: DebriefEntry) => {
    update(s => ({
      ...s,
      debriefs: [
        ...s.debriefs.filter(d => d.date !== entry.date),
        entry,
      ],
    }));
  }, [update]);

  const getTodayDebrief = useCallback((): DebriefEntry | undefined => {
    return state.debriefs.find(d => d.date === getToday());
  }, [state.debriefs]);

  // ── XP Calculations ──
  const stats = useMemo(() => {
    // Total XP from morning launches
    const launchXp = state.morningLaunches.length * MORNING_LAUNCH_XP;

    // Streak calculation
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
          if (launchDates.includes(prev)) {
            currentStreak++;
            checkDate = prev;
          } else {
            break;
          }
        }
      }
    }

    // Streak bonus XP (capped per week at 50)
    let streakXp = 0;
    const weekGroups = new Map<string, number>();
    const sortedDates = [...launchDates].sort();
    for (let i = 0; i < sortedDates.length; i++) {
      const week = getWeekStart(sortedDates[i]);
      const dayInWeek = (weekGroups.get(week) || 0) + 1;
      weekGroups.set(week, dayInWeek);
      if (dayInWeek > 1) {
        streakXp += Math.min(STREAK_BONUS_PER_DAY * (dayInWeek - 1), STREAK_BONUS_CAP);
      }
    }

    // Quest XP per tree
    const treeXp: Record<SkillTree, number> = { create: 0, move: 0, grow: 0, explore: 0, connect: 0 };
    let questXp = 0;
    for (const completion of state.questCompletions) {
      const quest = allQuests.find(q => q.id === completion.questId);
      if (quest) {
        treeXp[quest.tree] += quest.xp;
        questXp += quest.xp;
      }
    }

    // Debrief XP
    const debriefXp = state.debriefs.length * DEBRIEF_XP;

    // Weekly balance bonus
    let balanceXp = 0;
    const weeklyTrees = new Map<string, Set<SkillTree>>();
    for (const completion of state.questCompletions) {
      const quest = allQuests.find(q => q.id === completion.questId);
      if (quest) {
        const week = getWeekStart(completion.date);
        if (!weeklyTrees.has(week)) weeklyTrees.set(week, new Set());
        weeklyTrees.get(week)!.add(quest.tree);
      }
    }
    for (const trees of weeklyTrees.values()) {
      if (trees.size === 5) balanceXp += BALANCE_BONUS;
    }

    // Current week tree coverage
    const thisWeek = getWeekStart(getToday());
    const thisWeekTrees = weeklyTrees.get(thisWeek) || new Set<SkillTree>();

    const totalXp = launchXp + streakXp + questXp + debriefXp + balanceXp;

    return {
      totalXp,
      launchXp,
      streakXp,
      questXp,
      debriefXp,
      balanceXp,
      treeXp,
      currentStreak,
      thisWeekTrees,
      totalLaunches: state.morningLaunches.length,
      totalQuests: state.questCompletions.length,
      totalDebriefs: state.debriefs.length,
    };
  }, [state, allQuests]);

  // ── Family / Rewards ──
  const setFamilySettings = useCallback((settings: FamilySettings) => {
    update(s => ({ ...s, familySettings: settings }));
  }, [update]);

  const setActiveRewards = useCallback((rewards: ActiveReward[]) => {
    update(s => ({ ...s, familySettings: { ...s.familySettings, activeRewards: rewards } }));
  }, [update]);

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
      return {
        ...s,
        familySettings: {
          ...s.familySettings,
          claimedRewards: [...s.familySettings.claimedRewards, claim],
          pinnedRewardId: null, // clear goal after claim
        },
      };
    });
  }, [update]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      profile: null,
      questCompletions: [],
      morningLaunches: [],
      debriefs: [],
      customQuests: [],
      familySettings: { ...DEFAULT_FAMILY_SETTINGS },
    });
  }, []);

  return {
    state,
    stats,
    setProfile,
    completeMorningLaunch,
    getTodayLaunch,
    completeQuest,
    addCustomQuest,
    allQuests,
    getQuestCompletionsToday,
    submitDebrief,
    getTodayDebrief,
    setFamilySettings,
    setActiveRewards,
    setPinnedReward,
    claimReward,
    resetAll,
  };
}
