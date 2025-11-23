
import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { simulateMatchCommentary } from '../services/geminiService';
import { Play, Activity, Zap, Shield } from 'lucide-react';

interface MatchViewProps {
  team: Team;
  onFinish: (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => void;
  opponentName?: string;
  opponentColor?: string;
  skipSetup?: boolean;
}

const MatchView: React.FC<MatchViewProps> = ({ 
  team, 
  onFinish, 
  opponentName = "Dragões do Sul",
  opponentColor = "#dc2626",
  skipSetup = false
}) => {
  const [viewState, setViewState] = useState<'MENU' | 'PLAYING' | 'FINISHED'>(skipSetup ? 'PLAYING' : 'MENU');
  const [score, setScore] = useState({ user: 0, opponent: 0 });
  const [commentaryLines, setCommentaryLines] = useState<string[]>([]);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [tactic, setTactic] = useState<'attack' | 'defend' | 'possession'>('possession');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const startMatch = async () => {
    setViewState('PLAYING');
    setScore({ user: 0, opponent: 0 });
    setVisibleLines([]);
    
    // Simulation Logic
    const tacticBonus = tactic === 'attack' ? 1 : 0;
    const userGoals = Math.floor(Math.random() * 3) + tacticBonus + (Math.random() > 0.5 ? 1 : 0);
    const oppGoals = Math.floor(Math.random() * 3);
    
    const lines = await simulateMatchCommentary(team.name, opponentName);
    setCommentaryLines(lines);

    // Stream the commentary lines
    let currentLine = 0;
    const interval = setInterval(() => {
        if (currentLine < lines.length) {
            setVisibleLines(prev => [...prev, lines[currentLine]]);
            
            // Scroll to bottom
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }

            // Update score randomly during match
            if (currentLine === Math.floor(lines.length / 3)) {
               setScore(prev => ({ ...prev, user: Math.floor(userGoals / 2), opponent: Math.floor(oppGoals / 2) }));
            }
            if (currentLine === lines.length - 1) {
               setScore({ user: userGoals, opponent: oppGoals });
            }

            currentLine++;
        } else {
            clearInterval(interval);
            setViewState('FINISHED');
        }
    }, 1500); // New line every 1.5 seconds
  };

  useEffect(() => {
      if (skipSetup && !hasStartedRef.current) {
          hasStartedRef.current = true;
          startMatch();
      }
  }, [skipSetup]);

  const handleFinish = () => {
      if (score.user > score.opponent) onFinish('win', score.user, score.opponent);
      else if (score.user < score.opponent) onFinish('loss', score.user, score.opponent);
      else onFinish('draw', score.user, score.opponent);
  };

  if (viewState === 'MENU') {
      return (
          <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold text-white mb-2">Dia de Jogo</h1>
              <p className="text-slate-400 mb-8">{team.name} vs {opponentName}</p>

              <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-8">
                      <div className="text-center">
                          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto">🛡️</div>
                          <span className="font-bold text-white text-sm">{team.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-600">VS</div>
                      <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto"
                            style={{ backgroundColor: opponentColor }}
                          >⚔️</div>
                          <span className="font-bold text-white text-sm">{opponentName}</span>
                      </div>
                  </div>

                  <button 
                      onClick={startMatch}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                      <Play fill="currentColor" size={20} />
                      Assistir em 2D
                  </button>
                  
                  <div className="mt-4 text-center">
                     <p className="text-xs text-slate-500">Simulação realista com eventos ao vivo</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Header */}
      <div className="bg-slate-800 p-4 shadow-md z-20 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
              <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {team.name.substring(0,2).toUpperCase()}
              </div>
              <span className="text-2xl font-mono font-bold text-white">{score.user}</span>
          </div>
          <div className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 font-mono">
              {viewState === 'FINISHED' ? 'FIM' : 'AO VIVO'}
          </div>
          <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-white">{score.opponent}</span>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: opponentColor }}
              >
                  {opponentName.substring(0,2).toUpperCase()}
              </div>
          </div>
      </div>

      {/* 2D Field - Realistic */}
      <div className="relative w-full h-64 bg-green-700 overflow-hidden shadow-inner border-y border-slate-900">
           {/* Grass Pattern */}
           <div className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
           </div>
           
           {/* Field Lines */}
           <div className="absolute inset-4 border-2 border-white/40 rounded-sm">
               {/* Halfway Line */}
               <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/40 -translate-x-1/2"></div>
               {/* Center Circle */}
               <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
               {/* Penalty Areas */}
               <div className="absolute top-1/2 left-0 w-16 h-32 border-r-2 border-y-2 border-white/40 -translate-y-1/2 bg-white/5"></div>
               <div className="absolute top-1/2 right-0 w-16 h-32 border-l-2 border-y-2 border-white/40 -translate-y-1/2 bg-white/5"></div>
           </div>

           {/* Animated Dots */}
           {viewState === 'PLAYING' && (
             <>
                <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-black/50 animate-bounce transition-all duration-700"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white rounded-full shadow-lg shadow-black/50 animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/80 rounded-full"></div>
             </>
           )}
      </div>

      {/* Match Log (Below Field) */}
      <div className="flex-1 bg-slate-900 p-4 overflow-y-auto border-b border-slate-800" ref={scrollRef}>
          <div className="space-y-3">
              {visibleLines.length === 0 && (
                  <p className="text-slate-500 text-center italic text-sm mt-4">
                      {skipSetup ? "A bola vai rolar..." : "Aguardando início..."}
                  </p>
              )}
              {visibleLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3 animate-in slide-in-from-left duration-300">
                      <div className="min-w-[40px] text-xs font-mono text-emerald-500 pt-1">
                          {Math.floor((idx + 1) * (90 / commentaryLines.length))}'
                      </div>
                      <div className="bg-slate-800 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-slate-200 text-sm shadow-sm border border-slate-700/50">
                          {line}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Tactics Area (Bottom) */}
      <div className="bg-slate-800 p-4 pb-6 pt-2 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
         {viewState === 'FINISHED' ? (
             <button onClick={handleFinish} className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl shadow-lg">
                 Continuar
             </button>
         ) : (
             <div>
                 <div className="flex items-center gap-2 mb-3 justify-center opacity-70">
                    <Activity size={14} className="text-emerald-400"/>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Táticas em Tempo Real</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setTactic('attack')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'attack' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-700 border-transparent text-slate-400'}`}
                    >
                        <Zap size={18} />
                        <span className="text-[10px] font-bold">Ofensivo</span>
                    </button>
                    <button 
                        onClick={() => setTactic('possession')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'possession' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-700 border-transparent text-slate-400'}`}
                    >
                        <Activity size={18} />
                        <span className="text-[10px] font-bold">Posse</span>
                    </button>
                    <button 
                        onClick={() => setTactic('defend')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'defend' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-700 border-transparent text-slate-400'}`}
                    >
                        <Shield size={18} />
                        <span className="text-[10px] font-bold">Defensivo</span>
                    </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default MatchView;
