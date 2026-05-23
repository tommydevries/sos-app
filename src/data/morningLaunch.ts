import type { MorningLaunchItem } from '../types';

export const CORE_ITEMS: MorningLaunchItem[] = [
  { id: 'bed',       label: 'Make your bed',           description: 'Make it tidy and sharp.',                    emoji: '🛏️' },
  { id: 'teeth',     label: 'Brush your teeth',        description: 'Fresh breath. Clean start.',                 emoji: '🪥' },
  { id: 'breakfast', label: 'Eat a healthy breakfast',  description: 'Fuel your brain and your body.',             emoji: '🍳' },
  { id: 'move',      label: 'Move your body',          description: '10 push-ups, 10 sit-ups, 10 squats.',       emoji: '💪' },
  { id: 'clean',     label: 'Clean your space',        description: 'Tidy your room and any mess you made.',      emoji: '🧹' },
  { id: 'goal',      label: 'Set 1 goal for the day',  description: 'What will you accomplish today?',            emoji: '✍️' },
];

export const CHOICE_ITEMS: MorningLaunchItem[] = [
  { id: 'read',     label: 'Read for 20 minutes',      description: 'Any book, any language. Just read.',         emoji: '📚', isChoice: true },
  { id: 'kind',     label: 'Do something kind',        description: 'Make someone smile before your day begins.', emoji: '😊', isChoice: true },
  { id: 'learn',    label: 'Learn something new',      description: 'Watch a tutorial, practice a skill, research a question.', emoji: '💡', isChoice: true },
];

export const MORNING_LAUNCH_XP = 50;
export const STREAK_BONUS_PER_DAY = 10;
export const STREAK_BONUS_CAP = 50;
