
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Building2, MousePointer2, Hammer, Car, User, CarFront } from 'lucide-react';

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

const GRID_SIZE = 12; // 12x12 grid fits nicely on mobile

const CityBuilderView: React.FC<CityBuilderViewProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<TileType[][]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedTool, setSelectedTool] = useState<TileType | 'bulldoze' | 'add-car' | 'add-pedestrian'>('road');
  
  // Refs for simulation loop to access latest state without re-triggering effect constantly
  const gridRef = useRef<TileType[][]>([]);
  const entitiesRef = useRef<Entity[]>([]);

  // Sync refs
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { entitiesRef.current = entities; }, [entities]);

  // Initialize Grid & Entities
  useEffect(() => {
    if (SAVED_CITY_GRID) {
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
        
        // Create a default intersection for demo
        for(let i=0; i<GRID_SIZE; i++) newGrid[6][i] = 'road';
        for(let i=0; i<GRID_SIZE; i++) newGrid[i][6] = 'road';
        
        // Add some starter buildings
        newGrid[4][4] = 'house';
        newGrid[4][8] = 'house';
        newGrid[8][4] = 'commerce';
        
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

  // --- SIMULATION LOOP ---
  useEffect(() => {
      const interval = setInterval(() => {
          setEntities(prevEntities => {
              const currentGrid = gridRef.current;
              
              return prevEntities.map(entity => {
                  let { r, c, dir } = entity;
                  
                  // Helper to check if a tile is a road
                  const isRoad = (row: number, col: number) => {
                      return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE && currentGrid[row][col] === 'road';
                  };

                  if (entity.type === 'car') {
                      // Attempt to move forward
                      let nextR = r;
                      let nextC = c;
                      
                      if (dir === 'UP') nextR--;
                      if (dir === 'DOWN') nextR++;
                      if (dir === 'LEFT') nextC--;
                      if (dir === 'RIGHT') nextC++;

                      if (isRoad(nextR, nextC)) {
                          // 10% chance to turn at intersection even if straight is available
                          if (Math.random() < 0.1) {
                              const possibleTurns = [];
                              if (dir !== 'DOWN' && isRoad(r-1, c)) possibleTurns.push('UP');
                              if (dir !== 'UP' && isRoad(r+1, c)) possibleTurns.push('DOWN');
                              if (dir !== 'RIGHT' && isRoad(r, c-1)) possibleTurns.push('LEFT');
                              if (dir !== 'LEFT' && isRoad(r, c+1)) possibleTurns.push('RIGHT');
                              
                              if (possibleTurns.length > 0) {
                                  const newDir = possibleTurns[Math.floor(Math.random() * possibleTurns.length)] as Direction;
                                  return { ...entity, dir: newDir };
                              }
                          }
                          return { ...entity, r: nextR, c: nextC };
                      } else {
                          // Hit a wall or end of road, find a new direction
                          const possibleDirs = [];
                          // Don't go back exactly where we came from unless dead end (simple logic: just find any valid road neighbor)
                          if (isRoad(r-1, c)) possibleDirs.push('UP');
                          if (isRoad(r+1, c)) possibleDirs.push('DOWN');
                          if (isRoad(r, c-1)) possibleDirs.push('LEFT');
                          if (isRoad(r, c+1)) possibleDirs.push('RIGHT');

                          if (possibleDirs.length > 0) {
                              const newDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)] as Direction;
                              return { ...entity, dir: newDir }; // Rotate this tick, move next tick
                          } else {
                              // Stuck? Reverse
                              const reverse: Record<Direction, Direction> = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
                              return { ...entity, dir: reverse[dir] };
                          }
                      }
                  } 
                  else if (entity.type === 'pedestrian') {
                       // Pedestrians stick to current tile but change "side" of sidewalk or move to neighbor road
                       // Simple logic: Move to neighbor road tile
                       const moves = [
                           { dr: -1, dc: 0, d: 'UP' },
                           { dr: 1, dc: 0, d: 'DOWN' },
                           { dr: 0, dc: -1, d: 'LEFT' },
                           { dr: 0, dc: 1, d: 'RIGHT' }
                       ];
                       
                       // Filter valid moves (must be road)
                       const validMoves = moves.filter(m => isRoad(r + m.dr, c + m.dc));
                       
                       // 30% chance to stay put (chatting on sidewalk), 70% to move
                       if (Math.random() < 0.7 && validMoves.length > 0) {
                           const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                           return { 
                               ...entity, 
                               r: r + move.dr, 
                               c: c + move.dc,
                               dir: move.d as Direction,
                               // Randomize side of street occasionally
                               sideWalkSide: Math.random() > 0.8 ? Math.floor(Math.random() * 4) : entity.sideWalkSide
                           };
                       }
                  }

                  return entity;
              });
          });
      }, 500); // Game tick speed

      return () => clearInterval(interval);
  }, []);

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    // Handling Entity Placement
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
            color: ['#ef4444', '#3b82f6', '#eab308', '#000000', '#ffffff'][Math.floor(Math.random()*5)]
        };
        setEntities([...entities, newCar]);
        return;
    }

    if (selectedTool === 'add-pedestrian') {
         if (grid[rowIndex][colIndex] !== 'road') {
            alert("Pedestres devem ser colocados na calçada (bloco da rua)!");
            return;
        }
        const newPed: Entity = {
            id: Date.now(),
            type: 'pedestrian',
            r: rowIndex,
            c: colIndex,
            dir: 'DOWN',
            color: '#ffffff',
            sideWalkSide: Math.floor(Math.random() * 4) // 0: Top, 1: Right, 2: Bottom, 3: Left
        };
        setEntities([...entities, newPed]);
        return;
    }

    // Handling Map Building
    const newGrid = [...grid.map(row => [...row])];
    
    if (selectedTool === 'bulldoze') {
        newGrid[rowIndex][colIndex] = 'grass';
        // Also remove entities on this tile
        setEntities(entities.filter(e => e.r !== rowIndex || e.c !== colIndex));
    } else {
        // If placing a building on a road with cars, remove cars
        if (selectedTool !== 'road') {
             setEntities(entities.filter(e => e.r !== rowIndex || e.c !== colIndex));
        }
        newGrid[rowIndex][colIndex] = selectedTool;
    }
    
    setGrid(newGrid);
  };

  const getTileStyle = (type: TileType, r: number, c: number) => {
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

         return (
             <div className="w-full h-full bg-stone-300 relative flex items-center justify-center overflow-hidden">
                 {/* Sidewalk Base (Stone color) */}
                 
                 {/* Center Block (The Asphalt Intersection) */}
                 <div className="absolute w-[65%] h-[65%] bg-slate-700 z-10"></div>

                 {/* Road Segments */}
                 {(top || bottom || isolated) && (
                     <div className="absolute w-[65%] h-full bg-slate-700 flex justify-center">
                         <div className="h-full border-r border-dashed border-white/60 w-0"></div>
                     </div>
                 )}
                 {(left || right || isolated) && (
                     <div className="absolute h-[65%] w-full bg-slate-700 flex flex-col justify-center items-center">
                         <div className="w-full border-b border-dashed border-white/60 h-0"></div>
                     </div>
                 )}
                 
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '3px 3px'}}>
                 </div>
             </div>
         );
    }

    if (type === 'house') {
        return (
            <div className="w-full h-full relative bg-[#86efac] p-[2px]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[30%] bg-stone-300"></div>
                <div className="w-full h-full flex flex-col relative shadow-[2px_2px_2px_rgba(0,0,0,0.2)]">
                    <div className="h-1/2 w-full bg-red-500 relative rounded-sm z-10">
                         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-700/50"></div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-800/30 rounded-full"></div>
                    </div>
                    <div className="h-1/2 w-[90%] mx-auto bg-orange-100 relative border-x border-orange-200">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[70%] bg-orange-900 rounded-t-[2px]"></div>
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
                <div className="absolute inset-0 bg-stone-300 opacity-50"></div>
                <div className="w-full h-full relative flex flex-col shadow-[3px_3px_2px_rgba(0,0,0,0.15)]">
                    <div className="h-[25%] w-full bg-blue-600 flex items-center justify-center border-b-2 border-blue-800 rounded-t-sm z-10">
                        <span className="text-[5px] text-white font-black tracking-widest uppercase">LOJA</span>
                    </div>
                    <div className="flex-1 bg-white border-x-2 border-stone-300 flex items-end px-1 pb-0">
                         <div className="flex-1 h-[80%] bg-sky-100 border border-sky-300 mb-1 relative overflow-hidden group-hover:bg-sky-50 transition-colors">
                              <div className="absolute top-0 right-0 w-[150%] h-[200%] bg-white/30 -rotate-45 transform origin-top-right"></div>
                              <div className="absolute bottom-0 w-full h-[2px] bg-orange-400"></div>
                         </div>
                         <div className="w-[35%] h-[80%] bg-blue-900 ml-1 border-t border-r border-blue-950">
                             <div className="w-[2px] h-[4px] bg-yellow-400 mt-[50%] ml-[2px] rounded-full"></div>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full bg-[#4ade80]"
            style={{ 
                backgroundImage: `linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e), linear-gradient(45deg, #22c55e 25%, transparent 25%, transparent 75%, #22c55e 75%, #22c55e)`,
                backgroundPosition: '0 0, 4px 4px',
                backgroundSize: '8px 8px',
                opacity: 0.8
            }}
        ></div>
    );
  };

  const renderEntities = () => {
      return entities.map(entity => {
          // Calculate grid percentage
          const top = (entity.r / GRID_SIZE) * 100;
          const left = (entity.c / GRID_SIZE) * 100;
          const cellSize = 100 / GRID_SIZE; // Percent size of one cell

          if (entity.type === 'car') {
              const rotation = { 'UP': 0, 'RIGHT': 90, 'DOWN': 180, 'LEFT': 270 }[entity.dir];
              return (
                  <div 
                    key={entity.id}
                    className="absolute z-20 transition-all duration-500 ease-linear flex items-center justify-center"
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${cellSize}%`,
                        height: `${cellSize}%`,
                    }}
                  >
                      <div 
                        className="w-[60%] h-[40%] rounded-sm shadow-md flex items-center justify-center relative"
                        style={{ 
                            backgroundColor: entity.color,
                            transform: `rotate(${rotation}deg)` 
                        }}
                      >
                           {/* Car Details */}
                           <div className="absolute top-0 left-0 w-full h-[30%] bg-black/20"></div> {/* Windshield area */}
                           <div className="w-[80%] h-[60%] bg-white/20 rounded-sm"></div>
                      </div>
                  </div>
              );
          }

          if (entity.type === 'pedestrian') {
              // Pedestrian Offset Logic (Simulate Sidewalk)
              // 0: Top, 1: Right, 2: Bottom, 3: Left
              let offsetX = 0;
              let offsetY = 0;
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
                        className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-white shadow-sm"
                        style={{ transform: `translate(${offsetX}%, ${offsetY}%)` }}
                      ></div>
                  </div>
              )
          }
          return null;
      });
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
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tráfego</span>
             <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                 <CarFront size={14}/> {entities.filter(e => e.type === 'car').length}
                 <User size={14}/> {entities.filter(e => e.type === 'pedestrian').length}
             </span>
          </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#86efac] relative shadow-inner">
          <div 
            className="bg-[#22c55e] p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-4 border-[#16a34a] relative"
            style={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1/1',
            }}
          >
              {/* Grid Layer */}
              <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: '100%',
                    height: '100%',
                    gap: '0px'
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

              {/* Entity Layer (Overlay) */}
              <div className="absolute inset-3 pointer-events-none">
                  {renderEntities()}
              </div>

          </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 pb-8 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-20 overflow-x-auto no-scrollbar">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">Ferramentas</p>
          <div className="flex justify-between gap-2 min-w-max mx-auto px-4">
              
              <button 
                onClick={() => setSelectedTool('road')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'road' ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                  <div className={`w-6 h-6 rounded border-2 border-white/20 flex items-center justify-center ${selectedTool === 'road' ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <div className="h-full border-r border-dashed border-white/60"></div>
                  </div>
                  <span className="text-[9px] font-bold">Rua</span>
              </button>

              <button 
                onClick={() => setSelectedTool('house')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'house' ? 'border-orange-600 bg-orange-600 text-white shadow-lg' : 'border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100'}`}
              >
                  <Home size={20} />
                  <span className="text-[9px] font-bold">Casa</span>
              </button>

              <button 
                onClick={() => setSelectedTool('commerce')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'commerce' ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
              >
                  <Building2 size={20} />
                  <span className="text-[9px] font-bold">Loja</span>
              </button>

              <div className="w-[1px] bg-slate-200 mx-1"></div>

              <button 
                onClick={() => setSelectedTool('add-car')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'add-car' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}
              >
                  <Car size={20} />
                  <span className="text-[9px] font-bold">+Carro</span>
              </button>

              <button 
                onClick={() => setSelectedTool('add-pedestrian')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'add-pedestrian' ? 'border-teal-600 bg-teal-600 text-white shadow-lg' : 'border-teal-200 bg-teal-50 text-teal-500 hover:bg-teal-100'}`}
              >
                  <User size={20} />
                  <span className="text-[9px] font-bold">+Pessoa</span>
              </button>

              <div className="w-[1px] bg-slate-200 mx-1"></div>

              <button 
                onClick={() => setSelectedTool('bulldoze')}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-b-4 transition-all active:scale-95 w-16 ${selectedTool === 'bulldoze' ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'}`}
              >
                  <Hammer size={20} />
                  <span className="text-[9px] font-bold">Demolir</span>
              </button>

          </div>
      </div>
    </div>
  );
};

export default CityBuilderView;
