
import React from 'react';
import { LeagueTeam } from '../types';
import { Trophy, ArrowLeft, Play, List } from 'lucide-react';

interface LeagueViewProps {
    table: LeagueTeam[];
    currentRound: number;
    totalRounds: number;
    onPlayMatch: () => void;
    onBack: () => void;
}

const LeagueView: React.FC<LeagueViewProps> = ({ table, currentRound, totalRounds, onPlayMatch, onBack }) => {
    
    const userRank = table.findIndex(t => t.isUser) + 1;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-emerald-900 text-white p-6 rounded-b-[2rem] shadow-xl relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-400" />
                        Brasileirão Fictício
                    </h1>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Sua Posição</p>
                        <p className="text-3xl font-bold">{userRank}º <span className="text-sm font-normal text-emerald-200">Lugar</span></p>
                    </div>
                    <div className="text-right">
                         <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Rodada</p>
                         <p className="text-2xl font-bold">{currentRound}/{totalRounds}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 p-4 -mt-4 overflow-y-auto no-scrollbar">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-slate-100 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-5 text-left pl-2">Time</div>
                        <div className="col-span-2 text-center">P</div>
                        <div className="col-span-2 text-center">V</div>
                        <div className="col-span-2 text-center">Pts</div>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                        {table.map((team, index) => (
                            <div 
                                key={team.id} 
                                className={`grid grid-cols-12 p-3 items-center text-sm ${team.isUser ? 'bg-emerald-50' : ''}`}
                            >
                                <div className={`col-span-1 text-center font-bold ${index < 4 ? 'text-blue-600' : index > 15 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {index + 1}
                                </div>
                                <div className={`col-span-5 pl-2 truncate font-medium ${team.isUser ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                    {team.name}
                                </div>
                                <div className="col-span-2 text-center text-slate-500">{team.played}</div>
                                <div className="col-span-2 text-center text-slate-500">{team.won}</div>
                                <div className="col-span-2 text-center font-bold text-slate-800">{team.points}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white border-t border-slate-100">
                {currentRound <= totalRounds ? (
                    <button 
                        onClick={onPlayMatch}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-500"
                    >
                        <Play fill="currentColor" size={20} />
                        Jogar Rodada {currentRound}
                    </button>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <h3 className="font-bold text-yellow-800">Temporada Finalizada!</h3>
                        {userRank === 1 ? (
                             <p className="text-sm text-yellow-700">Parabéns! Você é o campeão!</p>
                        ) : (
                             <p className="text-sm text-yellow-700">Fim de campeonato. Tente novamente na próxima!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueView;
