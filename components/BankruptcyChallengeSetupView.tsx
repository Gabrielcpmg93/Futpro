
import React from 'react';
import { ArrowLeft, Flag, Banknote, DollarSign, Calendar, Users, Loader2, CheckCircle } from 'lucide-react';
import { Challenge, Team } from '../types';
import { generateWeakFictionalTeam } from '../services/geminiService';

interface BankruptcyChallengeSetupViewProps {
    challenge: Challenge;
    onSelectTeamAndStart: (team: Team) => void;
    onBack: () => void;
}

const BankruptcyChallengeSetupView: React.FC<BankruptcyChallengeSetupViewProps> = ({ challenge, onSelectTeamAndStart, onBack }) => {
    const [loading, setLoading] = React.useState(false);
    const [teamOptions, setTeamOptions] = React.useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

    React.useEffect(() => {
        const generateTeams = async () => {
            setLoading(true);
            try {
                // Generate two distinct weak fictional teams
                const team1 = await generateWeakFictionalTeam("Fictício FC A", 65, 2.0, 20);
                const team2 = await generateWeakFictionalTeam("Fictício FC B", 65, 2.0, 20);
                setTeamOptions([team1, team2]);
                setSelectedTeam(team1); // Pre-select first option
            } catch (error) {
                console.error("Error generating challenge teams:", error);
                alert("Não foi possível gerar os times do desafio. Tente novamente.");
                onBack(); // Go back if teams can't be generated
            } finally {
                setLoading(false);
            }
        };
        generateTeams();
    }, []); // Run only once on mount

    const handleConfirmAndStart = () => {
        if (selectedTeam) {
            setLoading(true); // Re-set loading for navigation
            onSelectTeamAndStart(selectedTeam);
        } else {
            alert("Por favor, selecione um time para iniciar o desafio.");
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

                <h3 className="text-red-200 font-bold text-sm uppercase tracking-wider mb-4">Condições Iniciais:</h3>
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
                
                {loading ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-white" size={48} />
                        <p className="text-lg font-bold">Gerando Times para o Desafio...</p>
                        <p className="text-red-200 text-sm">Isso pode levar alguns segundos.</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-red-200 font-bold text-sm uppercase tracking-wider mb-4">Escolha seu Time para o Desafio:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {teamOptions.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedTeam?.id === team.id ? 'border-yellow-400 ring-2 ring-yellow-400 bg-red-700/70 shadow-lg' : 'border-red-600 bg-red-700/40'}`}
                                >
                                    {selectedTeam?.id === team.id && (
                                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-red-900 rounded-full p-1.5 shadow-md">
                                            <CheckCircle size={18} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/50" style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}>
                                            {team.name.substring(0,2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{team.name}</p>
                                            <p className="text-red-200 text-sm">OVR: {team.strength} • Orçamento: R$ 1M</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto flex flex-col gap-3">
                            <button 
                                onClick={handleConfirmAndStart}
                                disabled={!selectedTeam}
                                className="w-full bg-white text-red-900 px-5 py-3 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
                            >
                                {loading ? 'Iniciando Desafio...' : 'Selecionar Time e Iniciar Desafio'}
                            </button>
                            <button 
                                onClick={onBack}
                                className="w-full text-white/70 text-sm font-medium py-2 hover:text-white transition-colors"
                            >
                                Voltar aos Desafios
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BankruptcyChallengeSetupView;
