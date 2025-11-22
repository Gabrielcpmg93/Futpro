import React, { useState, useEffect } from 'react';
import { Team, ScreenState } from '../types';
import { simulateMatchCommentary } from '../services/geminiService';
import { Trophy, Play, ArrowLeft } from 'lucide-react';

interface MatchViewProps {
  team: Team;
  onFinish: () => void;
}

const MatchView: React.FC<MatchViewProps> = ({ team, onFinish }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchOver, setMatchOver] = useState(false);
  const [score, setScore] = useState({ user: 0, opponent: 0 });
  const [commentary, setCommentary] = useState<string[]>([]);
  const opponentName = "Dragões do Sul"; // Hardcoded rival for demo

  const startMatch = async () => {
    setIsPlaying(true);
    
    // Generate random score based on strength (simple logic)
    const userGoals = Math.floor(Math.random() * 4);
    const oppGoals = Math.floor(Math.random() * 3);
    
    // Get AI commentary
    const comments = await simulateMatchCommentary(team.name, opponentName);
    setCommentary(comments);
    
    setScore({ user: userGoals, opponent: oppGoals });
    setMatchOver(true);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative flex flex-col">
      {/* Top Bar */}
      <div className="p-6 flex items-center">
         <button onClick={onFinish} className="text-white/50 hover:text-white">
            <ArrowLeft />
         </button>
         <span className="ml-4 text-white font-semibold">Partida Rápida</span>
      </div>

      {/* Scoreboard */}
      <div className="px-6 py-10 flex justify-between items-center relative z-10">
         <div className="text-center w-1/3">
             <div className="w-16 h-16 mx-auto bg-white/10 rounded-full mb-3 flex items-center justify-center backdrop-blur-sm border border-white/20">
                 <span className="text-2xl">🛡️</span>
             </div>
             <h2 className="text-white font-bold text-sm leading-tight">{team.name}</h2>
         </div>

         <div className="text-center w-1/3">
            {matchOver ? (
                 <div className="text-4xl font-bold text-white tracking-widest animate-in zoom-in duration-300">
                     {score.user} - {score.opponent}
                 </div>
            ) : (
                <span className="text-white/50 text-xl font-mono">VS</span>
            )}
         </div>

         <div className="text-center w-1/3">
             <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full mb-3 flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                 <span className="text-2xl">🐉</span>
             </div>
             <h2 className="text-white font-bold text-sm leading-tight">{opponentName}</h2>
         </div>
      </div>

      {/* Action Area */}
      <div className="flex-1 bg-white rounded-t-[40px] p-8 relative mt-auto shadow-2xl">
         {!matchOver && !isPlaying && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                 <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
                    <Trophy size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800">Está tudo pronto!</h3>
                 <p className="text-slate-500">Os times estão em campo. A torcida faz barulho.</p>
                 <button 
                    onClick={startMatch}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                 >
                    <Play fill="currentColor" size={20} />
                    Iniciar Partida
                 </button>
             </div>
         )}

         {isPlaying && (
             <div className="h-full flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                 <p className="text-slate-600 font-medium">A bola está rolando...</p>
             </div>
         )}

         {matchOver && (
             <div className="h-full flex flex-col">
                 <h3 className="font-bold text-slate-900 mb-4">Melhores Momentos</h3>
                 <div className="space-y-4 mb-8 flex-1 overflow-y-auto">
                    {commentary.map((line, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-1 h-full bg-emerald-200 rounded-full"></div>
                            <p className="text-slate-600 text-sm leading-relaxed">{line}</p>
                        </div>
                    ))}
                 </div>
                 <button 
                    onClick={onFinish}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-auto active:scale-95 transition-transform"
                 >
                    Voltar ao Início
                 </button>
             </div>
         )}
      </div>
    </div>
  );
};

export default MatchView;