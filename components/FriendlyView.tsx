import React, { useState } from 'react';
import { SERIE_A_MAPPING, generateFictionalTeam } from '../services/geminiService';
import { Team } from '../types';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import MatchView from './MatchView';

interface FriendlyViewProps {
  onBack: () => void;
}

const FriendlyView: React.FC<FriendlyViewProps> = ({ onBack }) => {
  const [selectedMyTeam, setSelectedMyTeam] = useState<string | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [myTeamData, setMyTeamData] = useState<Team | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fictionalTeams = Object.values(SERIE_A_MAPPING);

  const handleStartMatch = async () => {
    if (!selectedMyTeam || !selectedOpponent) return;
    
    setIsLoading(true);
    try {
        // Generate team data based on the selected FICTIONAL name
        // The updated geminiService now handles fictional names correctly
        const tempTeam: Team = await generateFictionalTeam(selectedMyTeam);
        setMyTeamData(tempTeam);
        setIsPlaying(true);
    } catch (e) {
        alert("Erro ao iniciar a partida. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  };

  if (isPlaying && myTeamData && selectedOpponent) {
    return (
      <MatchView 
        team={myTeamData} 
        opponentName={selectedOpponent} 
        onFinish={(result) => {
            alert(result === 'win' ? "Você venceu o amistoso!" : result === 'loss' ? "Derrota no amistoso." : "Empate.");
            setIsPlaying(false);
            onBack();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Amistoso</h1>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={48} />
              <p className="text-slate-400">Preparando as equipes...</p>
          </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
            {/* My Team Selection */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h2 className="text-emerald-400 font-bold text-sm uppercase mb-3">Escolha seu Time (Fictício)</h2>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {fictionalTeams.map(name => (
                <button 
                    key={name} 
                    onClick={() => setSelectedMyTeam(name)}
                    className={`p-2 rounded-lg text-xs font-bold text-left transition-all ${selectedMyTeam === name ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                    {name}
                </button>
                ))}
            </div>
            </div>

            <div className="text-center font-bold text-2xl text-slate-600">VS</div>

            {/* Opponent Selection */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h2 className="text-red-400 font-bold text-sm uppercase mb-3">Escolha o Adversário</h2>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {fictionalTeams.map(name => (
                <button 
                    key={name} 
                    onClick={() => setSelectedOpponent(name)}
                    disabled={name === selectedMyTeam}
                    className={`p-2 rounded-lg text-xs font-bold text-left transition-all ${selectedOpponent === name ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 disabled:opacity-30'}`}
                >
                    {name}
                </button>
                ))}
            </div>
            </div>

            {/* Start Button */}
            <button 
            onClick={handleStartMatch}
            disabled={!selectedMyTeam || !selectedOpponent}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors shadow-lg shadow-white/10"
            >
            <Play fill="currentColor" size={20} />
            Iniciar Partida
            </button>
        </div>
      )}
    </div>
  );
};

export default FriendlyView;
