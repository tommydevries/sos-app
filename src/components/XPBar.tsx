import { getRank, getNextRank, getRankProgress } from '../data/ranks';

interface XPBarProps {
  totalXp: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPBar({ totalXp, showLabel = true, size = 'md' }: XPBarProps) {
  const rank = getRank(totalXp);
  const next = getNextRank(totalXp);
  const progress = getRankProgress(totalXp);

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: rank.color }}>
            {rank.title}
          </span>
          {next && (
            <span className="text-xs text-gray-400">
              {totalXp} / {next.xpRequired} XP
            </span>
          )}
          {!next && (
            <span className="text-xs text-gray-400">{totalXp} XP</span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-700 ease-out animate-xp-fill`}
          style={{
            width: `${Math.max(progress * 100, 2)}%`,
            backgroundColor: rank.color,
          }}
        />
      </div>
    </div>
  );
}
