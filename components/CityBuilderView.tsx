
import React, { useState, useEffect, useRef, memo } from 'react';
import { ArrowLeft, Home, Building2, Hammer, Car, User, CarFront, ZoomIn, ZoomOut } from 'lucide-react';

interface CityBuilderViewProps {
  onBack: () => void;
}

// Global variable to persist state in memory without complex Context for this specific feature
let SAVED_CITY_GRID: TileType[][] | null = null;
let SAVED_ENTITIES: Entity[] | null = null;

type TileType = 'grass' | 'road' | 'house' | 'commerce';
type EntityType = 'car' | 'pedestrian';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Entity {
    id: number;
    type: EntityType;
    r: number;
    c: number;
    dir: Direction;
    color: string;
    // For pedestrians to stick to specific sidewalk sides (0-3: top, right, bottom, left)
    sideWalkSide?: number; 
}

const GRID_SIZE = 20; // Increased map size

// --- HELPER: TILE STYLING ---
// Moved outside component for optimization and clarity
const getTileStyle = (grid: TileType[][], type: TileType, r: number, c: number) => {
    const isRoad = (row: number, col: number) => {
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
        return grid[row][col] === 'road';
    };

    if (type === 'road') {
         const top = isRoad(r-1, c);
         const bottom = isRoad(r+1, c);
         const left = isRoad(r, c-1);
         const right = isRoad(r, c+1);
         const isolated = !top && !bottom && !left && !right;

         // WIDER SIDEWALKS: Road is now 40% width (leaving 30% sidewalk on each side)
         const roadWidthClass = "w-[40%]";
         const roadHeightClass = "h-[40%]";

         return (
             <div className="w-full h-full bg-stone-300 relative flex items-center justify-center overflow-hidden">
                 {/* Sidewalk Pattern (curb) */}
                 <div className="absolute inset-0 border-[0.5px] border-stone-400 opacity-30 pointer-events-none"></div>

                 {/* Center Block (The Asphalt Intersection) */}
                 <div className={`absolute ${roadWidthClass} ${roadHeightClass} bg-slate-700 z-10 rounded-sm`}>
                     {/* Center dashed lines intersection */}
                 </div>

                 {/* Road Segments */}
                 {(top || bottom || isolated) && (
                     <div className={`absolute ${roadWidthClass} h-full bg-slate-700 flex justify-center`}>
                         <div className="h-full border-r border-dashed border-white/60 w-0"></div>
                     </div>
                 )}
                 {(left || right || isolated) && (
                     <div className={`absolute h-[40%] w-full bg-slate-700 flex flex-col justify-center items-center`}>
                         <div className="w-full border-b border-dashed border-white/60 h-0"></div>
                     </div>
                 )}
                 
                 {/* Asphalt texture */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '3px 3px'}}>
                 </div>
             </div>
         );
    }

    if (type === 'house') {
        return (
            <div className="w-full h-full relative bg-[#86efac] p-[2px]">
                {/* Driveway connecting to road (assuming road is adjacent) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[20%] bg-stone-300"></div>
                
                <div className="w-full h-full flex flex-col relative shadow-[2px_2px_4px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5">
                    {/* Roof */}
                    <div className="h-1/2 w-full bg-red-600 relative rounded-sm z-10 flex items-center justify-center">
                         <div className="absolute w-full h-[1px] bg-red-800/40"></div>
                         <div className="w-2 h-2 bg-red-800/30 rounded-full"></div>
                    </div>
                    {/* Body */}
                    <div className="h-1/2 w-[90%] mx-auto bg-orange-50 relative border-x border-orange-200">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[70%] bg-orange-900 rounded-t-[2px]"></div>
                        <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-sky-200 border border-sky-300"></div>
                        <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-sky-200 border border-sky-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'commerce') {
        return (
            <div className="w-full h-full relative bg-stone-200 p-[2px]">
                <div className="absolute inset-0 bg-stone-300 opacity-50"></div>
                <div className="w-full h-full relative flex flex-col shadow-[3px_3px_5px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5">
                    <div className="h-[25%] w-full bg-blue-700 flex items-center justify-center border-b-2 border-blue-900 rounded-t-sm z-10">
                        <span className="text-[4px] text-white font-black tracking-widest uppercase">MERCADO</span>
                    </div>
                    <div className="flex-1 bg-white border-x-2 border-stone-300 flex items-end px-1 pb-0">
                         <div className="flex-1 h-[80%] bg-sky-100 border border-sky-300 mb-1 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-[150%] h-[200%] bg-white/30 -rotate-45 transform origin-top-right"></div>
                         </div>
                         <div className="w-[35%] h-[80%] bg-blue-900 ml-1 border-t border-r border-blue-950">
                             <div className="w-[2px] h-[3px] bg-yellow-400 mt-[50%] ml-[1px] rounded-full"></div>
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
                backgroundImage: `linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e), linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e)`,
                backgroundPosition: '0 0, 8px 8px',
                backgroundSize: '16px 16px',
                opacity: 0.9
            }}
        ></div>
    );
};

// --- MEMOIZED GRID COMPONENT ---
// This is critical for optimization. The 400 tiles (20x20) won't re-render every game tick.
const CityGrid = memo(({ grid, onTileClick }: { grid: TileType[][], onTileClick: (r: number, c: number) => void }) => {
    return (
        <div 
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
                width: '1000px', // Large fixed width to allow high detail
                height: '1000px',
                gap: '0px'
            }}
        >
            {grid.map((row, r) => (
                row.map((tile, c) => (
                    <div 
                        key={`${r}-${c}`} 
                        onClick={() => onTileClick(r, c)}
                        className="relative cursor-pointer hover:brightness-110 transition-colors"
                    >
                        {getTileStyle(grid, tile, r, c)}
                    </div>
                ))
            ))}
        </div>
    );
});

const CityBuilderView: React.FC<CityBuilderViewProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<TileType[][]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedTool, setSelectedTool] = useState<TileType | 'bulldoze' | 'add-car' | 'add-pedestrian'>('road');
  
  // Zoom State
  const [zoom, setZoom] = useState(1.0);
  const touchDistRef = useRef<number | null>(null);
  
  const gridRef = useRef<TileType[][]>([]);

  // Sync refs
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // Initialize Grid & Entities
  useEffect(() => {
    // Migration: If saved grid is smaller/different, reset it to ensure compatibility
    if (SAVED_CITY_GRID && SAVED_CITY_GRID.length === GRID_SIZE) {
        setGrid(SAVED_CITY_GRID);
        setEntities(SAVED_ENTITIES || []);
    } else {
        const newGrid: TileType[][] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            const row: TileType[] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                row.push('grass');
            }
            newGrid.push(row);
        }
        
        // Demo Setup
        const center = Math.floor(GRID_SIZE / 2);
        for(let i=0; i<GRID_SIZE; i++) newGrid[center][i] = 'road';
        for(let i=0; i<GRID_SIZE; i++) newGrid[i][center] = 'road';
        
        newGrid[center-2][center-2] = 'house';
        newGrid[center-2][center+2] = 'house';
        newGrid[center+2][center-2] = 'commerce';
        
        setGrid(newGrid);
        setEntities([]);
    }
  }, []);

  // Save state
  useEffect(() => {
      if (grid.length > 0) {
          SAVED_CITY_GRID = grid;
          SAVED_ENTITIES = entities;
      }
  }, [grid, entities]);

  // --- ZOOM GESTURE HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const delta = dist - touchDistRef.current;
      // Sensitivity factor 0.005 for smooth zoom
      setZoom(prev => Math.min(3, Math.max(0.5, prev + delta * 0.005)));
      
      touchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  const handleZoom = (change: number) => {
      setZoom(prev => Math.min(3, Math.max(0.5, prev + change)));
  }

  // --- SIMULATION LOOP ---
  useEffect(() => {
      const interval = setInterval(() => {
          setEntities(prevEntities => {
              const currentGrid = gridRef.current;
              
              return prevEntities.map(entity => {
                  let { r, c, dir } = entity;
                  
                  const isRoad = (row: number, col: number) => {
                      return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE && currentGrid[row][col] === 'road';
                  };

                  if (entity.type === 'car') {
                      let nextR = r;
                      let nextC = c;
                      
                      if (dir === 'UP') nextR--;
                      if (dir === 'DOWN') nextR++;
                      if (dir === 'LEFT') nextC--;
                      if (dir === 'RIGHT') nextC++;

                      if (isRoad(nextR, nextC)) {
                          if (Math.random() < 0.15) { // Chance to turn
                              const possibleTurns: Direction[] = [];
                              if (dir !== 'DOWN' && isRoad(r-1, c)) possibleTurns.push('UP');
                              if (dir !== 'UP' && isRoad(r+1, c)) possibleTurns.push('DOWN');
                              if (dir !== 'RIGHT' && isRoad(r, c-1)) possibleTurns.push('LEFT');
                              if (dir !== 'LEFT' && isRoad(r, c+1)) possibleTurns.push('RIGHT');
                              
                              if (possibleTurns.length > 0) {
                                  const newDir = possibleTurns[Math.floor(Math.random() * possibleTurns.length)];
                                  return { ...entity, dir: newDir };
                              }
                          }
                          return { ...entity, r: nextR, c: nextC };
                      } else {
                          const possibleDirs: Direction[] = [];
                          if (isRoad(r-1, c)) possibleDirs.push('UP');
                          if (isRoad(r+1, c)) possibleDirs.push('DOWN');
                          if (isRoad(r, c-1)) possibleDirs.push('LEFT');
                          if (isRoad(r, c+1)) possibleDirs.push('RIGHT');

                          if (possibleDirs.length > 0) {
                              const newDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                              return { ...entity, dir: newDir };
                          } else {
                              const reverse: Record<Direction, Direction> = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
                              return { ...entity, dir: reverse[dir] };
                          }
                      }
                  } 
                  else if (entity.type === 'pedestrian') {
                       const moves = [
                           { dr: -1, dc: 0, d: 'UP' },
                           { dr: 1, dc: 0, d: 'DOWN' },
                           { dr: 0, dc: -1, d: 'LEFT' },
                           { dr: 0, dc: 1, d: 'RIGHT' }
                       ];
                       
                       const validMoves = moves.filter(m => isRoad(r + m.dr, c + m.dc));
                       
                       if (Math.random() < 0.7 && validMoves.length > 0) {
                           const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                           return { 
                               ...entity, 
                               r: r + move.dr, 
                               c: c + move.dc,
                               dir: move.d as Direction,
                               sideWalkSide: Math.random() > 0.8 ? Math.floor(Math.random() * 4) : entity.sideWalkSide
                           };
                       }
                  }
                  return entity;
              });
          });
      }, 500); 

      return () => clearInterval(interval);
  }, []);

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    if (selectedTool === 'add-car') {
        if (grid[rowIndex][colIndex] !== 'road') {
            alert("Carros só podem ser colocados na rua!");
            return;
        }
        const newCar: Entity = {
            id: Date.now(),
            type: 'car',
            r: rowIndex,
            c: colIndex,
            dir: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random()*4)] as Direction,
            color: ['#ef4444', '#3b82f6', '#eab308', '#000000', '#ffffff', '#8b5cf6'][Math.floor(Math.random()*6)]
        };
        setEntities([...entities, newCar]);
        return;
    }

    if (selectedTool === 'add-pedestrian') {
         if (grid[rowIndex][colIndex] !== 'road') {
            alert("Pedestres devem ser colocados na calçada!");
            return;
        }
        const newPed: Entity = {
            id: Date.now(),
            type: 'pedestrian',
            r: rowIndex,
            c: colIndex,
            dir: 'DOWN',
            color: ['#f87171', '#60a5fa', '#a78bfa', '#fbbf24', '#34d399'][Math.floor(Math.random()*5)],
            sideWalkSide: Math.floor(Math.random() * 4) 
        };
        setEntities([...entities, newPed]);
        return;
    }

    const newGrid = [...grid.map(row => [...row])];
    
    if (selectedTool === 'bulldoze') {
        newGrid[rowIndex][colIndex] = 'grass';
        setEntities(entities.filter(e => e.r !== rowIndex || e.c !== colIndex));
    } else {
        if (selectedTool !== 'road') {
             setEntities(entities.filter(e => e.r !== rowIndex || e.c !== colIndex));
        }
        newGrid[rowIndex][colIndex] = selectedTool;
    }
    
    setGrid(newGrid);
  };

  const renderEntities = () => {
      // Scale is based on fixed map size of 1000px
      // 20x20 grid -> 5% per tile
      const cellSize = 100 / GRID_SIZE; 

      return entities.map(entity => {
          const top = (entity.r / GRID_SIZE) * 100;
          const left = (entity.c / GRID_SIZE) * 100;

          if (entity.type === 'car') {
              const rotation = { 'UP': 0, 'RIGHT': 90, 'DOWN': 180, 'LEFT': 270 }[entity.dir];
              return (
                  <div 
                    key={entity.id}
                    className="absolute z-20 transition-all duration-500 ease-linear flex items-center justify-center pointer-events-none"
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${cellSize}%`,
                        height: `${cellSize}%`,
                    }}
                  >
                      <div 
                        className="w-[45%] h-[65%] rounded-[4px] shadow-lg flex flex-col items-center justify-between relative py-[1px]"
                        style={{ 
                            backgroundColor: entity.color,
                            transform: `rotate(${rotation}deg)`,
                            // More detail for car
                        }}
                      >
                           {/* Headlights (Yellow) */}
                           <div className="w-full flex justify-between px-[2px]">
                               <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_2px_yellow]"></div>
                               <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_2px_yellow]"></div>
                           </div>
                           
                           {/* Roof/Windshield */}
                           <div className="w-[80%] h-[40%] bg-slate-800/40 rounded-sm"></div>

                           {/* Taillights (Red) */}
                           <div className="w-full flex justify-between px-[2px]">
                               <div className="w-1 h-0.5 bg-red-500"></div>
                               <div className="w-1 h-0.5 bg-red-500"></div>
                           </div>
                      </div>
                  </div>
              );
          }

          if (entity.type === 'pedestrian') {
              let offsetX = 0;
              let offsetY = 0;
              // Push to edges (sidewalk)
              // Since road is 40%, sidewalk starts at 20% from edge. 
              // We move them 30-35% to be safe.
              const side = entity.sideWalkSide || 0;
              
              if (side === 0) offsetY = -35;
              if (side === 1) offsetX = 35;
              if (side === 2) offsetY = 35;
              if (side === 3) offsetX = -35;

              return (
                  <div 
                    key={entity.id}
                    className="absolute z-30 transition-all duration-500 ease-linear flex items-center justify-center pointer-events-none"
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${cellSize}%`,
                        height: `${cellSize}%`,
                    }}
                  >
                      <div 
                        className="flex flex-col items-center animate-bounce"
                        style={{ 
                            transform: `translate(${offsetX}%, ${offsetY}%)`,
                            animationDuration: '0.8s'
                        }}
                      >
                           {/* Head */}
                           <div className="w-2 h-2 bg-orange-200 rounded-full border border-black/10 z-10"></div>
                           {/* Shoulders */}
                           <div className="w-3 h-2 rounded-full -mt-1" style={{ backgroundColor: entity.color }}></div>
                      </div>
                  </div>
              )
          }
          return null;
      });
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white p-3 shadow-md z-30 flex justify-between items-center border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors shadow-sm">
                  <ArrowLeft size={20} className="text-slate-700" />
              </button>
              <div>
                  <h1 className="font-bold text-slate-800 text-lg leading-tight">Prefeito</h1>
                  <p className="text-[10px] text-slate-500 font-medium">Construa e Gerencie</p>
              </div>
          </div>
          <div className="flex flex-col items-end bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">População</span>
             <span className="text-sm font-bold text-emerald-600 flex items-center gap-3">
                 <div className="flex items-center gap-1"><CarFront size={14}/> {entities.filter(e => e.type === 'car').length}</div>
                 <div className="flex items-center gap-1"><User size={14}/> {entities.filter(e => e.type === 'pedestrian').length}</div>
             </span>
          </div>
      </div>

      {/* Map Area with Scroll */}
      <div 
        className="flex-1 overflow-auto bg-[#86efac] relative shadow-inner cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          {/* Zoom Controls */}
          <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
               <button 
                onClick={() => handleZoom(0.5)}
                className="p-3 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
               >
                   <ZoomIn size={20} />
               </button>
               <button 
                onClick={() => handleZoom(-0.5)}
                className="p-3 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
               >
                   <ZoomOut size={20} />
               </button>
          </div>

          <div 
            className="min-w-fit min-h-fit p-10 flex items-center justify-center transition-all duration-100 origin-top-left"
            style={{
                 width: `${1000 * zoom + 80}px`, // Padding included in scroll width calculation
                 height: `${1000 * zoom + 80}px`
            }}
          >
              <div 
                className="bg-[#22c55e] border-8 border-[#15803d] relative shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top left',
                    width: '1000px',
                    height: '1000px',
                    willChange: 'transform' // GPU hint
                }}
              >
                  {/* Rendering Optimized Grid */}
                  <CityGrid grid={grid} onTileClick={handleTileClick} />

                  {/* Entity Layer (Overlay) */}
                  <div className="absolute inset-0 pointer-events-none">
                      {renderEntities()}
                  </div>
              </div>
          </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-2 pb-6 pt-3 rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] z-30 shrink-0">
          <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
              
              <button 
                onClick={() => setSelectedTool('road')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'road' ? 'border-slate-800 bg-slate-800 text-white shadow-lg transform -translate-y-1' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                  <div className={`w-6 h-6 rounded border-2 border-white/20 flex items-center justify-center ${selectedTool === 'road' ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <div className="h-full border-r border-dashed border-white/60"></div>
                  </div>
                  <span className="text-[10px] font-bold">Rua</span>
              </button>

              <button 
                onClick={() => setSelectedTool('house')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'house' ? 'border-orange-600 bg-orange-600 text-white shadow-lg transform -translate-y-1' : 'border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100'}`}
              >
                  <Home size={20} />
                  <span className="text-[10px] font-bold">Casa</span>
              </button>

              <button 
                onClick={() => setSelectedTool('commerce')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'commerce' ? 'border-blue-600 bg-blue-600 text-white shadow-lg transform -translate-y-1' : 'border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
              >
                  <Building2 size={20} />
                  <span className="text-[10px] font-bold">Loja</span>
              </button>

              <div className="w-[1px] bg-slate-200 mx-1"></div>

              <button 
                onClick={() => setSelectedTool('add-car')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'add-car' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg transform -translate-y-1' : 'border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}
              >
                  <Car size={20} />
                  <span className="text-[10px] font-bold">Carro</span>
              </button>

              <button 
                onClick={() => setSelectedTool('add-pedestrian')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'add-pedestrian' ? 'border-teal-600 bg-teal-600 text-white shadow-lg transform -translate-y-1' : 'border-teal-200 bg-teal-50 text-teal-500 hover:bg-teal-100'}`}
              >
                  <User size={20} />
                  <span className="text-[10px] font-bold">Pessoa</span>
              </button>

              <div className="w-[1px] bg-slate-200 mx-1"></div>

              <button 
                onClick={() => setSelectedTool('bulldoze')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-b-4 transition-all active:scale-95 min-w-[4rem] ${selectedTool === 'bulldoze' ? 'border-red-600 bg-red-600 text-white shadow-lg transform -translate-y-1' : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'}`}
              >
                  <Hammer size={20} />
                  <span className="text-[10px] font-bold">Demolir</span>
              </button>

          </div>
      </div>
    </div>
  );
};

export default CityBuilderView;
