
import React, { useState } from 'react';
import { Team, ScreenState, BankruptcyChallengeState } from '../types';
import { ArrowLeft, Flag, Banknote, DollarSign, Calendar, Users, Play, Repeat, CheckCircle } from 'lucide-react';
import MatchView from './MatchView'; // Reusing MatchView

interface BankruptcyChallengeHubViewProps {
  challengeState: BankruptcyChallengeState;
  onUpdateChallengeState: (newState: BankruptcyChallengeState) => void;
  onNavigate: (screen: ScreenState) => void;
  userTeam: Team; // The actual userTeam, kept in sync with App.tsx
  onUpdateUserTeam: (team: Team) => void; // Callback to update main userTeam in App.tsx
}

const BankruptcyChallengeHubView: React.FC<BankruptcyChallengeHubViewProps> = ({ challengeState, onUpdateChallengeState, onNavigate, userTeam, onUpdateUserTeam }) => {
  const [inMatch, setInMatch] = useState(false);
  const [matchOpponentName, setMatchOpponentName] = useState('');
  const [matchForcedResult, setMatchForcedResult] = useState<'win' | 'loss' | 'draw' | undefined>(undefined);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(val);
  };

  const handlePlayMatch = () => {
    if (challengeState.matchesPlayed >= challengeState.maxMatches) {
      alert("Todos os jogos do desafio foram concluídos!");
      return;
    }

    // Determine forced result based on 2 wins, 1 loss pattern
    // pattern: win, win, loss, win, win, loss...
    let currentMatchResult: 'win' | 'loss';
    if (challengeState.matchWinCount < 2) {
      currentMatchResult = 'win';
      // Temporarily update win count for next match decision, actual state update happens on finish
      onUpdateChallengeState({ ...challengeState, matchWinCount: challengeState.matchWinCount + 1 });
    } else {
      currentMatchResult = 'loss';
      onUpdateChallengeState({ ...challengeState, matchWinCount: 0 }); // Reset win count after a loss
    }
    setMatchForcedResult(currentMatchResult);

    // Simple opponent for challenge matches
    setMatchOpponentName("Rival Financeiro FC");
    setInMatch(true);
  };

  const handleMatchFinish = (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => {
    setInMatch(false);
    
    let newSponsorship = challengeState.sponsorshipEarnings;
    let budgetChange = 0;
    if (result === 'win') {
      newSponsorship += 1000000; // +1 million for a win
      budgetChange = 1000000; // Amount to add to budget
    }

    // Update the actual userTeam budget via callback to App.tsx
    const updatedUserTeam = {
        ...userTeam,
        budget: userTeam.budget + budgetChange
    };
    onUpdateUserTeam(updatedUserTeam); 

    // Update challenge-specific state
    onUpdateChallengeState({
      ...challengeState,
      matchesPlayed: challengeState.matchesPlayed + 1,
      sponsorshipEarnings: newSponsorship,
      // matchWinCount already updated in handlePlayMatch to determine current match result
    });
  };

  if (inMatch) {
    return (
      <MatchView
        team={userTeam} // Use the actual userTeam for display
        onFinish={handleMatchFinish}
        opponentName={matchOpponentName}
        forcedResult={matchForcedResult}
        skipSetup={true}
      />
    );
  }

  const { matchesPlayed, maxMatches } = challengeState;
  const challengeComplete = matchesPlayed >= maxMatches;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-950 text-white p-6 flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(ScreenState.CHALLENGE_MODE)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Flag size={24} className="text-yellow-400" /> Desafio da Falência
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Challenge Summary */}
      <div className="bg-red-700/50 p-6 rounded-2xl shadow-lg border border-red-600 mb-6">
        <h2 className="font-bold text-2xl mb-3">{userTeam.name} - Resgate Financeiro</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-red-300" />
            <p>Orçamento: {formatMoney(userTeam.budget)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-red-300" />
            <p>Salários: Astronômicos</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-red-300" />
            <p>Contratos: Curtos</p>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-red-300" />
            <p>Elenco: OVR 65</p>
          </div>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        <h3 className="text-red-200 font-bold text-sm uppercase tracking-wider mb-4">Progresso do Desafio:</h3>
        <div className="bg-red-700/30 p-4 rounded-xl flex justify-between items-center border border-red-700 mb-4">
          <div>
            <p className="font-bold text-lg">Partidas Jogadas</p>
            <p className="text-red-200 text-sm">{matchesPlayed} / {maxMatches}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-white font-bold text-xl">
            {Math.floor((matchesPlayed / maxMatches) * 100)}%
          </div>
        </div>

        <div className="bg-red-700/30 p-4 rounded-xl flex justify-between items-center border border-red-700 mb-6">
          <div>
            <p className="font-bold text-lg">Patrocínio Ganhos</p>
            <p className="text-red-200 text-sm">Bônus por vitórias</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-white font-bold text-xl">
            {formatMoney(challengeState.sponsorshipEarnings)}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate(ScreenState.SQUAD)}
            className="w-full bg-white text-red-900 px-5 py-3 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors active:scale-95 shadow-lg shadow-white/10"
          >
            <Repeat size={20} className="inline-block mr-2" /> Gerenciar Contratos
          </button>
          {!challengeComplete ? (
            <button
              onClick={handlePlayMatch}
              className="w-full bg-yellow-500 text-yellow-950 px-5 py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors active:scale-95 shadow-lg shadow-yellow-500/10"
            >
              <Play size={20} className="inline-block mr-2" /> Jogar Próxima Partida
            </button>
          ) : (
            <div className="w-full bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-lg text-center shadow-lg">
              <CheckCircle size={20} className="inline-block mr-2" /> Desafio Concluído!
            </div>
          )}

          <button
            onClick={() => onNavigate(ScreenState.HOME)}
            className="w-full text-white/70 text-sm font-medium py-2 hover:text-white transition-colors mt-4"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankruptcyChallengeHubView;
