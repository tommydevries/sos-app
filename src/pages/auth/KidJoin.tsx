import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface KidJoinProps {
  onBack: () => void;
}

export default function KidJoin({ onBack }: KidJoinProps) {
  const { joinAsKid } = useAuth();
  const [step, setStep]         = useState<'code' | 'name'>('code');
  const [code, setCode]         = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleJoin = async () => {
    setError('');
    if (!name.trim()) { setError('Enter your name!'); return; }
    setLoading(true);
    try {
      await joinAsKid(code, name.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <button onClick={onBack} className="text-gray-400 text-2xl mb-8 self-start">←</button>

      <div className="max-w-sm w-full mx-auto text-center">
        {step === 'code' ? (
          <>
            <div className="text-5xl mb-4">🎒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your family code</h1>
            <p className="text-sm text-gray-400 mb-8">
              Ask your parent for the code — it looks like <span className="font-mono font-bold text-gray-600">HAWK-4821</span>
            </p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-0000"
              maxLength={9}
              autoFocus
              className="w-full text-center text-2xl font-bold tracking-widest py-4 px-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-gray-900 focus:outline-none uppercase"
            />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <button
              onClick={() => { setError(''); setStep('name'); }}
              disabled={code.replace('-','').length < 8}
              className="w-full mt-4 py-4 bg-gray-900 text-white rounded-2xl font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
            >
              Next →
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What's your name?</h1>
            <p className="text-sm text-gray-400 mb-8">Every adventurer needs a name.</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="Your first name"
              autoFocus
              className="w-full text-center text-2xl font-semibold py-4 px-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-gray-900 focus:outline-none"
            />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={!name.trim() || loading}
              className="w-full mt-4 py-4 bg-gray-900 text-white rounded-2xl font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
            >
              {loading ? '…' : "Let's Go! 🚀"}
            </button>
            <button onClick={() => setStep('code')} className="w-full mt-2 py-3 text-sm text-gray-400">
              ← Change code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
