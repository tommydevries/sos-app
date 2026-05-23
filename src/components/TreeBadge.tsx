import type { SkillTree } from '../types';
import { SKILL_TREE_META } from '../types';
import { getTreeLevel, getTreeLevelProgress } from '../data/ranks';

interface TreeBadgeProps {
  tree: SkillTree;
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function TreeBadge({ tree, xp, size = 'md', showProgress = false }: TreeBadgeProps) {
  const meta = SKILL_TREE_META[tree];
  const level = getTreeLevel(xp);
  const progress = getTreeLevelProgress(xp);

  const sizes = {
    sm: { box: 'w-10 h-10', emoji: 'text-lg', text: 'text-[9px]' },
    md: { box: 'w-14 h-14', emoji: 'text-2xl', text: 'text-[10px]' },
    lg: { box: 'w-20 h-20', emoji: 'text-3xl', text: 'text-xs' },
  };

  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${s.box} rounded-xl flex flex-col items-center justify-center relative overflow-hidden`}
        style={{ backgroundColor: meta.lightColor, border: `2px solid ${meta.color}` }}
      >
        {showProgress && (
          <div
            className="absolute bottom-0 left-0 right-0 opacity-20 transition-all duration-500"
            style={{
              height: `${progress * 100}%`,
              backgroundColor: meta.color,
            }}
          />
        )}
        <span className={s.emoji}>{meta.emoji}</span>
      </div>
      <span className={`${s.text} font-semibold text-gray-600 text-center leading-tight`}>
        {meta.label}
      </span>
      {showProgress && (
        <span className={`${s.text} font-medium text-center leading-tight`} style={{ color: meta.color }}>
          {level.title}
        </span>
      )}
    </div>
  );
}
