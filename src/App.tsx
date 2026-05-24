import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import type { Tab } from './components/Layout';

// Auth screens
import Landing      from './pages/auth/Landing';
import ParentAuth   from './pages/auth/ParentAuth';
import KidJoin      from './pages/auth/KidJoin';

// Parent
import ParentDashboard from './pages/ParentDashboard';

// Kid app
import Setup        from './pages/Setup';
import Walkthrough  from './components/Walkthrough';
import Home         from './pages/Home';
import MorningLaunch from './pages/MorningLaunch';
import Quests       from './pages/Quests';
import Rewards      from './pages/Rewards';
import Progress     from './pages/Progress';
import Debrief      from './pages/Debrief';

// ── Auth shell ────────────────────────────────────────────────────────────────
function AuthShell() {
  const [screen, setScreen] = useState<'landing' | 'parent' | 'kid'>('landing');
  if (screen === 'parent') return <ParentAuth onBack={() => setScreen('landing')} />;
  if (screen === 'kid')    return <KidJoin    onBack={() => setScreen('landing')} />;
  return (
    <Landing
      onChooseParent={() => setScreen('parent')}
      onChooseKid={() => setScreen('kid')}
    />
  );
}

// ── Kid app ───────────────────────────────────────────────────────────────────
function KidApp() {
  const { user, familyCode } = useAuth();
  const store = useStore({ uid: user?.uid, familyCode: familyCode ?? undefined });

  const [currentTab, setCurrentTab]       = useState<Tab>('home');
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // First-time name setup (if they joined without going through Setup)
  if (!store.state.profile) {
    return (
      <Setup
        onComplete={profile => {
          store.setProfile(profile);
          setShowWalkthrough(true);
        }}
      />
    );
  }

  if (showWalkthrough) {
    return (
      <Walkthrough
        name={store.state.profile.name}
        onComplete={() => { setShowWalkthrough(false); setCurrentTab('launch'); }}
      />
    );
  }

  const todayLaunch      = store.getTodayLaunch();
  const todayCompletions = store.getQuestCompletionsToday();
  const todayDebrief     = store.getTodayDebrief();
  const { familySettings } = store.state;
  const pinnedReward = familySettings.activeRewards.find(r => r.id === familySettings.pinnedRewardId) ?? null;

  const renderPage = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home
            name={store.state.profile!.name}
            totalXp={store.stats.totalXp}
            treeXp={store.stats.treeXp}
            currentStreak={store.stats.currentStreak}
            launchDoneToday={!!todayLaunch}
            questsToday={todayCompletions.length}
            debriefDoneToday={!!todayDebrief}
            thisWeekTrees={store.stats.thisWeekTrees}
            pinnedReward={pinnedReward}
            onNavigate={setCurrentTab}
          />
        );
      case 'launch':
        return (
          <MorningLaunch
            todayLaunch={todayLaunch}
            onComplete={store.completeMorningLaunch}
            streak={store.stats.currentStreak}
          />
        );
      case 'quests':
        return (
          <Quests
            allQuests={store.allQuests}
            completions={store.state.questCompletions}
            todayCompletions={todayCompletions}
            onComplete={store.completeQuest}
            onAddCustom={store.addCustomQuest}
          />
        );
      case 'rewards':
        return (
          <Rewards
            totalXp={store.stats.totalXp}
            familySettings={familySettings}
            onSetActiveRewards={store.setActiveRewards}
            onSetPinned={store.setPinnedReward}
            onClaim={store.claimReward}
            onSaveFamilySettings={store.setFamilySettings}
          />
        );
      case 'progress':
        return (
          <Progress
            totalXp={store.stats.totalXp}
            treeXp={store.stats.treeXp}
            completions={store.state.questCompletions}
            allQuests={store.allQuests}
            totalLaunches={store.stats.totalLaunches}
            totalDebriefs={store.stats.totalDebriefs}
            currentStreak={store.stats.currentStreak}
          />
        );
      case 'debrief':
        return (
          <Debrief
            todayDebrief={todayDebrief}
            onSubmit={store.submitDebrief}
            questsToday={todayCompletions.length}
          />
        );
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab} playerName={store.state.profile.name}>
      {renderPage()}
    </Layout>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg">🧭</p>
      </div>
    );
  }

  if (!user || !role) return <AuthShell />;
  if (role === 'parent')  return <ParentDashboard />;
  return <KidApp />;
}
