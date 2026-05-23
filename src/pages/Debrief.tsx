import { useState, useEffect } from 'react';
import type { DebriefEntry } from '../types';
import { getToday } from '../store/useStore';

interface DebriefProps {
  todayDebrief: DebriefEntry | undefined;
  onSubmit: (entry: DebriefEntry) => void;
  questsToday: number;
}

export default function Debrief({ todayDebrief, onSubmit, questsToday }: DebriefProps) {
  const [wentWell, setWentWell] = useState(todayDebrief?.wentWell || '');
  const [wasHard, setWasHard] = useState(todayDebrief?.wasHard || '');
  const [tomorrow, setTomorrow] = useState(todayDebrief?.tomorrow || '');
  const [showComplete, setShowComplete] = useState(false);

  const isCompleted = todayDebrief !== undefined;
  const canSubmit = wentWell.trim() && wasHard.trim() && tomorrow.trim() && !isCompleted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowComplete(true);
    onSubmit({
      date: getToday(),
      wentWell: wentWell.trim(),
      wasHard: wasHard.trim(),
      tomorrow: tomorrow.trim(),
    });
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
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Debrief Complete!</h1>
        <p className="text-lg font-semibold text-green-600">+15 XP</p>
        <p className="text-sm text-gray-400 mt-4">See you tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Mission Debrief</h1>
        <p className="text-xs text-gray-400 mt-1">
          {isCompleted
            ? "Today's debrief is done."
            : `You completed ${questsToday} quest${questsToday !== 1 ? 's' : ''} today. Let's reflect.`
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">😊</span>
            <label className="text-sm font-semibold text-gray-900">
              What went well today?
            </label>
          </div>
          <textarea
            value={wentWell}
            onChange={e => setWentWell(e.target.value)}
            placeholder="Something you're proud of..."
            disabled={isCompleted}
            rows={3}
            className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:border-gray-400 disabled:opacity-60"
          />
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💪</span>
            <label className="text-sm font-semibold text-gray-900">
              What was hard?
            </label>
          </div>
          <textarea
            value={wasHard}
            onChange={e => setWasHard(e.target.value)}
            placeholder="Something you struggled with..."
            disabled={isCompleted}
            rows={3}
            className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:border-gray-400 disabled:opacity-60"
          />
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎯</span>
            <label className="text-sm font-semibold text-gray-900">
              What's one thing you want to do tomorrow?
            </label>
          </div>
          <textarea
            value={tomorrow}
            onChange={e => setTomorrow(e.target.value)}
            placeholder="Something to look forward to..."
            disabled={isCompleted}
            rows={3}
            className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:border-gray-400 disabled:opacity-60"
          />
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gray-900 disabled:opacity-20 active:scale-95 transition-all"
        >
          Submit Debrief  📝  +15 XP
        </button>
      )}
    </div>
  );
}
