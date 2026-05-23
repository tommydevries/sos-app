import { useState } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import type { Tab } from './components/Layout';
import Setup from './pages/Setup';
import Home from './pages/Home';
import MorningLaunch from './pages/MorningLaunch';
import Quests from './pages/Quests';
import Progress from './pages/Progress';
import Debrief from './pages/Debrief';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const store = useStore();

  if (!store.state.profile) {
    return <Setup onComplete={store.setProfile} />;
  }

  const todayLaunch = store.getTodayLaunch();
  const todayCompletions = store.getQuestCompletionsToday();
  const todayDebrief = store.getTodayDebrief();

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
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      playerName={store.state.profile.name}
    >
      {renderPage()}
    </Layout>
  );
}
