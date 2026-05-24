import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ParentAuthProps {
  onBack: () => void;
}

export default function ParentAuth({ onBack }: ParentAuthProps) {
  const { signInParent, signUpParent } = useAuth();
  const [mode, setMode]       = useState<'login' | 'signup'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Enter your email and password.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await signInParent(email.trim(), password);
      else await signUpParent(email.trim(), password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <button onClick={onBack} className="text-gray-400 text-2xl mb-8 self-start">←</button>

      <div className="max-w-sm w-full mx-auto">
        <div className="text-4xl mb-4">👨‍👩‍👧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create your family'}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {mode === 'login'
            ? 'Sign in to see your kids\' progress.'
            : 'Set up a family and get a code your kids use to join.'}
        </p>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
            autoComplete="email"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none text-base"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none text-base"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          onClick={handle}
          disabled={loading}
          className="w-full mt-5 py-4 bg-gray-900 text-white rounded-2xl font-bold text-base disabled:opacity-40 active:scale-95 transition-all"
        >
          {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Family'}
        </button>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
          className="w-full mt-3 py-3 text-sm text-gray-400 font-medium"
        >
          {mode === 'login' ? 'New here? Create a family →' : 'Already have an account? Sign in →'}
        </button>
      </div>
    </div>
  );
}
