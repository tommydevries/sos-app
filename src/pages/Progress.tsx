import type { SkillTree, QuestCompletion, Quest } from '../types';
import { SKILL_TREE_META } from '../types';
import { getRank, getNextRank, getRankProgress, RANKS, getTreeLevel, getTreeLevelProgress, TREE_LEVELS } from '../data/ranks';
import XPBar from '../components/XPBar';

interface ProgressProps {
  totalXp: number;
  treeXp: Record<SkillTree, number>;
  completions: QuestCompletion[];
  allQuests: Quest[];
  totalLaunches: number;
  totalDebriefs: number;
  currentStreak: number;
}

export default function Progress({
  totalXp, treeXp, completions, allQuests,
  totalLaunches, totalDebriefs, currentStreak,
}: ProgressProps) {
  const rank = getRank(totalXp);
  const nextRank = getNextRank(totalXp);
  const trees: SkillTree[] = ['create', 'move', 'grow', 'explore', 'connect'];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Progress</h1>

      {/* Rank Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: rank.color }}
          >
            {rank.level}
          </div>
          <div>
            <p className="font-bold text-xl" style={{ color: rank.color }}>
              {rank.title}
            </p>
            <p className="text-sm text-gray-400">
              {totalXp} XP
              {nextRank && ` • ${nextRank.xpRequired - totalXp} to ${nextRank.title}`}
            </p>
          </div>
        </div>
        <XPBar totalXp={totalXp} size="lg" />

        {/* Rank Timeline */}
        <div className="mt-4 flex items-center gap-1">
          {RANKS.map(r => {
            const isActive = r.level <= rank.level;
            const isCurrent = r.level === rank.level;
            return (
              <div key={r.level} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full h-2 rounded-full transition-all ${isCurrent ? 'animate-xp-pop' : ''}`}
                  style={{
                    backgroundColor: isActive ? r.color : '#e5e7eb',
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
                <span className={`text-[8px] mt-1 ${isActive ? 'font-bold text-gray-700' : 'text-gray-300'}`}>
                  {r.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Trees */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-gray-900">Skill Trees</h2>
        {trees.map(tree => {
          const meta = SKILL_TREE_META[tree];
          const xp = treeXp[tree];
          const level = getTreeLevel(xp);
          const progress = getTreeLevelProgress(xp);
          const nextLevel = TREE_LEVELS[TREE_LEVELS.indexOf(level) + 1];
          const treeCompletions = completions.filter(c => {
            const q = allQuests.find(quest => quest.id === c.questId);
            return q?.tree === tree;
          });

          return (
            <div
              key={tree}
              className="bg-white rounded-2xl p-4 border-2 transition-all"
              style={{ borderColor: meta.color + '40' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: meta.lightColor }}
                >
                  {meta.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900">{meta.label}</h3>
                    <span className="text-xs font-bold" style={{ color: meta.color }}>
                      {level.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {xp} XP • {treeCompletions.length} quest{treeCompletions.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 animate-xp-fill"
                  style={{
                    width: `${Math.max(progress * 100, 3)}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
              {nextLevel && (
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  {nextLevel.xpRequired - xp} XP to {nextLevel.title}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-sm text-gray-900 mb-3">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalLaunches}</p>
            <p className="text-xs text-gray-400">Launches</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{completions.length}</p>
            <p className="text-xs text-gray-400">Quests Done</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{currentStreak}</p>
            <p className="text-xs text-gray-400">Day Streak 🔥</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalDebriefs}</p>
            <p className="text-xs text-gray-400">Debriefs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
