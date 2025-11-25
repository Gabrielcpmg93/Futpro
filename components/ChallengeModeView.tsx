import React from 'react';
import { ArrowLeft, Flag, Banknote, ShieldOff, TrendingDown, TrendingUp } from 'lucide-react';
import { Team, Position, Challenge, ScreenState } from '../types';
import { generateFictionalTeam } from '../services/geminiService'; // Reusing gemini service for team generation base

interface ChallengeModeViewProps {
    onBack: () => void;
    onChallengeStart: (challenge: Challenge) => void; // Now accepts the challenge object
    onSetupBankruptcyChallenge: (challenge: Challenge) => void; // New prop for bankruptcy setup
}

const generateChallengeTeam = async (
    baseName: string,
    fictionalName: string,
    initialBudget: number,
    baseRating: number,
    salaryMultiplier: number,
    contractWeeks: number
): Promise<Team> => {
    // Generate a default team using the existing service
    const baseTeam = await generateFictionalTeam(baseName);

    // Modify the team to fit challenge criteria
    const challengeRoster = baseTeam.roster.map(player => ({
        ...player,
        rating: Math.max(1, Math.min(99, Math.floor(baseRating + (Math.random() - 0.5) * 10))), // Vary ratings slightly
        salary: Math.floor(player.salary * salaryMultiplier),
        contractWeeks: Math.max(10, contractWeeks), // Ensure not too low or too high
        marketValue: parseFloat((Math.random() * (baseRating / 100 * 5)).toFixed(1)) // Adjust market value based on rating
    }));

    // Ensure at least one GK
    if (!challengeRoster.some(p => p.position === Position.GK)) {
        const gkIndex = Math.floor(Math.random() * challengeRoster.length);
        challengeRoster[gkIndex].position = Position.GK;
        challengeRoster[gkIndex].name = "Goleiro " + challengeRoster[gkIndex].name.split(' ')[1];
        challengeRoster[gkIndex].rating = Math.max(60, challengeRoster[gkIndex].rating); // Ensure GK is not too bad
    }

    const teamStrength = Math.floor(challengeRoster.reduce((acc, p) => acc + p.rating, 0) / challengeRoster.length);

    return {
        ...baseTeam,
        id: `challenge-${Date.now()}`,
        name: fictionalName,
        originalName: baseName,
        roster: challengeRoster,
        budget: initialBudget,
        strength: teamStrength,
        trophies: [],
        primaryColor: '#60a5fa', // Default color for challenge teams
        secondaryColor: '#fde047',
    };
};

const CHALLENGES: Challenge[] = [
    {
        id: 'bankruptcy',
        title: 'Salvar da Falência',
        description: 'Assuma um clube com dívidas pesadas e salários astronômicos. Sua missão é equilibrar as finanças e evitar a falência em uma temporada!',
        icon: <Banknote size={24} />,
        colorClass: 'from-red-600 to-orange-600',
        startTeamConfig: async () => generateChallengeTeam(
            "Fortaleza", // Base real team
            "Atlético Caipira", // Fictional name for challenge
            1000000, // Very low initial budget
            65, // Average players
            2.0, // High salaries
            20 // Short contracts
        )
    },
    {
        id: 'underdog',
        title: 'Ascensão do Zero',
        description: 'Pegue um time da última divisão com jogadores amadores. Leve-os à glória e vença o campeonato mais importante em 3 temporadas!',
        icon: <TrendingDown size={24} />,
        colorClass: 'from-purple-600 to-indigo-600',
        startTeamConfig: async () => generateChallengeTeam(
            "Cuiabá", // Base real team
            "Clube da Colina", // Fictional name for challenge
            10000000, // Decent budget
            45, // Very low player ratings
            0.8, // Normal salaries
            52 // Normal contracts
        )
    },
    {
        id: 'discipline',
        title: 'A Lenda da Disciplina',
        description: 'Gerencie um time com um elenco problemático e um orçamento apertado. Você tem uma temporada para conseguir a promoção e limpar a imagem do clube!',
        icon: <ShieldOff size={24} />,
        colorClass: 'from-amber-600 to-yellow-600',
        startTeamConfig: async () => generateChallengeTeam(
            "Juventude", // Base real team
            "Estrela do Norte FC", // Fictional name for challenge
            5000000, // Low budget
            55, // Mid-low player ratings
            1.2, // Slightly high salaries
            30 // Shorter contracts
        )
    },
];

const ChallengeModeView: React.FC<ChallengeModeViewProps> = ({ onBack, onChallengeStart, onSetupBankruptcyChallenge }) => {
    const [loadingChallenge, setLoadingChallenge] = React.useState<string | null>(null);

    const handleSelectChallenge = async (challenge: Challenge) => {
        if (challenge.id === 'bankruptcy') {
            onSetupBankruptcyChallenge(challenge); // Navigate to setup screen
        } else {
            setLoadingChallenge(challenge.id);
            try {
                // For other challenges, directly start
                await onChallengeStart(challenge); // Pass the challenge object
            } catch (error) {
                console.error("Error starting challenge:", error);
                alert("Não foi possível iniciar o desafio. Tente novamente.");
            } finally {
                setLoadingChallenge(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Flag size={24} className="text-red-400" />
                    Modo Desafio
                </h1>
            </div>

            <p className="text-slate-400 text-sm mb-6">Escolha um cenário e teste suas habilidades de gestão!</p>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
                <div className="space-y-4">
                    {CHALLENGES.map(challenge => (
                        <div 
                            key={challenge.id} 
                            className={`bg-gradient-to-br ${challenge.colorClass} p-5 rounded-2xl shadow-lg relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg text-white">
                                    {challenge.icon}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg mb-1">{challenge.title}</h2>
                                    <p className="text-white/80 text-sm leading-relaxed mb-4">{challenge.description}</p>
                                    <button 
                                        onClick={() => handleSelectChallenge(challenge)}
                                        disabled={loadingChallenge === challenge.id}
                                        className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingChallenge === challenge.id ? 'Carregando...' : (challenge.id === 'bankruptcy' ? 'Ver Detalhes' : 'Aceitar Desafio')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChallengeModeView;