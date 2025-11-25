import React from 'react';
import { ArrowLeft, Flag, Banknote, DollarSign, Calendar, Users } from 'lucide-react';
import { Challenge } from '../types';

interface BankruptcyChallengeSetupViewProps {
    challenge: Challenge;
    onStart: (challenge: Challenge) => void;
    onBack: () => void;
}

const BankruptcyChallengeSetupView: React.FC<BankruptcyChallengeSetupViewProps> = ({ challenge, onStart, onBack }) => {
    const [loading, setLoading] = React.useState(false);

    const handleStartChallenge = async () => {
        setLoading(true);
        try {
            await onStart(challenge);
        } catch (error) {
            console.error("Error starting bankruptcy challenge:", error);
            alert("Não foi possível iniciar o desafio. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-950 text-white p-6 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Flag size={24} className="text-yellow-400" />
                    Modo Desafio
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
                <div className="bg-red-700/50 p-6 rounded-2xl shadow-lg border border-red-600 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-lg text-white">
                            {challenge.icon}
                        </div>
                        <h2 className="font-bold text-2xl leading-tight">{challenge.title}</h2>
                    </div>
                    <p className="text-red-200 text-sm leading-relaxed">{challenge.description}</p>
                </div>

                <h3 className="text-red-200 font-bold text-sm uppercase tracking-wider mb-4">Detalhes do Desafio:</h3>
                <div className="space-y-3 mb-8">
                    <div className="bg-red-700/30 p-4 rounded-xl flex items-center gap-4 border border-red-700">
                        <div className="bg-red-400/20 p-2 rounded-lg text-red-300">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Orçamento Inicial: Baixíssimo</p>
                            <p className="text-red-200 text-sm">Apenas R$ 1 milhão para começar</p>
                        </div>
                    </div>
                    <div className="bg-red-700/30 p-4 rounded-xl flex items-center gap-4 border border-red-700">
                        <div className="bg-red-400/20 p-2 rounded-lg text-red-300">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Salários: Astronômicos</p>
                            <p className="text-red-200 text-sm">Seus jogadores têm salários 200% acima da média</p>
                        </div>
                    </div>
                    <div className="bg-red-700/30 p-4 rounded-xl flex items-center gap-4 border border-red-700">
                        <div className="bg-red-400/20 p-2 rounded-lg text-red-300">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Contratos: Curtos</p>
                            <p className="text-red-200 text-sm">Muitos contratos vencendo em 20 semanas</p>
                        </div>
                    </div>
                    <div className="bg-red-700/30 p-4 rounded-xl flex items-center gap-4 border border-red-700">
                        <div className="bg-red-400/20 p-2 rounded-lg text-red-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Elenco: Mediano</p>
                            <p className="text-red-200 text-sm">Rating médio de 65. Sem estrelas para vender fácil</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                    <button 
                        onClick={handleStartChallenge}
                        disabled={loading}
                        className="w-full bg-white text-red-900 px-5 py-3 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
                    >
                        {loading ? 'Iniciando Desafio...' : 'Confirmar e Iniciar Desafio'}
                    </button>
                    <button 
                        onClick={onBack}
                        className="w-full text-white/70 text-sm font-medium py-2 hover:text-white transition-colors"
                    >
                        Voltar aos Desafios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BankruptcyChallengeSetupView;