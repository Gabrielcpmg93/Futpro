
import React from 'react';
import { Calendar, Tv, Globe, Star, Trophy, DollarSign, FileText, Award } from 'lucide-react';
import { Team, ScreenState } from '../types';

interface DashboardProps {
  team: Team;
  onNavigate: (screen: ScreenState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ team, onNavigate }) => {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(val);
  };

  const expenses = team.roster.reduce((acc, p) => acc + p.salary, 0);
  const expiringContracts = team.roster.filter(p => p.contractWeeks < 10).length;

  return (
    <div className="p-6 pt-8 pb-24 flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Início</h1>
          <p className="text-slate-500 text-sm">Gestor do <span className="font-semibold text-slate-700">{team.name}</span></p>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                {formatMoney(team.budget)}
            </span>
        </div>
      </div>

      {/* Finances & Contracts Row */}
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <div className="bg-red-100 p-1.5 rounded-lg text-red-600"><DollarSign size={16}/></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Despesas</span>
             </div>
             <p className="text-slate-800 font-bold text-sm">-{formatMoney(expenses)}/sem</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><FileText size={16}/></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Contratos</span>
             </div>
             <p className="text-slate-800 font-bold text-sm">{expiringContracts} vencendo</p>
          </div>
      </div>

      {/* Trophy Room Preview */}
      {team.trophies.length > 0 && (
         <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex items-center gap-3">
            <Award className="text-yellow-600" />
            <div>
                <h3 className="text-yellow-800 font-bold text-sm">Sala de Troféus</h3>
                <p className="text-yellow-600 text-xs">{team.trophies.join(", ")}</p>
            </div>
         </div>
      )}

      {/* Copa das Américas */}
      <div 
        onClick={() => onNavigate(ScreenState.COPA_AMERICAS)}
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
          <div className="w-10 h-10 bg-amber-900/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-amber-300 mb-4">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-amber-200/80 text-xs font-medium mb-1 uppercase tracking-wide">Torneio Continental</p>
            <h2 className="text-white text-xl font-bold leading-tight">Copa das Américas</h2>
            <p className="text-amber-200/60 text-xs mt-1">Grupos A, B, C, E</p>
          </div>
        </div>
      </div>

      {/* Career Mode */}
      <div 
        onClick={() => onNavigate(ScreenState.CAREER_MODE)}
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' }}
      >
         <div className="absolute bottom-0 right-0 p-4 opacity-10 rotate-12">
          <Star size={100} />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
          <div className="w-10 h-10 bg-violet-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-yellow-300 mb-4">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-violet-200 text-xs font-medium mb-1 uppercase tracking-wide">Modo Carreira</p>
            <h2 className="text-white text-2xl font-bold">Rumo ao Estrelato</h2>
            <p className="text-violet-300 text-xs mt-1">Temporada de 80 Jogos</p>
          </div>
        </div>
      </div>

      {/* Friendly Match */}
      <div 
        onClick={() => onNavigate(ScreenState.FRIENDLY_SETUP)}
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
          <div className="flex justify-between items-center">
             <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-emerald-400 mb-2">
                <Tv size={20} />
             </div>
             <span className="text-white text-xs bg-emerald-600 px-2 py-1 rounded">Amistoso</span>
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Jogar Amistoso</h2>
            <p className="text-slate-400 text-xs mt-1">Escolha times da Série A Fictícia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
