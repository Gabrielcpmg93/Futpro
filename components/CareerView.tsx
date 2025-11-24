
import React, { useState } from 'react';
import { Team, Position } from '../types';
import { SERIE_A_MAPPING } from '../services/geminiService';
import { Star, ArrowRight, Play, ArrowLeft, Zap, Activity, ChevronRight, ChevronLeft, RotateCw, RotateCcw } from 'lucide-react';
import MatchView from './MatchView';

interface CareerViewProps {
    onComplete: (team: Team) => void;
    onCancel: () => void;
    onWinTrophy: () => void;
}

const HAIR_COLORS = ['#1a1a1a', '#4b2e18', '#b45309', '#facc15', '#a3a3a3', '#fafafa'];
const BEARD_COLORS = ['#1a1a1a', '#4b2e18', '#b45309', '#a3a3a3'];
const SKIN_TONES = ['#f5d0b0', '#e0ac69', '#aa724b', '#5c3a21'];

const HAIR_STYLES = ['Careca', 'Curto', 'Moicano', 'Tigela', 'Longo'];
const BEARD_STYLES = ['Sem Barba', 'Cavanhaque', 'Barba Cheia', 'Bigode'];

const CareerView: React.FC<CareerViewProps> = ({ onComplete, onCancel, onWinTrophy }) => {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [inCareerMatch, setInCareerMatch] = useState(false);
    const [careerOpponent, setCareerOpponent] = useState<string>('');
    
    // Customization State
    const [hairStyle, setHairStyle] = useState(1);
    const [hairColor, setHairColor] = useState(HAIR_COLORS[1]);
    const [beardStyle, setBeardStyle] = useState(0);
    const [beardColor, setBeardColor] = useState(BEARD_COLORS[0]);
    const [skinTone, setSkinTone] = useState(SKIN_TONES[1]);
    const [avatarRotation, setAvatarRotation] = useState(0); // New Rotation State
    
    // Season Stats
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const TOTAL_GAMES = 90;

    // Fictional Serie A opponents using the mapping
    const CAREER_OPPONENTS = Object.values(SERIE_A_MAPPING);

    const handleCreate = () => {
        if (!playerName.trim()) {
            alert("Por favor, digite o nome do seu jogador.");
            return;
        }
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
            })),
            youthAcademy: []
        };
        setMyTeam(newTeam);
        setStep(4); // Go to Career Hub
    };

    const prepareMatchDay = () => {
        if (gamesPlayed >= TOTAL_GAMES) return;
        
        const randomOpponent = CAREER_OPPONENTS[Math.floor(Math.random() * CAREER_OPPONENTS.length)];
        const opponent = randomOpponent === myTeam?.name ? "Rival Local FC" : randomOpponent;
        
        setCareerOpponent(opponent);
        setStep(5); // Go to Match Menu (Pre-match)
    };

    const startCareerMatch = () => {
        setInCareerMatch(true);
    };

    const handleMatchFinish = (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => {
        setInCareerMatch(false);
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed);

        if (newGamesPlayed === TOTAL_GAMES) {
            onWinTrophy();
            alert("Parabéns! Você completou a temporada de 90 jogos e conquistou o Troféu Estrelato!");
            setStep(4); 
        } else {
            setStep(4); 
        }
    };

    const exitCareer = () => {
        if (myTeam) onComplete(myTeam);
    };

    // --- VOXEL AVATAR RENDERER ---
    const renderAvatar = () => {
        return (
            <div className="relative w-40 h-48 mx-auto mb-2" style={{ perspective: '600px' }}>
                <div 
                    className="w-full h-full relative transition-transform duration-500 ease-out"
                    style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: `rotateY(${avatarRotation}deg)` 
                    }}
                >
                    {/* HEAD GROUP */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-200 z-20 shadow-md" style={{ backgroundColor: skinTone, transform: 'translateZ(10px)' }}>
                        {/* Hair */}
                        {hairStyle === 1 && <div className="absolute top-0 w-full h-4 z-30" style={{ backgroundColor: hairColor }}></div>} {/* Curto */}
                        {hairStyle === 2 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-8 z-30" style={{ backgroundColor: hairColor }}></div>} {/* Moicano */}
                        {hairStyle === 3 && <div className="absolute top-0 w-full h-8 z-30 rounded-t-lg" style={{ backgroundColor: hairColor }}></div>} {/* Tigela */}
                        {hairStyle === 4 && <div className="absolute top-0 w-full h-12 z-0 -ml-1 w-[110%]" style={{ backgroundColor: hairColor }}></div>} {/* Longo */}
                        
                        {/* Eyes */}
                        <div className="absolute top-8 left-4 w-2 h-2 bg-black z-30"></div>
                        <div className="absolute top-8 right-4 w-2 h-2 bg-black z-30"></div>
                        {/* Eyebrows */}
                        <div className="absolute top-6 left-3 w-4 h-1 bg-black/50 z-30"></div>
                        <div className="absolute top-6 right-3 w-4 h-1 bg-black/50 z-30"></div>
                        
                        {/* Beard */}
                        {beardStyle === 1 && <div className="absolute bottom-0 w-full h-6 bg-black/20 z-20" style={{ backgroundColor: beardColor, opacity: 0.5 }}></div>} {/* Stubble */}
                        {beardStyle === 2 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 z-20" style={{ backgroundColor: beardColor }}></div>} {/* Goatee */}
                        {beardStyle === 3 && <div className="absolute bottom-0 w-full h-8 z-20" style={{ backgroundColor: beardColor }}></div>} {/* Full */}
                        {beardStyle === 4 && <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-2 z-20" style={{ backgroundColor: beardColor }}></div>} {/* Mustache */}

                        {/* Mouth (Smile) */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-900/50 z-20"></div>
                        
                        {/* Back of Head (Hair) */}
                         <div className="absolute top-0 left-0 w-full h-full -z-10" style={{ backgroundColor: hairColor, transform: 'translateZ(-21px)' }}></div>
                    </div>

                    {/* BODY GROUP */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-24 h-20 z-10 flex shadow-md" style={{ transform: 'translateZ(5px)' }}>
                        {/* Left Side Red */}
                        <div className="w-1/2 h-full bg-[#ef4444] relative">
                             <div className="absolute top-4 left-2 text-[6px] text-white font-bold opacity-80">M</div>
                             <div className="absolute top-8 left-2 text-[4px] text-white font-bold leading-tight w-8">TOUCH2GOAL</div>
                        </div>
                        {/* Right Side Blue */}
                        <div className="w-1/2 h-full bg-[#3b82f6] relative">
                            <div className="absolute top-4 right-2 w-3 h-4 bg-purple-900 rounded-b-full border border-white"></div>
                        </div>
                        {/* Sleeves */}
                        <div className="absolute top-0 -left-6 w-6 h-12 bg-[#3b82f6] origin-top-right rotate-12 border-r border-black/10"></div>
                        <div className="absolute top-0 -right-6 w-6 h-12 bg-[#ef4444] origin-top-left -rotate-12 border-b-4 border-blue-600 border-l border-black/10"></div>
                        
                        {/* Back of Shirt */}
                         <div className="absolute top-0 left-0 w-full h-full bg-blue-700 -z-10" style={{ transform: 'translateZ(-12px)' }}>
                             <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-black text-4xl opacity-80">10</div>
                         </div>
                    </div>

                    {/* SHORTS */}
                    <div className="absolute top-40 left-1/2 -translate-x-1/2 w-20 h-10 bg-[#3b82f6] z-10 flex" style={{ transform: 'translateZ(5px)' }}>
                        <div className="w-1/2 h-full border-r border-blue-700"></div>
                        <div className="w-1/2 h-full"></div>
                    </div>

                    {/* LEGS */}
                    <div className="absolute top-48 left-1/2 -translate-x-1/2 w-20 h-12 z-0 flex justify-between px-1" style={{ transform: 'translateZ(5px)' }}>
                        <div className="w-6 h-full bg-blue-700 rounded-b-sm border-b-4 border-[#ef4444]"></div> {/* Left Sock */}
                        <div className="w-6 h-full bg-blue-700 rounded-b-sm border-b-4 border-[#ef4444]"></div> {/* Right Sock */}
                    </div>
                </div>
            </div>
        )
    }

    if (inCareerMatch && myTeam) {
        return <MatchView team={myTeam} onFinish={handleMatchFinish} opponentName={careerOpponent} skipSetup={true} />;
    }

    return (
        <div className="min-h-screen bg-violet-900 text-white flex flex-col">
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-sm animate-in zoom-in pb-10">
                        <h2 className="text-2xl font-bold text-center mb-6 text-yellow-400">Crie seu Craque</h2>
                        
                        {/* Avatar Preview */}
                        <div className="bg-white/10 p-6 rounded-3xl mb-6 backdrop-blur-sm border border-white/10 relative">
                             {renderAvatar()}
                             
                             {/* Rotation Controls */}
                             <div className="flex justify-center gap-4 mt-4">
                                <button onClick={() => setAvatarRotation(r => r - 45)} className="p-2 bg-violet-800 rounded-full hover:bg-violet-700"><RotateCcw size={20} /></button>
                                <button onClick={() => setAvatarRotation(r => r + 45)} className="p-2 bg-violet-800 rounded-full hover:bg-violet-700"><RotateCw size={20} /></button>
                             </div>
                        </div>

                        {/* Name Input */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-violet-300 uppercase ml-1">Nome do Jogador</label>
                            <input 
                                type="text" 
                                placeholder="Seu Nome" 
                                className="w-full p-4 rounded-xl bg-violet-800 border border-violet-600 text-white placeholder-violet-400 mt-1 outline-none focus:border-yellow-400 transition-colors font-bold text-lg"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                            />
                        </div>

                        {/* Customization Controls */}
                        <div className="space-y-4 bg-violet-800/50 p-4 rounded-2xl border border-violet-700 mb-6">
                            {/* Skin Tone */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-violet-300">Tom de Pele</span>
                                </div>
                                <div className="flex gap-2">
                                    {SKIN_TONES.map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => setSkinTone(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${skinTone === color ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Hair Style */}
                            <div className="flex items-center justify-between bg-violet-900/50 p-2 rounded-xl">
                                <button onClick={() => setHairStyle(prev => (prev === 0 ? HAIR_STYLES.length - 1 : prev - 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft size={20}/></button>
                                <div className="text-center">
                                    <span className="text-xs text-violet-400 block">Cabelo</span>
                                    <span className="font-bold">{HAIR_STYLES[hairStyle]}</span>
                                </div>
                                <button onClick={() => setHairStyle(prev => (prev === HAIR_STYLES.length - 1 ? 0 : prev + 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight size={20}/></button>
                            </div>

                             {/* Hair Color */}
                             <div className="flex gap-2 justify-center pb-2 border-b border-white/10">
                                {HAIR_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setHairColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${hairColor === color ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            {/* Beard Style */}
                            <div className="flex items-center justify-between bg-violet-900/50 p-2 rounded-xl">
                                <button onClick={() => setBeardStyle(prev => (prev === 0 ? BEARD_STYLES.length - 1 : prev - 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft size={20}/></button>
                                <div className="text-center">
                                    <span className="text-xs text-violet-400 block">Barba</span>
                                    <span className="font-bold">{BEARD_STYLES[beardStyle]}</span>
                                </div>
                                <button onClick={() => setBeardStyle(prev => (prev === BEARD_STYLES.length - 1 ? 0 : prev + 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight size={20}/></button>
                            </div>

                             {/* Beard Color */}
                             <div className="flex gap-2 justify-center">
                                {BEARD_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setBeardColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${beardColor === color ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button onClick={handleCreate} className="w-full bg-yellow-400 hover:bg-yellow-300 text-violet-900 font-bold py-4 rounded-xl transition-colors shadow-lg shadow-yellow-400/20 text-lg">
                            Iniciar Carreira
                        </button>
                        <button onClick={onCancel} className="w-full mt-4 text-violet-400 text-sm font-medium py-2">Cancelar</button>
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
                             {/* Mini Voxel Head for Hub */}
                             <div className="w-16 h-16 bg-amber-200 rounded-xl overflow-hidden relative border-2 border-white/20" style={{ backgroundColor: skinTone }}>
                                 {hairStyle === 1 && <div className="absolute top-0 w-full h-3" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 2 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-6" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 3 && <div className="absolute top-0 w-full h-6 rounded-t-md" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 4 && <div className="absolute top-0 w-full h-8" style={{ backgroundColor: hairColor }}></div>}
                                 
                                 <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-black"></div>
                                 <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-black"></div>
                                 {beardStyle !== 0 && <div className="absolute bottom-0 w-full h-4 opacity-50" style={{ backgroundColor: beardColor }}></div>}
                             </div>

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
                                <Star className="mx-auto mb-2" size={40} fill="currentColor" />
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

            {/* STEP 5: MATCH DAY MENU */}
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
