
import React, { useState } from 'react';
import { Team, Position, Player } from '../types';
import { Shield, User, DollarSign, RefreshCw, Briefcase, Clock } from 'lucide-react';

interface SquadViewProps {
  team: Team;
  onBack: () => void;
  onUpdateTeam: (team: Team) => void;
}

const SquadView: React.FC<SquadViewProps> = ({ team, onBack, onUpdateTeam }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [action, setAction] = useState<'sell' | 'loan' | 'renew' | null>(null);

  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case Position.DEF: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Position.MID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case Position.FWD: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100';
    }
  };

  const handleAction = () => {
      if (!selectedPlayer || !action) return;

      let newTeam = { ...team };
      let msg = "";

      if (action === 'sell') {
          newTeam.roster = newTeam.roster.filter(p => p.id !== selectedPlayer.id);
          newTeam.budget += selectedPlayer.marketValue * 1000000;
          msg = `Vendido por $${selectedPlayer.marketValue}M!`;
      } else if (action === 'renew') {
          // Logic to renew (cost budget)
          newTeam.roster = newTeam.roster.map(p => p.id === selectedPlayer.id ? { ...p, contractWeeks: p.contractWeeks + 52 } : p);
          newTeam.budget -= 200000; // Signing bonus
          msg = "Contrato renovado!";
      } else if (action === 'loan') {
          newTeam.roster = newTeam.roster.filter(p => p.id !== selectedPlayer.id);
          msg = "Emprestado com sucesso!";
      }

      onUpdateTeam(newTeam);
      alert(msg);
      setSelectedPlayer(null);
      setAction(null);
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 relative min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Elenco ({team.roster.length})</h1>
        <div className="px-3 py-1 bg-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
           ${(team.budget/1000000).toFixed(1)}M
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {team.roster.map((player) => (
            <div key={player.id} onClick={() => setSelectedPlayer(player)} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 relative">
                    <User size={20} className="text-gray-400" />
                    {player.contractWeeks < 10 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white" title="Contrato acabando"></div>}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{player.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-slate-400">Salário: ${player.salary}/sem</p>
                      <div className={`flex items-center gap-1 text-xs font-bold ${player.contractWeeks < 10 ? 'text-red-500' : 'text-slate-400'}`}>
                         <Clock size={10} />
                         {player.contractWeeks === 0 ? 'EXPIRADO' : `${player.contractWeeks} sem`}
                      </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] px-2 py-1 rounded border font-bold ${getPositionColor(player.position)}`}>
                    {player.position}
                 </span>
                 <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
                    {player.rating}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {selectedPlayer && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom duration-200">
                  <div className="flex justify-between items-start mb-1">
                      <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
                      {selectedPlayer.contractWeeks < 10 && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                              Contrato Crítico
                          </span>
                      )}
                  </div>
                  <p className="text-slate-500 text-sm mb-6">O que deseja fazer com este atleta?</p>

                  {!action ? (
                    <div className="space-y-3">
                        <button onClick={() => setAction('sell')} className="w-full p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={20}/></div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-800">Vender</span>
                                <span className="text-xs text-slate-500">Interesse de: Dragões do Sul, União Celeste</span>
                            </div>
                        </button>
                        <button onClick={() => setAction('loan')} className="w-full p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Briefcase size={20}/></div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-800">Emprestar</span>
                                <span className="text-xs text-slate-500">Para times da Série B</span>
                            </div>
                        </button>
                        <button onClick={() => setAction('renew')} className="w-full p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><RefreshCw size={20}/></div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-800">Renovar</span>
                                <span className="text-xs text-slate-500">Estender contrato (+52 semanas)</span>
                            </div>
                        </button>
                    </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl text-center">
                              {action === 'sell' && <p>Vender para <strong>União Celeste</strong> por <strong>${selectedPlayer.marketValue}M</strong>?</p>}
                              {action === 'loan' && <p>Emprestar para <strong>Norte Guerreiro</strong>?</p>}
                              {action === 'renew' && <p>Renovar por <strong>52 semanas</strong> mantendo o salário?</p>}
                          </div>
                          <button onClick={handleAction} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Confirmar</button>
                      </div>
                  )}
                  
                  <button onClick={() => { setSelectedPlayer(null); setAction(null); }} className="w-full mt-3 text-slate-400 text-sm font-medium py-2">Cancelar</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default SquadView;
