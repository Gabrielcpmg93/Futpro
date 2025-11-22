import React from 'react';
import { Calendar, Tv, Globe, Star, Trophy } from 'lucide-react';
import { Team, ScreenState } from '../types';

interface DashboardProps {
  team: Team;
  onNavigate: (screen: ScreenState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ team, onNavigate }) => {
  return (
    <div className="p-6 pt-8 pb-24 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Início</h1>
          <p className="text-slate-500 text-sm">Bem-vindo ao <span className="font-semibold text-slate-700">{team.name}</span></p>
        </div>
        <button className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 hover:bg-amber-200 transition-colors">
          <Calendar size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Card 1: Next Challenge (Dark Blue) */}
      <div 
        onClick={() => onNavigate(ScreenState.MATCH)}
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer group transform transition-transform hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Tv size={120} />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-emerald-400 mb-4">
            <Tv size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wide">Próximo Desafio</p>
            <h2 className="text-white text-2xl font-bold">Ir para o Jogo</h2>
          </div>
        </div>
      </div>

      {/* Card 2: Continental Tournament (Gold/Brown) */}
      <div 
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)' }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-amber-900/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-amber-300 mb-4">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-amber-200/80 text-xs font-medium mb-1 uppercase tracking-wide">Torneio Continental</p>
            <h2 className="text-white text-xl font-bold leading-tight">Copa das Américas</h2>
            <p className="text-amber-200/60 text-xs mt-1">Times Fictícios Exclusivos</p>
          </div>
        </div>
      </div>

      {/* Card 3: Career Mode (Purple) */}
      <div 
        className="w-full rounded-3xl p-6 relative overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' }}
      >
         <div className="absolute bottom-0 right-0 p-4 opacity-10 rotate-12">
          <Star size={100} />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-violet-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-yellow-300 mb-4">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-violet-200 text-xs font-medium mb-1 uppercase tracking-wide">Modo Carreira</p>
            <h2 className="text-white text-2xl font-bold">Rumo ao Estrelato</h2>
          </div>
        </div>
      </div>

      {/* Card 4: Partial Green (Table/Training) */}
      <div 
        className="w-full rounded-t-3xl p-6 relative overflow-hidden shadow-xl h-24 mt-2"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
      >
         <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                <Trophy size={20} />
            </div>
            <div>
                 <h2 className="text-white text-lg font-bold">Tabela da Liga</h2>
                 <p className="text-emerald-200 text-xs">Veja sua classificação</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;