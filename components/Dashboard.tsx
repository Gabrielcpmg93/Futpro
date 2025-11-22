
import React from 'react';
import { Calendar, Tv, Globe, Star, Trophy, DollarSign, FileText, Award, Medal, ArrowRight } from 'lucide-react';
import { Team, ScreenState } from '../types';

interface DashboardProps {
  team: Team;
  onNavigate: (screen: ScreenState) => void;
  onUpdateTeam: (team: Team) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ team, onNavigate, onUpdateTeam }) => {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(val);
  };

  const expenses = team.roster.reduce((acc, p) => acc + p.salary, 0);
  const expiringContracts = team.roster.filter(p => p.contractWeeks < 10).length;

  const handleSkipWeek = () => {
    // Calculate new budget (deduct expenses)
    const newBudget = team.budget - expenses;
    
    // Decrease contract weeks for all players
    const newRoster = team.roster.map(p => ({
      ...p,
      contractWeeks: Math.max(0, p.contractWeeks - 1)
    }));

    onUpdateTeam({
      ...team,
      budget: newBudget,
      roster: newRoster
    });

    // Visual feedback (optional, but good for UX)
    // We rely on the UI updating immediately
  };

  return (
    <div className="p-6 pt-8 pb-24 flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Início</h1>
          <p className="text-slate-500 text-sm">Gestor do <span className="font-semibold text-slate-700">{team.name}</span></p>
        </div>
        <div className="flex flex-col items-end">
            <span className={`font-bold text-sm px-2 py-1 rounded-lg border ${team.budget < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
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
          <button 
            onClick={() => onNavigate(ScreenState.SQUAD)}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left hover:bg-slate-50 transition-colors active:scale-95"
          >
             <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${expiringContracts > 0 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <FileText size={16}/>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Contratos</span>
             </div>
             <p className={`font-bold text-sm ${expiringContracts > 0 ? 'text-orange-600' : 'text-slate-800'}`}>
                 {expiringContracts} vencendo
             </p>
          </button>
      </div>

      {/* Skip Week Button */}
      <button 
        onClick={handleSkipWeek}
        className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group active:scale-95 transition-all hover:bg-slate-50"
      >
         <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <Calendar size={20} />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Pular Semana</p>
                <p className="text-xs text-slate-400">Pagar salários e avançar tempo</p>
            </div>
         </div>
         <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">+1</span>
         </div>
      </button>

      {/* Trophy Room Section */}
      {team.trophies.length > 0 ? (
         <div className="bg-gradient-to-r from-yellow-100 to-orange-50 p-5 rounded-2xl border border-yellow-200 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700">
                   <Trophy size={20} />
                </div>
                <div>
                    <h3 className="text-yellow-900 font-bold">Sala de Troféus</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                       {team.trophies.map((t, i) => (
                           <span key={i} className="text-[10px] bg-white/60 text-yellow-800 px-2 py-0.5 rounded font-semibold border border-yellow-200/50 flex items-center gap-1">
                              <Medal size={10} /> {t}
                           </span>
                       ))}
                    </div>
                </div>
            </div>
         </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed flex items-center gap-3 opacity-60">
           <Trophy className="text-slate-300" />
           <p className="text-slate-400 text-xs font-medium">Sua galeria de troféus está vazia. Vença campeonatos!</p>
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
            <p className="text-violet-300 text-xs mt-1">Temporada de 90 Jogos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
