
import React, { useState } from 'react';
import { Team, Position } from '../types';
import { Star, User, ArrowRight } from 'lucide-react';

interface CareerViewProps {
    onComplete: (team: Team) => void;
    onCancel: () => void;
}

const CareerView: React.FC<CareerViewProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);

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
        // Create a mock team for the chosen club
        const newTeam: Team = {
            id: 'career-team',
            name: clubName,
            originalName: clubName,
            primaryColor: '#0000FF',
            secondaryColor: '#FFFFFF',
            strength: 70,
            budget: 1000000,
            trophies: [],
            roster: Array.from({ length: 24 }).map((_, i) => ({
                id: `cp-${i}`,
                name: i === 0 ? playerName : `Teammate ${i}`,
                position: Position.MID,
                rating: 70,
                age: 20,
                salary: 5000,
                contractWeeks: 52,
                marketValue: 1.0
            }))
        };
        onComplete(newTeam);
    };

    return (
        <div className="min-h-screen bg-violet-900 p-6 flex flex-col items-center justify-center text-white">
            {step === 1 && (
                <div className="w-full max-w-sm animate-in zoom-in">
                    <div className="w-20 h-20 bg-violet-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <User size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Crie seu Jogador</h2>
                    <input 
                        type="text" 
                        placeholder="Seu Nome" 
                        className="w-full p-4 rounded-xl bg-violet-800 border border-violet-600 text-white placeholder-violet-400 mb-4 outline-none focus:border-yellow-400"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button onClick={handleCreate} className="w-full bg-yellow-400 text-violet-900 font-bold py-3 rounded-xl">Continuar</button>
                    <button onClick={onCancel} className="w-full mt-4 text-violet-400 text-sm">Cancelar</button>
                </div>
            )}

            {step === 2 && (
                <div className="text-center animate-in fade-in">
                    {loading ? (
                        <div>
                            <Star className="animate-spin mx-auto mb-4 text-yellow-400" size={48} />
                            <p>Jogando partida amadora...</p>
                            <p className="text-sm text-violet-300">Olheiros estão assistindo.</p>
                        </div>
                    ) : (
                         <div className="w-full max-w-sm">
                            <h2 className="text-2xl font-bold mb-4">Partida de Peneira</h2>
                            <p className="mb-6 text-violet-200">Jogue bem para receber propostas.</p>
                            <button onClick={handleMatchSim} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                <PlayIcon /> Jogar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="w-full max-w-sm animate-in slide-in-from-bottom">
                    <h2 className="text-2xl font-bold mb-2 text-center">Propostas Recebidas!</h2>
                    <p className="text-center text-violet-300 mb-6">Você se destacou. Escolha seu destino.</p>
                    
                    <div className="space-y-3">
                        <button onClick={() => selectOffer("Raposa Celeste")} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl text-left relative overflow-hidden">
                             <span className="font-bold block">Raposa Celeste</span>
                             <span className="text-xs text-blue-200">Oferta: Série A - Salário Alto</span>
                        </button>
                        <button onClick={() => selectOffer("Leão do Pici")} className="w-full bg-red-600 hover:bg-red-500 p-4 rounded-xl text-left">
                             <span className="font-bold block">Leão do Pici</span>
                             <span className="text-xs text-red-200">Oferta: Titularidade Imediata</span>
                        </button>
                        <button onClick={() => selectOffer("Tricolor de Aço")} className="w-full bg-cyan-600 hover:bg-cyan-500 p-4 rounded-xl text-left">
                             <span className="font-bold block">Tricolor de Aço</span>
                             <span className="text-xs text-cyan-200">Oferta: Projeto Futuro</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;

export default CareerView;
