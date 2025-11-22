
import React, { useState } from 'react';
import { SERIE_A_MAPPING, generateFictionalTeam } from '../services/geminiService';
import { Team } from '../types';
import { ArrowLeft, Play, Loader2, Shield, Sword } from 'lucide-react';
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
        opponentColor="#3b82f6" // Give opponent a distinct color (Blue) for Friendlies
        skipSetup={true} // Auto start simulation
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
        <h1 className="text-2xl font-bold">Configurar Amistoso</h1>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in">
              <Loader2 className="animate-spin text-emerald-500" size={48} />
              <p className="text-slate-400">Convocando jogadores fictícios...</p>
          </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
            {/* Matchup Preview */}
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 relative overflow-hidden mb-8 text-center">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col items-center w-1/3">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-all ${selectedMyTeam ? 'bg-emerald-600 scale-110 shadow-emerald-500/20 shadow-lg' : 'bg-slate-700 opacity-50'}`}>
                            <Shield />
                        </div>
                        <p className="text-xs font-bold leading-tight">{selectedMyTeam || "Seu Time"}</p>
                    </div>
                    <div className="text-xl font-bold text-slate-500">VS</div>
                    <div className="flex flex-col items-center w-1/3">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-all ${selectedOpponent ? 'bg-blue-600 scale-110 shadow-blue-500/20 shadow-lg' : 'bg-slate-700 opacity-50'}`}>
                            <Sword />
                        </div>
                        <p className="text-xs font-bold leading-tight">{selectedOpponent || "Adversário"}</p>
                    </div>
                </div>
            </div>

            {/* My Team Selection */}
            <div>
                <h2 className="text-emerald-400 font-bold text-xs uppercase mb-3 ml-1">Escolha seu Time (Fictício)</h2>
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                        {fictionalTeams.map(name => (
                        <button 
                            key={name} 
                            onClick={() => setSelectedMyTeam(name)}
                            disabled={name === selectedOpponent}
                            className={`p-3 rounded-xl text-xs font-bold text-left transition-all ${selectedMyTeam === name ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 disabled:opacity-20'}`}
                        >
                            {name}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Opponent Selection */}
            <div>
                <h2 className="text-blue-400 font-bold text-xs uppercase mb-3 ml-1">Escolha o Adversário</h2>
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                        {fictionalTeams.map(name => (
                        <button 
                            key={name} 
                            onClick={() => setSelectedOpponent(name)}
                            disabled={name === selectedMyTeam}
                            className={`p-3 rounded-xl text-xs font-bold text-left transition-all ${selectedOpponent === name ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 disabled:opacity-20'}`}
                        >
                            {name}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <button 
            onClick={handleStartMatch}
            disabled={!selectedMyTeam || !selectedOpponent}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 mt-4"
            >
            <Play fill="currentColor" size={20} />
            Iniciar Amistoso
            </button>
        </div>
      )}
    </div>
  );
};

export default FriendlyView;
