import React, { useState, useEffect } from 'react';
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
import FarmModeView from './components/FarmModeView';
import UpdatesView from './components/UpdatesView'; // Import New Updates View
import ChallengeModeView from './components/ChallengeModeView'; // Import New Challenge Mode View
import BankruptcyChallengeSetupView from './components/BankruptcyChallengeSetupView'; // Import new Bankruptcy Setup View
import { Team, ScreenState, LeagueTeam, NewsArticle, CopaProgress, Challenge } from './types';
import { generateLeagueTable, updateLeagueTable, generatePostMatchNews } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'futmanager_pro_save';

// Helper function to load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return undefined; // Let Redux (or useState) initialize state
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};

const App: React.FC = () => {
  const savedState = loadState();

  const [userTeam, setUserTeam] = useState<Team | null>(savedState ? savedState.userTeam : null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(savedState ? savedState.currentScreen : ScreenState.SELECT_TEAM);

  // League State
  const [leagueTable, setLeagueTable] = useState<LeagueTeam[]>(savedState ? savedState.leagueTable : []);
  const [currentRound, setCurrentRound] = useState(savedState ? savedState.currentRound : 1);
  const TOTAL_LEAGUE_ROUNDS = 38;
  const [isPlayingLeagueMatch, setIsPlayingLeagueMatch] = useState(savedState ? savedState.isPlayingLeagueMatch : false);
  const [leagueOpponent, setLeagueOpponent] = useState<string>(savedState ? savedState.leagueOpponent : "");

  // Copa America State (Persistence)
  const [copaProgress, setCopaProgress] = useState<CopaProgress>(savedState ? savedState.copaProgress : {
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
  } | null>(savedState ? savedState.lastMatchData : null);

  // News State
  const [latestNews, setLatestNews] = useState<NewsArticle>(savedState ? savedState.latestState : {
      headline: "Temporada Começa com Grande Expectativa!",
      subheadline: "Times se reforçam para o campeonato mais disputado do ano.",
      content: "A torcida está ansiosa para ver os novos reforços em campo. O mercado da bola esteve agitado e promessas de títulos foram feitas por diversos dirigentes. Quem levantará a taça este ano?",
      date: new Date().toLocaleDateString('pt-BR'),
      imageCaption: "Estádio lotado para a abertura da temporada."
  });

  // Challenge Mode State
  const [selectedChallengeForSetup, setSelectedChallengeForSetup] = useState<Challenge | null>(null);


  // --- Auto-save effect ---
  useEffect(() => {
    const appState = {
      userTeam,
      currentScreen,
      leagueTable,
      currentRound,
      isPlayingLeagueMatch,
      leagueOpponent,
      copaProgress,
      lastMatchData,
      latestNews,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  }, [userTeam, currentScreen, leagueTable, currentRound, isPlayingLeagueMatch, leagueOpponent, copaProgress, lastMatchData, latestNews]);


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

  // --- CHALLENGE MODE HANDLERS ---
  const handleChallengeStart = async (challenge: Challenge) => {
      const challengeTeam = await challenge.startTeamConfig(); // Generate team from challenge config
      setUserTeam(challengeTeam);
      setLeagueTable(generateLeagueTable(challengeTeam)); // Initialize league for challenge team
      setCurrentRound(1);
      setIsPlayingLeagueMatch(false);
      setLeagueOpponent("");
      setCopaProgress({ currentGroup: 'A', matchIndex: 0, matchesPlayedTotal: 0 }); // Reset Copa
      setLastMatchData(null);
      setLatestNews({ // Generic start news for challenge
          headline: `${challengeTeam.name} Embarca em Nova Jornada!`,
          subheadline: "Grandes expectativas cercam o início da temporada.",
          content: "O time se prepara para uma temporada desafiadora, com a torcida ansiosa por bons resultados. A diretoria promete dedicação total para superar os obstáculos e alcançar a glória.",
          date: new Date().toLocaleDateString('pt-BR'),
          imageCaption: "Jogadores em aquecimento antes da primeira partida do desafio."
      });
      setSelectedChallengeForSetup(null); // Clear selected challenge after starting
      setCurrentScreen(ScreenState.HOME);
  };

  const handleSetupBankruptcyChallenge = (challenge: Challenge) => {
      setSelectedChallengeForSetup(challenge);
      setCurrentScreen(ScreenState.BANKRUPTCY_CHALLENGE_SETUP);
  };

  // --- RENDER ---

  if (currentScreen === ScreenState.SELECT_TEAM) {
    return <TeamSelector onTeamSelected={handleTeamSelect} />;
  }

  if (!userTeam && currentScreen !== ScreenState.BANKRUPTCY_CHALLENGE_SETUP) return null; // Keep this line to handle null userTeam for other screens

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === ScreenState.HOME && (
        <Dashboard team={userTeam!} onNavigate={setCurrentScreen} onUpdateTeam={handleUpdateTeam} />
      )}
      
      {currentScreen === ScreenState.SQUAD && (
        <SquadView team={userTeam!} onBack={() => setCurrentScreen(ScreenState.HOME)} onUpdateTeam={handleUpdateTeam} />
      )}

      {currentScreen === ScreenState.MARKET && (
        <MarketView team={userTeam!} onUpdateTeam={handleUpdateTeam} onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.SOCIAL && (
        <SocialView teamName={userTeam!.name} />
      )}

      {currentScreen === ScreenState.PLAY_HUB && (
        <PlayHub 
            team={userTeam!} 
            onNavigate={setCurrentScreen} 
            onPlayLeagueMatch={handlePlayLeagueMatch}
            onPlay3DMatch={handleStart3DLeagueMatch}
            currentRound={currentRound}
        />
      )}

      {currentScreen === ScreenState.MATCH && (
          <MatchView 
            team={userTeam!} 
            opponentName={leagueOpponent}
            onFinish={handleMatchFinish}
          />
      )}

      {currentScreen === ScreenState.MATCH_3D && (
          <Match3DView 
            team={userTeam!} 
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
            team={userTeam!} 
            progress={copaProgress} // Pass state
            onUpdateProgress={setCopaProgress} // Pass updater
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
            onWinTrophy={() => setUserTeam({ ...userTeam!, trophies: [...userTeam!.trophies, "Copa das Américas"] })}
            onMatchRecord={(opp, res, us, os) => {
                // Optional: update news for Copa
                generatePostMatchNews(userTeam!.name, opp, us, os).then(news => setLatestNews(news));
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
            onWinTrophy={() => setUserTeam({ ...userTeam!, trophies: [...userTeam!.trophies, "Estrelato"] })}
          />
      )}

      {currentScreen === ScreenState.YOUTH_ACADEMY && (
          <YouthAcademyView 
            team={userTeam!}
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
            team={userTeam!} 
            lastMatchData={lastMatchData}
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
          />
      )}

      {currentScreen === ScreenState.POLICE_MODE && (
          <PoliceModeView onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.FARM_MODE && (
          <FarmModeView onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.UPDATES && (
          <UpdatesView onBack={() => setCurrentScreen(ScreenState.HOME)} />
      )}

      {currentScreen === ScreenState.CHALLENGE_MODE && (
          <ChallengeModeView 
            onBack={() => setCurrentScreen(ScreenState.HOME)} 
            onChallengeStart={handleChallengeStart} // Modified to accept Challenge object
            onSetupBankruptcyChallenge={handleSetupBankruptcyChallenge} // New prop
          />
      )}

      {currentScreen === ScreenState.BANKRUPTCY_CHALLENGE_SETUP && selectedChallengeForSetup && (
          <BankruptcyChallengeSetupView
            challenge={selectedChallengeForSetup}
            onStart={handleChallengeStart} // Use the same start function
            onBack={() => setCurrentScreen(ScreenState.CHALLENGE_MODE)}
          />
      )}
    </Layout>
  );
};

export default App;