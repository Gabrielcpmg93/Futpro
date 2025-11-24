
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
        
        // Create a default intersection for demo
        for(let i=0; i<GRID_SIZE; i++) newGrid[6][i] = 'road';
        for(let i=0; i<GRID_SIZE; i++) newGrid[i][6] = 'road';
        
        // Add some starter buildings
        newGrid[4][4] = 'house';
        newGrid[4][8] = 'house';
        newGrid[8][4] = 'commerce';
        
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

  const getTileStyle = (type: TileType, r: number, c: number) => {
    // Helper to check neighbors for smart roads
    const isRoad = (row: number, col: number) => {
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
        return grid[row][col] === 'road';
    };

    if (type === 'road') {
         const top = isRoad(r-1, c);
         const bottom = isRoad(r+1, c);
         const left = isRoad(r, c-1);
         const right = isRoad(r, c+1);

         // Determine road shape
         // If neighbors exist, we connect. 
         // If no neighbors, we assume vertical just to show something, or horizontal.
         // Let's logic: 
         const isVertical = (top || bottom);
         const isHorizontal = (left || right);
         
         // If isolated, default to a cross intersection style or just a square
         const isolated = !top && !bottom && !left && !right;

         return (
             <div className="w-full h-full bg-stone-300 relative flex items-center justify-center overflow-hidden">
                 {/* Sidewalk Base (Stone color) is the background */}
                 
                 {/* Center Block (The Asphalt Intersection) */}
                 <div className="absolute w-[65%] h-[65%] bg-slate-700 z-10 flex items-center justify-center">
                     {/* If it's a 4-way or corner, no center stripe usually, but let's keep it simple */}
                 </div>

                 {/* Vertical Road Segment */}
                 {(top || bottom || isolated) && (
                     <div className="absolute w-[65%] h-full bg-slate-700 flex justify-center">
                         {/* Dashed Stripe */}
                         <div className="h-full border-r border-dashed border-white/60 w-0"></div>
                     </div>
                 )}

                 {/* Horizontal Road Segment */}
                 {(left || right || isolated) && (
                     <div className="absolute h-[65%] w-full bg-slate-700 flex flex-col justify-center items-center">
                         {/* Dashed Stripe */}
                         <div className="w-full border-b border-dashed border-white/60 h-0"></div>
                     </div>
                 )}
                 
                 {/* Sidewalk Texture Overlay */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '3px 3px'}}>
                 </div>
             </div>
         );
    }

    if (type === 'house') {
        return (
            <div className="w-full h-full relative bg-[#86efac] p-[2px]">
                {/* Yard Path */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[30%] bg-stone-300"></div>

                {/* House Structure */}
                <div className="w-full h-full flex flex-col relative shadow-[2px_2px_2px_rgba(0,0,0,0.2)]">
                    {/* Roof */}
                    <div className="h-1/2 w-full bg-red-500 relative rounded-sm z-10">
                         {/* Roof Detail */}
                         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-700/50"></div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-800/30 rounded-full"></div>
                    </div>
                    {/* Walls */}
                    <div className="h-1/2 w-[90%] mx-auto bg-orange-100 relative border-x border-orange-200">
                        {/* Door */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[70%] bg-orange-900 rounded-t-[2px]"></div>
                        {/* Windows */}
                        <div className="absolute top-1 left-0.5 w-2 h-2 bg-sky-200 border border-sky-300"></div>
                        <div className="absolute top-1 right-0.5 w-2 h-2 bg-sky-200 border border-sky-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'commerce') {
        return (
            <div className="w-full h-full relative bg-stone-200 p-[2px]">
                {/* Paved Surroundings */}
                <div className="absolute inset-0 bg-stone-300 opacity-50"></div>

                {/* Building */}
                <div className="w-full h-full relative flex flex-col shadow-[3px_3px_2px_rgba(0,0,0,0.15)]">
                    {/* Top Sign */}
                    <div className="h-[25%] w-full bg-blue-600 flex items-center justify-center border-b-2 border-blue-800 rounded-t-sm z-10">
                        <span className="text-[5px] text-white font-black tracking-widest uppercase">LOJA</span>
                    </div>
                    
                    {/* Store Front */}
                    <div className="flex-1 bg-white border-x-2 border-stone-300 flex items-end px-1 pb-0">
                         {/* Large Window */}
                         <div className="flex-1 h-[80%] bg-sky-100 border border-sky-300 mb-1 relative overflow-hidden group-hover:bg-sky-50 transition-colors">
                              <div className="absolute top-0 right-0 w-[150%] h-[200%] bg-white/30 -rotate-45 transform origin-top-right"></div>
                              {/* Shelf items hint */}
                              <div className="absolute bottom-0 w-full h-[2px] bg-orange-400"></div>
                         </div>
                         {/* Door */}
                         <div className="w-[35%] h-[80%] bg-blue-900 ml-1 border-t border-r border-blue-950">
                             <div className="w-[2px] h-[4px] bg-yellow-400 mt-[50%] ml-[2px] rounded-full"></div>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    // Improved Grass Texture
    return (
        <div 
            className="w-full h-full bg-[#4ade80]"
            style={{ 
                backgroundImage: `
                    linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e),
                    linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e)
                `,
                backgroundPosition: '0 0, 4px 4px',
                backgroundSize: '8px 8px',
                opacity: 0.8
            }}
        >
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-20 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                  <ArrowLeft size={20} className="text-slate-700" />
              </button>
              <h1 className="font-bold text-slate-800 text-lg">Modo Prefeito</h1>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">População</span>
             <span className="text-sm font-bold text-emerald-600">{(grid.flat().filter(t => t === 'house').length * 4) + (grid.flat().filter(t => t === 'commerce').length * 10)} Habitantes</span>
          </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#86efac] relative shadow-inner">
          {/* Map Container - Border represents city limits */}
          <div 
            className="bg-[#22c55e] p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-4 border-[#16a34a]"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1/1',
                gap: '0px' // No gap for seamless roads
            }}
          >
              {grid.map((row, r) => (
                  row.map((tile, c) => (
                      <div 
                        key={`${r}-${c}`} 
                        onClick={() => handleTileClick(r, c)}
                        className="relative cursor-pointer hover:brightness-110 active:scale-95 transition-transform overflow-hidden"
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
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 ${selectedTool === 'road' ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white/20 ${selectedTool === 'road' ? 'bg-slate-600' : 'bg-slate-300'}`}>
                      <div className="w-[2px] h-full border-r border-dashed border-white/60"></div>
                  </div>
                  <span className="text-[10px] font-bold">Rua</span>
              </button>

              <button 
                onClick={() => setSelectedTool('house')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 ${selectedTool === 'house' ? 'border-orange-600 bg-orange-600 text-white shadow-lg' : 'border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100'}`}
              >
                  <Home size={24} />
                  <span className="text-[10px] font-bold">Casa</span>
              </button>

              <button 
                onClick={() => setSelectedTool('commerce')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 ${selectedTool === 'commerce' ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
              >
                  <Building2 size={24} />
                  <span className="text-[10px] font-bold">Comércio</span>
              </button>

              <button 
                onClick={() => setSelectedTool('bulldoze')}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 ${selectedTool === 'bulldoze' ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'}`}
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
