
import React, { useState, useEffect } from 'react';
import { Team, Player } from '../types';
import { generateMarketPlayers } from '../services/geminiService';
import { DollarSign, Search, RefreshCw } from 'lucide-react';

interface MarketViewProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onBack: () => void;
}

const MarketView: React.FC<MarketViewProps> = ({ team, onUpdateTeam, onBack }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [offer, setOffer] = useState({ salary: 0, weeks: 52 });

  useEffect(() => {
      setPlayers(generateMarketPlayers());
  }, []);

  const handleHire = () => {
      if (!selectedPlayer) return;
      if (team.budget < 1000000) { // Simplified check
          alert("Sem verba suficiente para luvas.");
          return;
      }

      const newPlayer = { ...selectedPlayer, salary: offer.salary, contractWeeks: offer.weeks };
      const newTeam = { ...team, roster: [...team.roster, newPlayer], budget: team.budget - 500000 }; // Deduct signing fee
      onUpdateTeam(newTeam);
      alert("Contratado com sucesso!");
      setSelectedPlayer(null);
  };

  const handleRefreshPlayers = () => {
      setPlayers(generateMarketPlayers());
      alert("Lista de jogadores atualizada!");
  };

  return (
      <div className="p-6 pb-24 min-h-screen bg-slate-50">
          <div className="flex items-center justify-between mb-6">
              <button onClick={onBack} className="text-slate-500 font-medium">Voltar</button>
              <h1 className="text-2xl font-bold text-slate-900">Mercado</h1>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex items-center gap-2">
              <Search className="text-slate-400" />
              <input type="text" placeholder="Buscar jogador..." className="outline-none text-sm w-full" />
              <button 
                onClick={handleRefreshPlayers} 
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors active:scale-95"
                title="Atualizar lista de jogadores"
              >
                  <RefreshCw size={18} className="text-slate-600" />
              </button>
          </div>

          <div className="grid gap-3">
              {players.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <div>
                          <h3 className="font-bold text-slate-800">{p.name}</h3>
                          <p className="text-xs text-slate-500">{p.position} • {p.age} anos • OVR {p.rating}</p>
                      </div>
                      <button onClick={() => { setSelectedPlayer(p); setOffer({ salary: p.salary, weeks: 52 }); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                          Contratar
                      </button>
                  </div>
              ))}
          </div>

          {selectedPlayer && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
                  <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in zoom-in">
                      <h2 className="text-xl font-bold mb-4">Oferta para {selectedPlayer.name}</h2>
                      
                      <div className="space-y-4 mb-6">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Salário Semanal</label>
                              <input type="range" min="5000" max="100000" step="1000" value={offer.salary} onChange={e => setOffer({...offer, salary: parseInt(e.target.value)})} className="w-full accent-emerald-600" />
                              <p className="text-right font-bold text-slate-800">${offer.salary}</p>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Contrato (Semanas)</label>
                              <input type="range" min="10" max="150" value={offer.weeks} onChange={e => setOffer({...offer, weeks: parseInt(e.target.value)})} className="w-full accent-emerald-600" />
                              <p className="text-right font-bold text-slate-800">{offer.weeks} semanas</p>
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <button onClick={() => setSelectedPlayer(null)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-600">Cancelar</button>
                          <button onClick={handleHire} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold">Finalizar</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};

export default MarketView;
