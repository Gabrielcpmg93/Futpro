
import React, { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SquadView from './components/SquadView';
import MatchView from './components/MatchView';
import MarketView from './components/MarketView';
import SocialView from './components/SocialView';
import CopaView from './components/CopaView';
import CareerView from './components/CareerView';
import FriendlyView from './components/FriendlyView';
import { Team, ScreenState } from './types';

const App: React.FC = () => {
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.SELECT_TEAM);

  const handleTeamSelect = (team: Team) => {
    setUserTeam(team);
    setCurrentScreen(ScreenState.HOME);
  };

  const handleUpdateTeam = (team: Team) => {
    setUserTeam(team);
  };

  const handleMatchFinish = (result: 'win' | 'loss' | 'draw') => {
      // Simple match result logic for quick match (if accessed directly, though Friendlies use their own now)
      if (result === 'win' && userTeam) {
          setUserTeam({ ...userTeam, budget: userTeam.budget + 100000 }); // Win bonus
      }
      setCurrentScreen(ScreenState.HOME);
  };

  const handleCopaWin = () => {
      if (userTeam) {
          setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Copa das Américas"] });
      }
  };

  const handleCareerTrophy = () => {
      if (userTeam) {
          // Check if already has trophy to avoid duplicates if triggered multiple times
          if (!userTeam.trophies.includes("Troféu Estrelato")) {
            setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Troféu Estrelato"] });
          }
      }
  };

  if (currentScreen === ScreenState.SELECT_TEAM) {
    return <TeamSelector onTeamSelected={handleTeamSelect} />;
  }

  if (currentScreen === ScreenState.CAREER_MODE) {
      return (
        <CareerView 
            onComplete={handleTeamSelect} 
            onCancel={() => setCurrentScreen(ScreenState.HOME)} 
            onWinTrophy={handleCareerTrophy}
        />
      );
  }

  if (currentScreen === ScreenState.FRIENDLY_SETUP) {
      return <FriendlyView onBack={() => setCurrentScreen(ScreenState.HOME)} />;
  }

  if (!userTeam) return null;

  // Full screen views (no bottom nav)
  if (currentScreen === ScreenState.MATCH) {
    return <MatchView team={userTeam} onFinish={handleMatchFinish} />;
  }
  if (currentScreen === ScreenState.COPA_AMERICAS) {
      return <CopaView team={userTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} onWinTrophy={handleCopaWin} />;
  }

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === ScreenState.HOME && (
        <Dashboard team={userTeam} onNavigate={setCurrentScreen} />
      )}
      {currentScreen === ScreenState.SQUAD && (
        <SquadView team={userTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} onUpdateTeam={handleUpdateTeam} />
      )}
      {currentScreen === ScreenState.MARKET && (
        <MarketView team={userTeam} onUpdateTeam={handleUpdateTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}
      {currentScreen === ScreenState.SOCIAL && (
        <SocialView teamName={userTeam.name} />
      )}
    </Layout>
  );
};

export default App;
