import XPBar from '../components/XPBar';
import TreeBadge from '../components/TreeBadge';
import { getRank } from '../data/ranks';
import type { SkillTree, ActiveReward } from '../types';
import { SKILL_TREE_META } from '../types';
import type { Tab } from '../components/Layout';

interface HomeProps {
  name: string;
  totalXp: number;
  treeXp: Record<SkillTree, number>;
  currentStreak: number;
  launchDoneToday: boolean;
  questsToday: number;
  debriefDoneToday: boolean;
  thisWeekTrees: Set<SkillTree>;
  pinnedReward: ActiveReward | null;
  onNavigate: (tab: Tab) => void;
}

export default function Home({
  name, totalXp, treeXp, currentStreak,
  launchDoneToday, questsToday, debriefDoneToday,
  thisWeekTrees, pinnedReward, onNavigate,
}: HomeProps) {
  const rank = getRank(totalXp);
  const trees: SkillTree[] = ['create', 'move', 'grow', 'explore', 'connect'];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isFirstDay = totalXp === 0 && !launchDoneToday;

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="animate-slide-up">
        <p className="text-sm text-gray-400">{greeting()}</p>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      </div>

      {/* First-day welcome card */}
      {isFirstDay && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 animate-pop-in">
          <p className="font-bold text-amber-900 mb-1">👋 Welcome to SOS!</p>
          <p className="text-sm text-amber-800 mb-3">
            Every day has 3 missions: do your <strong>Morning Launch</strong>, complete some <strong>Quests</strong>, then <strong>Debrief</strong> at the end of the day. Start right here ↓
          </p>
          <button
            onClick={() => onNavigate('launch')}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold text-base active:scale-95 transition-all"
          >
            🚀 Start Morning Launch
          </button>
        </div>
      )}

      {/* Rank + XP */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: rank.color }}
          >
            {rank.level}
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900" style={{ color: rank.color }}>
              {rank.title}
            </p>
            <p className="text-sm text-gray-400">{totalXp} Total XP</p>
          </div>
          {currentStreak > 0 && (
            <div className="ml-auto text-center">
              <p className="text-2xl">🔥</p>
              <p className="text-xs font-bold text-gray-600">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
        <XPBar totalXp={totalXp} />
      </div>

      {/* Today's Status */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slide-up">
        <h2 className="font-bold text-sm text-gray-900 mb-3">Today</h2>
        <div className="space-y-2">
          <button
            onClick={() => onNavigate('launch')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              launchDoneToday ? 'bg-green-50' : 'bg-amber-400'
            }`}
          >
            <span className="text-xl">{launchDoneToday ? '✅' : '🚀'}</span>
            <span className={`text-sm font-semibold ${launchDoneToday ? 'text-green-700' : 'text-white'}`}>
              {launchDoneToday ? 'Morning Launch complete!' : 'Morning Launch — tap to start!'}
            </span>
            {!launchDoneToday && (
              <span className="ml-auto text-xs font-bold text-amber-100">+50 XP</span>
            )}
          </button>

          <button
            onClick={() => onNavigate('quests')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              questsToday >= 2 ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <span className="text-xl">{questsToday >= 2 ? '✅' : '🎯'}</span>
            <span className={`text-sm font-medium ${questsToday >= 2 ? 'text-green-700' : 'text-gray-700'}`}>
              {questsToday} quest{questsToday !== 1 ? 's' : ''} completed
              {questsToday < 2 && ` (${2 - questsToday} more to go)`}
            </span>
          </button>

          <button
            onClick={() => onNavigate('debrief')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              debriefDoneToday ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <span className="text-xl">{debriefDoneToday ? '✅' : '📝'}</span>
            <span className={`text-sm font-medium ${debriefDoneToday ? 'text-green-700' : 'text-gray-700'}`}>
              {debriefDoneToday ? 'Debrief done' : 'Debrief waiting'}
            </span>
            {!debriefDoneToday && (
              <span className="ml-auto text-xs font-bold text-gray-400">+15 XP</span>
            )}
          </button>
        </div>
      </div>

      {/* Working Toward (pinned reward) */}
      {pinnedReward && (
        <button
          onClick={() => onNavigate('rewards')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slide-up text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{pinnedReward.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Working Toward</p>
              <p className="font-bold text-gray-900 text-sm truncate">{pinnedReward.name}</p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((totalXp / pinnedReward.xpRequired) * 100, 100)}%`,
                    backgroundColor: totalXp >= pinnedReward.xpRequired ? '#22c55e' : '#f59e0b',
                  }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              {totalXp >= pinnedReward.xpRequired ? (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Claim!</span>
              ) : (
                <p className="text-xs font-bold text-gray-500">
                  {Math.min(totalXp, pinnedReward.xpRequired).toLocaleString()}<br/>
                  <span className="text-gray-300">/ {pinnedReward.xpRequired.toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
        </button>
      )}

      {/* Skill Trees */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-gray-900">Skill Trees</h2>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs text-gray-400 font-medium"
          >
            See all
          </button>
        </div>
        <div className="flex justify-between">
          {trees.map(tree => (
            <TreeBadge key={tree} tree={tree} xp={treeXp[tree]} showProgress size="sm" />
          ))}
        </div>
      </div>

      {/* Weekly Balance */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-gray-900">This Week's Balance</h2>
          {thisWeekTrees.size === 5 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +50 XP Bonus!
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {trees.map(tree => {
            const done = thisWeekTrees.has(tree);
            const meta = SKILL_TREE_META[tree];
            return (
              <div
                key={tree}
                className={`flex-1 py-2 rounded-xl text-center text-xs font-medium transition-all ${
                  done ? 'text-white' : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: done ? meta.color : '#f3f4f6',
                }}
              >
                {meta.emoji}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {thisWeekTrees.size}/5 trees this week
          {thisWeekTrees.size < 5 && ` • Complete all 5 for a bonus`}
        </p>
      </div>
    </div>
  );
}
