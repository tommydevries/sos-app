import { useState } from 'react';

interface WalkthroughProps {
  name: string;
  onComplete: () => void;
}

const slides = [
  {
    emoji: '🚀',
    title: 'Morning Launch',
    desc: 'Start every day by checking off your morning routine and setting a goal.',
    badge: '+50 XP',
    badgeColor: '#f59e0b',
    bg: '#fffbeb',
    accent: '#f59e0b',
  },
  {
    emoji: '🎯',
    title: 'Go on Quests',
    desc: 'Pick adventures across 5 skill trees — Create, Move, Grow, Explore, and Connect.',
    badge: '+25–100 XP each',
    badgeColor: '#6366f1',
    bg: '#eef2ff',
    accent: '#6366f1',
  },
  {
    emoji: '📝',
    title: 'End with a Debrief',
    desc: 'At the end of the day, reflect on what went well and what you want to do tomorrow.',
    badge: '+15 XP',
    badgeColor: '#10b981',
    bg: '#ecfdf5',
    accent: '#10b981',
  },
  {
    emoji: '⭐',
    title: 'Level Up All Summer',
    desc: 'Earn XP, climb 10 ranks, and grow 5 skill trees. Your quests. Your summer. Your story.',
    badge: null,
    badgeColor: '#111827',
    bg: '#f9fafb',
    accent: '#111827',
  },
];

export default function Walkthrough({ name, onComplete }: WalkthroughProps) {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const advance = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setExiting(true);
    setTimeout(() => {
      setIndex(i => i + 1);
      setExiting(false);
    }, 200);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: slide.bg, transition: 'background-color 0.4s ease' }}
    >
      {/* Skip */}
      <div className="flex justify-end p-5">
        <button
          onClick={onComplete}
          className="text-sm font-medium text-gray-400 px-3 py-1"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.2s ease' }}
      >
        {/* Slide number */}
        <p className="text-xs font-semibold text-gray-400 mb-6 tracking-widest uppercase">
          {index + 1} of {slides.length}
        </p>

        {/* Emoji */}
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mb-8 shadow-sm"
          style={{ backgroundColor: slide.badgeColor + '18' }}
        >
          {slide.emoji}
        </div>

        {/* XP badge */}
        {slide.badge && (
          <div
            className="px-4 py-1.5 rounded-full text-white text-sm font-bold mb-5"
            style={{ backgroundColor: slide.badgeColor }}
          >
            {slide.badge}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-base text-gray-500 leading-relaxed max-w-xs">
          {slide.desc}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? 20 : 8,
              height: 8,
              backgroundColor: i === index ? slide.accent : '#d1d5db',
            }}
          />
        ))}
      </div>

      {/* CTA button */}
      <div className="px-6 pb-10">
        <button
          onClick={advance}
          className="w-full py-4 rounded-2xl font-semibold text-lg text-white active:scale-95 transition-all"
          style={{ backgroundColor: slide.accent }}
        >
          {isLast ? `Let's go, ${name}! 🚀` : 'Next →'}
        </button>
      </div>
    </div>
  );
}
