import React, { useState } from 'react';
import { generateFictionalTeam } from '../services/geminiService';
import { Team } from '../types';
import { Loader2, Trophy } from 'lucide-react';

interface TeamSelectorProps {
  onTeamSelected: (team: Team) => void;
}

const BRAZILIAN_TEAMS = [
  "Flamengo", "Palmeiras", "São Paulo", "Corinthians", 
  "Fluminense", "Grêmio", "Internacional", "Atlético Mineiro", 
  "Cruzeiro", "Vasco da Gama", "Botafogo", "Bahia", 
  "Fortaleza", "Athletico Paranaense", "Santos"
];

const TeamSelector: React.FC<TeamSelectorProps> = ({ onTeamSelected }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (realName: string) => {
    setLoading(realName);
    const team = await generateFictionalTeam(realName);
    setLoading(null);
    onTeamSelected(team);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col max-w-md mx-auto">
      <div className="mb-8 mt-4 text-center">
         <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Trophy className="text-white" size={32} />
         </div>
         <h1 className="text-3xl font-bold text-white mb-2">Escolha seu Time</h1>
         <p className="text-slate-400 text-sm">Selecione um gigante do futebol brasileiro para começar sua jornada no mundo fictício.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
           <Loader2 className="text-emerald-400 animate-spin w-12 h-12" />
           <div className="text-center">
             <p className="text-white font-semibold text-lg">Criando identidade do clube...</p>
             <p className="text-slate-400 text-sm mt-1">Contratando jogadores fictícios para o {loading}</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-10">
          {BRAZILIAN_TEAMS.map((name) => (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl transition-all duration-200 active:scale-95 text-left flex flex-col justify-between h-24 shadow-lg"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-transparent opacity-20 rounded-full blur-xl group-hover:opacity-40 transition-opacity" />
              <span className="text-white font-semibold z-10">{name}</span>
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Série A</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamSelector;