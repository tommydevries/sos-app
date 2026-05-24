import { useState } from 'react';

interface ParentGateProps {
  storedPin: string;          // '' means no PIN set yet
  onSuccess: (pin: string) => void; // passes the (possibly new) PIN back
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function ParentGate({ storedPin, onSuccess, onCancel, title, subtitle }: ParentGateProps) {
  const isSetup = storedPin === '';
  const [digits, setDigits]       = useState<string[]>([]);
  const [confirmDigits, setConfirmDigits] = useState<string[]>([]);
  const [confirmPhase, setConfirmPhase]   = useState(false);
  const [shake, setShake]         = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  const current = confirmPhase ? confirmDigits : digits;
  const setCurrent = confirmPhase ? setConfirmDigits : setDigits;

  const triggerShake = (msg: string) => {
    setShake(true);
    setErrorMsg(msg);
    setTimeout(() => { setShake(false); setErrorMsg(''); }, 700);
  };

  const handleDigit = (d: string) => {
    if (current.length >= 4) return;
    const next = [...current, d];
    setCurrent(next);

    if (next.length === 4) {
      const entered = next.join('');
      setTimeout(() => {
        if (isSetup) {
          if (!confirmPhase) {
            // First entry of new PIN — move to confirm phase
            setConfirmPhase(true);
          } else {
            // Confirm phase — check they match
            if (entered === digits.join('')) {
              onSuccess(entered);
            } else {
              setConfirmDigits([]);
              triggerShake('PINs don\'t match. Try again.');
            }
          }
        } else {
          // Checking against stored PIN
          if (entered === storedPin) {
            onSuccess(storedPin);
          } else {
            setDigits([]);
            triggerShake('Wrong PIN');
          }
        }
      }, 120);
    }
  };

  const handleDelete = () => {
    setCurrent(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const displayDigits = confirmPhase ? confirmDigits : digits;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
         onClick={onCancel}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-sm pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pt-6 pb-4 px-6">
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="text-lg font-bold text-gray-900">
            {title || (isSetup ? 'Set a Parent PIN' : 'Parent Access')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSetup
              ? (confirmPhase ? 'Enter the PIN again to confirm' : 'Choose a 4-digit PIN only you know')
              : (subtitle || 'Enter your 4-digit PIN to continue')
            }
          </p>
        </div>

        {/* Dots */}
        <div className={`flex justify-center gap-4 py-4 ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                displayDigits.length > i
                  ? 'bg-gray-900 border-gray-900'
                  : 'bg-transparent border-gray-300'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-center text-sm text-red-500 font-medium mb-2">{errorMsg}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 mx-4 rounded-2xl overflow-hidden mb-4">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
            <button
              key={i}
              onClick={() => key === '⌫' ? handleDelete() : key !== '' ? handleDigit(key) : undefined}
              disabled={key === ''}
              className={`py-5 text-xl font-semibold bg-white active:bg-gray-100 transition-colors ${
                key === '' ? 'opacity-0 pointer-events-none' : 'text-gray-900'
              } ${key === '⌫' ? 'text-gray-500' : ''}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full py-4 text-sm font-medium text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
