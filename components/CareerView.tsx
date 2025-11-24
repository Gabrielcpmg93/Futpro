
import React, { useState } from 'react';
import { Team, Position } from '../types';
import { SERIE_A_MAPPING } from '../services/geminiService';
import { Star, ArrowRight, Play, ArrowLeft, Zap, Activity, ChevronRight, ChevronLeft, RotateCcw, RefreshCcw } from 'lucide-react';
import MatchView from './MatchView';

interface CareerViewProps {
    onComplete: (team: Team) => void;
    onCancel: () => void;
    onWinTrophy: () => void;
}

const HAIR_COLORS = [
    '#09090b', // Jet Black
    '#27272a', // Off Black
    '#3f2e18', // Dark Brown
    '#5D4037', // Medium Brown
    '#8D6E63', // Light Brown
    '#b45309', // Auburn
    '#d97706', // Ginger
    '#ca8a04', // Dark Blonde
    '#facc15', // Golden Blonde
    '#fef3c7', // Platinum
    '#a3a3a3', // Grey
    '#fafafa'  // White
];

const BEARD_COLORS = [
    '#09090b', 
    '#3f2e18', 
    '#5D4037', 
    '#b45309', 
    '#a3a3a3', 
    '#fafafa'
];

const SKIN_TONES = [
    '#ffdbac', // Very Light
    '#f1c27d', // Light
    '#e0ac69', // Medium Light
    '#cd9575', // Medium
    '#bd8260', // Tan
    '#aa724b', // Deep Tan
    '#8d5524', // Brown
    '#5c3a21', // Dark Brown
    '#3b2516', // Very Dark
    '#26180e'  // Deep Ebony
];

const HAIR_STYLES = ['Careca', 'Curto', 'Moicano', 'Tigela', 'Longo', 'Afro', 'Topete'];
const BEARD_STYLES = ['Sem Barba', 'Cavanhaque', 'Barba Cheia', 'Bigode', 'Por Fazer'];

const CareerView: React.FC<CareerViewProps> = ({ onComplete, onCancel, onWinTrophy }) => {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [inCareerMatch, setInCareerMatch] = useState(false);
    const [careerOpponent, setCareerOpponent] = useState<string>('');
    
    // Customization State
    const [hairStyle, setHairStyle] = useState(1);
    const [hairColor, setHairColor] = useState(HAIR_COLORS[2]);
    const [beardStyle, setBeardStyle] = useState(0);
    const [beardColor, setBeardColor] = useState(BEARD_COLORS[1]);
    const [skinTone, setSkinTone] = useState(SKIN_TONES[2]);
    const [avatarRotation, setAvatarRotation] = useState(0); 
    
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
        // Back of head logic
        const backHeadColor = hairStyle === 0 ? skinTone : hairColor;

        return (
            <div className="relative w-48 h-60 mx-auto mb-2 flex items-center justify-center" style={{ perspective: '800px' }}>
                <div 
                    className="w-full h-full relative transition-transform duration-300 ease-out transform-style-3d"
                    style={{ 
                        transform: `rotateY(${avatarRotation}deg)` 
                    }}
                >
                    {/* --- HEAD GROUP --- */}
                    <div 
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 z-20 shadow-xl rounded-sm" 
                        style={{ 
                            backgroundColor: skinTone, 
                            transform: 'translateZ(12px)',
                            boxShadow: 'inset -2px -2px 10px rgba(0,0,0,0.1)' 
                        }}
                    >
                        {/* 3D Nose */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-4 z-30 rounded-b-sm" 
                             style={{ backgroundColor: skinTone, transform: 'translateZ(4px)', filter: 'brightness(0.95)' }}></div>

                        {/* Ears (Slightly darker for depth) */}
                        <div className="absolute top-9 -left-2 w-2 h-7 rounded-l-md" style={{ backgroundColor: skinTone, filter: 'brightness(0.9)' }}></div>
                        <div className="absolute top-9 -right-2 w-2 h-7 rounded-r-md" style={{ backgroundColor: skinTone, filter: 'brightness(0.9)' }}></div>

                        {/* --- HAIR --- */}
                        {hairStyle === 1 && <div className="absolute top-0 w-full h-5 z-30" style={{ backgroundColor: hairColor }}></div>} {/* Curto */}
                        
                        {hairStyle === 2 && ( /* Moicano */
                            <>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-30" style={{ backgroundColor: hairColor }}></div>
                                <div className="absolute top-0 w-full h-2 z-20 opacity-30" style={{ backgroundColor: hairColor }}></div>
                            </>
                        )}
                        
                        {hairStyle === 3 && <div className="absolute top-0 w-full h-10 z-30 rounded-t-lg border-b border-black/10" style={{ backgroundColor: hairColor }}></div>} {/* Tigela */}
                        
                        {hairStyle === 4 && ( /* Longo */
                            <>
                                <div className="absolute top-0 w-full h-full -z-10" style={{ backgroundColor: hairColor, transform: 'translateZ(-10px) scale(1.1)' }}></div>
                                <div className="absolute top-0 left-0 w-4 h-[120%] bg-inherit z-30" style={{ backgroundColor: hairColor }}></div>
                                <div className="absolute top-0 right-0 w-4 h-[120%] bg-inherit z-30" style={{ backgroundColor: hairColor }}></div>
                                <div className="absolute top-0 w-full h-6 z-30" style={{ backgroundColor: hairColor }}></div>
                            </>
                        )}

                        {hairStyle === 5 && ( /* Afro */
                            <div className="absolute -top-4 -left-2 w-[120%] h-16 rounded-full z-30" style={{ backgroundColor: hairColor }}></div>
                        )}

                        {hairStyle === 6 && ( /* Topete */
                             <div className="absolute -top-3 w-full h-8 z-30 rounded-t-sm" style={{ backgroundColor: hairColor, transform: 'skewX(-10deg)' }}></div>
                        )}
                        
                        {/* Eyes */}
                        <div className="absolute top-10 left-5 w-2.5 h-2.5 bg-black z-30 rounded-sm">
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute top-10 right-5 w-2.5 h-2.5 bg-black z-30 rounded-sm">
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        
                        {/* Eyebrows */}
                        <div className="absolute top-7 left-4 w-5 h-1.5 bg-black/40 z-30 rounded-full" style={{ backgroundColor: hairColor, filter: 'brightness(0.5)' }}></div>
                        <div className="absolute top-7 right-4 w-5 h-1.5 bg-black/40 z-30 rounded-full" style={{ backgroundColor: hairColor, filter: 'brightness(0.5)' }}></div>
                        
                        {/* --- BEARD --- */}
                        {beardStyle === 1 && <div className="absolute bottom-0 w-full h-8 z-20 opacity-30 rounded-b-sm" style={{ backgroundColor: beardColor }}></div>} {/* Stubble */}
                        
                        {beardStyle === 2 && ( /* Cavanhaque */
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 z-20 rounded-b-sm border-t border-transparent" style={{ backgroundColor: beardColor }}></div>
                        )}
                        
                        {beardStyle === 3 && ( /* Cheia */
                            <>
                                <div className="absolute bottom-0 w-full h-10 z-20 rounded-b-md" style={{ backgroundColor: beardColor }}></div>
                                <div className="absolute bottom-6 left-0 w-3 h-6 z-20" style={{ backgroundColor: beardColor }}></div>
                                <div className="absolute bottom-6 right-0 w-3 h-6 z-20" style={{ backgroundColor: beardColor }}></div>
                            </>
                        )}
                        
                        {beardStyle === 4 && <div className="absolute top-14 left-1/2 -translate-x-1/2 w-14 h-3 z-20 rounded-full" style={{ backgroundColor: beardColor }}></div>} {/* Bigode */}

                        {beardStyle === 5 && ( /* Por Fazer */
                            <div className="absolute bottom-0 w-full h-8 z-20 opacity-20" style={{ backgroundImage: `radial-gradient(${beardColor} 1px, transparent 1px)`, backgroundSize: '2px 2px' }}></div>
                        )}

                        {/* Mouth */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-red-900/30 z-20 rounded-full"></div>
                        
                        {/* Back of Head */}
                         <div className="absolute top-0 left-0 w-full h-full -z-10 rounded-sm" style={{ backgroundColor: backHeadColor, transform: 'translateZ(-24px)' }}></div>
                    </div>
                    
                    {/* NECK */}
                    <div 
                        className="absolute top-26 left-1/2 -translate-x-1/2 w-10 h-6 z-10"
                        style={{ backgroundColor: skinTone, transform: 'translateZ(6px)', filter: 'brightness(0.9)' }}
                    ></div>

                    {/* --- BODY GROUP --- */}
                    <div className="absolute top-32 left-1/2 -translate-x-1/2 w-32 h-24 z-10 flex shadow-lg" style={{ transform: 'translateZ(6px)' }}>
                        <div className="w-1/2 h-full bg-[#ef4444] relative rounded-tl-lg">
                             <div className="absolute top-4 left-3 text-[8px] text-white font-bold opacity-80">M</div>
                             <div className="absolute top-8 left-3 text-[6px] text-white font-bold leading-tight w-10">TOUCH2GOAL</div>
                        </div>
                        <div className="w-1/2 h-full bg-[#3b82f6] relative rounded-tr-lg">
                            <div className="absolute top-4 right-3 w-4 h-5 bg-purple-900 rounded-b-full border border-white"></div>
                        </div>
                        
                        {/* Sleeves */}
                        <div className="absolute top-0 -left-6 w-8 h-16 bg-[#3b82f6] origin-top-right rotate-12 border-r border-black/10 rounded-l-md">
                            <div className="absolute bottom-0 w-full h-2 bg-white/20"></div> {/* Trim */}
                            {/* Arm Skin */}
                            <div className="absolute top-full left-1 w-6 h-12 rounded-b-md" style={{ backgroundColor: skinTone }}></div>
                        </div>
                        
                        <div className="absolute top-0 -right-6 w-8 h-16 bg-[#ef4444] origin-top-left -rotate-12 border-b-4 border-blue-600 border-l border-black/10 rounded-r-md">
                             <div className="absolute bottom-0 w-full h-2 bg-white/20"></div> {/* Trim */}
                             {/* Arm Skin */}
                             <div className="absolute top-full right-1 w-6 h-12 rounded-b-md" style={{ backgroundColor: skinTone }}></div>
                        </div>
                        
                         <div className="absolute top-0 left-0 w-full h-full bg-blue-700 -z-10 rounded-t-lg" style={{ transform: 'translateZ(-14px)' }}>
                             <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-black text-5xl opacity-80">10</div>
                         </div>
                    </div>

                    {/* SHORTS */}
                    <div className="absolute top-56 left-1/2 -translate-x-1/2 w-28 h-12 bg-[#3b82f6] z-10 flex" style={{ transform: 'translateZ(6px)' }}>
                        <div className="w-1/2 h-full border-r border-blue-700"></div>
                        <div className="w-1/2 h-full"></div>
                    </div>

                    {/* LEGS */}
                    <div className="absolute top-64 left-1/2 -translate-x-1/2 w-28 h-16 z-0 flex justify-between px-2" style={{ transform: 'translateZ(6px)' }}>
                        <div className="w-8 h-full bg-blue-700 rounded-b-md border-b-4 border-[#ef4444]"></div>
                        <div className="w-8 h-full bg-blue-700 rounded-b-md border-b-4 border-[#ef4444]"></div>
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
                        
                        {/* Avatar Preview & Controls */}
                        <div className="bg-white/10 p-6 rounded-3xl mb-6 backdrop-blur-sm border border-white/10 relative overflow-hidden h-80 flex items-center justify-center">
                             
                             <button 
                                onClick={() => setAvatarRotation(r => r - 45)} 
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/30 rounded-full hover:bg-black/50 z-50 transition-colors"
                             >
                                 <ChevronLeft size={24} />
                             </button>
                             
                             <button 
                                onClick={() => setAvatarRotation(r => r + 45)} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/30 rounded-full hover:bg-black/50 z-50 transition-colors"
                             >
                                 <ChevronRight size={24} />
                             </button>

                             <button 
                                onClick={() => setAvatarRotation(0)}
                                className="absolute top-2 right-2 p-2 text-white/50 hover:text-white z-50"
                                title="Reset Rotation"
                             >
                                 <RefreshCcw size={16} />
                             </button>

                             {renderAvatar()}
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
                                <div className="grid grid-cols-5 gap-2 justify-items-center">
                                    {SKIN_TONES.map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => setSkinTone(color)}
                                            className={`w-10 h-10 rounded-full border-4 transition-transform ${skinTone === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="h-[1px] bg-white/10 my-2"></div>

                            {/* Hair Style */}
                            <div className="flex items-center justify-between bg-violet-900/50 p-2 rounded-xl">
                                <button onClick={() => setHairStyle(prev => (prev === 0 ? HAIR_STYLES.length - 1 : prev - 1))} className="p-3 bg-violet-800 rounded-lg hover:bg-violet-700"><ChevronLeft size={20}/></button>
                                <div className="text-center w-32">
                                    <span className="text-xs text-violet-400 block uppercase tracking-wider">Cabelo</span>
                                    <span className="font-bold text-lg">{HAIR_STYLES[hairStyle]}</span>
                                </div>
                                <button onClick={() => setHairStyle(prev => (prev === HAIR_STYLES.length - 1 ? 0 : prev + 1))} className="p-3 bg-violet-800 rounded-lg hover:bg-violet-700"><ChevronRight size={20}/></button>
                            </div>

                             {/* Hair Color */}
                             <div className="grid grid-cols-6 gap-2 justify-items-center py-2">
                                {HAIR_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setHairColor(color)}
                                        className={`w-8 h-8 rounded-full border-4 transition-transform ${hairColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <div className="h-[1px] bg-white/10 my-2"></div>

                            {/* Beard Style */}
                            <div className="flex items-center justify-between bg-violet-900/50 p-2 rounded-xl">
                                <button onClick={() => setBeardStyle(prev => (prev === 0 ? BEARD_STYLES.length - 1 : prev - 1))} className="p-3 bg-violet-800 rounded-lg hover:bg-violet-700"><ChevronLeft size={20}/></button>
                                <div className="text-center w-32">
                                    <span className="text-xs text-violet-400 block uppercase tracking-wider">Barba</span>
                                    <span className="font-bold text-lg">{BEARD_STYLES[beardStyle]}</span>
                                </div>
                                <button onClick={() => setBeardStyle(prev => (prev === BEARD_STYLES.length - 1 ? 0 : prev + 1))} className="p-3 bg-violet-800 rounded-lg hover:bg-violet-700"><ChevronRight size={20}/></button>
                            </div>

                             {/* Beard Color */}
                             <div className="grid grid-cols-6 gap-2 justify-items-center py-2">
                                {BEARD_COLORS.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setBeardColor(color)}
                                        className={`w-8 h-8 rounded-full border-4 transition-transform ${beardColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button onClick={handleCreate} className="w-full bg-yellow-400 hover:bg-yellow-300 text-violet-900 font-bold py-4 rounded-xl transition-colors shadow-lg shadow-yellow-400/20 text-lg">
                            Iniciar Carreira
                        </button>
                        <button onClick={onCancel} className="w-full mt-4 text-violet-400 text-sm font-medium py-2 hover:text-white transition-colors">Cancelar</button>
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
                             <div className="w-16 h-16 rounded-xl overflow-hidden relative border-2 border-white/20" style={{ backgroundColor: skinTone }}>
                                 {/* Hair */}
                                 {hairStyle === 1 && <div className="absolute top-0 w-full h-3" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 2 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-6" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 3 && <div className="absolute top-0 w-full h-6 rounded-t-md" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 4 && <div className="absolute top-0 w-full h-8" style={{ backgroundColor: hairColor }}></div>}
                                 {hairStyle === 5 && <div className="absolute -top-2 w-full h-6 rounded-full" style={{ backgroundColor: hairColor }}></div>}
                                 
                                 <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-black"></div>
                                 <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-black"></div>
                                 
                                 {/* Beard */}
                                 {beardStyle === 1 && <div className="absolute bottom-0 w-full h-3 opacity-30" style={{ backgroundColor: beardColor }}></div>}
                                 {beardStyle === 2 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2" style={{ backgroundColor: beardColor }}></div>}
                                 {beardStyle === 3 && <div className="absolute bottom-0 w-full h-4" style={{ backgroundColor: beardColor }}></div>}
                                 {beardStyle === 4 && <div className="absolute top-9 left-1/2 -translate-x-1/2 w-6 h-1.5" style={{ backgroundColor: beardColor }}></div>}
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
