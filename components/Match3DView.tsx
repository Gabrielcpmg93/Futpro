import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { ArrowLeft, Hand } from 'lucide-react';

interface Match3DViewProps {
  team: Team;
  opponentName?: string;
  opponentColor?: string;
  onFinish: (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => void;
  onBack: () => void;
}

// --- CONSTANTS & HELPERS ---
const TOTAL_ROUNDS = 5;

// Helper to get alternating difficulty based on "Win 2, Lose 1" pattern
// Index 0: Win (Easy)
// Index 1: Win (Easy)
// Index 2: Loss (Hard)
const getMatchConfig = () => {
    const lastIndex = localStorage.getItem('match_3d_pattern_index');
    const index = lastIndex ? parseInt(lastIndex) : 0;
    
    // If index % 3 is 2, it's the 3rd match -> Hard (Loss expected)
    // Otherwise it's Easy (Win expected)
    const difficulty = index % 3 === 2 ? 'HARD' : 'EASY';
    
    return { difficulty, index };
};

const advancePatternIndex = (currentIndex: number) => {
    localStorage.setItem('match_3d_pattern_index', (currentIndex + 1).toString());
};

// --- VOXEL COMPONENTS ---

const VoxelStadium = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-100 -z-50"></div>
        
        {/* Stands (Background) */}
        <div 
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[300px] bg-slate-800"
            style={{ 
                transform: 'translateZ(-400px) rotateX(-10deg)',
                backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)',
                backgroundSize: '10px 10px',
                opacity: 0.5
            }}
        ></div>
         <div 
            className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[100%] h-[100px] bg-blue-900 flex items-center justify-center"
            style={{ transform: 'translateZ(-350px)' }}
        >
            <span className="text-white font-black text-6xl opacity-20 tracking-widest">ARENA</span>
        </div>
    </div>
);

const VoxelPlayer = ({ 
    color, 
    x, 
    y, 
    scale = 1, 
    isGoalkeeper = false,
    pose = 'idle' // idle, run, kick, dive-left, dive-right
}: { 
    color: string, 
    x: number, 
    y: number, 
    scale?: number,
    isGoalkeeper?: boolean,
    pose?: string
}) => {
    // Dynamic styles based on pose
    let rotation = 0;
    let translateX = 0;
    let translateY = 0;
    
    if (pose === 'dive-left') { rotation = -75; translateX = -30; translateY = 10; }
    if (pose === 'dive-right') { rotation = 75; translateX = 30; translateY = 10; }
    if (pose === 'kick') { rotation = 15; translateY = -10; }

    return (
        <div 
            className="absolute transition-all duration-300 ease-out"
            style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale}) translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
                zIndex: Math.floor(y),
                transformStyle: 'preserve-3d'
            }}
        >
            <div className={`relative w-10 h-16 preserve-3d ${pose === 'idle' ? 'animate-bounce-slow' : ''}`}>
                {/* Shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 rounded-full blur-[4px]"></div>
                
                {/* Legs */}
                <div className="absolute bottom-0 left-2 w-2.5 h-6 bg-slate-900 rounded-b-sm"></div>
                <div className="absolute bottom-0 right-2 w-2.5 h-6 bg-slate-900 rounded-b-sm"></div>
                
                {/* Shorts */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 h-4 bg-white rounded-sm"></div>
                
                {/* Body (Jersey) */}
                <div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-7 flex items-center justify-center font-bold text-[8px] text-white/90 border-b border-black/10 rounded-t-sm shadow-inner"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute -left-2 top-0 w-2 h-4 bg-inherit rounded-l-sm origin-top-right rotate-12"></div> {/* Arm L */}
                    <div className="absolute -right-2 top-0 w-2 h-4 bg-inherit rounded-r-sm origin-top-left -rotate-12"></div> {/* Arm R */}
                    {isGoalkeeper ? '1' : '10'}
                </div>

                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#e0ac69] rounded-md shadow-sm">
                    {/* Hair */}
                    <div className="absolute top-0 w-full h-2 bg-black/80 rounded-t-md"></div>
                    <div className="absolute top-0 -left-1 w-1 h-3 bg-black/80"></div>
                    <div className="absolute top-0 -right-1 w-1 h-3 bg-black/80"></div>
                    {/* Face */}
                    <div className="absolute top-3 left-1.5 w-1 h-1 bg-black rounded-full"></div>
                    <div className="absolute top-3 right-1.5 w-1 h-1 bg-black rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Match3DView: React.FC<Match3DViewProps> = ({ 
  team, 
  opponentName = "CPU FC", 
  opponentColor = "#ef4444",
  onFinish,
  onBack
}) => {
    // Match State
    // We only read from LS once on mount to determine "Destiny"
    const [{ difficulty, index: patternIndex }] = useState(getMatchConfig());
    
    const [round, setRound] = useState(1);
    const [turn, setTurn] = useState<'PLAYER' | 'CPU'>('PLAYER');
    const [score, setScore] = useState({ user: 0, cpu: 0 });
    const [gameState, setGameState] = useState<'IDLE' | 'DRAGGING' | 'SHOOTING' | 'RESULT'>('IDLE');
    const [resultMsg, setResultMsg] = useState<string | null>(null);

    // Physics / Positions
    const [ballPos, setBallPos] = useState({ x: 50, y: 80, z: 0 }); // % relative to container
    const [keeperPos, setKeeperPos] = useState(50); // % X
    const [strikerPos, setStrikerPos] = useState(50); // % X
    
    // Animation States
    const [keeperPose, setKeeperPose] = useState('idle');
    const [strikerPose, setStrikerPose] = useState('idle');

    // Drag Logic
    const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{x: number, y: number} | null>(null);

    // Initial CPU Turn trigger if needed (though we start with PLAYER usually)
    useEffect(() => {
        if (turn === 'CPU' && gameState === 'IDLE') {
            setTimeout(handleCpuShoot, 1500);
        }
    }, [turn, gameState]);

    // Reset for new turn
    const setupTurn = (nextTurn: 'PLAYER' | 'CPU') => {
        setTurn(nextTurn);
        setGameState('IDLE');
        setResultMsg(null);
        setBallPos({ x: 50, y: 80, z: 0 });
        setKeeperPos(50);
        setStrikerPos(50);
        setKeeperPose('idle');
        setStrikerPose('idle');
    };

    // --- PLAYER INTERACTION (DRAG) ---

    const handlePointerDown = (e: React.PointerEvent) => {
        if (turn !== 'PLAYER' || gameState !== 'IDLE') return;
        // Prevent scrolling on touch
        e.preventDefault();
        setGameState('DRAGGING');
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragCurrent({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (gameState !== 'DRAGGING' || !dragStart) return;
        setDragCurrent({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        if (gameState !== 'DRAGGING' || !dragStart || !dragCurrent) return;

        const deltaX = dragCurrent.x - dragStart.x;
        const deltaY = dragStart.y - dragCurrent.y; // Positive = Up

        // Require minimum drag to prevent accidental clicks
        if (deltaY < 50) {
            setGameState('IDLE');
            setDragStart(null);
            setDragCurrent(null);
            return;
        }

        // Calculate Shot Vector
        const power = Math.min(deltaY / 250, 1.3); // Power based on drag distance
        const angle = Math.max(-1, Math.min(1, deltaX / 120)); // Angle based on horizontal drag

        executeShot(angle, power);
        setDragStart(null);
        setDragCurrent(null);
    };

    // --- SHOT LOGIC ---

    const executeShot = (angle: number, power: number) => {
        setGameState('SHOOTING');
        setStrikerPose('kick');

        // Target Calculation
        const targetX = 50 + (angle * 35);
        const peakZ = 50 * power;

        // Animate Ball
        setBallPos({ x: targetX, y: 18, z: peakZ });

        // Keeper AI Decision based on Difficulty
        let keeperDiveTarget = 50;
        
        if (turn === 'PLAYER') {
            // CPU Keeper defending against User
            if (difficulty === 'HARD') {
                // Hard Mode: Keeper reads shot perfectly with tiny error
                keeperDiveTarget = targetX + (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1));
            } else {
                // Easy Mode: Keeper dives randomly or with huge error
                const mistake = Math.random() > 0.6; 
                if (mistake) {
                    keeperDiveTarget = targetX > 50 ? 20 : 80; // Dive wrong way
                } else {
                    keeperDiveTarget = targetX + (Math.random() * 30 * (Math.random() > 0.5 ? 1 : -1));
                }
            }
        } else {
            // User Keeper (CPU is shooting)
            // Note: In this simple version, user keeper is auto-controlled or static
            // To simulate "User loses matches in Hard mode", the CPU shot must score.
            
            // User keeper defense logic (Simulated)
            // In Hard mode, user keeper is bad. In Easy mode, user keeper is good.
            const keeperSkill = difficulty === 'HARD' ? 0.2 : 0.9;
            
            // Keeper attempts to guess target
            if (Math.random() < keeperSkill) {
               keeperDiveTarget = targetX + (Math.random() * 10 - 5); // Good save attempt
            } else {
               keeperDiveTarget = targetX + (Math.random() * 50 - 25); // Bad save attempt
            }
        }

        // Animate Keeper
        setTimeout(() => {
            setKeeperPos(keeperDiveTarget);
            if (keeperDiveTarget < 45) setKeeperPose('dive-left');
            else if (keeperDiveTarget > 55) setKeeperPose('dive-right');
            else setKeeperPose('idle');
        }, 100);

        // Calculate Result
        setTimeout(() => {
            const isGoal = checkCollision(targetX, keeperDiveTarget);
            handleResult(isGoal);
        }, 800);
    };

    const handleCpuShoot = () => {
        // CPU Aiming Logic
        let angle, power;
        
        if (difficulty === 'HARD') {
            // Hard: CPU aims for corners with good power
            angle = (Math.random() > 0.5 ? 0.8 : -0.8) + (Math.random() * 0.1);
            power = 1.0 + Math.random() * 0.2;
        } else {
            // Easy: CPU aims center or misses
            angle = (Math.random() * 1.0) - 0.5; 
            power = 0.6 + Math.random() * 0.4;
        }

        executeShot(angle, power);
    };

    const checkCollision = (ballX: number, keeperX: number) => {
        // Goal Width is roughly 35% to 65% (30 units wide)
        const isOnTarget = ballX > 38 && ballX < 62;
        
        if (!isOnTarget) return false; // Miss

        // Keeper Save Range (Radius of ~8 units)
        const keeperSave = Math.abs(ballX - keeperX) < 12;
        
        return !keeperSave; // Goal if on target and not saved
    };

    const handleResult = (isGoal: boolean) => {
        setGameState('RESULT');
        
        if (isGoal) {
            setResultMsg("GOL!");
            setScore(prev => turn === 'PLAYER' ? { ...prev, user: prev.user + 1 } : { ...prev, cpu: prev.cpu + 1 });
        } else {
            setResultMsg(turn === 'PLAYER' ? "DEFENDEU!" : "PRA FORA!");
        }

        setTimeout(() => {
            if (turn === 'PLAYER') {
                setupTurn('CPU');
            } else {
                if (round < TOTAL_ROUNDS) {
                    setRound(r => r + 1);
                    setupTurn('PLAYER');
                } else {
                    finishMatch();
                }
            }
        }, 2000);
    };

    const finishMatch = () => {
        // Update the pattern index for next time
        advancePatternIndex(patternIndex);
        
        const winner = score.user > score.cpu ? 'win' : score.user < score.cpu ? 'loss' : 'draw';
        onFinish(winner, score.user, score.cpu);
    };

    return (
        <div className="w-full h-screen bg-slate-900 flex flex-col relative overflow-hidden touch-none select-none">
            
            {/* HUD */}
            <div className="absolute top-4 left-0 w-full z-50 px-4 flex justify-between items-start pointer-events-none">
                 
                 {/* Back Button */}
                 <button 
                    onClick={onBack}
                    className="pointer-events-auto bg-white/10 text-white p-2 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
                 >
                    <ArrowLeft size={24} />
                 </button>

                 <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 flex flex-col items-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Placar</div>
                    <div className="text-3xl font-mono font-bold flex gap-4">
                        <span className="text-emerald-400">{score.user}</span>
                        <span className="text-slate-600">:</span>
                        <span className="text-red-400">{score.cpu}</span>
                    </div>
                </div>

                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="text-[10px] text-slate-400 font-bold uppercase text-right">Chutes</div>
                    <div className="text-xl font-bold">{round} / {TOTAL_ROUNDS}</div>
                </div>
            </div>

            {/* Turn Indicator */}
            <div className="absolute top-24 w-full text-center z-40 pointer-events-none">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${turn === 'PLAYER' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {turn === 'PLAYER' ? 'Sua Vez' : 'Vez do Adversário'}
                </span>
            </div>

            {/* RESULT MESSAGE POPUP */}
            {resultMsg && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-bounce-in z-50 pointer-events-none">
                    <h1 className={`text-6xl font-black drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-tighter italic transform -rotate-6 ${resultMsg === 'GOL!' ? 'text-yellow-400 stroke-black' : 'text-white'}`}>
                        {resultMsg}
                    </h1>
                </div>
            )}

            {/* 3D SCENE */}
            <div 
                className="flex-1 relative flex items-center justify-center bg-sky-300"
                style={{ perspective: '800px' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp} // Safety release
            >
                {/* FIELD CONTAINER */}
                <div 
                    className="relative w-[400px] h-[600px] transform-style-3d transition-transform duration-700"
                    style={{ 
                        transform: 'rotateX(40deg) translateY(-20px)',
                    }}
                >
                    <VoxelStadium />

                    {/* THE PITCH */}
                    <div 
                        className="absolute inset-0 bg-[#4ade80] shadow-2xl rounded-lg overflow-hidden border-4 border-white/20"
                        style={{
                            backgroundImage: `
                                repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 50px),
                                linear-gradient(to bottom, #22c55e 0%, #4ade80 100%)
                            `
                        }}
                    >
                        {/* Goal Area Lines */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-x-4 border-b-4 border-white/60 bg-white/5"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[6%] border-x-4 border-b-4 border-white/60"></div>
                        <div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                    </div>

                    {/* 3D GOAL */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[34%] h-14 transform-style-3d z-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/30 border-2 border-slate-200" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-white shadow-lg"></div>
                        <div className="absolute right-0 top-0 h-full w-1.5 bg-white shadow-lg"></div>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-white shadow-lg"></div>
                    </div>

                    {/* ENTITIES */}
                    <VoxelPlayer 
                        color={turn === 'PLAYER' ? opponentColor : team.primaryColor}
                        x={keeperPos} 
                        y={12} 
                        scale={0.9} 
                        isGoalkeeper 
                        pose={keeperPose}
                    />

                    <VoxelPlayer 
                        color={turn === 'PLAYER' ? team.primaryColor : opponentColor}
                        x={strikerPos} 
                        y={88} 
                        scale={1.2} 
                        pose={strikerPose}
                    />

                    {/* THE BALL */}
                    <div 
                        className="absolute w-5 h-5 z-30 transition-all duration-[800ms] ease-out-quad"
                        style={{ 
                            left: `${ballPos.x}%`, 
                            top: `${ballPos.y}%`,
                            transform: `translate(-50%, -50%) translateZ(${ballPos.z}px) rotateX(${ballPos.y * 5}deg)`, 
                            boxShadow: ballPos.z > 5 ? 'none' : '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div className="w-full h-full bg-white rounded-full border border-gray-300 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                             <div className="absolute top-1/2 left-1/2 w-full h-1 bg-black/10 -translate-x-1/2 -rotate-45"></div>
                        </div>
                        {ballPos.z > 5 && (
                             <div 
                                className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm transition-all duration-300"
                                style={{ transform: `translateY(${ballPos.z}px) scale(${1 - ballPos.z/100})` }}
                             ></div>
                        )}
                    </div>

                    {/* DRAG INDICATOR ARROW */}
                    {gameState === 'DRAGGING' && dragStart && dragCurrent && (
                        <div 
                            className="absolute z-20 top-[80%] left-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[100px] border-b-yellow-400/50 origin-bottom"
                            style={{ 
                                height: `${Math.min(150, Math.max(0, dragStart.y - dragCurrent.y))}px`,
                                transform: `translate(-50%, -100%) rotate(${(dragCurrent.x - dragStart.x) * 0.5}deg)`,
                            }}
                        ></div>
                    )}

                </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="absolute bottom-10 w-full text-center pointer-events-none">
                {gameState === 'IDLE' && turn === 'PLAYER' && (
                    <div className="animate-pulse flex flex-col items-center text-white drop-shadow-md">
                        <Hand className="mb-2" />
                        <p className="font-bold text-lg">Arraste a bola para chutar!</p>
                    </div>
                )}
                {turn === 'CPU' && (
                    <p className="text-white font-bold opacity-80">Aguardando chute do adversário...</p>
                )}
            </div>

        </div>
    );
};

export default Match3DView;
