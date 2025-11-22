
import React, { useState } from 'react';
import { Team, Position } from '../types';
import { COPA_TEAMS_MAPPING } from '../services/geminiService';
import { Star, User, ArrowRight, MapPin, Calendar, Trophy } from 'lucide-react';
import MatchView from './MatchView';

interface CareerViewProps {
    onComplete: (team: Team) => void;
    onCancel: () => void;
}

const CareerView: React.FC<CareerViewProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [inCareerMatch, setInCareerMatch] = useState(false);
    const [careerOpponent, setCareerOpponent] = useState<string>('');

    // Fictional Serie A opponents for Career Mode
    const CAREER_OPPONENTS = [
        "Urubu Guerreiro", "Porco Alviverde", "Soberano FC", "Tricolor de Aço", 
        "Raposa Celeste", "Colorado do Sul", "Leão do Pici", "Estrela Solitária"
    ];

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

    const selectOffer = (clubName: string) => {
        // Create the user's team
        const newTeam: Team = {
            id: 'career-team',
            name: clubName,
            originalName: clubName,
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

    const startCareerMatch = () => {
        const randomOpponent = CAREER_OPPONENTS[Math.floor(Math.random() * CAREER_OPPONENTS.length)];
        // Ensure we don't play against ourselves if names match
        const opponent = randomOpponent === myTeam?.name ? "Rival Local FC" : randomOpponent;
        setCareerOpponent(opponent);
        setInCareerMatch(true);
    };

    const handleMatchFinish = (result: 'win' | 'loss' | 'draw') => {
        setInCareerMatch(false);
        if (result === 'win') {
            alert("Vitória importante para sua carreira! Valor de mercado subiu.");
        } else {
            alert("Resultado difícil. Treine mais.");
        }
    };

    const exitCareer = () => {
        if (myTeam) onComplete(myTeam);
    };

    // If Playing a Match inside Career
    if (inCareerMatch && myTeam) {
        return <MatchView team={myTeam} onFinish={handleMatchFinish} opponentName={careerOpponent} />;
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
                                <PlayIcon /> Jogar Peneira
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
                                 <p className="text-xs text-slate-400 uppercase">Valor</p>
                                 <p className="text-lg font-bold text-emerald-400">$1.5M</p>
                             </div>
                             <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                 <p className="text-xs text-slate-400 uppercase">Média</p>
                                 <p className="text-lg font-bold text-yellow-400">70</p>
                             </div>
                         </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="flex-1 p-6 -mt-6 bg-slate-900 rounded-t-3xl">
                        <h3 className="font-bold text-lg mb-4">Próximo Desafio</h3>
                        
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400">Brasileirão Série A</span>
                                <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">Rodada 1</span>
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-bold">{myTeam.name}</span>
                                <span className="text-slate-500 text-xs">vs</span>
                                <span className="font-bold text-right">Adversário Aleatório</span>
                            </div>
                            <button 
                                onClick={startCareerMatch} 
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <PlayIcon /> Ir para o Jogo
                            </button>
                        </div>

                        <div className="space-y-3">
                             <button className="w-full p-4 bg-slate-800 rounded-xl flex items-center gap-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                 <Calendar size={20} /> Calendário
                             </button>
                             <button onClick={exitCareer} className="w-full p-4 bg-slate-800 rounded-xl flex items-center gap-3 text-red-400 hover:bg-slate-700 transition-colors">
                                 <ArrowRight size={20} /> Sair do Modo Carreira
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;

export default CareerView;
