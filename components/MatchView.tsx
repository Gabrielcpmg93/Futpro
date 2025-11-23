
import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { simulateMatchCommentary } from '../services/geminiService';
import { Play, Activity, Zap, Shield, Pause, RotateCcw } from 'lucide-react';

interface MatchViewProps {
  team: Team;
  onFinish: (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => void;
  opponentName?: string;
  opponentColor?: string;
  skipSetup?: boolean;
  forcedResult?: 'win' | 'loss' | 'draw'; // New prop to force outcome
}

interface FieldPlayer {
    id: number;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    role: 'GK' | 'DEF' | 'MID' | 'FWD';
    team: 'home' | 'away';
    targetX?: number;
    targetY?: number;
}

const MatchView: React.FC<MatchViewProps> = ({ 
  team, 
  onFinish, 
  opponentName = "Dragões do Sul",
  opponentColor = "#dc2626",
  skipSetup = false,
  forcedResult
}) => {
  const [viewState, setViewState] = useState<'MENU' | 'PLAYING' | 'FINISHED'>(skipSetup ? 'PLAYING' : 'MENU');
  const [score, setScore] = useState({ user: 0, opponent: 0 });
  const [commentaryLines, setCommentaryLines] = useState<string[]>([]);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [tactic, setTactic] = useState<'attack' | 'defend' | 'possession'>('possession');
  
  // Field Simulation State
  const [players, setPlayers] = useState<FieldPlayer[]>([]);
  const [ball, setBall] = useState({ x: 50, y: 50 });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Initialize Players (7 vs 7 for mobile visibility)
  const initPlayers = () => {
      const homePlayers: FieldPlayer[] = [
          { id: 1, x: 5, y: 50, role: 'GK', team: 'home' },
          { id: 2, x: 20, y: 20, role: 'DEF', team: 'home' },
          { id: 3, x: 20, y: 80, role: 'DEF', team: 'home' },
          { id: 4, x: 35, y: 50, role: 'MID', team: 'home' },
          { id: 5, x: 45, y: 30, role: 'MID', team: 'home' },
          { id: 6, x: 45, y: 70, role: 'MID', team: 'home' },
          { id: 7, x: 60, y: 50, role: 'FWD', team: 'home' },
      ];
      
      const awayPlayers: FieldPlayer[] = [
          { id: 8, x: 95, y: 50, role: 'GK', team: 'away' },
          { id: 9, x: 80, y: 20, role: 'DEF', team: 'away' },
          { id: 10, x: 80, y: 80, role: 'DEF', team: 'away' },
          { id: 11, x: 65, y: 50, role: 'MID', team: 'away' },
          { id: 12, x: 55, y: 30, role: 'MID', team: 'away' },
          { id: 13, x: 55, y: 70, role: 'MID', team: 'away' },
          { id: 14, x: 40, y: 50, role: 'FWD', team: 'away' },
      ];

      setPlayers([...homePlayers, ...awayPlayers]);
      setBall({ x: 50, y: 50 });
  };

  useEffect(() => {
      initPlayers();
  }, []);

  // Simulation Loop
  useEffect(() => {
      if (viewState !== 'PLAYING') return;

      const interval = setInterval(() => {
          setPlayers(prevPlayers => prevPlayers.map(p => {
              // Base positions based on role
              let baseX = p.team === 'home' ? 30 : 70;
              if (p.role === 'GK') baseX = p.team === 'home' ? 5 : 95;
              if (p.role === 'FWD') baseX = p.team === 'home' ? 70 : 30;

              // Tactic influence
              if (p.team === 'home') {
                  if (tactic === 'attack') baseX += 10;
                  if (tactic === 'defend') baseX -= 10;
              }

              // Random movement noise
              const noiseX = (Math.random() - 0.5) * 10;
              const noiseY = (Math.random() - 0.5) * 10;
              
              let newX = p.x + (baseX - p.x) * 0.1 + noiseX;
              let newY = p.y + noiseY;

              // Clamp to field
              newX = Math.max(2, Math.min(98, newX));
              newY = Math.max(2, Math.min(98, newY));

              return { ...p, x: newX, y: newY };
          }));

          // Ball Movement - Move towards active zones
          setBall(prev => {
              const targetX = Math.random() > 0.5 ? 80 : 20; // Move towards goals
              const targetY = Math.random() * 100;
              return {
                  x: prev.x + (targetX - prev.x) * 0.05 + (Math.random() - 0.5) * 5,
                  y: prev.y + (targetY - prev.y) * 0.05 + (Math.random() - 0.5) * 5
              };
          });

      }, 500); // Update every 500ms

      return () => clearInterval(interval);
  }, [viewState, tactic]);


  const startMatch = async () => {
    setViewState('PLAYING');
    setScore({ user: 0, opponent: 0 });
    setVisibleLines([]);
    initPlayers();
    
    // Simulation Logic
    let userGoals = 0;
    let oppGoals = 0;

    // Apply forced result if provided, otherwise use random logic
    if (forcedResult === 'win') {
        userGoals = Math.floor(Math.random() * 2) + 2; // 2 or 3 goals
        oppGoals = Math.floor(Math.random() * (userGoals - 1)); // Always strictly less
    } else if (forcedResult === 'loss') {
        oppGoals = Math.floor(Math.random() * 2) + 2; // 2 or 3 goals
        userGoals = Math.floor(Math.random() * (oppGoals - 1)); // Always strictly less
    } else if (forcedResult === 'draw') {
        userGoals = Math.floor(Math.random() * 3);
        oppGoals = userGoals;
    } else {
        // Standard Logic
        const tacticBonus = tactic === 'attack' ? 1 : 0;
        userGoals = Math.floor(Math.random() * 3) + tacticBonus + (Math.random() > 0.5 ? 1 : 0);
        oppGoals = Math.floor(Math.random() * 3);
    }
    
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
    }, 2000); // Slower commentary to enjoy the view
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
                          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto ring-4 ring-emerald-900">🛡️</div>
                          <span className="font-bold text-white text-sm">{team.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-600">VS</div>
                      <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto ring-4 ring-slate-900"
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
                      Iniciar Partida
                  </button>
                  
                  <div className="mt-4 text-center">
                     <p className="text-xs text-slate-500">Simulação 2D em tempo real</p>
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
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-600 shadow-lg"
                style={{ backgroundColor: team.primaryColor }}
              >
                  {team.name.substring(0,2).toUpperCase()}
              </div>
              <span className="text-3xl font-mono font-bold text-white">{score.user}</span>
          </div>
          
          <div className="flex flex-col items-center">
              <div className="bg-slate-900/50 px-3 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-700 mb-1">
                  {viewState === 'FINISHED' ? 'FIM' : 'AO VIVO'}
              </div>
              <div className="h-1 w-12 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-[pulse_2s_infinite]"></div>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-bold text-white">{score.opponent}</span>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-600 shadow-lg"
                style={{ backgroundColor: opponentColor }}
              >
                  {opponentName.substring(0,2).toUpperCase()}
              </div>
          </div>
      </div>

      {/* 2D Field - High Fidelity */}
      <div className="relative w-full aspect-[16/10] bg-[#2e8b57] overflow-hidden shadow-inner border-y-4 border-slate-900 select-none">
           {/* Grass Texture - Striped */}
           <div className="absolute inset-0" 
                style={{ 
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.05) 20%)',
                    backgroundSize: '100% 100%' 
                }}>
           </div>
           
           {/* Field Markings Container */}
           <div className="absolute inset-3 border-2 border-white/60 rounded-sm box-border">
               
               {/* Center Line */}
               <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/60 -translate-x-1/2"></div>
               
               {/* Center Circle */}
               <div className="absolute top-1/2 left-1/2 w-[22%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>

               {/* Penalty Area Left */}
               <div className="absolute top-1/2 left-0 w-[16%] h-[44%] border-r-2 border-y-2 border-white/60 -translate-y-1/2 bg-white/5"></div>
               {/* Goal Area Left */}
               <div className="absolute top-1/2 left-0 w-[6%] h-[20%] border-r-2 border-y-2 border-white/60 -translate-y-1/2"></div>
               {/* Penalty Spot Left */}
               <div className="absolute top-1/2 left-[11%] w-1 h-1 bg-white rounded-full -translate-y-1/2"></div>
               {/* Goal Net Left */}
               <div className="absolute top-1/2 -left-2 w-2 h-[12%] border-y border-l border-white/30 -translate-y-1/2 bg-white/10"></div>

               {/* Penalty Area Right */}
               <div className="absolute top-1/2 right-0 w-[16%] h-[44%] border-l-2 border-y-2 border-white/60 -translate-y-1/2 bg-white/5"></div>
               {/* Goal Area Right */}
               <div className="absolute top-1/2 right-0 w-[6%] h-[20%] border-l-2 border-y-2 border-white/60 -translate-y-1/2"></div>
               {/* Penalty Spot Right */}
               <div className="absolute top-1/2 right-[11%] w-1 h-1 bg-white rounded-full -translate-y-1/2"></div>
               {/* Goal Net Right */}
               <div className="absolute top-1/2 -right-2 w-2 h-[12%] border-y border-r border-white/30 -translate-y-1/2 bg-white/10"></div>

               {/* Corner Arcs */}
               <div className="absolute top-0 left-0 w-3 h-3 border-b border-r border-white/60 rounded-br-full"></div>
               <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-white/60 rounded-bl-full"></div>
               <div className="absolute bottom-0 left-0 w-3 h-3 border-t border-r border-white/60 rounded-tr-full"></div>
               <div className="absolute bottom-0 right-0 w-3 h-3 border-t border-l border-white/60 rounded-tl-full"></div>
           </div>

           {/* Players Rendering */}
           {players.map(p => (
               <div 
                key={p.id}
                className="absolute w-4 h-4 rounded-full border border-white/90 shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-500 ease-linear z-10 flex items-center justify-center"
                style={{ 
                    left: `${p.x}%`, 
                    top: `${p.y}%`,
                    backgroundColor: p.team === 'home' ? team.primaryColor : opponentColor,
                    transform: 'translate(-50%, -50%)'
                }}
               >
                   {/* Player inner detail (like a top-down head) */}
                   <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
               </div>
           ))}

           {/* Ball Rendering */}
           <div 
             className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-sm z-20 transition-all duration-500 ease-linear border border-gray-300"
             style={{
                 left: `${ball.x}%`,
                 top: `${ball.y}%`,
                 transform: 'translate(-50%, -50%)'
             }}
           ></div>

      </div>

      {/* Match Log (Below Field) */}
      <div className="flex-1 bg-slate-900 p-4 overflow-y-auto border-b border-slate-800" ref={scrollRef}>
          <div className="space-y-3">
              {visibleLines.length === 0 && (
                  <div className="text-center py-10">
                      <div className="animate-pulse text-emerald-500 text-sm font-bold mb-2">AQUECIMENTO</div>
                      <p className="text-slate-500 text-xs">Os jogadores estão se posicionando...</p>
                  </div>
              )}
              {visibleLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3 animate-in slide-in-from-left duration-300">
                      <div className="min-w-[40px] text-xs font-mono text-emerald-500 pt-1 text-right">
                          {Math.floor((idx + 1) * (90 / Math.max(1, commentaryLines.length)))}'
                      </div>
                      <div className="bg-slate-800 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-slate-200 text-sm shadow-sm border border-slate-700/50 flex-1">
                          {line}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Tactics Area (Bottom) */}
      <div className="bg-slate-800 p-4 pb-6 pt-2 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
         {viewState === 'FINISHED' ? (
             <button onClick={handleFinish} className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                 <RotateCcw size={18} /> Continuar
             </button>
         ) : (
             <div>
                 <div className="flex items-center gap-2 mb-3 justify-center opacity-70">
                    <Activity size={14} className="text-emerald-400"/>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Táticas do Treinador</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setTactic('attack')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'attack' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'}`}
                    >
                        <Zap size={18} />
                        <span className="text-[10px] font-bold">Ofensivo</span>
                    </button>
                    <button 
                        onClick={() => setTactic('possession')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'possession' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'}`}
                    >
                        <Activity size={18} />
                        <span className="text-[10px] font-bold">Posse</span>
                    </button>
                    <button 
                        onClick={() => setTactic('defend')} 
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${tactic === 'defend' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'}`}
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
