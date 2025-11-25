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

const getMatchConfig = () => {
    const lastIndex = localStorage.getItem('match_3d_pattern_index');
    const index = lastIndex ? parseInt(lastIndex) : 0;
    const difficulty = index % 3 === 2 ? 'HARD' : 'EASY';
    return { difficulty, index };
};

const advancePatternIndex = (currentIndex: number) => {
    localStorage.setItem('match_3d_pattern_index', (currentIndex + 1).toString());
};

// --- VOXEL COMPONENTS ---

// Fix: Define an explicit interface for VoxelFan props and use React.FC
interface VoxelFanProps {
    x: number;
    y: number;
    scale?: number;
    fanColor: string;
}

const VoxelFan: React.FC<VoxelFanProps> = ({ x, y, scale = 0.3, fanColor }) => {
    return (
        <div
            className="absolute transition-transform duration-300 ease-out animate-wiggle"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformStyle: 'preserve-3d',
                zIndex: Math.floor(y),
            }}
        >
            {/* Body */}
            <div className="w-4 h-6 rounded-sm absolute bottom-0 left-1/2 -translate-x-1/2" style={{ backgroundColor: fanColor }}></div>
            {/* Head */}
            <div className="w-4 h-4 rounded-full absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-100 border border-black/10"></div>
        </div>
    );
};

const VoxelStands = ({ teamColor, isLeft }: { teamColor: string, isLeft: boolean }) => {
    const numRows = 5;
    const fansPerRow = 10;
    const fanColors = [teamColor, '#fff', '#000', '#666']; // Base colors
    
    return (
        <div
            className="absolute top-[20%] w-[50%] h-[150px] transform-style-3d overflow-hidden"
            style={{
                [isLeft ? 'left' : 'right']: '50%', // Start at center of stadium
                transform: `
                    translateZ(-100px) /* Push back */
                    ${isLeft ? 'translateX(-100%)' : 'translateX(0%)'} /* Move to side */
                    rotateY(${isLeft ? -60 : 60}deg) /* Angle towards field */
                    skewX(${isLeft ? -15 : 15}deg) /* Perspective distortion */
                    translateY(-10%) /* Adjust vertical position */
                `,
                transformOrigin: isLeft ? 'bottom right' : 'bottom left', // Pivot point for rotation
                width: '600px', // Fixed width for consistent size
                height: '200px', // Fixed height
            }}
        >
            {/* Base of the stand */}
            <div className="absolute inset-0 bg-slate-900 border border-slate-700 shadow-xl"></div>

            {Array.from({ length: numRows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="absolute w-full h-[30px] flex items-center justify-evenly"
                    style={{
                        bottom: `${rowIndex * 20}%`, // Stacking rows
                        transform: `translateZ(${rowIndex * 10}px) translateY(${rowIndex * -5}px)`, // Depth and height for tiers
                        backgroundColor: `rgba(0,0,0,${0.2 + rowIndex * 0.05})`, // Darker as it goes up
                        zIndex: numRows - rowIndex,
                    }}
                >
                    {Array.from({ length: fansPerRow }).map((_, fanIndex) => {
                        const randomFanColor = fanColors[Math.floor(Math.random() * fanColors.length)];
                        return (
                            <VoxelFan
                                key={fanIndex}
                                x={((fanIndex + 0.5) / fansPerRow) * 100}
                                y={50} // Vertically centered in the row
                                fanColor={randomFanColor}
                                scale={0.25 + (rowIndex * 0.03)} // Fans in front rows slightly larger
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};


const VoxelStadium = ({ teamPrimaryColor, opponentColor }: { teamPrimaryColor: string, opponentColor: string }) => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-200 -z-50"></div>
        
        {/* Stands (Background) */}
        <div 
            className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[140%] h-[400px] bg-slate-800"
            style={{ 
                transform: 'translateZ(-450px) rotateX(-15deg)',
                opacity: 1
            }}
        >
            {/* Crowd Noise (Dots) */}
            <div className="w-full h-full" style={{ 
                backgroundImage: 'radial-gradient(circle, #fbbf24 2px, transparent 3px), radial-gradient(circle, #ef4444 2px, transparent 3px), radial-gradient(circle, #fff 2px, transparent 3px)',
                backgroundSize: '12px 12px, 15px 15px, 20px 20px',
                backgroundPosition: '0 0, 5px 5px, 10px 10px',
                opacity: 0.6
            }}></div>
        </div>

         <div 
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full text-center"
            style={{ transform: 'translateZ(-350px)' }}
        >
            <h1 className="text-white font-black text-8xl opacity-10 tracking-widest uppercase">ARENA 3D</h1>
        </div>

        {/* Left Side Stands */}
        <VoxelStands teamColor={teamPrimaryColor} isLeft={true} />
        {/* Right Side Stands */}
        <VoxelStands teamColor={opponentColor} isLeft={false} />
    </div>
);

const VoxelPlayer = ({ 
    color, 
    x, 
    y, 
    scale = 1, 
    isGoalkeeper = false,
    pose = 'idle' 
}: { 
    color: string, 
    x: number, 
    y: number, 
    scale?: number,
    isGoalkeeper?: boolean,
    pose?: string
}) => {
    let rotation = 0;
    let translateX = 0;
    let translateY = 0;
    
    if (pose === 'dive-left') { rotation = -80; translateX = -30; translateY = 20; }
    if (pose === 'dive-right') { rotation = 80; translateX = 30; translateY = 20; }
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
            {/* Player container - increased height for better proportions */}
            <div className={`relative w-12 h-28 preserve-3d ${pose === 'idle' ? 'animate-bounce-slow' : ''}`}>
                {/* Shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-black/30 rounded-full blur-[3px]"></div>
                
                {/* Legs */}
                <div className="absolute bottom-1 left-2.5 w-3 h-7 bg-slate-900 rounded-b-sm"></div>
                <div className="absolute bottom-1 right-2.5 w-3 h-7 bg-slate-900 rounded-b-sm"></div>
                
                {/* Boots (Cleats) - New Detail */}
                <div className="absolute bottom-0 left-2 w-4 h-3 bg-black rounded-sm border-b-2 border-gray-600"></div>
                <div className="absolute bottom-0 right-2 w-4 h-3 bg-black rounded-sm border-b-2 border-gray-600"></div>

                {/* Shorts */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-5 bg-white rounded-sm shadow-sm"></div>
                
                {/* Torso (Jersey) - Thicker look */}
                <div 
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-t-sm shadow-inner"
                    style={{ 
                        backgroundColor: color,
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.2)' // Fake depth
                    }}
                >
                    {/* Jersey Number */}
                    <span className="text-[10px] font-black text-white/90 drop-shadow-md">{isGoalkeeper ? '1' : '10'}</span>
                    
                    {/* Arms */}
                    <div className="absolute -left-2.5 top-0 w-2.5 h-6 bg-inherit rounded-l-sm origin-top-right rotate-12 border-r border-black/10"></div>
                    <div className="absolute -right-2.5 top-0 w-2.5 h-6 bg-inherit rounded-r-sm origin-top-left -rotate-12 border-l border-black/10"></div>
                </div>

                {/* Neck */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#e0ac69] z-0"></div>

                {/* Head - Improved Shape */}
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#e0ac69] rounded-md shadow-sm border-b-2 border-[#d49e58]">
                    {/* Hair */}
                    <div className="absolute -top-1 w-full h-3 bg-black/80 rounded-t-md"></div>
                    <div className="absolute top-0 -left-0.5 w-1 h-4 bg-black/80"></div>
                    <div className="absolute top-0 -right-0.5 w-1 h-4 bg-black/80"></div>
                    
                    {/* Face Features */}
                    <div className="absolute top-3.5 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-3.5 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
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
    const [{ difficulty, index: patternIndex }] = useState(getMatchConfig());
    const [round, setRound] = useState(1);
    const [turn, setTurn] = useState<'PLAYER' | 'CPU'>('PLAYER');
    const [score, setScore] = useState({ user: 0, cpu: 0 });
    const [gameState, setGameState] = useState<'IDLE' | 'DRAGGING' | 'SHOOTING' | 'RESULT'>('IDLE');
    const [resultMsg, setResultMsg] = useState<string | null>(null);

    const [ballPos, setBallPos] = useState({ x: 50, y: 80, z: 0 }); 
    const [keeperPos, setKeeperPos] = useState(50); 
    const [strikerPos, setStrikerPos] = useState(50); 
    const [keeperPose, setKeeperPose] = useState('idle');
    const [strikerPose, setStrikerPose] = useState('idle');

    const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{x: number, y: number} | null>(null);

    useEffect(() => {
        if (turn === 'CPU' && gameState === 'IDLE') {
            setTimeout(handleCpuShoot, 1500);
        }
    }, [turn, gameState]);

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

    const handlePointerDown = (e: React.PointerEvent) => {
        if (turn !== 'PLAYER' || gameState !== 'IDLE') return;
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
        const deltaY = dragStart.y - dragCurrent.y; 
        if (deltaY < 50) {
            setGameState('IDLE');
            setDragStart(null);
            setDragCurrent(null);
            return;
        }

        const power = Math.min(deltaY / 250, 1.3); 
        const angle = Math.max(-1, Math.min(1, deltaX / 120)); 

        executeShot(angle, power);
        setDragStart(null);
        setDragCurrent(null);
    };

    const executeShot = (angle: number, power: number) => {
        setGameState('SHOOTING');
        setStrikerPose('kick');

        const targetX = 50 + (angle * 35);
        const peakZ = 50 * power;

        setBallPos({ x: targetX, y: 18, z: peakZ });

        let keeperDiveTarget = 50;
        
        if (turn === 'PLAYER') {
            if (difficulty === 'HARD') {
                keeperDiveTarget = targetX + (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1));
            } else {
                const mistake = Math.random() > 0.6; 
                if (mistake) {
                    keeperDiveTarget = targetX > 50 ? 20 : 80; 
                } else {
                    keeperDiveTarget = targetX + (Math.random() * 30 * (Math.random() > 0.5 ? 1 : -1));
                }
            }
        } else {
            const keeperSkill = difficulty === 'HARD' ? 0.2 : 0.9;
            if (Math.random() < keeperSkill) {
               keeperDiveTarget = targetX + (Math.random() * 10 - 5); 
            } else {
               keeperDiveTarget = targetX + (Math.random() * 50 - 25); 
            }
        }

        setTimeout(() => {
            setKeeperPos(keeperDiveTarget);
            if (keeperDiveTarget < 45) setKeeperPose('dive-left');
            else if (keeperDiveTarget > 55) setKeeperPose('dive-right');
            else setKeeperPose('idle');
        }, 100);

        setTimeout(() => {
            const isGoal = checkCollision(targetX, keeperDiveTarget);
            handleResult(isGoal);
        }, 800);
    };

    const handleCpuShoot = () => {
        let angle, power;
        if (difficulty === 'HARD') {
            angle = (Math.random() > 0.5 ? 0.8 : -0.8) + (Math.random() * 0.1);
            power = 1.0 + Math.random() * 0.2;
        } else {
            angle = (Math.random() * 1.0) - 0.5; 
            power = 0.6 + Math.random() * 0.4;
        }
        executeShot(angle, power);
    };

    const checkCollision = (ballX: number, keeperX: number) => {
        const isOnTarget = ballX > 38 && ballX < 62;
        if (!isOnTarget) return false; 
        const keeperSave = Math.abs(ballX - keeperX) < 12;
        return !keeperSave; 
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
        advancePatternIndex(patternIndex);
        const winner = score.user > score.cpu ? 'win' : score.user < score.cpu ? 'loss' : 'draw';
        onFinish(winner, score.user, score.cpu);
    };

    return (
        <div className="w-full h-screen bg-slate-900 flex flex-col relative overflow-hidden touch-none select-none">
            
            {/* HUD */}
            <div className="absolute top-16 left-0 w-full z-50 px-4 flex justify-between items-start pointer-events-none">
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

            <div className="absolute top-24 w-full text-center z-40 pointer-events-none">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${turn === 'PLAYER' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {turn === 'PLAYER' ? 'Sua Vez' : 'Vez do Adversário'}
                </span>
            </div>

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
                onPointerLeave={handlePointerUp} 
            >
                {/* FIELD CONTAINER */}
                <div 
                    // Adjusted for responsiveness: uses vmin (viewport minimum) and max-w/max-h
                    className="relative w-[70vmin] h-[105vmin] mx-auto max-w-xl max-h-2xl transform-style-3d transition-transform duration-700"
                    style={{ 
                        transform: 'rotateX(40deg) translateY(-20px)',
                    }}
                >
                    <VoxelStadium teamPrimaryColor={team.primaryColor} opponentColor={opponentColor} />

                    {/* THE PITCH - Improved Texture */}
                    <div 
                        className="absolute inset-0 bg-[#4ade80] shadow-2xl rounded-lg overflow-hidden border-4 border-white/20"
                        style={{
                            backgroundImage: `
                                linear-gradient(to top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 50%), /* Subtle bottom shadow for depth */
                                repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 50px),
                                repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 25px, transparent 25px, transparent 50px),
                                linear-gradient(to bottom, #22c55e 0%, #4ade80 100%)
                            `,
                            boxShadow: 'inset 0px 0px 50px rgba(0,0,0,0.4)', // Inner shadow for field depth
                            transform: 'translateZ(-5px)' // Slightly behind players/ball
                        }}
                    >
                        {/* Goal Area Lines */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-x-4 border-b-4 border-white/60 bg-white/5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[6%] border-x-4 border-b-4 border-white/60 shadow-[0_4px_8px_rgba(0,0,0,0.2)]"></div>
                        <div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
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

                    {/* DRAG INDICATOR */}
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