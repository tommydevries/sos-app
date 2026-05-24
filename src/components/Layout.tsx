import type { ReactNode } from 'react';

export type Tab = 'home' | 'launch' | 'quests' | 'rewards' | 'progress' | 'debrief';

interface LayoutProps {
  children: ReactNode;
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  playerName?: string;
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home',     label: 'Home',    emoji: '🏠' },
  { id: 'launch',   label: 'Launch',  emoji: '🚀' },
  { id: 'quests',   label: 'Quests',  emoji: '🎯' },
  { id: 'rewards',  label: 'Rewards', emoji: '🎁' },
  { id: 'progress', label: 'Stats',   emoji: '📊' },
  { id: 'debrief',  label: 'Debrief', emoji: '📝' },
];

export default function Layout({ children, currentTab, onTabChange, playerName }: LayoutProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-gray-900">SOS</span>
          <span className="text-xs text-gray-400 font-medium">Summer Operating System</span>
        </div>
        {playerName && (
          <span className="text-sm font-medium text-gray-600">{playerName}</span>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-gray-200 px-2 pb-safe shrink-0">
        <div className="flex justify-around">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-1 flex-1 transition-colors ${
                currentTab === tab.id ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span className={`text-[9px] mt-0.5 font-medium ${
                currentTab === tab.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
