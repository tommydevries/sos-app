import { useState } from 'react';
import type { Quest, SkillTree, QuestCompletion } from '../types';
import { SKILL_TREE_META } from '../types';
import QuestCard from '../components/QuestCard';

interface QuestsProps {
  allQuests: Quest[];
  completions: QuestCompletion[];
  todayCompletions: QuestCompletion[];
  onComplete: (questId: string, note?: string) => void;
  onAddCustom: (quest: Quest) => void;
}

type FilterTab = 'all' | SkillTree;

export default function Quests({ allQuests, completions, todayCompletions, onComplete, onAddCustom }: QuestsProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newQuest, setNewQuest] = useState({ name: '', description: '', tree: 'create' as SkillTree, tier: 1 as 1 | 2 | 3 });

  const trees: SkillTree[] = ['create', 'move', 'grow', 'explore', 'connect'];

  const filtered = filter === 'all'
    ? allQuests
    : allQuests.filter(q => q.tree === filter);

  const getCompletionCount = (questId: string) =>
    completions.filter(c => c.questId === questId).length;

  const isCompletedToday = (questId: string) =>
    todayCompletions.some(c => c.questId === questId);

  const handleAddCustom = () => {
    if (!newQuest.name.trim()) return;
    const xpMap = { 1: 25, 2: 50, 3: 100 };
    const quest: Quest = {
      id: `custom-${Date.now()}`,
      tree: newQuest.tree,
      name: newQuest.name.trim(),
      description: newQuest.description.trim() || 'Custom quest',
      tier: newQuest.tier,
      xp: xpMap[newQuest.tier],
      custom: true,
    };
    onAddCustom(quest);
    setNewQuest({ name: '', description: '', tree: 'create', tier: 1 });
    setShowAdd(false);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Quests</h1>
        <span className="text-xs text-gray-400">{todayCompletions.length} done today</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          All
        </button>
        {trees.map(tree => {
          const meta = SKILL_TREE_META[tree];
          return (
            <button
              key={tree}
              onClick={() => setFilter(tree)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors`}
              style={{
                backgroundColor: filter === tree ? meta.color : meta.lightColor,
                color: filter === tree ? 'white' : meta.color,
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {filtered.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={onComplete}
            completedToday={isCompletedToday(quest.id)}
            totalCompletions={getCompletionCount(quest.id)}
          />
        ))}
      </div>

      {/* Add Custom Quest */}
      <div className="mt-6">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-400 active:scale-95 transition-transform"
          >
            + Create Your Own Quest
          </button>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 space-y-3 animate-slide-up">
            <h3 className="font-semibold text-sm text-gray-900">New Quest</h3>
            <input
              type="text"
              value={newQuest.name}
              onChange={e => setNewQuest(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Quest name"
              autoFocus
              className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
            />
            <input
              type="text"
              value={newQuest.description}
              onChange={e => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What do you have to do?"
              className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
            />

            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Skill Tree</p>
              <div className="flex gap-1.5">
                {trees.map(tree => {
                  const meta = SKILL_TREE_META[tree];
                  return (
                    <button
                      key={tree}
                      onClick={() => setNewQuest(prev => ({ ...prev, tree }))}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: newQuest.tree === tree ? meta.color : meta.lightColor,
                        color: newQuest.tree === tree ? 'white' : meta.color,
                      }}
                    >
                      {meta.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Difficulty</p>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setNewQuest(prev => ({ ...prev, tier }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      newQuest.tier === tier
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {'★'.repeat(tier)} ({tier === 1 ? '25' : tier === 2 ? '50' : '100'} XP)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustom}
                disabled={!newQuest.name.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 disabled:opacity-30"
              >
                Add Quest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
