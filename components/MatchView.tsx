
import React, { useState, useEffect } from 'react';
import { Team, ScreenState } from '../types';
import { simulateMatchCommentary } from '../services/geminiService';
import { Trophy, Play, ArrowLeft, LayoutTemplate } from 'lucide-react';

interface MatchViewProps {
  team: Team;
  onFinish: (result: 'win' | 'loss' | 'draw') => void;
  opponentName?: string;
}

const MatchView: React.FC<MatchViewProps> = ({ team, onFinish, opponentName = "Dragões do Sul" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchOver, setMatchOver] = useState(false);
  const [score, setScore] = useState({ user: 0, opponent: 0 });
  const [commentary, setCommentary] = useState<string[]>([]);
  const [tactic, setTactic] = useState<'attack' | 'defend' | 'possession'>('possession');

  const startMatch = async () => {
    setIsPlaying(true);
    
    // Simulation
    const tacticBonus = tactic === 'attack' ? 1 : 0;
    const userGoals = Math.floor(Math.random() * 4) + tacticBonus;
    const oppGoals = Math.floor(Math.random() * 3);
    
    const comments = await simulateMatchCommentary(team.name, opponentName);
    
    // Artificial delay for 2D view
    setTimeout(() => {
        setCommentary(comments);
        setScore({ user: userGoals, opponent: oppGoals });
        setMatchOver(true);
        setIsPlaying(false);
    }, 5000); // 5 seconds of "watching"
  };

  const handleFinish = () => {
      if (score.user > score.opponent) onFinish('win');
      else if (score.user < score.opponent) onFinish('loss');
      else onFinish('draw');
  };

  return (
    <div className="min-h-screen bg-slate-900 relative flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between bg-slate-900 z-10">
         <button onClick={handleFinish} className="text-white/50 hover:text-white">
            <ArrowLeft />
         </button>
         <span className="text-white font-semibold text-sm">Assistir em 2D</span>
         <div className="w-6"></div>
      </div>

      {/* 2D Field Area */}
      <div className="flex-1 relative bg-green-700 overflow-hidden flex items-center justify-center shadow-inner">
          {/* Field Markings */}
          <div className="w-[90%] h-[90%] border-2 border-white/30 relative rounded">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>
             <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-2 border-x-2 border-white/30"></div>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-x-2 border-white/30"></div>
          </div>

          {/* Player Dots (Animation) */}
          {isPlaying && (
             <>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '1s' }}></div>
                <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full animate-spin"></div>
             </>
          )}

          {!isPlaying && !matchOver && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <button onClick={startMatch} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    <Play fill="currentColor" size={18} /> Iniciar Partida
                 </button>
             </div>
          )}

          {/* Score Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-6 py-2 rounded-full backdrop-blur font-mono text-xl border border-white/10">
             {isPlaying || matchOver ? `${score.user} - ${score.opponent}` : '0 - 0'}
          </div>
      </div>

      {/* Tactics & Controls */}
      <div className="bg-slate-800 p-4 pb-8 rounded-t-3xl -mt-4 z-20 shadow-2xl border-t border-slate-700">
         {matchOver ? (
             <div className="space-y-4">
                 <h3 className="text-white font-bold text-center mb-2">Fim de Jogo</h3>
                 <div className="bg-slate-700/50 p-4 rounded-xl">
                    {commentary.map((line, i) => (
                        <p key={i} className="text-slate-300 text-xs mb-1 border-l-2 border-emerald-500 pl-2">{line}</p>
                    ))}
                 </div>
                 <button onClick={handleFinish} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold">Continuar</button>
             </div>
         ) : (
             <div>
                 <h3 className="text-slate-400 text-xs font-bold uppercase mb-3 tracking-wider text-center">Opções Táticas</h3>
                 <div className="flex gap-2 justify-center">
                    <button 
                        onClick={() => setTactic('attack')} 
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${tactic === 'attack' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                    >
                        Ataque Total
                    </button>
                    <button 
                        onClick={() => setTactic('possession')} 
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${tactic === 'possession' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                    >
                        Posse
                    </button>
                    <button 
                        onClick={() => setTactic('defend')} 
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${tactic === 'defend' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                    >
                        Retranca
                    </button>
                 </div>
                 <p className="text-center text-xs text-slate-500 mt-3">Sua tática influencia as chances de gol.</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default MatchView;
