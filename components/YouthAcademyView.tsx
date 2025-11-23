
import React, { useState } from 'react';
import { Team, Player, Position } from '../types';
import { GraduationCap, ArrowLeft, TrendingUp, UserPlus, Dumbbell, AlertCircle } from 'lucide-react';

interface YouthAcademyViewProps {
  team: Team;
  onBack: () => void;
  onUpdateTeam: (team: Team) => void;
}

const YouthAcademyView: React.FC<YouthAcademyViewProps> = ({ team, onBack, onUpdateTeam }) => {
  const [trainingLoading, setTrainingLoading] = useState<string | null>(null);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(val);
  };

  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case Position.DEF: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Position.MID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case Position.FWD: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100';
    }
  };

  const handlePromote = (player: Player) => {
      if (team.roster.length >= 30) {
          alert("O elenco principal está cheio (máx 30 jogadores). Venda alguém antes de promover.");
          return;
      }

      const confirmPromote = window.confirm(`Deseja promover ${player.name} para o time principal?`);
      if (!confirmPromote) return;

      const newRoster = [...team.roster, player];
      const newYouthAcademy = team.youthAcademy.filter(p => p.id !== player.id);

      onUpdateTeam({
          ...team,
          roster: newRoster,
          youthAcademy: newYouthAcademy
      });
  };

  const handleTrain = (player: Player) => {
      const TRAINING_COST = 20000;
      
      if (team.budget < TRAINING_COST) {
          alert("Orçamento insuficiente para realizar o treino.");
          return;
      }

      setTrainingLoading(player.id);

      // Simulate training delay
      setTimeout(() => {
          const improvement = Math.floor(Math.random() * 2) + 1; // +1 or +2
          const newRating = Math.min(99, player.rating + improvement);
          const newValue = player.marketValue + (improvement * 0.2);

          const updatedPlayer = { 
              ...player, 
              rating: newRating,
              marketValue: newValue 
          };

          const newYouthAcademy = team.youthAcademy.map(p => p.id === player.id ? updatedPlayer : p);
          
          onUpdateTeam({
              ...team,
              budget: team.budget - TRAINING_COST,
              youthAcademy: newYouthAcademy
          });

          setTrainingLoading(null);
      }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Header */}
       <div className="bg-teal-900 text-white p-6 rounded-b-[2rem] shadow-xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
              <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap size={24} className="text-teal-400" />
                  Base
              </h1>
          </div>

          <div className="flex justify-between items-end">
              <div>
                  <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">Talentos em Desenvolvimento</p>
                  <p className="text-2xl font-bold">{team.youthAcademy.length} <span className="text-sm font-normal text-teal-200">Jogadores</span></p>
              </div>
              <div className="text-right">
                   <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">Orçamento</p>
                   <p className="text-xl font-bold">{formatMoney(team.budget)}</p>
              </div>
          </div>
      </div>

      <div className="flex-1 p-4 -mt-2 overflow-y-auto no-scrollbar pb-24">
          {team.youthAcademy.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <AlertCircle size={48} />
                  <p className="text-center">Sua base está vazia no momento.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {team.youthAcademy.map((player) => (
                      <div key={player.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                      {player.position}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-800">{player.name}</h3>
                                      <p className="text-xs text-slate-500">{player.age} anos • Potencial Alto</p>
                                  </div>
                              </div>
                              <span className="px-2 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold">
                                  {player.rating} OVR
                              </span>
                          </div>

                          <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleTrain(player)}
                                disabled={trainingLoading === player.id}
                                className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                              >
                                  {trainingLoading === player.id ? (
                                      "Treinando..."
                                  ) : (
                                      <>
                                          <Dumbbell size={16} /> Treinar ($20k)
                                      </>
                                  )}
                              </button>
                              <button 
                                onClick={() => handlePromote(player)}
                                className="flex-1 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-500 transition-colors shadow-lg shadow-teal-500/20"
                              >
                                  <UserPlus size={16} /> Promover
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default YouthAcademyView;
