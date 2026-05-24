import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadAllKidsData } from '../lib/db';
import type { PlayerState } from '../types';
import { getRank } from '../data/ranks';
import { MORNING_LAUNCH_XP } from '../data/morningLaunch';
import { QUESTS } from '../data/quests';

function getToday() { return new Date().toISOString().split('T')[0]; }

function computeXp(data: PlayerState): number {
  const launchXp = data.morningLaunches.length * MORNING_LAUNCH_XP;
  let questXp = 0;
  for (const c of data.questCompletions) {
    const q = QUESTS.find(q => q.id === c.questId);
    if (q) questXp += q.xp;
  }
  const debriefXp = data.debriefs.length * 15;
  return launchXp + questXp + debriefXp;
}

function getStreak(data: PlayerState): number {
  const dates = data.morningLaunches.map(m => m.date).sort();
  if (!dates.length) return 0;
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0;
  let streak = 1;
  let check = dates.includes(today) ? today : yesterday;
  for (let i = 1; i < 365; i++) {
    const prev = new Date(new Date(check + 'T00:00:00').getTime() - 86400000).toISOString().split('T')[0];
    if (dates.includes(prev)) { streak++; check = prev; } else break;
  }
  return streak;
}

interface KidCard {
  uid: string;
  name: string;
  data: PlayerState;
}

export default function ParentDashboard() {
  const { familyCode, signOut } = useAuth();
  const [kids, setKids]         = useState<KidCard[]>([]);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    if (!familyCode) return;
    loadAllKidsData(familyCode).then(results => {
      setKids(results);
      setLoading(false);
    });
  }, [familyCode]);

  const copyCode = () => {
    if (familyCode) navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Parent Dashboard</p>
          <h1 className="text-lg font-bold text-gray-900">SOS Family</h1>
        </div>
        <button onClick={signOut} className="text-sm text-gray-400 font-medium">Sign out</button>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">

        {/* Family code card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Family Code</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold tracking-widest text-gray-900 font-mono">{familyCode}</p>
            <button
              onClick={copyCode}
              className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 active:scale-95 transition-all"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this with your kids — they enter it when they open SOS on their device.
          </p>
        </div>

        {/* Kids */}
        <h2 className="font-bold text-sm text-gray-900">Your Kids Today</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : kids.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-4xl mb-3">👋</p>
            <p className="font-semibold text-gray-700">No kids have joined yet.</p>
            <p className="text-sm text-gray-400 mt-1">Share your family code above.</p>
          </div>
        ) : (
          kids.map(({ uid, name, data }) => {
            const today = getToday();
            const totalXp    = computeXp(data);
            const rank       = getRank(totalXp);
            const streak     = getStreak(data);
            const launchDone = data.morningLaunches.some(m => m.date === today);
            const questsDone = data.questCompletions.filter(c => c.date === today).length;
            const debriefDone = data.debriefs.some(d => d.date === today);
            const todayScore = (launchDone ? 1 : 0) + (questsDone >= 1 ? 1 : 0) + (debriefDone ? 1 : 0);

            // Pending reward claims
            const pendingClaims = data.familySettings.claimedRewards.filter(c => {
              // show claims from the last 7 days
              return new Date(c.claimedAt) > new Date(Date.now() - 7 * 86400000);
            });

            return (
              <div key={uid} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Kid header */}
                <div className="px-5 pt-5 pb-3 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: rank.color }}
                  >
                    {rank.level}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{name}</p>
                    <p className="text-xs text-gray-400">
                      {totalXp.toLocaleString()} XP · {rank.title}
                      {streak > 0 && ` · 🔥 ${streak} day streak`}
                    </p>
                  </div>
                  {/* Today summary dot */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    todayScore === 3 ? 'bg-green-500' : todayScore >= 1 ? 'bg-amber-400' : 'bg-gray-200'
                  }`}>
                    {todayScore === 3 ? '✓' : `${todayScore}/3`}
                  </div>
                </div>

                {/* Today checklist */}
                <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Launch', done: launchDone, emoji: '🚀' },
                    { label: `${questsDone} Quest${questsDone !== 1 ? 's' : ''}`, done: questsDone > 0, emoji: '🎯' },
                    { label: 'Debrief', done: debriefDone, emoji: '📝' },
                  ].map(item => (
                    <div
                      key={item.label}
                      className={`rounded-xl py-2 px-2 text-center ${item.done ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      <p className="text-base">{item.done ? '✅' : item.emoji}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${item.done ? 'text-green-700' : 'text-gray-400'}`}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Today's debrief snippet */}
                {debriefDone && (() => {
                  const d = data.debriefs.find(d => d.date === today);
                  return d ? (
                    <div className="mx-5 mb-4 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Tonight's reflection</p>
                      <p className="text-sm text-gray-700">😊 {d.wentWell}</p>
                    </div>
                  ) : null;
                })()}

                {/* Pending reward claims */}
                {pendingClaims.length > 0 && (
                  <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">🎉 Reward claimed!</p>
                    {pendingClaims.map(c => (
                      <p key={c.id} className="text-sm font-medium text-gray-800">
                        {c.rewardEmoji} {c.rewardName}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
