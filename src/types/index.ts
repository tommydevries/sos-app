export type SkillTree = 'create' | 'move' | 'grow' | 'explore' | 'connect';

export type QuestTier = 1 | 2 | 3;

export interface Quest {
  id: string;
  tree: SkillTree;
  name: string;
  description: string;
  tier: QuestTier;
  xp: number;
  custom?: boolean;
}

export interface QuestCompletion {
  questId: string;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
}

export interface MorningLaunchItem {
  id: string;
  label: string;
  description: string;
  emoji: string;
  isChoice?: boolean;
}

export interface MorningLaunchCompletion {
  date: string;
  completedItems: string[];
  goalText: string;
  goalPlan: string;
}

export interface DebriefEntry {
  date: string;
  wentWell: string;
  wasHard: string;
  tomorrow: string;
}

export interface Rank {
  level: number;
  title: string;
  xpRequired: number;
  color: string;
  bgColor: string;
}

export interface TreeLevel {
  level: number;
  title: string;
  xpRequired: number;
}

export interface PlayerProfile {
  name: string;
  createdAt: string;
}

export interface PlayerState {
  profile: PlayerProfile | null;
  questCompletions: QuestCompletion[];
  morningLaunches: MorningLaunchCompletion[];
  debriefs: DebriefEntry[];
  customQuests: Quest[];
}

export const SKILL_TREE_META: Record<SkillTree, { label: string; emoji: string; color: string; lightColor: string }> = {
  create: { label: 'Create', emoji: '🔨', color: '#f59e0b', lightColor: '#fef3c7' },
  move:   { label: 'Move',   emoji: '⚡', color: '#ef4444', lightColor: '#fee2e2' },
  grow:   { label: 'Grow',   emoji: '🌱', color: '#22c55e', lightColor: '#dcfce7' },
  explore:{ label: 'Explore',emoji: '🧭', color: '#6366f1', lightColor: '#e0e7ff' },
  connect:{ label: 'Connect',emoji: '🔥', color: '#f97316', lightColor: '#ffedd5' },
};
