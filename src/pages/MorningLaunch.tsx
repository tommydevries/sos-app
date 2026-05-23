import { useState, useEffect } from 'react';
import { CORE_ITEMS, CHOICE_ITEMS, MORNING_LAUNCH_XP } from '../data/morningLaunch';
import type { MorningLaunchCompletion } from '../types';
import { getToday } from '../store/useStore';

interface MorningLaunchProps {
  todayLaunch: MorningLaunchCompletion | undefined;
  onComplete: (completion: MorningLaunchCompletion) => void;
  streak: number;
}

export default function MorningLaunch({ todayLaunch, onComplete, streak }: MorningLaunchProps) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(todayLaunch?.completedItems || [])
  );
  const [goalText, setGoalText] = useState(todayLaunch?.goalText || '');
  const [goalPlan, setGoalPlan] = useState(todayLaunch?.goalPlan || '');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    todayLaunch?.completedItems.find(id => CHOICE_ITEMS.some(c => c.id === id)) || null
  );
  const [showComplete, setShowComplete] = useState(false);

  const isCompleted = todayLaunch !== undefined;

  const allCoreChecked = CORE_ITEMS.every(item => checked.has(item.id));
  const hasChoice = selectedChoice !== null && checked.has(selectedChoice);
  const hasGoal = goalText.trim().length > 0;
  const canComplete = allCoreChecked && hasChoice && hasGoal && !isCompleted;

  const toggle = (id: string) => {
    if (isCompleted) return;
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleComplete = () => {
    if (!canComplete) return;
    setShowComplete(true);
    const completion: MorningLaunchCompletion = {
      date: getToday(),
      completedItems: Array.from(checked),
      goalText,
      goalPlan,
    };
    onComplete(completion);
  };

  useEffect(() => {
    if (showComplete) {
      const timer = setTimeout(() => setShowComplete(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showComplete]);

  if (showComplete) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 animate-pop-in">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Launch Complete!</h1>
        <p className="text-lg font-semibold text-green-600 mb-1">+{MORNING_LAUNCH_XP} XP</p>
        {streak > 1 && (
          <p className="text-sm text-amber-600 font-medium">
            🔥 {streak} day streak! +{Math.min((streak - 1) * 10, 50)} bonus XP
          </p>
        )}
        <p className="text-sm text-gray-400 mt-4">You're cleared for quests.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-xl font-bold text-gray-900">Morning Launch</h1>
        <p className="text-xs text-gray-400 mt-1">
          {isCompleted ? "Today's launch is complete!" : 'Complete all items to earn +50 XP'}
        </p>
      </div>

      {/* Core Items */}
      <div className="space-y-2">
        {CORE_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            disabled={isCompleted}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              checked.has(item.id)
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100'
            } ${isCompleted ? 'opacity-70' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border-2 transition-all ${
                checked.has(item.id)
                  ? 'bg-green-500 border-green-500 text-white animate-check-pop'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {checked.has(item.id) && '✓'}
            </div>
            <span className="text-lg">{item.emoji}</span>
            <div className="text-left">
              <p className={`text-sm font-semibold ${
                checked.has(item.id) ? 'text-green-700' : 'text-gray-900'
              }`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Goal Section */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✍️</span>
          <span className="text-sm font-semibold text-gray-900">Today's Goal</span>
        </div>
        <input
          type="text"
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder="What's one thing you'll accomplish today?"
          disabled={isCompleted}
          className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400 disabled:opacity-60"
        />
        <input
          type="text"
          value={goalPlan}
          onChange={e => setGoalPlan(e.target.value)}
          placeholder="How will you make it happen?"
          disabled={isCompleted}
          className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400 disabled:opacity-60"
        />
      </div>

      {/* Choice Section */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
          Pick one
        </p>
        {CHOICE_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (isCompleted) return;
              if (selectedChoice === item.id) {
                setSelectedChoice(null);
                setChecked(prev => { const n = new Set(prev); n.delete(item.id); return n; });
              } else {
                if (selectedChoice) {
                  setChecked(prev => { const n = new Set(prev); n.delete(selectedChoice); return n; });
                }
                setSelectedChoice(item.id);
                setChecked(prev => new Set(prev).add(item.id));
              }
            }}
            disabled={isCompleted}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              checked.has(item.id)
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-white border-gray-100'
            } ${isCompleted ? 'opacity-70' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                checked.has(item.id)
                  ? 'bg-indigo-500 border-indigo-500 text-white animate-check-pop'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {checked.has(item.id) && '✓'}
            </div>
            <span className="text-lg">{item.emoji}</span>
            <div className="text-left">
              <p className={`text-sm font-semibold ${
                checked.has(item.id) ? 'text-indigo-700' : 'text-gray-900'
              }`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <button
          onClick={handleComplete}
          disabled={!canComplete}
          className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gray-900 disabled:opacity-20 active:scale-95 transition-all"
        >
          Complete Launch  🚀  +{MORNING_LAUNCH_XP} XP
        </button>
      )}
    </div>
  );
}
