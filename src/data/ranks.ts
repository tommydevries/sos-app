import type { Rank, TreeLevel } from '../types';

export const RANKS: Rank[] = [
  { level: 1,  title: 'Rookie',      xpRequired: 0,     color: '#9ca3af', bgColor: '#f3f4f6' },
  { level: 2,  title: 'Scout',       xpRequired: 500,   color: '#22c55e', bgColor: '#dcfce7' },
  { level: 3,  title: 'Pathfinder',  xpRequired: 1200,  color: '#3b82f6', bgColor: '#dbeafe' },
  { level: 4,  title: 'Adventurer',  xpRequired: 2200,  color: '#14b8a6', bgColor: '#ccfbf1' },
  { level: 5,  title: 'Explorer',    xpRequired: 3500,  color: '#8b5cf6', bgColor: '#ede9fe' },
  { level: 6,  title: 'Trailblazer', xpRequired: 5000,  color: '#f97316', bgColor: '#ffedd5' },
  { level: 7,  title: 'Ranger',      xpRequired: 7000,  color: '#ef4444', bgColor: '#fee2e2' },
  { level: 8,  title: 'Vanguard',    xpRequired: 9500,  color: '#94a3b8', bgColor: '#f1f5f9' },
  { level: 9,  title: 'Champion',    xpRequired: 12500, color: '#eab308', bgColor: '#fef9c3' },
  { level: 10, title: 'Legend',      xpRequired: 16000, color: '#111827', bgColor: '#fef9c3' },
];

export const TREE_LEVELS: TreeLevel[] = [
  { level: 1, title: 'Beginner',    xpRequired: 0 },
  { level: 2, title: 'Apprentice',  xpRequired: 200 },
  { level: 3, title: 'Journeyman',  xpRequired: 500 },
  { level: 4, title: 'Expert',      xpRequired: 1000 },
  { level: 5, title: 'Master',      xpRequired: 2000 },
];

export function getRank(totalXp: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalXp >= rank.xpRequired) {
      current = rank;
    } else {
      break;
    }
  }
  return current;
}

export function getNextRank(totalXp: number): Rank | null {
  const current = getRank(totalXp);
  const next = RANKS.find(r => r.level === current.level + 1);
  return next || null;
}

export function getRankProgress(totalXp: number): number {
  const current = getRank(totalXp);
  const next = getNextRank(totalXp);
  if (!next) return 1;
  const rangeXp = next.xpRequired - current.xpRequired;
  const progressXp = totalXp - current.xpRequired;
  return Math.min(progressXp / rangeXp, 1);
}

export function getTreeLevel(treeXp: number): TreeLevel {
  let current = TREE_LEVELS[0];
  for (const level of TREE_LEVELS) {
    if (treeXp >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getTreeLevelProgress(treeXp: number): number {
  const current = getTreeLevel(treeXp);
  const idx = TREE_LEVELS.indexOf(current);
  const next = TREE_LEVELS[idx + 1];
  if (!next) return 1;
  const range = next.xpRequired - current.xpRequired;
  const progress = treeXp - current.xpRequired;
  return Math.min(progress / range, 1);
}
