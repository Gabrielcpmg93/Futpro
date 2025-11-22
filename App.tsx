import React, { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SquadView from './components/SquadView';
import MatchView from './components/MatchView';
import { Team, ScreenState } from './types';

const App: React.FC = () => {
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.SELECT_TEAM);

  const handleTeamSelect = (team: Team) => {
    setUserTeam(team);
    setCurrentScreen(ScreenState.HOME);
  };

  const handleNavigation = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  if (!userTeam) {
    return <TeamSelector onTeamSelected={handleTeamSelect} />;
  }

  if (currentScreen === ScreenState.MATCH) {
    return (
        <MatchView 
            team={userTeam} 
            onFinish={() => setCurrentScreen(ScreenState.HOME)} 
        />
    );
  }

  return (
    <Layout currentScreen={currentScreen} onNavigate={handleNavigation}>
      {currentScreen === ScreenState.HOME && (
        <Dashboard team={userTeam} onNavigate={handleNavigation} />
      )}
      {currentScreen === ScreenState.SQUAD && (
        <SquadView team={userTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}
      {/* Placeholder for screens not yet fully implemented */}
      {(currentScreen !== ScreenState.HOME && currentScreen !== ScreenState.SQUAD) && (
        <div className="p-10 text-center text-slate-400 mt-20">
            <p>Funcionalidade em desenvolvimento.</p>
            <button 
                onClick={() => setCurrentScreen(ScreenState.HOME)}
                className="mt-4 text-emerald-600 font-medium underline"
            >
                Voltar
            </button>
        </div>
      )}
    </Layout>
  );
};

export default App;