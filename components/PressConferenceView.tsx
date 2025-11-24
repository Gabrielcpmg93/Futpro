
import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { ArrowLeft, Mic, Camera, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';

interface PressConferenceViewProps {
  team: Team;
  lastMatchData?: {
      opponent: string;
      result: 'win' | 'loss' | 'draw';
      scoreUser: number;
      scoreOpponent: number;
  } | null;
  onBack: () => void;
}

const PressConferenceView: React.FC<PressConferenceViewProps> = ({ team, lastMatchData, onBack }) => {
  // Extract initials or a short name for the logo pattern
  const teamInitials = team.name.substring(0, 3).toUpperCase();
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset state when new data comes in (though usually this component remounts)
  useEffect(() => {
      setAnswered(false);
      setFeedback(null);
  }, [lastMatchData]);

  const handleAnswer = (text: string) => {
      setAnswered(true);
      setFeedback("A torcida reagiu positivamente à sua declaração.");
  };

  const getQuestions = () => {
      if (!lastMatchData) return null;
      const { result, opponent } = lastMatchData;

      if (result === 'win') {
          return {
              journalist: `Parabéns pela vitória contra o ${opponent}. O que foi decisivo hoje?`,
              options: [
                  "A entrega dos jogadores",
                  "Nossa estratégia funcionou",
                  "O apoio da torcida"
              ]
          };
      } else if (result === 'loss') {
          return {
              journalist: `Derrota difícil contra o ${opponent}. O que deu errado?`,
              options: [
                  "Faltou concentração",
                  "O adversário teve sorte",
                  "Vamos trabalhar mais"
              ]
          };
      } else {
          return {
              journalist: `Um empate contra o ${opponent}. Como você avalia o resultado?`,
              options: [
                  "Merecíamos vencer",
                  "Foi um jogo equilibrado",
                  "Poderia ser pior"
              ]
          };
      }
  };

  const qData = getQuestions();

  // --- 2D VOXEL CHARACTER RENDERER (MANAGER) ---
  const ManagerCharacter = () => (
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 w-32 h-40 transition-transform duration-500 hover:scale-105 origin-bottom">
          {/* Head */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#f5d0b0] rounded-md shadow-md border-b-2 border-[#e0ac69]">
              {/* Hair */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[110%] h-6 bg-slate-800 rounded-t-md"></div>
              {/* Eyes */}
              <div className="absolute top-7 left-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-7 right-3 w-2 h-2 bg-black rounded-full"></div>
              {/* Beard/Stubble */}
              <div className="absolute bottom-0 w-full h-5 bg-slate-900/10"></div>
          </div>
          
          {/* Neck */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-6 h-4 bg-[#f5d0b0] z-0"></div>

          {/* Body (Suit) */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-slate-800 rounded-t-xl shadow-lg flex flex-col items-center">
              {/* Shirt Collar */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white mt-1"></div>
              {/* Tie */}
              <div className="w-2 h-16 -mt-2" style={{ backgroundColor: team.secondaryColor }}></div>
              {/* Suit Buttons */}
              <div className="absolute top-12 w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="absolute top-16 w-1 h-1 bg-slate-600 rounded-full"></div>
          </div>

          {/* Arms (Resting on desk implicitly) */}
          <div className="absolute top-18 left-0 w-6 h-20 bg-slate-900 rounded-l-md rotate-6 origin-top"></div>
          <div className="absolute top-18 right-0 w-6 h-20 bg-slate-900 rounded-r-md -rotate-6 origin-top"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between">
        <button 
            onClick={onBack}
            className="bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
        <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Ao Vivo
        </div>
      </div>

      {/* THE ROOM (CSS 3D Scene) */}
      <div className="flex-1 relative flex items-end justify-center perspective-[1000px] overflow-hidden">
          
          {/* Back Wall (The Backdrop) */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: team.primaryColor }}
          >
              {/* Logo Pattern */}
              <div className="w-full h-full opacity-20 grid grid-cols-6 gap-8 p-8 content-center justify-items-center" 
                   style={{ transform: 'scale(1.2)' }}>
                  {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="font-black text-white text-xl tracking-tighter rotate-[-15deg] select-none">
                          {teamInitials}
                      </div>
                  ))}
              </div>

              {/* Central Main Logo/Text */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full px-4">
                  <h1 className="text-white font-black text-4xl uppercase tracking-wide drop-shadow-lg mb-2 leading-tight">
                      {team.name}
                  </h1>
                  <div className="flex justify-center gap-4 opacity-80">
                      <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded">SPONSOR</div>
                      <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded">BET</div>
                      <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded">BANK</div>
                  </div>
              </div>
          </div>

          {/* Floor */}
          <div className="absolute bottom-0 w-full h-1/3 bg-[#8b5a2b] origin-bottom" 
               style={{ 
                   transform: 'rotateX(45deg) scale(2)',
                   backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))'
               }}>
          </div>

          {/* MANAGER CHARACTER (Behind Desk) */}
          <ManagerCharacter />

          {/* The Desk */}
          <div className="relative w-full max-w-lg h-40 z-20 -mb-10">
              {/* Desk Front Panel */}
              <div 
                className="absolute bottom-0 left-0 w-full h-full flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: team.primaryColor }}
              >
                  <div className="border-t-4 border-white/20 w-full h-full flex items-center justify-center relative overflow-hidden">
                        {/* Desk Logo */}
                        <div className="w-24 h-24 rounded-full border-4 border-white/50 flex items-center justify-center bg-white/10 text-white font-black text-2xl shadow-inner">
                            {team.name.substring(0,1)}
                        </div>
                        
                        {/* Side text */}
                        <div className="absolute right-4 bottom-16 text-white/30 text-[10px] font-bold w-16 leading-tight text-right">
                            ONTEM<br/>HOJE E<br/>SEMPRE
                        </div>
                  </div>
              </div>

              {/* Desk Top (Wood) */}
              <div className="absolute top-0 left-0 w-full h-12 bg-[#5d4037] origin-bottom skew-x-12 shadow-lg" style={{ transform: 'translateY(-100%) rotateX(60deg)' }}></div>

              {/* Microphones */}
              <div className="absolute -top-16 left-1/4 w-2 h-16 bg-gray-800 rotate-12 origin-bottom">
                  <div className="absolute -top-2 -left-1 w-4 h-6 bg-black rounded-md flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
              </div>
              <div className="absolute -top-14 left-1/3 w-2 h-14 bg-gray-800 -rotate-6 origin-bottom">
                   <div className="absolute -top-2 -left-1 w-4 h-6 bg-gray-900 rounded-md border-t-2 border-red-500"></div>
              </div>
              <div className="absolute -top-16 right-1/3 w-2 h-16 bg-gray-800 rotate-6 origin-bottom">
                   <div className="absolute -top-2 -left-1 w-4 h-6 bg-black rounded-md flex items-center justify-center">
                       <span className="text-[4px] text-white font-bold">TV</span>
                   </div>
              </div>
              <div className="absolute -top-12 right-1/4 w-2 h-12 bg-gray-800 -rotate-12 origin-bottom">
                   <div className="absolute -top-2 -left-1 w-4 h-6 bg-gray-900 rounded-md"></div>
              </div>

              {/* Water Bottles */}
              <div className="absolute -top-4 left-10 w-3 h-8 bg-blue-200/50 rounded-sm border border-white/30"></div>
              <div className="absolute -top-4 right-20 w-3 h-8 bg-blue-200/50 rounded-sm border border-white/30"></div>
              
              {/* Tablet/Papers */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-10 bg-white transform rotate-x-60 skew-x-12 shadow-sm flex items-center justify-center">
                  <div className="w-12 h-1 bg-black/20"></div>
              </div>
          </div>

          {/* Flash Effects */}
          <div className="absolute inset-0 pointer-events-none animate-pulse bg-white/5 z-30 mix-blend-overlay"></div>
      </div>

      {/* Interactive Area */}
      <div className="bg-slate-800 p-6 pb-10 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl border-t border-slate-700">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <Mic size={20} className="text-rose-500" /> 
              Coletiva de Imprensa
          </h2>

          {lastMatchData && qData ? (
              !answered ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 mb-4 relative">
                          <div className="absolute -top-3 -left-2 bg-yellow-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              PERGUNTA
                          </div>
                          <p className="text-slate-200 text-sm italic">"{qData.journalist}"</p>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-3 font-bold uppercase">Sua Resposta:</p>
                      <div className="grid gap-3">
                          {qData.options.map((option, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                className="bg-slate-100 hover:bg-white text-slate-900 p-3 rounded-xl text-sm font-bold text-left transition-colors active:scale-95 flex items-center gap-3"
                              >
                                  <MessageSquare size={16} className="text-slate-400" />
                                  {option}
                              </button>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center animate-in zoom-in">
                      <ThumbsUp className="mx-auto text-emerald-400 mb-2" size={32} />
                      <p className="text-white font-bold text-lg">Declaração Registrada</p>
                      <p className="text-emerald-200 text-sm mt-1">{feedback}</p>
                  </div>
              )
          ) : (
              <div className="text-center py-6 opacity-60">
                  <AlertCircle className="mx-auto mb-2 text-slate-500" size={32} />
                  <p className="text-slate-400 text-sm">Nenhuma entrevista agendada.</p>
                  <p className="text-slate-600 text-xs mt-1">Jogue uma partida para falar com a imprensa.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default PressConferenceView;
