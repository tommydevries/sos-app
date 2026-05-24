import { useState } from 'react';
import type { ActiveReward, FamilySettings } from '../types';
import { CATEGORY_META, REWARD_SUGGESTIONS } from '../data/rewardSuggestions';
import ParentGate from '../components/ParentGate';

interface RewardsProps {
  totalXp: number;
  familySettings: FamilySettings;
  onSetActiveRewards: (rewards: ActiveReward[]) => void;
  onSetPinned: (id: string | null) => void;
  onClaim: (rewardId: string) => void;
  onSaveFamilySettings: (settings: FamilySettings) => void;
}

type View = 'kid' | 'parent';

export default function Rewards({
  totalXp, familySettings,
  onSetActiveRewards, onSetPinned, onClaim, onSaveFamilySettings,
}: RewardsProps) {
  const [view, setView] = useState<View>('kid');
  const [showGate, setShowGate] = useState(false);
  const [showClaim, setShowClaim] = useState<string | null>(null); // rewardId being claimed
  const [showClaimGate, setShowClaimGate] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<ActiveReward | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🎁');
  const [customXp, setCustomXp] = useState('500');
  const [editingXp, setEditingXp] = useState<string | null>(null); // reward id being edited

  const { activeRewards, pinnedRewardId, claimedRewards, parentPin } = familySettings;
  const pinned = activeRewards.find(r => r.id === pinnedRewardId) ?? null;

  // ── Kid: initiate claim ──────────────────────────────────────────────────
  const handleClaimRequest = (rewardId: string) => {
    setShowClaim(rewardId);
    setShowClaimGate(true);
  };

  const handleClaimConfirmed = () => {
    if (!showClaim) return;
    onClaim(showClaim);
    const reward = activeRewards.find(r => r.id === showClaim) ?? null;
    setClaimSuccess(reward);
    setShowClaim(null);
    setShowClaimGate(false);
  };

  // ── Parent: toggle a suggestion ──────────────────────────────────────────
  const toggleSuggestion = (suggId: string) => {
    const exists = activeRewards.find(r => r.id === suggId);
    if (exists) {
      onSetActiveRewards(activeRewards.filter(r => r.id !== suggId));
    } else {
      const s = REWARD_SUGGESTIONS.find(r => r.id === suggId)!;
      const newReward: ActiveReward = { id: s.id, emoji: s.emoji, name: s.name, category: s.category, xpRequired: s.defaultXp };
      onSetActiveRewards([...activeRewards, newReward]);
    }
  };

  const saveXpEdit = (rewardId: string, newXp: number) => {
    onSetActiveRewards(activeRewards.map(r => r.id === rewardId ? { ...r, xpRequired: newXp } : r));
    setEditingXp(null);
  };

  const addCustomReward = () => {
    if (!customName.trim()) return;
    const xp = Math.max(50, parseInt(customXp) || 500);
    const newReward: ActiveReward = {
      id: `custom_${Date.now()}`,
      emoji: customEmoji,
      name: customName.trim(),
      category: 'item',
      xpRequired: xp,
      isCustom: true,
    };
    onSetActiveRewards([...activeRewards, newReward]);
    setCustomName('');
    setCustomEmoji('🎁');
    setCustomXp('500');
  };

  const removeReward = (id: string) => {
    onSetActiveRewards(activeRewards.filter(r => r.id !== id));
    if (pinnedRewardId === id) onSetPinned(null);
  };

  // ── Claim success screen ─────────────────────────────────────────────────
  if (claimSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center animate-pop-in">
        <div className="text-7xl mb-4">{claimSuccess.emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reward Claimed!</h1>
        <p className="text-lg font-semibold text-gray-700 mb-1">{claimSuccess.name}</p>
        <p className="text-sm text-gray-400 mb-8">Your parent confirmed it. Time to collect!</p>
        <button
          onClick={() => setClaimSuccess(null)}
          className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg active:scale-95 transition-all"
        >
          Set a New Goal
        </button>
      </div>
    );
  }

  // ── Parent setup view ────────────────────────────────────────────────────
  if (view === 'parent') {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('kid')} className="text-gray-400 text-2xl leading-none">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reward Setup</h1>
            <p className="text-xs text-gray-400">Only you can see this</p>
          </div>
        </div>

        {/* Suggestions by category */}
        {(['screentime','experience','privilege','money','item'] as const).map(cat => {
          const meta = CATEGORY_META[cat];
          const suggestions = REWARD_SUGGESTIONS.filter(s => s.category === cat);
          return (
            <div key={cat}>
              <h2 className="font-bold text-sm mb-2" style={{ color: meta.color }}>{meta.label}</h2>
              <div className="space-y-2">
                {suggestions.map(s => {
                  const active = activeRewards.find(r => r.id === s.id);
                  const isEditing = editingXp === s.id;
                  return (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="flex-1 text-sm font-medium text-gray-800">{s.name}</span>
                      {active && (
                        isEditing ? (
                          <input
                            type="number"
                            defaultValue={active.xpRequired}
                            autoFocus
                            onBlur={e => saveXpEdit(s.id, parseInt(e.target.value) || active.xpRequired)}
                            onKeyDown={e => e.key === 'Enter' && saveXpEdit(s.id, parseInt((e.target as HTMLInputElement).value) || active.xpRequired)}
                            className="w-20 text-right text-sm font-bold border border-gray-300 rounded-lg px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingXp(s.id)}
                            className="text-xs font-bold px-2 py-1 rounded-lg"
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            {active.xpRequired} XP
                          </button>
                        )
                      )}
                      <button
                        onClick={() => toggleSuggestion(s.id)}
                        className={`w-10 h-6 rounded-full transition-all relative ${active ? 'bg-gray-900' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${active ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom rewards */}
        <div>
          <h2 className="font-bold text-sm mb-2 text-gray-900">Custom Rewards</h2>
          {activeRewards.filter(r => r.isCustom).map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 mb-2">
              <span className="text-2xl">{r.emoji}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{r.name}</span>
              <span className="text-xs font-bold text-gray-500">{r.xpRequired} XP</span>
              <button onClick={() => removeReward(r.id)} className="text-red-400 text-sm font-bold px-2">✕</button>
            </div>
          ))}

          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Custom</p>
            <div className="flex gap-2">
              <input
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                className="w-14 text-center text-xl border border-gray-200 rounded-xl py-2 focus:outline-none"
                maxLength={2}
              />
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Reward name…"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-gray-500 font-medium">XP required:</label>
              <input
                type="number"
                value={customXp}
                onChange={e => setCustomXp(e.target.value)}
                className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400"
              />
            </div>
            <button
              onClick={addCustomReward}
              disabled={!customName.trim()}
              className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-30 active:scale-95 transition-all"
            >
              + Add Reward
            </button>
          </div>
        </div>

        {/* Claim history */}
        {claimedRewards.length > 0 && (
          <div>
            <h2 className="font-bold text-sm mb-2 text-gray-900">Claimed Rewards</h2>
            <div className="space-y-2">
              {[...claimedRewards].reverse().map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <span className="text-xl">{c.rewardEmoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.rewardName}</p>
                    <p className="text-xs text-gray-400">{new Date(c.claimedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">✓ Done</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Kid view (default) ───────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Rewards</h1>
        <button
          onClick={() => setShowGate(true)}
          className="text-xs text-gray-400 font-medium flex items-center gap-1"
        >
          ⚙️ Parent Setup
        </button>
      </div>

      {activeRewards.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🎁</div>
          <p className="font-semibold text-gray-600">No rewards yet</p>
          <p className="text-sm mt-1">Ask a parent to set up your reward menu!</p>
        </div>
      ) : (
        <>
          {/* Pinned / Working Toward */}
          {pinned ? (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Working Toward</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl">{pinned.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg leading-tight">{pinned.name}</p>
                  <p className="text-sm text-amber-700 font-medium mt-0.5">
                    {Math.min(totalXp, pinned.xpRequired).toLocaleString()} / {pinned.xpRequired.toLocaleString()} XP
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((totalXp / pinned.xpRequired) * 100, 100)}%`,
                    backgroundColor: '#f59e0b',
                  }}
                />
              </div>

              {totalXp >= pinned.xpRequired ? (
                <button
                  onClick={() => handleClaimRequest(pinned.id)}
                  className="w-full py-3 bg-amber-500 text-white font-bold text-base rounded-xl active:scale-95 transition-all animate-pop-in"
                >
                  🎉 Claim Reward!
                </button>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-amber-600">
                    {(pinned.xpRequired - totalXp).toLocaleString()} XP to go
                  </p>
                  <button
                    onClick={() => onSetPinned(null)}
                    className="text-xs text-gray-400 underline"
                  >
                    Change goal
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-2xl p-4 text-center">
              Tap a reward below to set it as your goal ↓
            </p>
          )}

          {/* All rewards */}
          <div className="space-y-2">
            {activeRewards.map(reward => {
              const isPinned = reward.id === pinnedRewardId;
              const reached = totalXp >= reward.xpRequired;
              const progress = Math.min(totalXp / reward.xpRequired, 1);
              const meta = CATEGORY_META[reward.category];
              return (
                <button
                  key={reward.id}
                  onClick={() => onSetPinned(isPinned ? null : reward.id)}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all active:scale-[0.98] ${
                    isPinned ? 'border-amber-400 shadow-sm' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{reward.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm">{reward.name}</p>
                        {isPinned && <span className="text-amber-500 text-sm">★ Goal</span>}
                        {reached && !isPinned && <span className="text-green-600 text-xs font-bold">Ready!</span>}
                      </div>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: meta.color }}>
                        {meta.label} · {reward.xpRequired.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress * 100}%`, backgroundColor: reached ? '#22c55e' : meta.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Parent gate modal */}
      {showGate && (
        <ParentGate
          storedPin={parentPin}
          onSuccess={newPin => {
            if (parentPin === '') {
              onSaveFamilySettings({ ...familySettings, parentPin: newPin });
            }
            setShowGate(false);
            setView('parent');
          }}
          onCancel={() => setShowGate(false)}
          subtitle="Enter your PIN to edit rewards"
        />
      )}

      {/* Claim confirmation gate */}
      {showClaimGate && showClaim && (
        <ParentGate
          storedPin={parentPin}
          onSuccess={handleClaimConfirmed}
          onCancel={() => { setShowClaimGate(false); setShowClaim(null); }}
          title="Confirm Reward"
          subtitle="Parent confirms: enter your PIN"
        />
      )}
    </div>
  );
}
