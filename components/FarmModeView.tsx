
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sprout, ShoppingBasket, Coins, ZoomIn, ZoomOut, PawPrint, Hand } from 'lucide-react';

interface FarmModeViewProps {
  onBack: () => void;
}

type CropType = 'carrot' | 'corn' | 'pumpkin' | 'strawberry';
type AnimalType = 'horse' | 'cow' | 'pig';
type GrowthStage = 0 | 1 | 2 | 3; // 0: Seed, 1: Sprout, 2: Growing, 3: Ready

interface FarmTile {
    id: string;
    r: number;
    c: number;
    hasCrop: boolean;
    cropType?: CropType;
    stage: GrowthStage;
}

interface FarmAnimal {
    id: string;
    type: AnimalType;
    x: number; // Percentage position
    y: number; // Percentage position
    direction: 'left' | 'right';
}

const GRID_SIZE = 20; // Increased map size (20x20)

const CROPS: Record<CropType, { name: string, cost: number, sellPrice: number, color: string, icon: string }> = {
    carrot: { name: 'Cenoura', cost: 10, sellPrice: 18, color: '#fb923c', icon: '🥕' },
    corn: { name: 'Milho', cost: 15, sellPrice: 28, color: '#facc15', icon: '🌽' },
    pumpkin: { name: 'Abóbora', cost: 30, sellPrice: 60, color: '#d97706', icon: '🎃' },
    strawberry: { name: 'Morango', cost: 50, sellPrice: 120, color: '#ef4444', icon: '🍓' }
};

const ANIMALS: Record<AnimalType, { name: string, cost: number, icon: string, speed: number }> = {
    horse: { name: 'Cavalo', cost: 50, icon: '🐎', speed: 0.8 },
    cow: { name: 'Vaca', cost: 150, icon: '🐄', speed: 0.3 },
    pig: { name: 'Porco', cost: 200, icon: '🐖', speed: 0.5 }
};

const FarmModeView: React.FC<FarmModeViewProps> = ({ onBack }) => {
    const [money, setMoney] = useState(500); // Increased starting money for testing
    const [grid, setGrid] = useState<FarmTile[]>([]);
    const [animals, setAnimals] = useState<FarmAnimal[]>([]);
    
    // Tools & Selection
    const [activeTab, setActiveTab] = useState<'crops' | 'animals'>('crops');
    const [selectedTool, setSelectedTool] = useState<'plant' | 'harvest'>('plant');
    const [selectedSeed, setSelectedSeed] = useState<CropType>('carrot');
    const [selectedAnimalToBuy, setSelectedAnimalToBuy] = useState<AnimalType | null>(null);
    
    const [inventory, setInventory] = useState<Record<CropType, number>>({ carrot: 0, corn: 0, pumpkin: 0, strawberry: 0 });

    // Viewport State
    const [zoom, setZoom] = useState(1.0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);
    const scrollStartRef = useRef<{ left: number, top: number } | null>(null);
    const touchDistRef = useRef<number | null>(null);

    // Initialize Grid
    useEffect(() => {
        const newGrid: FarmTile[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                newGrid.push({
                    id: `${r}-${c}`,
                    r,
                    c,
                    hasCrop: false,
                    stage: 0,
                });
            }
        }
        setGrid(newGrid);
    }, []);

    // Crop Growth Cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setGrid(prevGrid => prevGrid.map(tile => {
                if (tile.hasCrop && tile.stage < 3) {
                    if (Math.random() < 0.3) {
                        return { ...tile, stage: (tile.stage + 1) as GrowthStage };
                    }
                }
                return tile;
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Animal Movement Cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimals(prev => prev.map(anim => {
                // Random movement
                if (Math.random() > 0.3) return anim; // Sometimes stay still

                const moveX = (Math.random() - 0.5) * 5 * ANIMALS[anim.type].speed;
                const moveY = (Math.random() - 0.5) * 5 * ANIMALS[anim.type].speed;
                
                let newX = Math.max(5, Math.min(95, anim.x + moveX));
                let newY = Math.max(5, Math.min(95, anim.y + moveY));
                
                return {
                    ...anim,
                    x: newX,
                    y: newY,
                    direction: moveX > 0 ? 'right' : 'left'
                };
            }));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // --- INTERACTION HANDLERS ---

    const handleTileClick = (tileIndex: number) => {
        if (activeTab === 'animals') {
            // If trying to place animal
            if (selectedAnimalToBuy) {
                const cost = ANIMALS[selectedAnimalToBuy].cost;
                if (money >= cost) {
                    setMoney(prev => prev - cost);
                    // Calculate approximate position based on tile index
                    const r = Math.floor(tileIndex / GRID_SIZE);
                    const c = tileIndex % GRID_SIZE;
                    const posX = (c / GRID_SIZE) * 100 + 2; // Add offset to center
                    const posY = (r / GRID_SIZE) * 100 + 2;

                    const newAnimal: FarmAnimal = {
                        id: Date.now().toString(),
                        type: selectedAnimalToBuy,
                        x: posX,
                        y: posY,
                        direction: 'right'
                    };
                    setAnimals(prev => [...prev, newAnimal]);
                    setSelectedAnimalToBuy(null); // Deselect after buy
                } else {
                    alert("Dinheiro insuficiente para comprar este animal!");
                }
            }
            return;
        }

        // Crop Logic
        const tile = grid[tileIndex];
        if (selectedTool === 'plant') {
            if (!tile.hasCrop) {
                const seedCost = CROPS[selectedSeed].cost;
                if (money >= seedCost) {
                    setMoney(prev => prev - seedCost);
                    const newGrid = [...grid];
                    newGrid[tileIndex] = { ...tile, hasCrop: true, cropType: selectedSeed, stage: 0 };
                    setGrid(newGrid);
                } else {
                    alert("Dinheiro insuficiente!");
                }
            }
        } else if (selectedTool === 'harvest') {
            if (tile.hasCrop && tile.stage === 3 && tile.cropType) {
                const type = tile.cropType;
                setInventory(prev => ({ ...prev, [type]: prev[type] + 1 }));
                const newGrid = [...grid];
                newGrid[tileIndex] = { ...tile, hasCrop: false, stage: 0, cropType: undefined };
                setGrid(newGrid);
            }
        }
    };

    const sellCrop = (type: CropType) => {
        if (inventory[type] > 0) {
            setInventory(prev => ({ ...prev, [type]: prev[type] - 1 }));
            setMoney(prev => prev + CROPS[type].sellPrice);
        }
    };

    // --- VIEWPORT CONTROLS ---

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(3, Math.max(0.5, prev + delta)));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchDistRef.current = dist;
        } else if (e.touches.length === 1 && containerRef.current) {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            scrollStartRef.current = { left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchDistRef.current) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = (dist - touchDistRef.current) * 0.005;
            setZoom(prev => Math.min(3, Math.max(0.5, prev + delta)));
            touchDistRef.current = dist;
        } else if (e.touches.length === 1 && touchStartRef.current && scrollStartRef.current && containerRef.current) {
            const deltaX = e.touches[0].clientX - touchStartRef.current.x;
            const deltaY = e.touches[0].clientY - touchStartRef.current.y;
            containerRef.current.scrollLeft = scrollStartRef.current.left - deltaX;
            containerRef.current.scrollTop = scrollStartRef.current.top - deltaY;
        }
    };

    // --- RENDER HELPERS ---

    const renderTileContent = (tile: FarmTile) => {
        if (!tile.hasCrop || !tile.cropType) return null;
        const cropInfo = CROPS[tile.cropType];
        if (tile.stage === 0) return <div className="w-1.5 h-1.5 bg-black/30 rounded-full"></div>;
        if (tile.stage === 1) return <div className="text-[6px]">🌱</div>;
        if (tile.stage === 2) return <div className="text-[8px]">🌿</div>;
        if (tile.stage === 3) return <div className="text-sm animate-bounce">{cropInfo.icon}</div>;
    };

    return (
        <div className="min-h-screen bg-[#2f2f2f] flex flex-col font-mono relative overflow-hidden select-none h-screen">
            
            {/* Top Bar */}
            <div className="bg-[#8b4513] p-2 flex justify-between items-center border-b-4 border-[#5e2f0d] shadow-md z-30 shrink-0">
                <button onClick={onBack} className="bg-[#d2691e] p-2 rounded border-2 border-[#5e2f0d] text-[#3e1f08] hover:brightness-110 active:translate-y-1">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2 bg-[#d2691e] px-3 py-1 rounded border-2 border-[#5e2f0d] text-[#3e1f08] font-bold text-sm">
                    <Coins size={14} />
                    <span>{money}</span>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
                <button onClick={() => handleZoom(0.2)} className="bg-white/80 p-2 rounded-full shadow-lg backdrop-blur-sm border border-white"><ZoomIn size={20}/></button>
                <button onClick={() => handleZoom(-0.2)} className="bg-white/80 p-2 rounded-full shadow-lg backdrop-blur-sm border border-white"><ZoomOut size={20}/></button>
            </div>

            {/* Scrollable Game Area */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-auto bg-[#63a91f] relative touch-none cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => { touchStartRef.current = null; touchDistRef.current = null; }}
            >
                <div 
                    className="origin-top-left transition-transform duration-75 ease-out relative p-10"
                    style={{ 
                        width: `${1000 * zoom}px`, 
                        height: `${1000 * zoom}px`,
                        transform: `scale(${zoom})` 
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                        backgroundImage: 'radial-gradient(#3e6912 2px, transparent 2px)', 
                        backgroundSize: '20px 20px' 
                    }}></div>

                    {/* Farm House */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-24 bg-[#a05a2c] border-4 border-[#5e2f0d] flex flex-col items-center shadow-xl z-10">
                        <div className="w-36 h-16 bg-[#8b0000] -mt-8 border-4 border-[#5e2f0d] skew-x-12 relative left-[-4px]"></div>
                        <div className="w-8 h-12 bg-[#3e1f08] mt-auto mb-0 border-t-2 border-x-2 border-[#8b4513]"></div>
                    </div>

                    {/* The Grid */}
                    <div 
                        className="grid gap-[1px] bg-[#4a2e13] p-2 rounded border-4 border-[#38220d] shadow-2xl relative top-20 mx-auto"
                        style={{ 
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: '800px' // Fixed large width
                        }}
                    >
                        {grid.map((tile, i) => (
                            <div 
                                key={tile.id}
                                onClick={() => handleTileClick(i)}
                                className={`aspect-square bg-[#7c5026] border-[0.5px] border-[#5c3a1b] flex items-center justify-center cursor-pointer active:scale-95 relative hover:brightness-110
                                    ${tile.hasCrop && tile.stage === 3 ? 'ring-2 ring-yellow-400 z-10' : ''}
                                `}
                            >
                                <div className="absolute inset-0.5 border border-[#5c3a1b] opacity-30"></div>
                                {renderTileContent(tile)}
                            </div>
                        ))}
                    </div>

                    {/* Animals Layer (Overlay on top of grid area logically) */}
                    <div className="absolute top-20 left-0 w-full h-[800px] pointer-events-none mx-auto" style={{ width: '800px', left: '50%', transform: 'translateX(-50%)' }}>
                        {animals.map(anim => (
                            <div 
                                key={anim.id}
                                className="absolute text-2xl transition-all duration-500 ease-linear z-20 drop-shadow-md"
                                style={{ 
                                    left: `${anim.x}%`, 
                                    top: `${anim.y}%`,
                                    transform: `scaleX(${anim.direction === 'right' ? -1 : 1})`
                                }}
                            >
                                {ANIMALS[anim.type].icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls / Inventory (Bottom Sheet) */}
            <div className="bg-[#d2b48c] border-t-4 border-[#8b4513] p-2 shrink-0 z-30 pb-6">
                
                {/* Tab Switcher */}
                <div className="flex justify-center gap-2 mb-3">
                    <button 
                        onClick={() => { setActiveTab('crops'); setSelectedAnimalToBuy(null); }}
                        className={`px-4 py-2 rounded-t-lg font-bold text-xs border-x-2 border-t-2 ${activeTab === 'crops' ? 'bg-[#ffe4b5] border-[#8b4513] text-[#5e2f0d] -mb-3 pb-3 z-10' : 'bg-[#a0522d] border-[#5e2f0d] text-white opacity-80'}`}
                    >
                        Plantação
                    </button>
                    <button 
                        onClick={() => { setActiveTab('animals'); setSelectedTool('plant'); }} // Reset tool to avoid confusion
                        className={`px-4 py-2 rounded-t-lg font-bold text-xs border-x-2 border-t-2 ${activeTab === 'animals' ? 'bg-[#ffe4b5] border-[#8b4513] text-[#5e2f0d] -mb-3 pb-3 z-10' : 'bg-[#a0522d] border-[#5e2f0d] text-white opacity-80'}`}
                    >
                        Animais
                    </button>
                </div>

                <div className="bg-[#ffe4b5] p-3 rounded-lg border-2 border-[#8b4513] shadow-inner">
                    
                    {/* CROPS TAB */}
                    {activeTab === 'crops' && (
                        <div className="flex flex-col gap-3">
                            {/* Tools */}
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => setSelectedTool('plant')}
                                    className={`px-3 py-2 rounded border-2 flex items-center gap-1 font-bold text-xs transition-all ${selectedTool === 'plant' ? 'bg-[#8b4513] text-white border-[#5e2f0d]' : 'bg-[#deb887] text-[#5e2f0d] border-[#8b4513]'}`}
                                >
                                    <Sprout size={16} /> Plantar
                                </button>
                                <button 
                                    onClick={() => setSelectedTool('harvest')}
                                    className={`px-3 py-2 rounded border-2 flex items-center gap-1 font-bold text-xs transition-all ${selectedTool === 'harvest' ? 'bg-[#8b4513] text-white border-[#5e2f0d]' : 'bg-[#deb887] text-[#5e2f0d] border-[#8b4513]'}`}
                                >
                                    <ShoppingBasket size={16} /> Colher/Vender
                                </button>
                            </div>

                            {selectedTool === 'plant' ? (
                                <div className="flex gap-2 overflow-x-auto pb-2 justify-start px-1">
                                    {(Object.keys(CROPS) as CropType[]).map(key => (
                                        <button 
                                            key={key}
                                            onClick={() => setSelectedSeed(key)}
                                            className={`flex flex-col items-center p-1 rounded border-2 min-w-[60px] ${selectedSeed === key ? 'bg-[#a0522d] border-[#5e2f0d] text-white scale-105 shadow-lg' : 'bg-[#deb887] border-[#d2691e] text-[#8b4513]'}`}
                                        >
                                            <span className="text-lg">{CROPS[key].icon}</span>
                                            <span className="text-[8px] font-bold">{CROPS[key].name}</span>
                                            <span className="text-[8px] opacity-80">${CROPS[key].cost}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-2 overflow-x-auto pb-2 justify-start px-1">
                                    {(Object.keys(inventory) as CropType[]).map(key => (
                                        <button 
                                            key={key}
                                            onClick={() => sellCrop(key)}
                                            className="flex flex-col items-center relative group active:scale-95 min-w-[60px]"
                                            disabled={inventory[key] === 0}
                                        >
                                            <div className={`w-full p-1 flex flex-col items-center bg-[#deb887] rounded border-2 border-[#8b4513] ${inventory[key] === 0 ? 'opacity-50' : ''}`}>
                                                <span className="text-lg">{CROPS[key].icon}</span>
                                                <span className="text-[8px] font-bold text-[#5e2f0d] mt-1">+${CROPS[key].sellPrice}</span>
                                            </div>
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                                                {inventory[key]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANIMALS TAB */}
                    {activeTab === 'animals' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#8b4513] mb-1">
                                <PawPrint size={16} />
                                <span className="text-xs font-bold uppercase">Comprar Animais</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 justify-start">
                                {(Object.keys(ANIMALS) as AnimalType[]).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => { setSelectedAnimalToBuy(key); }}
                                        className={`flex flex-col items-center p-2 rounded border-2 min-w-[70px] transition-all ${selectedAnimalToBuy === key ? 'bg-[#a0522d] border-[#5e2f0d] text-white scale-105 shadow-lg ring-2 ring-yellow-400' : 'bg-[#deb887] border-[#d2691e] text-[#8b4513]'}`}
                                    >
                                        <span className="text-2xl">{ANIMALS[key].icon}</span>
                                        <span className="text-[10px] font-bold mt-1">{ANIMALS[key].name}</span>
                                        <span className="text-[10px] font-bold bg-black/20 px-2 rounded mt-1">${ANIMALS[key].cost}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedAnimalToBuy && (
                                <div className="bg-[#5e2f0d] text-[#ffe4b5] text-[10px] p-2 rounded text-center font-bold animate-pulse">
                                    Toque no mapa para colocar o {ANIMALS[selectedAnimalToBuy].name}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FarmModeView;
