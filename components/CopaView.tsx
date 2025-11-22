
import React, { useState } from 'react';
import { Team } from '../types'; 
import { COPA_TEAMS_MAPPING } from '../services/geminiService';
import { Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import MatchView from './MatchView';

interface CopaViewProps {
    team: Team;
    onBack: () => void;
    onWinTrophy: () => void;
}

const GROUPS = {
    A: ["Deportivo Táchira", "Carabobo", "Peñarol", "Alianza Lima", "Sporting Cristal"],
    B: ["Universitário", "Nacional", "Cerro Porteño", "Olimpia", "Libertad"],
    C: ["Barcelona de Guayaquil", "Independiente del Valle", "LDU Quito", "Atlético Nacional", "Atlético Bucaramanga"],
    E: ["Universidad de Chile", "Colo-Colo", "Bolívar", "San Antonio Bulo Bulo", "River Plate"] // Using last batch as E as requested
};

const CopaView: React.FC<CopaViewProps> = ({ team, onBack, onWinTrophy }) => {
    const [currentGroup, setCurrentGroup] = useState<'A' | 'B' | 'C' | 'E'>('A');
    const [matchIndex, setMatchIndex] = useState(0);
    const [inMatch, setInMatch] = useState(false);

    // Helper to get mapped name
    const getOpponentName = (realName: string) => {
        return COPA_TEAMS_MAPPING[realName] || `${realName} FC`;
    };

    const currentOpponentList = GROUPS[currentGroup];
    const currentOpponentReal = currentOpponentList[matchIndex];
    const currentOpponentFictional = getOpponentName(currentOpponentReal);

    const handleMatchEnd = (result: 'win' | 'loss' | 'draw') => {
        setInMatch(false);
        if (result === 'win') {
            if (matchIndex < 4) {
                setMatchIndex(matchIndex + 1);
            } else {
                // Group finished
                if (currentGroup === 'A') { setCurrentGroup('B'); setMatchIndex(0); }
                else if (currentGroup === 'B') { setCurrentGroup('C'); setMatchIndex(0); }
                else if (currentGroup === 'C') { setCurrentGroup('E'); setMatchIndex(0); }
                else if (currentGroup === 'E') {
                    // WON THE CUP
                    onWinTrophy();
                    alert("Campeão da Copa das Américas!");
                    onBack();
                }
            }
        } else {
            alert("Você não venceu! Tente novamente contra " + currentOpponentFictional);
        }
    };

    if (inMatch) {
        return <MatchView team={team} onFinish={handleMatchEnd} opponentName={currentOpponentFictional} />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="text-slate-400">Voltar</button>
                <h1 className="font-bold text-xl flex items-center gap-2"><Trophy className="text-yellow-400" size={20} /> Copa das Américas</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-emerald-400 font-bold">GRUPO {currentGroup}</span>
                        <span className="text-xs text-slate-400">Partida {matchIndex + 1}/5</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                         <div className="text-center">
                             <div className="w-16 h-16 bg-slate-700 rounded-full mb-2 mx-auto flex items-center justify-center text-2xl">🛡️</div>
                             <p className="font-bold text-sm">{team.name}</p>
                         </div>
                         <div className="text-slate-500 font-bold">VS</div>
                         <div className="text-center">
                             <div className="w-16 h-16 bg-red-900/50 rounded-full mb-2 mx-auto flex items-center justify-center text-2xl">⚔️</div>
                             <p className="font-bold text-sm">{currentOpponentFictional}</p>
                         </div>
                    </div>
                </div>

                <div className="w-full space-y-2">
                    <p className="text-center text-slate-500 text-sm mb-4">Vença para avançar na competição.</p>
                    <button onClick={() => setInMatch(true)} className="w-full bg-yellow-500 text-yellow-950 font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                        Jogar Agora <ArrowRight size={20} />
                    </button>
                </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-2">
                {['A', 'B', 'C', 'E'].map(g => (
                    <div key={g} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentGroup === g ? 'bg-emerald-500 text-white' : (g < currentGroup ? 'bg-slate-700 text-slate-500' : 'bg-slate-800 text-slate-600')}`}>
                        {g}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CopaView;
