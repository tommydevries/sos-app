import { useState } from 'react';
import type { PlayerProfile } from '../types';

interface SetupProps {
  onComplete: (profile: PlayerProfile) => void;
}

export default function Setup({ onComplete }: SetupProps) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {step === 0 && (
        <div className="text-center animate-pop-in max-w-sm">
          <div className="text-6xl mb-6">🧭</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            SOS
          </h1>
          <p className="text-lg text-gray-500 mb-2">
            Summer Operating System
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Your quests. Your summer. Your story.
          </p>
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg active:scale-95 transition-transform"
          >
            Start Your Adventure
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="text-center animate-slide-up max-w-sm w-full">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What's your name?
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Every adventurer needs a name.
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Your first name"
            autoFocus
            className="w-full text-center text-2xl font-semibold py-4 px-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="mt-4 w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg disabled:opacity-30 active:scale-95 transition-all"
          >
            Let's Go
          </button>
        </div>
      )}
    </div>
  );
}
