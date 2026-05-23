import { useState } from 'react';
import type { Quest } from '../types';
import { SKILL_TREE_META } from '../types';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, note?: string) => void;
  completedToday: boolean;
  totalCompletions: number;
}

export default function QuestCard({ quest, onComplete, completedToday, totalCompletions }: QuestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const meta = SKILL_TREE_META[quest.tree];

  const stars = Array.from({ length: quest.tier }, (_, i) => i);

  const handleComplete = () => {
    setJustCompleted(true);
    onComplete(quest.id, note || undefined);
    setTimeout(() => {
      setExpanded(false);
      setNote('');
    }, 800);
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 ${
        completedToday ? 'opacity-60' : ''
      } ${justCompleted ? 'animate-pop-in' : ''}`}
      style={{
        borderColor: completedToday ? '#d1d5db' : meta.color,
        backgroundColor: completedToday ? '#f9fafb' : 'white',
      }}
    >
      <button
        onClick={() => !completedToday && setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3"
        disabled={completedToday}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xl"
          style={{ backgroundColor: meta.lightColor }}
        >
          {completedToday ? '✅' : meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {quest.name}
            </h3>
            {quest.custom && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Custom</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-bold" style={{ color: meta.color }}>
              +{quest.xp} XP
            </span>
            <span className="text-xs text-amber-500">
              {stars.map((_, i) => <span key={i}>★</span>)}
            </span>
            {totalCompletions > 0 && (
              <span className="text-[10px] text-gray-400">
                Done {totalCompletions}x
              </span>
            )}
          </div>
        </div>
      </button>

      {expanded && !completedToday && (
        <div className="px-4 pb-4 animate-slide-up">
          <div className="border-t border-gray-100 pt-3">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What did you do? (optional)"
              className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ focusRingColor: meta.color } as any}
              rows={2}
            />
            <button
              onClick={handleComplete}
              className="mt-2 w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform"
              style={{ backgroundColor: meta.color }}
            >
              Complete Quest  +{quest.xp} XP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
