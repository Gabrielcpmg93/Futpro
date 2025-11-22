
import React, { useState } from 'react';
import { Team, Position } from '../types';
import { SERIE_A_MAPPING } from '../services/geminiService';
import { Star, User, ArrowRight, MapPin, Calendar, Trophy, Activity, Play, CheckCircle, ArrowLeft, Shield, Zap } from 'lucide-react';
import MatchView from './MatchView';

interface CareerViewProps {
    onComplete: (team: Team) => void;
    onCancel: () => void;
    onWinTrophy: () => void;
}

const CareerView: React.FC<CareerViewProps> = ({ onComplete, onCancel, onWinTrophy }) => {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [inCareerMatch, setInCareerMatch] = useState(false);
    const [careerOpponent, setCareerOpponent] = useState<string>('');
    
    // Season Stats
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const TOTAL_GAMES = 90;

    // Fictional Serie A opponents using the mapping
    const CAREER_OPPONENTS = Object.values(SERIE_A_MAPPING);

    const handleCreate = () => {
        if (!playerName) return;
        setStep(2);
    };

    const handleMatchSim = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 3000);
    };

    const selectOffer = (clubFictionalName: string) => {
        // Create the user's team
        const newTeam: Team = {
            id: 'career-team',
            name: clubFictionalName,
            originalName: clubFictionalName,
            primaryColor: '#0000FF',
            secondaryColor: '#FFFFFF',
            strength: 75,
            budget: 1000000,
            trophies: [],
            roster: Array.from({ length: 24 }).map((_, i) => ({
                id: `cp-${i}`,
                name: i === 0 ? playerName : `Companheiro ${i}`,
                position: Position.MID,
                rating: 70,
                age: 20,
                salary: 5000,
                contractWeeks: 52,
                marketValue: 1.0
            }))
        };
        setMyTeam(newTeam);
        setStep(4); // Go to Career Hub
    };

    const prepareMatchDay = () => {
        if (gamesPlayed >= TOTAL_GAMES) return;
        
        // Determine opponent for this round
        const randomOpponent = CAREER_OPPONENTS[Math.floor(Math.random() * CAREER_OPPONENTS.length)];
        // Ensure we don't play against ourselves
        const opponent = randomOpponent === myTeam?.name ? "Rival Local FC" : randomOpponent;
        
        setCareerOpponent(opponent);
        setStep(5); // Go to Match Menu (Pre-match)
    };

    const startCareerMatch = () => {
        setInCareerMatch(true);
    };

    const handleMatchFinish = (result: 'win' | 'loss' | 'draw') => {
        setInCareerMatch(false);
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed);

        if (newGamesPlayed === TOTAL_GAMES) {
            // Season Finished
            onWinTrophy();
            alert("Parabéns! Você completou a temporada de 90 jogos e conquistou o Troféu Estrelato!");
            setStep(4); // Back to Hub to see trophy
        } else {
            setStep(4); // Back to Hub
        }
    };

    const exitCareer = () => {
        if (myTeam) onComplete(myTeam);
    };

    // If Playing a Match inside Career
    if (inCareerMatch && myTeam) {
        return <MatchView team={myTeam} onFinish={handleMatchFinish} opponentName={careerOpponent} skipSetup={true} />;
    }

    return (
        <div className="min-h-screen bg-violet-900 text-white flex flex-col">
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-sm animate-in zoom-in">
                        <div className="w-20 h-20 bg-violet-700 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-violet-600">
                            <User size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-6">Crie seu Jogador</h2>
                        <input 
                            type="text" 
                            placeholder="Seu Nome" 
                            className="w-full p-4 rounded-xl bg-violet-800 border border-violet-600 text-white placeholder-violet-400 mb-4 outline-none focus:border-yellow-400 transition-colors"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                        <button onClick={handleCreate} className="w-full bg-yellow-400 hover:bg-yellow-300 text-violet-900 font-bold py-3 rounded-xl transition-colors">Continuar</button>
                        <button onClick={onCancel} className="w-full mt-4 text-violet-400 text-sm">Cancelar</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                    {loading ? (
                        <div>
                            <Star className="animate-spin mx-auto mb-4 text-yellow-400" size={48} />
                            <p className="font-bold text-lg">Jogando partida amadora...</p>
                            <p className="text-sm text-violet-300 mt-2">Olheiros estão assistindo seu desempenho.</p>
                        </div>
                    ) : (
                         <div className="w-full max-w-sm">
                            <h2 className="text-2xl font-bold mb-4">Partida de Peneira</h2>
                            <p className="mb-6 text-violet-200">Esta é sua chance. Jogue bem para receber propostas de grandes clubes.</p>
                            <button onClick={handleMatchSim} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                                <Play size={20} /> Jogar Peneira
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-in slide-in-from-bottom">
                    <div className="w-full max-w-sm">
                        <h2 className="text-2xl font-bold mb-2 text-center">Propostas Recebidas!</h2>
                        <p className="text-center text-violet-300 mb-8">Você se destacou. Escolha seu destino.</p>
                        
                        <div className="space-y-4">
                            <button onClick={() => selectOffer("Raposa Celeste")} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl text-left relative overflow-hidden group transition-all transform hover:-translate-y-1">
                                 <div className="flex justify-between items-center">
                                     <span className="font-bold block text-lg">Raposa Celeste</span>
                                     <Star size={16} className="text-yellow-400" fill="currentColor"/>
                                 </div>
                                 <span className="text-xs text-blue-200 mt-1 block">Série A • Salário Alto</span>
                            </button>
                            <button onClick={() => selectOffer("Leão do Pici")} className="w-full bg-red-600 hover:bg-red-500 p-4 rounded-xl text-left group transition-all transform hover:-translate-y-1">
                                 <span className="font-bold block text-lg">Leão do Pici</span>
                                 <span className="text-xs text-red-200 mt-1 block">Série A • Titularidade Imediata</span>
                            </button>
                            <button onClick={() => selectOffer("Tricolor de Aço")} className="w-full bg-cyan-600 hover:bg-cyan-500 p-4 rounded-xl text-left group transition-all transform hover:-translate-y-1">
                                 <span className="font-bold block text-lg">Tricolor de Aço</span>
                                 <span className="text-xs text-cyan-200 mt-1 block">Série A • Projeto Futuro</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && myTeam && (
                <div className="flex-1 flex flex-col bg-slate-900 text-white animate-in fade-in">
                    {/* Career Hub Header */}
                    <div className="p-6 bg-gradient-to-b from-violet-900 to-slate-900 pb-10">
                         <div className="flex items-center gap-4 mb-6">
                             <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl">👤</div>
                             <div>
                                 <h1 className="text-2xl font-bold">{playerName}</h1>
                                 <p className="text-violet-300 text-sm">Atleta do {myTeam.name}</p>
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                 <p className="text-xs text-slate-400 uppercase">Jogos</p>
                                 <p className="text-lg font-bold text-emerald-400">{gamesPlayed} / {TOTAL_GAMES}</p>
                             </div>
                             <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                 <p className="text-xs text-slate-400 uppercase">Progresso</p>
                                 <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                                     <div 
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${(gamesPlayed/TOTAL_GAMES)*100}%` }}
                                     ></div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="flex-1 p-6 -mt-6 bg-slate-900 rounded-t-3xl">
                        <h3 className="font-bold text-lg mb-4">Temporada Atual</h3>
                        
                        {gamesPlayed < TOTAL_GAMES ? (
                            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-slate-400">Brasileirão Série A</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">Rodada {gamesPlayed + 1}</span>
                                </div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                         <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center font-bold text-xs">
                                            {myTeam.name.substring(0,2)}
                                         </div>
                                         <span className="font-bold text-sm">{myTeam.name}</span>
                                    </div>
                                    <span className="text-slate-500 text-xs mx-2">vs</span>
                                    <span className="font-bold text-right text-sm text-slate-400">???</span>
                                </div>
                                <button 
                                    onClick={prepareMatchDay} 
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play size={20} /> Ir para o Jogo
                                </button>
                            </div>
                        ) : (
                            <div className="bg-yellow-500 text-slate-900 p-6 rounded-2xl mb-6 text-center animate-bounce">
                                <Trophy className="mx-auto mb-2" size={40} />
                                <h3 className="font-bold text-xl">Temporada Finalizada!</h3>
                                <p className="text-sm font-medium">Você conquistou o Troféu Estrelato!</p>
                            </div>
                        )}

                        <div className="space-y-3">
                             <button onClick={exitCareer} className="w-full p-4 bg-slate-800 rounded-xl flex items-center gap-3 text-red-400 hover:bg-slate-700 transition-colors">
                                 <ArrowRight size={20} /> Voltar ao Menu Principal
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: MATCH DAY MENU (REPLACED GRID) */}
            {step === 5 && myTeam && (
                <div className="flex-1 flex flex-col bg-slate-900 animate-in slide-in-from-right">
                     {/* Header */}
                     <div className="p-4 flex items-center gap-4 bg-slate-800 border-b border-slate-700">
                        <button onClick={() => setStep(4)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="font-bold text-white">Dia de Jogo</h2>
                            <p className="text-xs text-slate-400">Rodada {gamesPlayed + 1} de {TOTAL_GAMES}</p>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <div className="text-center mb-8 relative z-10">
                                <div className="inline-block px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-emerald-400 mb-4 border border-slate-600">
                                    BRASILEIRÃO SÉRIE A
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-105 transition-transform">
                                            🛡️
                                        </div>
                                        <span className="font-bold text-sm">{myTeam.name}</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-slate-500 italic">VS</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-105 transition-transform">
                                            ⚔️
                                        </div>
                                        <span className="font-bold text-sm text-center leading-tight">{careerOpponent}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <button 
                                    onClick={startCareerMatch}
                                    className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-lg"
                                >
                                    <Play fill="currentColor" size={20} /> 
                                    Jogar Partida
                                </button>
                                <div className="flex justify-center gap-4 text-xs text-slate-500 mt-4">
                                    <span className="flex items-center gap-1"><Zap size={12}/> Clima: Bom</span>
                                    <span className="flex items-center gap-1"><Activity size={12}/> Estádio Lotado</span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default CareerView;
