
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, Building2, MousePointer2, Hammer } from 'lucide-react';

interface CityBuilderViewProps {
  onBack: () => void;
}

// Global variable to persist state in memory without complex Context for this specific feature
let SAVED_CITY_GRID: TileType[][] | null = null;

type TileType = 'grass' | 'road' | 'house' | 'commerce';

const GRID_SIZE = 12; // 12x12 grid fits nicely on mobile

const CityBuilderView: React.FC<CityBuilderViewProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<TileType[][]>([]);
  const [selectedTool, setSelectedTool] = useState<TileType | 'bulldoze'>('road');

  // Initialize Grid
  useEffect(() => {
    if (SAVED_CITY_GRID) {
        setGrid(SAVED_CITY_GRID);
    } else {
        const newGrid: TileType[][] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            const row: TileType[] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                row.push('grass');
            }
            newGrid.push(row);
        }
        // Create a default road
        for(let i=0; i<GRID_SIZE; i++) newGrid[6][i] = 'road';
        setGrid(newGrid);
    }
  }, []);

  // Save grid whenever it changes
  useEffect(() => {
      if (grid.length > 0) {
          SAVED_CITY_GRID = grid;
      }
  }, [grid]);

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid.map(row => [...row])];
    
    if (selectedTool === 'bulldoze') {
        newGrid[rowIndex][colIndex] = 'grass';
    } else {
        newGrid[rowIndex][colIndex] = selectedTool;
    }
    
    setGrid(newGrid);
  };

  const getTileStyle = (type: TileType, rowIndex: number, colIndex: number) => {
    // Determine road connections for smarter visuals (simple)
    let extraClasses = "";
    
    if (type === 'road') {
         extraClasses = "bg-slate-700";
         // Simple visual trick: if road above/below, keep as is.
         // This can be expanded for complex road textures.
         return (
             <div className="w-full h-full bg-slate-700 relative flex items-center justify-center">
                 <div className="w-full h-1 bg-slate-500/30 absolute"></div>
                 <div className="h-full w-1 bg-slate-500/30 absolute"></div>
             </div>
         );
    }

    if (type === 'house') {
        return (
            <div className="w-full h-full relative p-[2px]">
                <div className="w-full h-full bg-orange-200 border-b-4 border-r-4 border-orange-800 rounded-sm relative shadow-sm">
                    {/* Roof */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 clip-roof"></div>
                    {/* Door */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1/3 bg-orange-900"></div>
                </div>
            </div>
        );
    }

    if (type === 'commerce') {
        return (
            <div className="w-full h-full relative p-[2px]">
                <div className="w-full h-full bg-blue-300 border-b-4 border-r-4 border-blue-900 rounded-sm relative shadow-sm flex flex-col items-center justify-end">
                    <div className="w-full h-1/3 bg-blue-500 absolute top-0"></div>
                    <div className="w-2/3 h-1/3 bg-sky-100 mb-1 border border-blue-200"></div>
                </div>
            </div>
        );
    }

    // Grass
    return (
        <div 
            className="w-full h-full bg-[#4ade80] opacity-80"
            style={{ 
                backgroundImage: 'radial-gradient(#22c55e 10%, transparent 11%)',
                backgroundSize: '4px 4px'
            }}
        ></div>
    );
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                  <ArrowLeft size={20} className="text-slate-700" />
              </button>
              <h1 className="font-bold text-slate-800 text-lg">Modo Prefeito</h1>
          </div>
          <div className="bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 border border-emerald-200">
              Cidade em Expansão
          </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#2e8b57] relative shadow-inner">
          {/* Map Container */}
          <div 
            className="bg-[#22c55e] p-2 rounded shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-[#15803d]"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1/1',
                gap: '1px'
            }}
          >
              {grid.map((row, r) => (
                  row.map((tile, c) => (
                      <div 
                        key={`${r}-${c}`} 
                        onClick={() => handleTileClick(r, c)}
                        className="relative cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
                      >
                          {getTileStyle(tile, r, c)}
                      </div>
                  ))
              ))}
          </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 pb-8 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-20">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">Ferramentas de Construção</p>
          <div className="flex justify-between gap-2 max-w-md mx-auto">
              
              <button 
                onClick={() => setSelectedTool('road')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedTool === 'road' ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
              >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTool === 'road' ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <div className="w-4 h-full bg-white/20"></div>
                  </div>
                  <span className="text-[10px] font-bold">Rua</span>
              </button>

              <button 
                onClick={() => setSelectedTool('house')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedTool === 'house' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-100 bg-orange-50 text-orange-500'}`}
              >
                  <Home size={24} />
                  <span className="text-[10px] font-bold">Casa</span>
              </button>

              <button 
                onClick={() => setSelectedTool('commerce')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedTool === 'commerce' ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-100 bg-blue-50 text-blue-500'}`}
              >
                  <Building2 size={24} />
                  <span className="text-[10px] font-bold">Comércio</span>
              </button>

              <button 
                onClick={() => setSelectedTool('bulldoze')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedTool === 'bulldoze' ? 'border-red-600 bg-red-600 text-white' : 'border-red-100 bg-red-50 text-red-500'}`}
              >
                  <Hammer size={24} />
                  <span className="text-[10px] font-bold">Demolir</span>
              </button>

          </div>
      </div>
    </div>
  );
};

export default CityBuilderView;
