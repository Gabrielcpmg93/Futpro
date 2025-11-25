
import React, { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SquadView from './components/SquadView';
import MatchView from './components/MatchView';
import Match3DView from './components/Match3DView'; // Import New View
import MarketView from './components/MarketView';
import SocialView from './components/SocialView';
import CopaView from './components/CopaView';
import CareerView from './components/CareerView';
import FriendlyView from './components/FriendlyView';
import PlayHub from './components/PlayHub';
import LeagueView from './components/LeagueView';
import NewsView from './components/NewsView';
import YouthAcademyView from './components/YouthAcademyView';
import CalendarView from './components/CalendarView';
import CityBuilderView from './components/CityBuilderView';
import PressConferenceView from './components/PressConferenceView';
import PoliceModeView from './components/PoliceModeView';
import { Team, ScreenState, LeagueTeam, NewsArticle, CopaProgress } from './types';
import { generateLeagueTable, updateLeagueTable, generatePostMatchNews } from './services/geminiService';

const App: React.FC = () => {
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.SELECT_TEAM);

  // League State
  const [leagueTable, setLeagueTable] = useState<LeagueTeam[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const TOTAL_LEAGUE_ROUNDS = 38;
  const [isPlayingLeagueMatch, setIsPlayingLeagueMatch] = useState(false);
  const [leagueOpponent, setLeagueOpponent] = useState<string>("");

  // Copa America State (Persistence)
  const [copaProgress, setCopaProgress] = useState<CopaProgress>({
      currentGroup: 'A',
      matchIndex: 0,
      matchesPlayedTotal: 0
  });

  // Match History State for Press Conference
  const [lastMatchData, setLastMatchData] = useState<{
      opponent: string;
      result: 'win' | 'loss' | 'draw';
      scoreUser: number;
      scoreOpponent: number;
  } | null>(null);

  // News State
  const [latestNews, setLatestNews] = useState<NewsArticle>({
      headline: "Temporada Começa com Grande Expectativa!",
      subheadline: "Times se reforçam para o campeonato mais disputado do ano.",
      content: "A torcida está ansiosa para ver os novos reforços em campo. O mercado da bola esteve agitado e promessas de títulos foram feitas por diversos dirigentes. Quem levantará a taça este ano?",
      date: new Date().toLocaleDateString('pt-BR'),
      imageCaption: "Estádio lotado para a abertura da temporada."
  });

  const handleTeamSelect = (team: Team) => {
    setUserTeam(team);
    // Initialize league when team is created
    setLeagueTable(generateLeagueTable(team));
    setCurrentScreen(ScreenState.HOME);
  };

  const handleUpdateTeam = (team: Team) => {
    setUserTeam(team);
  };

  const handleNavigate = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  // --- MATCH HANDLERS ---

  const handlePlayLeagueMatch = () => {
      // Find next opponent
      const opponent = leagueTable.filter(t => !t.isUser)[Math.floor(Math.random() * 19)];
      setLeagueOpponent(opponent.name);
      setIsPlayingLeagueMatch(true);
      setCurrentScreen(ScreenState.MATCH);
  };

  const handleStart3DLeagueMatch = () => {
      // 3D Matches also count for league in this version
      const opponent = leagueTable.filter(t => !t.isUser)[Math.floor(Math.random() * 19)];
      setLeagueOpponent(opponent.name);
      setIsPlayingLeagueMatch(true); // Flag as league match to update table
      setCurrentScreen(ScreenState.MATCH_3D);
  };

  const handleMatchFinish = (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => {
      const opponentName = leagueOpponent || "Adversário";
      
      // Save result for Press Conference
      setLastMatchData({
          opponent: opponentName,
          result: result,
          scoreUser: userScore,
          scoreOpponent: opponentScore
      });

      if (isPlayingLeagueMatch && userTeam) {
          // Update Table
          const newTable = updateLeagueTable(leagueTable, result, userScore, opponentScore);
          setLeagueTable(newTable);
          
          // Generate News
          generatePostMatchNews(userTeam.name, opponentName, userScore, opponentScore).then(news => setLatestNews(news));

          // Increment Round
          if (currentRound < TOTAL_LEAGUE_ROUNDS) {
              setCurrentRound(prev => prev + 1);
          }
      }
      
      setIsPlayingLeagueMatch(false);
      setCurrentScreen(ScreenState.PLAY_HUB);
  };

  // --- RENDER ---

  if (currentScreen === ScreenState.SELECT_TEAM) {
    return <TeamSelector onTeamSelected={handleTeamSelect} />;
  }

  if (!userTeam) return null;

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === ScreenState.HOME && (
        <Dashboard team={userTeam} onNavigate={setCurrentScreen} onUpdateTeam={handleUpdateTeam} />
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

      {currentScreen === ScreenState.PLAY_HUB && (
        <PlayHub 
            team={userTeam} 
            onNavigate={setCurrentScreen} 
            onPlayLeagueMatch={handlePlayLeagueMatch}
            onPlay3DMatch={handleStart3DLeagueMatch}
            currentRound={currentRound}
        />
      )}

      {currentScreen === ScreenState.MATCH && (
          <MatchView 
            team={userTeam} 
            opponentName={leagueOpponent}
            onFinish={handleMatchFinish}
          />
      )}

      {currentScreen === ScreenState.MATCH_3D && (
          <Match3DView 
            team={userTeam} 
            opponentName={leagueOpponent}
            onFinish={handleMatchFinish}
            onBack={() => setCurrentScreen(ScreenState.PLAY_HUB)}
          />
      )}

      {currentScreen === ScreenState.LEAGUE_TABLE && (
          <LeagueView 
            table={leagueTable} 
            currentRound={currentRound} 
            totalRounds={TOTAL_LEAGUE_ROUNDS} 
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
          />
      )}

      {currentScreen === ScreenState.NEWS && (
          <NewsView news={latestNews} onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.FRIENDLY_SETUP && (
          <FriendlyView onBack={() => setCurrentScreen(ScreenState.PLAY_HUB)} />
      )}

      {currentScreen === ScreenState.COPA_AMERICAS && (
          <CopaView 
            team={userTeam} 
            progress={copaProgress} // Pass state
            onUpdateProgress={setCopaProgress} // Pass updater
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
            onWinTrophy={() => setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Copa das Américas"] })}
            onMatchRecord={(opp, res, us, os) => {
                // Optional: update news for Copa
                generatePostMatchNews(userTeam.name, opp, us, os).then(news => setLatestNews(news));
                // Also set match data for press conference
                setLastMatchData({
                    opponent: opp,
                    result: res,
                    scoreUser: us,
                    scoreOpponent: os
                });
            }}
          />
      )}

      {currentScreen === ScreenState.CAREER_MODE && (
          <CareerView 
            onComplete={(careerTeam) => {
                 setUserTeam(careerTeam);
                 setCurrentScreen(ScreenState.HOME);
            }} 
            onCancel={() => setCurrentScreen(ScreenState.HOME)}
            onWinTrophy={() => setUserTeam({ ...userTeam, trophies: [...userTeam.trophies, "Estrelato"] })}
          />
      )}

      {currentScreen === ScreenState.YOUTH_ACADEMY && (
          <YouthAcademyView 
            team={userTeam}
            onBack={() => setCurrentScreen(ScreenState.HOME)}
            onUpdateTeam={handleUpdateTeam}
          />
      )}

      {currentScreen === ScreenState.CALENDAR && (
          <CalendarView 
            onBack={() => setCurrentScreen(ScreenState.HOME)}
            onScheduleFriendly={() => setCurrentScreen(ScreenState.FRIENDLY_SETUP)}
          />
      )}

      {currentScreen === ScreenState.CITY_BUILDER && (
          <CityBuilderView onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.PRESS_CONFERENCE && (
          <PressConferenceView 
            team={userTeam} 
            lastMatchData={lastMatchData}
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
          />
      )}

      {currentScreen === ScreenState.POLICE_MODE && (
          <PoliceModeView onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}
    </Layout>
  );
};

export default App;
