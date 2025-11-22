
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
import PlayHub from './components/PlayHub';
import LeagueView from './components/LeagueView';
import { Team, ScreenState, LeagueTeam } from './types';
import { generateLeagueTable, updateLeagueTable } from './services/geminiService';

const App: React.FC = () => {
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.SELECT_TEAM);

  // League State
  const [leagueTable, setLeagueTable] = useState<LeagueTeam[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const TOTAL_LEAGUE_ROUNDS = 38;
  const [isPlayingLeagueMatch, setIsPlayingLeagueMatch] = useState(false);
  const [leagueOpponent, setLeagueOpponent] = useState<string>("");

  const handleTeamSelect = (team: Team) => {
    setUserTeam(team);
    // Initialize league when team is created
    setLeagueTable(generateLeagueTable(team));
    setCurrentScreen(ScreenState.HOME);
  };

  const handleUpdateTeam = (team: Team) => {
    setUserTeam(team);
  };

  const handleMatchFinish = (result: 'win' | 'loss' | 'draw') => {
      // League Match Logic
      if (isPlayingLeagueMatch && userTeam) {
          // Calculate GF/GA based on simple result for now (can be more complex if MatchView returns score)
          // MatchView currently returns just win/loss/draw. We will estimate goals.
          let gf = 0;
          let ga = 0;
          if (result === 'win') { gf = 2; ga = 1; }
          else if (result === 'loss') { gf = 0; ga = 2; }
          else { gf = 1; ga = 1; }

          const newTable = updateLeagueTable(leagueTable, result, gf, ga);
          setLeagueTable(newTable);
          
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          setIsPlayingLeagueMatch(false);

          // Check Trophy (After last round)
          if (currentRound === TOTAL_LEAGUE_ROUNDS) {
              // Find winner
              const winner = newTable[0];
              if (winner.isUser) {
                   // Award Trophy
                   if (!userTeam.trophies.includes("Troféu Brasileirão")) {
                       setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Troféu Brasileirão"] });
                       alert("🏆 É CAMPEÃO! Você venceu o Brasileirão Fictício!");
                   }
              }
          }
          
          // Navigate to table to show points update, then user can go back
          setCurrentScreen(ScreenState.LEAGUE_TABLE);
          return;
      }

      // Simple match result logic for quick match/friendly
      if (result === 'win' && userTeam) {
          setUserTeam({ ...userTeam, budget: userTeam.budget + 100000 }); // Win bonus
      }
      setCurrentScreen(ScreenState.HOME);
  };

  const handleCopaWin = () => {
      if (userTeam) {
          if (!userTeam.trophies.includes("Copa das Américas")) {
            setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Copa das Américas"] });
          }
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

  const handleStartLeagueMatch = () => {
      if (currentRound > TOTAL_LEAGUE_ROUNDS) {
          alert("O campeonato acabou!");
          return;
      }

      // Pick random opponent from table (that is not user)
      const possibleOpponents = leagueTable.filter(t => !t.isUser);
      const randomOpponent = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)];
      
      setLeagueOpponent(randomOpponent.name);
      setIsPlayingLeagueMatch(true);
      setCurrentScreen(ScreenState.MATCH);
  }

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
      return <FriendlyView onBack={() => setCurrentScreen(ScreenState.PLAY_HUB)} />;
  }

  if (!userTeam) return null;

  // Full screen views (no bottom nav)
  if (currentScreen === ScreenState.MATCH) {
    return (
        <MatchView 
            team={userTeam} 
            onFinish={handleMatchFinish} 
            opponentName={isPlayingLeagueMatch ? leagueOpponent : "Dragões do Sul"}
            // Give random color for opponent
            opponentColor={isPlayingLeagueMatch ? "#" + Math.floor(Math.random()*16777215).toString(16) : "#dc2626"}
        />
    );
  }
  
  if (currentScreen === ScreenState.COPA_AMERICAS) {
      return <CopaView team={userTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} onWinTrophy={handleCopaWin} />;
  }

  if (currentScreen === ScreenState.LEAGUE_TABLE) {
      return (
          <LeagueView 
            table={leagueTable}
            currentRound={currentRound}
            totalRounds={TOTAL_LEAGUE_ROUNDS}
            onBack={() => setCurrentScreen(ScreenState.HOME)}
          />
      )
  }

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === ScreenState.HOME && (
        <Dashboard team={userTeam} onNavigate={setCurrentScreen} onUpdateTeam={handleUpdateTeam} />
      )}
      {currentScreen === ScreenState.PLAY_HUB && (
        <PlayHub 
            team={userTeam} 
            onNavigate={setCurrentScreen} 
            onPlayLeagueMatch={handleStartLeagueMatch}
            currentRound={currentRound}
        />
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
