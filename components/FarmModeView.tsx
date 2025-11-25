
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sprout, ShoppingBasket, Coins, Shovel } from 'lucide-react';

interface FarmModeViewProps {
  onBack: () => void;
}

type CropType = 'carrot' | 'corn' | 'pumpkin' | 'strawberry';
type GrowthStage = 0 | 1 | 2 | 3; // 0: Seed, 1: Sprout, 2: Growing, 3: Ready

interface FarmTile {
    id: string;
    hasCrop: boolean;
    cropType?: CropType;
    stage: GrowthStage;
    isWatered: boolean;
}

const CROPS: Record<CropType, { name: string, cost: number, sellPrice: number, color: string, icon: string }> = {
    carrot: { name: 'Cenoura', cost: 10, sellPrice: 18, color: '#fb923c', icon: '🥕' },
    corn: { name: 'Milho', cost: 15, sellPrice: 28, color: '#facc15', icon: '🌽' },
    pumpkin: { name: 'Abóbora', cost: 30, sellPrice: 60, color: '#d97706', icon: '🎃' },
    strawberry: { name: 'Morango', cost: 50, sellPrice: 120, color: '#ef4444', icon: '🍓' }
};

const FarmModeView: React.FC<FarmModeViewProps> = ({ onBack }) => {
    const [money, setMoney] = useState(100);
    const [grid, setGrid] = useState<FarmTile[]>([]);
    const [selectedSeed, setSelectedSeed] = useState<CropType>('carrot');
    const [inventory, setInventory] = useState<Record<CropType, number>>({ carrot: 0, corn: 0, pumpkin: 0, strawberry: 0 });
    const [selectedTool, setSelectedTool] = useState<'plant' | 'harvest'>('plant');

    // Initialize Grid
    useEffect(() => {
        const newGrid: FarmTile[] = [];
        for (let i = 0; i < 25; i++) { // 5x5 Grid
            newGrid.push({
                id: `tile-${i}`,
                hasCrop: false,
                stage: 0,
                isWatered: false
            });
        }
        setGrid(newGrid);
    }, []);

    // Growth Cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setGrid(prevGrid => prevGrid.map(tile => {
                if (tile.hasCrop && tile.stage < 3) {
                    // 30% chance to grow each tick
                    if (Math.random() < 0.3) {
                        return { ...tile, stage: (tile.stage + 1) as GrowthStage };
                    }
                }
                return tile;
            }));
        }, 1000); // Check growth every second

        return () => clearInterval(interval);
    }, []);

    const handleTileClick = (index: number) => {
        const tile = grid[index];

        if (selectedTool === 'plant') {
            if (!tile.hasCrop) {
                const seedCost = CROPS[selectedSeed].cost;
                if (money >= seedCost) {
                    setMoney(prev => prev - seedCost);
                    const newGrid = [...grid];
                    newGrid[index] = { ...tile, hasCrop: true, cropType: selectedSeed, stage: 0 };
                    setGrid(newGrid);
                } else {
                    alert("Dinheiro insuficiente!");
                }
            }
        } else if (selectedTool === 'harvest') {
            if (tile.hasCrop && tile.stage === 3 && tile.cropType) {
                // Harvest
                const type = tile.cropType;
                setInventory(prev => ({ ...prev, [type]: prev[type] + 1 }));
                
                // Clear Tile
                const newGrid = [...grid];
                newGrid[index] = { ...tile, hasCrop: false, stage: 0, cropType: undefined };
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

    // --- RENDER HELPERS ---
    const renderTileContent = (tile: FarmTile) => {
        if (!tile.hasCrop || !tile.cropType) return null;
        const cropInfo = CROPS[tile.cropType];

        if (tile.stage === 0) return <div className="w-2 h-2 bg-black/30 rounded-full"></div>; // Seed
        if (tile.stage === 1) return <div className="text-[8px]">🌱</div>; // Sprout
        if (tile.stage === 2) return <div className="text-xs">🌿</div>; // Growing
        if (tile.stage === 3) return <div className="text-lg animate-bounce">{cropInfo.icon}</div>; // Ready
    };

    return (
        <div className="min-h-screen bg-[#2f2f2f] flex flex-col font-mono relative overflow-hidden select-none">
            
            {/* Top Bar */}
            <div className="bg-[#8b4513] p-3 flex justify-between items-center border-b-4 border-[#5e2f0d] shadow-md z-10">
                <button onClick={onBack} className="bg-[#d2691e] p-2 rounded border-2 border-[#5e2f0d] text-[#3e1f08] hover:brightness-110 active:translate-y-1">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 bg-[#d2691e] px-3 py-1 rounded border-2 border-[#5e2f0d] text-[#3e1f08] font-bold">
                    <Coins size={16} />
                    <span>{money}</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative flex items-center justify-center bg-[#63a91f]">
                {/* Decorative Background elements */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                    backgroundImage: 'radial-gradient(#3e6912 2px, transparent 2px)', 
                    backgroundSize: '20px 20px' 
                }}></div>

                {/* Farm House Decoration */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-24 bg-[#a05a2c] border-4 border-[#5e2f0d] flex flex-col items-center shadow-xl">
                    <div className="w-36 h-16 bg-[#8b0000] -mt-8 border-4 border-[#5e2f0d] skew-x-12 relative left-[-4px]"></div>
                    <div className="w-8 h-12 bg-[#3e1f08] mt-auto mb-0 border-t-2 border-x-2 border-[#8b4513]"></div>
                </div>

                {/* The Farm Grid */}
                <div className="grid grid-cols-5 gap-1 p-2 bg-[#4a2e13] rounded border-4 border-[#38220d] shadow-2xl relative top-10">
                    {grid.map((tile, i) => (
                        <div 
                            key={tile.id}
                            onClick={() => handleTileClick(i)}
                            className={`w-14 h-14 bg-[#7c5026] border-2 border-[#5c3a1b] flex items-center justify-center cursor-pointer active:scale-95 transition-transform relative hover:brightness-110
                                ${tile.hasCrop && tile.stage === 3 ? 'ring-2 ring-yellow-400' : ''}
                            `}
                        >
                            {/* Soil Texture */}
                            <div className="absolute inset-1 border border-[#5c3a1b] opacity-50"></div>
                            {renderTileContent(tile)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls / Inventory */}
            <div className="bg-[#d2b48c] border-t-4 border-[#8b4513] p-4">
                
                {/* Tools Toggle */}
                <div className="flex justify-center gap-4 mb-4">
                    <button 
                        onClick={() => setSelectedTool('plant')}
                        className={`p-3 rounded-lg border-2 flex items-center gap-2 font-bold transition-all ${selectedTool === 'plant' ? 'bg-[#8b4513] text-white border-[#5e2f0d] translate-y-1' : 'bg-[#deb887] text-[#5e2f0d] border-[#8b4513] hover:bg-[#eecfa1]'}`}
                    >
                        <Sprout size={20} /> Plantar
                    </button>
                    <button 
                        onClick={() => setSelectedTool('harvest')}
                        className={`p-3 rounded-lg border-2 flex items-center gap-2 font-bold transition-all ${selectedTool === 'harvest' ? 'bg-[#8b4513] text-white border-[#5e2f0d] translate-y-1' : 'bg-[#deb887] text-[#5e2f0d] border-[#8b4513] hover:bg-[#eecfa1]'}`}
                    >
                        <ShoppingBasket size={20} /> Colher
                    </button>
                </div>

                {/* Seed Selection (Only if Planting) */}
                {selectedTool === 'plant' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                        {(Object.keys(CROPS) as CropType[]).map(key => (
                            <button 
                                key={key}
                                onClick={() => setSelectedSeed(key)}
                                className={`flex flex-col items-center p-2 rounded border-2 min-w-[70px] ${selectedSeed === key ? 'bg-[#a0522d] border-[#5e2f0d] text-white' : 'bg-[#ffe4b5] border-[#d2691e] text-[#8b4513]'}`}
                            >
                                <span className="text-lg">{CROPS[key].icon}</span>
                                <span className="text-[10px] font-bold mt-1">{CROPS[key].name}</span>
                                <span className="text-[10px] opacity-80">${CROPS[key].cost}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Sell Inventory (Only if Harvesting/Neutral) */}
                {selectedTool === 'harvest' && (
                    <div className="bg-[#ffe4b5] p-3 rounded border-2 border-[#d2691e]">
                        <p className="text-xs font-bold text-[#8b4513] mb-2 text-center uppercase tracking-widest">Estoque (Vender)</p>
                        <div className="flex gap-2 justify-center">
                            {(Object.keys(inventory) as CropType[]).map(key => (
                                <button 
                                    key={key}
                                    onClick={() => sellCrop(key)}
                                    className="flex flex-col items-center relative group active:scale-95 transition-transform"
                                    disabled={inventory[key] === 0}
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center bg-[#deb887] rounded border-2 border-[#8b4513] ${inventory[key] === 0 ? 'opacity-50' : ''}`}>
                                        <span className="text-xl">{CROPS[key].icon}</span>
                                    </div>
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border border-white">
                                        {inventory[key]}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#5e2f0d] mt-1">+${CROPS[key].sellPrice}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmModeView;
