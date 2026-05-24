import type { RewardCategory } from '../types';

export interface RewardSuggestion {
  id: string;
  emoji: string;
  name: string;
  category: RewardCategory;
  defaultXp: number;
}

export const REWARD_SUGGESTIONS: RewardSuggestion[] = [
  // Screen Time
  { id: 's_screen_30',   emoji: '📱', name: '30 min extra screen time', category: 'screentime', defaultXp: 300 },
  { id: 's_movie',       emoji: '🎬', name: 'Pick the movie tonight',   category: 'screentime', defaultXp: 400 },
  { id: 's_gaming',      emoji: '🎮', name: '1-hour gaming session',     category: 'screentime', defaultXp: 500 },
  // Experiences
  { id: 's_dinner',      emoji: '🍕', name: 'Choose what\'s for dinner', category: 'experience', defaultXp: 250 },
  { id: 's_ice_cream',   emoji: '🍦', name: 'Ice cream run',             category: 'experience', defaultXp: 300 },
  { id: 's_sleepover',   emoji: '🏕️', name: 'Sleepover with a friend',   category: 'experience', defaultXp: 800 },
  { id: 's_bowling',     emoji: '🎳', name: 'Bowling trip',              category: 'experience', defaultXp: 1000 },
  { id: 's_outing',      emoji: '🚗', name: 'Pick the family outing',    category: 'experience', defaultXp: 1200 },
  // Privileges
  { id: 's_skip_chore',  emoji: '🧹', name: 'Skip one chore',            category: 'privilege',  defaultXp: 200 },
  { id: 's_late_bed',    emoji: '🌙', name: 'Stay up 30 min later',      category: 'privilege',  defaultXp: 350 },
  { id: 's_pick_act',    emoji: '🎯', name: 'Pick the family activity',  category: 'privilege',  defaultXp: 500 },
  // Money
  { id: 's_dollar',      emoji: '💵', name: '$1 bonus',                  category: 'money',      defaultXp: 150 },
  { id: 's_five',        emoji: '💰', name: '$5 bonus',                  category: 'money',      defaultXp: 600 },
  { id: 's_ten',         emoji: '💎', name: '$10 bonus',                 category: 'money',      defaultXp: 1200 },
  // Items
  { id: 's_book',        emoji: '📚', name: 'Book of your choice',       category: 'item',       defaultXp: 600 },
  { id: 's_art',         emoji: '🎨', name: 'Art supplies',              category: 'item',       defaultXp: 700 },
  { id: 's_toy',         emoji: '🧸', name: 'Small toy or game',         category: 'item',       defaultXp: 1000 },
];

export const CATEGORY_META: Record<RewardCategory, { label: string; color: string; bg: string }> = {
  screentime: { label: 'Screen Time', color: '#6366f1', bg: '#eef2ff' },
  experience: { label: 'Experiences', color: '#f59e0b', bg: '#fffbeb' },
  privilege:  { label: 'Privileges',  color: '#ec4899', bg: '#fdf2f8' },
  money:      { label: 'Money',       color: '#22c55e', bg: '#f0fdf4' },
  item:       { label: 'Items',       color: '#f97316', bg: '#fff7ed' },
};
