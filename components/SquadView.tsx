import React from 'react';
import { Team, Position } from '../types';
import { Shield, User } from 'lucide-react';

interface SquadViewProps {
  team: Team;
  onBack: () => void;
}

const SquadView: React.FC<SquadViewProps> = ({ team, onBack }) => {
  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case Position.DEF: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Position.MID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case Position.FWD: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Elenco</h1>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
           Força: {team.strength}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
             <Shield size={20} className="text-slate-500" />
           </div>
           <div>
             <h2 className="font-bold text-slate-800">{team.name}</h2>
             <p className="text-xs text-slate-500">Baseado no {team.originalName}</p>
           </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {team.roster.map((player) => (
            <div key={player.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                    <User size={20} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{player.name}</h3>
                  <p className="text-xs text-slate-400">{player.age} anos</p>
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
    </div>
  );
};

export default SquadView;