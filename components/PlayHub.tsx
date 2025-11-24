import React from 'react';
import { Team, ScreenState } from '../types';
import { Play, Trophy, Users, Shield, Calendar, ArrowRight, Gamepad2 } from 'lucide-react';

interface PlayHubProps {
  team: Team;
  onNavigate: (screen: ScreenState) => void;
  onPlayLeagueMatch: () => void;
  onPlay3DMatch: () => void;
  currentRound: number;
}

const PlayHub: React.FC<PlayHubProps> = ({ team, onNavigate, onPlayLeagueMatch, onPlay3DMatch, currentRound }) => {
  return (
    <div className="p-6 pb-24 animate-in fade-in duration-500 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Central de Jogos</h1>

      <div className="space-y-4">
        {/* League Match Card - SIMULATION */}
        <button 
            onClick={onPlayLeagueMatch}
            className="w-full bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl group transition-transform active:scale-95 text-left"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <div className="relative z-10 flex flex-col items-start">
                <div className="bg-slate-800 p-3 rounded-xl mb-4 text-emerald-400">
                    <Shield size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Brasileirão - Rodada {currentRound}</h2>
                <p className="text-slate-400 text-sm mb-4">Simulação Tática 2D</p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wide">
                    Simular <Play size={16} fill="currentColor" />
                </div>
            </div>
        </button>

        {/* 3D Match Card - NEW */}
        <button 
            onClick={onPlay3DMatch}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl group transition-transform active:scale-95 text-left"
        >
             <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-start">
                <div className="bg-white/20 p-3 rounded-xl mb-4 text-white">
                    <Gamepad2 size={32} />
                </div>
                <div className="flex justify-between w-full items-start">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Partida 3D</h2>
                        <p className="text-indigo-200 text-sm mb-4">Jogue os Melhores Momentos (Valendo Pontos)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wide bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    Jogar Agora <ArrowRight size={16} />
                </div>
            </div>
        </button>

        {/* Friendly Match Card Redirects to Calendar */}
        <button 
            onClick={() => onNavigate(ScreenState.CALENDAR)}
            className="w-full bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-lg group transition-transform active:scale-95 text-left relative overflow-hidden"
        >
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-100 rounded-full filter blur-2xl opacity-50 -mr-5 -mb-5"></div>
            <div className="relative z-10 flex flex-col items-start">
                <div className="bg-blue-50 p-3 rounded-xl mb-4 text-blue-600">
                    <Calendar size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Agendar Amistoso</h2>
                <p className="text-slate-500 text-sm mb-4">Acesse o calendário para marcar jogos amistosos.</p>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-wide">
                    Ir para Calendário <ArrowRight size={16} />
                </div>
            </div>
        </button>
      </div>
      
      <div className="mt-8 bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex items-start gap-3">
          <Trophy className="text-yellow-600 shrink-0 mt-1" size={20} />
          <div>
              <h3 className="font-bold text-yellow-800 text-sm">Dica do Treinador</h3>
              <p className="text-yellow-700 text-xs mt-1">O modo 3D permite que você controle diretamente os chutes a gol em momentos decisivos.</p>
          </div>
      </div>
    </div>
  );
};

export default PlayHub;
