interface LandingProps {
  onChooseParent: () => void;
  onChooseKid: () => void;
}

export default function Landing({ onChooseParent, onChooseKid }: LandingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center animate-pop-in max-w-sm w-full">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">SOS</h1>
        <p className="text-base text-gray-400 mb-12">Summer Operating System</p>

        <div className="space-y-3">
          <button
            onClick={onChooseKid}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all"
          >
            🎒  I'm a Kid
          </button>
          <button
            onClick={onChooseParent}
            className="w-full py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg active:scale-95 transition-all"
          >
            👨‍👩‍👧  I'm a Parent
          </button>
        </div>
      </div>
    </div>
  );
}
