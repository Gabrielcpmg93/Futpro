
import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { ArrowLeft, Target, Trophy } from 'lucide-react';

interface Match3DViewProps {
  team: Team;
  opponentName?: string;
  opponentColor?: string;
  onFinish: (result: 'win' | 'loss' | 'draw', userScore: number, opponentScore: number) => void;
}

// Voxel Player Component
const VoxelPlayer = ({ 
    color, 
    x, 
    y, 
    scale = 1, 
    isGoalkeeper = false,
    animation = 'idle' // idle, run, kick
}: { 
    color: string, 
    x: number, 
    y: number, 
    scale?: number,
    isGoalkeeper?: boolean,
    animation?: 'idle' | 'run' | 'kick'
}) => {
    return (
        <div 
            className="absolute transition-transform duration-300"
            style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: Math.floor(y) // Simple Z-sorting
            }}
        >
            <div className={`relative w-8 h-12 preserve-3d ${animation === 'idle' ? 'animate-bounce-slow' : ''}`}>
                {/* Shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full blur-[2px]"></div>
                
                {/* Legs */}
                <div className="absolute bottom-0 left-1 w-2 h-4 bg-slate-900"></div>
                <div className="absolute bottom-0 right-1 w-2 h-4 bg-slate-900"></div>
                
                {/* Shorts */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-3 bg-white"></div>
                
                {/* Body (Jersey) */}
                <div 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-5 flex items-center justify-center font-bold text-[6px] text-white/80 border-b border-black/10"
                    style={{ backgroundColor: color }}
                >
                    {isGoalkeeper ? '1' : '10'}
                </div>

                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#e0ac69] rounded-sm shadow-sm">
                    {/* Hair */}
                    <div className="absolute top-0 w-full h-1.5 bg-black/80"></div>
                    {/* Eyes */}
                    <div className="absolute top-2 left-1 w-1 h-1 bg-black"></div>
                    <div className="absolute top-2 right-1 w-1 h-1 bg-black"></div>
                </div>
            </div>
        </div>
    );
};

const Match3DView: React.FC<Match3DViewProps> = ({ 
  team, 
  opponentName = "CPU FC", 
  opponentColor = "#ef4444",
  onFinish 
}) => {
    const [score, setScore] = useState({ user: 0, cpu: 0 });
    const [scenario, setScenario] = useState(1);
    const TOTAL_SCENARIOS = 5;
    
    // Game State
    const [gameState, setGameState] = useState<'AIMING' | 'KICKING' | 'RESULT'>('AIMING');
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    
    // Physics / Aiming
    const [arrowAngle, setArrowAngle] = useState(0); // -45 to 45 degrees
    const arrowDirectionRef = useRef(1); // 1 for right, -1 for left
    const [ballPos, setBallPos] = useState({ x: 50, y: 80, z: 0 });
    const [keeperPos, setKeeperPos] = useState(50); // 0 to 100% of goal width
    
    // Refs for animation loop
    const requestRef = useRef<number>();

    // SCENARIO SETUP
    // Reset ball and goalkeeper for each new scenario
    useEffect(() => {
        setBallPos({ x: 50, y: 80, z: 0 });
        setGameState('AIMING');
        setResultMessage(null);
        
        // Random keeper start pos
        setKeeperPos(40 + Math.random() * 20);
    }, [scenario]);

    // AIMING LOOP
    const animateAim = () => {
        if (gameState === 'AIMING') {
            setArrowAngle(prev => {
                const limit = 45;
                if (prev >= limit) arrowDirectionRef.current = -1;
                if (prev <= -limit) arrowDirectionRef.current = 1;
                // Speed of arrow
                return prev + (arrowDirectionRef.current * 1.5);
            });
            requestRef.current = requestAnimationFrame(animateAim);
        }
    };

    useEffect(() => {
        if (gameState === 'AIMING') {
            requestRef.current = requestAnimationFrame(animateAim);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [gameState]);

    // KEEPER AI LOOP
    useEffect(() => {
        const keeperInterval = setInterval(() => {
            if (gameState === 'AIMING') {
                setKeeperPos(prev => {
                    const move = (Math.random() - 0.5) * 10;
                    return Math.max(30, Math.min(70, prev + move));
                });
            }
        }, 500);
        return () => clearInterval(keeperInterval);
    }, [gameState]);

    const handleShoot = () => {
        if (gameState !== 'AIMING') return;
        setGameState('KICKING');

        // Calculate Target based on Angle
        // Angle 0 -> x: 50
        // Angle -45 -> x: 20
        // Angle 45 -> x: 80
        const targetX = 50 + (arrowAngle * 0.8);
        const targetY = 18; // Goal line Y position in %

        // Animate Ball
        setBallPos({ x: targetX, y: targetY, z: 20 }); // z creates arc effect via transform

        // Determine Outcome
        setTimeout(() => {
            // Check Hit Box
            // Goal is roughly 35% to 65% width
            const isOnTarget = targetX > 38 && targetX < 62;
            
            // Check Goalkeeper Save
            // Keeper covers +/- 10% from their center
            const keeperSave = Math.abs(targetX - keeperPos) < 10;

            if (isOnTarget && !keeperSave) {
                handleGoal();
            } else {
                handleMiss(isOnTarget ? "DEFESAÇA!" : "PRA FORA!");
                // Move keeper to ball if save
                if (keeperSave) setKeeperPos(targetX); 
            }
        }, 800); // Time for ball to travel
    };

    const handleGoal = () => {
        setResultMessage("GOLAÇO!");
        setScore(prev => ({ ...prev, user: prev.user + 1 }));
        finishTurn();
    };

    const handleMiss = (msg: string) => {
        setResultMessage(msg);
        // Random CPU score chance
        if (Math.random() > 0.6) {
            setScore(prev => ({ ...prev, cpu: prev.cpu + 1 }));
        }
        finishTurn();
    };

    const finishTurn = () => {
        setGameState('RESULT');
        setTimeout(() => {
            if (scenario < TOTAL_SCENARIOS) {
                setScenario(s => s + 1);
            } else {
                onFinish(
                    score.user > score.cpu ? 'win' : score.user < score.cpu ? 'loss' : 'draw',
                    score.user,
                    score.cpu
                );
            }
        }, 2000);
    };

    return (
        <div className="w-full h-screen bg-sky-300 flex flex-col relative overflow-hidden">
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="text-xs text-slate-400 font-bold uppercase">Placar</div>
                    <div className="text-2xl font-mono font-bold flex gap-3">
                        <span className="text-emerald-400">{score.user}</span>
                        <span>-</span>
                        <span className="text-red-400">{score.cpu}</span>
                    </div>
                </div>

                {resultMessage && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-bounce-in">
                        <h1 className="text-5xl font-black text-white drop-shadow-[0_4px_0_#000] stroke-black tracking-tighter italic transform -rotate-6">
                            {resultMessage}
                        </h1>
                    </div>
                )}

                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="text-xs text-slate-400 font-bold uppercase">Momento</div>
                    <div className="text-xl font-bold">{scenario} / {TOTAL_SCENARIOS}</div>
                </div>
            </div>

            {/* 3D SCENE CONTAINER */}
            <div 
                className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-sky-300 to-sky-100"
                style={{ perspective: '800px' }}
            >
                {/* STADIUM / PITCH */}
                <div 
                    className="relative w-[500px] h-[800px] bg-[#4ade80] transform-style-3d shadow-2xl"
                    style={{ 
                        transform: 'rotateX(50deg) translateY(-50px)',
                        backgroundImage: `
                            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.3) 50px),
                            linear-gradient(to bottom, #22c55e 0%, #4ade80 100%)
                        `
                    }}
                >
                    {/* Sidelines */}
                    <div className="absolute inset-x-4 inset-y-4 border-4 border-white/60"></div>
                    
                    {/* Penalty Box */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-[20%] border-x-4 border-b-4 border-white/60 bg-white/5"></div>
                    
                    {/* Goal Area */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-x-4 border-b-4 border-white/60"></div>

                    {/* THE GOAL STRUCTURE (3D-ish) */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[30%] h-16 transform-style-3d">
                        {/* Net Back */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-50 bg-white border-2 border-slate-300"></div>
                        {/* Posts */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-white"></div>
                        <div className="absolute right-0 top-0 h-full w-2 bg-white"></div>
                        <div className="absolute top-0 left-0 w-full h-2 bg-white"></div>
                    </div>

                    {/* ENTITIES */}

                    {/* Goalkeeper */}
                    <VoxelPlayer 
                        color={opponentColor} 
                        x={keeperPos} 
                        y={15} 
                        scale={0.9} 
                        isGoalkeeper 
                        animation={gameState === 'RESULT' ? 'idle' : 'run'}
                    />

                    {/* Defenders (Decor) */}
                    <VoxelPlayer color={opponentColor} x={30} y={30} scale={0.8} />
                    <VoxelPlayer color={opponentColor} x={70} y={30} scale={0.8} />

                    {/* The User Player (Shooter) */}
                    <VoxelPlayer 
                        color={team.primaryColor} 
                        x={50} 
                        y={88} 
                        scale={1.2} 
                        animation={gameState === 'KICKING' ? 'kick' : 'idle'}
                    />

                    {/* The Ball */}
                    <div 
                        className="absolute w-6 h-6 bg-white rounded-full shadow-md z-20 flex items-center justify-center transition-all duration-700 ease-out"
                        style={{ 
                            left: `${ballPos.x}%`, 
                            top: `${ballPos.y}%`,
                            transform: `translate(-50%, -50%) scale(${1 - (ballPos.y/200)}) translateY(-${ballPos.z}px)`, // Scale down as it goes far, lift Y for arc
                        }}
                    >
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                    </div>

                    {/* Aiming Arrow (Only when aiming) */}
                    {gameState === 'AIMING' && (
                        <div 
                            className="absolute top-[80%] left-1/2 w-4 h-24 origin-bottom z-10"
                            style={{ 
                                transform: `translate(-50%, -100%) rotate(${arrowAngle}deg)`,
                            }}
                        >
                            <div className="w-full h-full flex flex-col items-center animate-pulse">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-yellow-400"></div>
                                <div className="w-2 flex-1 bg-yellow-400/80"></div>
                            </div>
                             <div 
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black text-xs px-2 py-0.5 rounded shadow-sm"
                                style={{ transform: 'rotate(-' + arrowAngle + 'deg)' }} // Keep text straight
                             >
                                100%
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTROLS */}
            <div className="h-48 bg-slate-900 p-6 flex flex-col items-center justify-center relative z-40">
                {gameState === 'AIMING' ? (
                    <>
                        <p className="text-white mb-4 animate-pulse font-bold text-lg">Toque para Chutar!</p>
                        <button 
                            onPointerDown={handleShoot}
                            className="w-24 h-24 rounded-full bg-red-600 border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        >
                            <Target className="text-white w-10 h-10" />
                        </button>
                    </>
                ) : (
                    <div className="text-slate-500 font-bold">
                        {gameState === 'KICKING' ? 'Chutou...' : 'Processando...'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Match3DView;
