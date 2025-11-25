
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Siren, Search, FileText, Car, AlertTriangle, CheckCircle, Radio, User, Lock } from 'lucide-react';

interface PoliceModeViewProps {
  onBack: () => void;
}

interface TrafficCar {
    id: number;
    type: 'sedan' | 'taxi' | 'truck' | 'sports';
    color: string;
    x: number; // percentage
    speed: number;
    defects: string[]; // 'expired_plate', 'broken_light', 'stolen', etc.
    plate: string;
}

interface Pedestrian {
    id: number;
    x: number;
    speed: number;
    direction: 1 | -1; // 1 right, -1 left
    skinColor: string;
    shirtColor: string;
    hasIllegalItem: boolean;
    isWanted: boolean;
    name: string;
}

const PoliceModeView: React.FC<PoliceModeViewProps> = ({ onBack }) => {
    const [cars, setCars] = useState<TrafficCar[]>([]);
    const [pedestrians, setPedestrians] = useState<Pedestrian[]>([]);
    
    const [selectedCar, setSelectedCar] = useState<TrafficCar | null>(null);
    const [selectedPedestrian, setSelectedPedestrian] = useState<Pedestrian | null>(null);
    const [showFineMenu, setShowFineMenu] = useState(false); // Submenu state
    
    const [actionLog, setActionLog] = useState<string[]>([]);
    const [ticketsIssued, setTicketsIssued] = useState(0);
    const [arrestedCount, setArrestedCount] = useState(0);
    const [shiftTime, setShiftTime] = useState("");
    
    // New State for Traffic Phases (Cars vs Peds)
    const [trafficPhase, setTrafficPhase] = useState<'CARS' | 'PEDS'>('CARS');

    // --- REAL TIME CLOCK ---
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setShiftTime(`${hours}:${minutes}`);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- PHASE TOGGLE TIMER ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTrafficPhase(prev => prev === 'CARS' ? 'PEDS' : 'CARS');
        }, 30000); // Switch every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // --- PHASE CHANGE HANDLER (CLEANUP) ---
    useEffect(() => {
        if (trafficPhase === 'CARS') {
            setPedestrians([]);
            setSelectedPedestrian(null);
            setActionLog(prev => [`Fluxo alterado para: VEÍCULOS`, ...prev].slice(0, 6));
        } else {
            setCars([]);
            setSelectedCar(null);
            setActionLog(prev => [`Fluxo alterado para: PEDESTRES`, ...prev].slice(0, 6));
        }
    }, [trafficPhase]);

    // --- GENERATION LOGIC (CARS & PEDESTRIANS) ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Generate Cars (Only if in CARS phase)
            if (trafficPhase === 'CARS' && cars.length < 1 && !selectedCar) {
                const newCar: TrafficCar = {
                    id: Date.now(),
                    type: ['sedan', 'taxi', 'truck', 'sports'][Math.floor(Math.random() * 4)] as any,
                    color: ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#64748b', '#000000'][Math.floor(Math.random() * 6)],
                    x: -30,
                    speed: 0.2 + Math.random() * 0.2,
                    plate: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
                    defects: []
                };
                if (Math.random() < 0.4) {
                    const issues = ['Placa Vencida', 'Farol Quebrado', 'Roubado', 'Sem Seguro'];
                    newCar.defects.push(issues[Math.floor(Math.random() * issues.length)]);
                }
                setCars(prev => [...prev, newCar]);
            }

            // Generate Pedestrians (Only if in PEDS phase)
            if (trafficPhase === 'PEDS' && pedestrians.length < 1 && !selectedPedestrian) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                const newPed: Pedestrian = {
                    id: Date.now() + Math.random(),
                    x: dir === 1 ? -10 : 110,
                    speed: (0.05 + Math.random() * 0.05) * dir,
                    direction: dir as 1 | -1,
                    skinColor: ['#f5d0b0', '#e0ac69', '#5c3a21'][Math.floor(Math.random() * 3)],
                    shirtColor: ['#ef4444', '#3b82f6', '#ffffff', '#000000'][Math.floor(Math.random() * 4)],
                    hasIllegalItem: Math.random() < 0.2,
                    isWanted: Math.random() < 0.15,
                    name: `Cidadão #${Math.floor(Math.random() * 100)}`
                };
                setPedestrians(prev => [...prev, newPed]);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [cars.length, pedestrians.length, selectedCar, selectedPedestrian, trafficPhase]);

    // --- GAME LOOP ---
    useEffect(() => {
        if (selectedCar || selectedPedestrian) return; // Pause when interacting

        const loop = setInterval(() => {
            setCars(prev => prev.map(c => ({
                ...c,
                x: c.x + c.speed
            })).filter(c => c.x < 120));

            setPedestrians(prev => prev.map(p => ({
                ...p,
                x: p.x + p.speed
            })).filter(p => p.x > -20 && p.x < 120));

        }, 30);

        return () => clearInterval(loop);
    }, [selectedCar, selectedPedestrian]);

    // --- CAR ACTIONS ---
    const handleStopCar = (car: TrafficCar) => {
        setSelectedPedestrian(null); 
        setSelectedCar(car);
        setShowFineMenu(false);
        setActionLog([`Veículo ${car.plate} parado.`]);
    };

    const handleCarAction = (action: string, value?: number) => {
        if (!selectedCar) return;
        let result = "";
        
        switch (action) {
            case 'check_plate':
                result = selectedCar.defects.includes('Placa Vencida') || selectedCar.defects.includes('Roubado') 
                    ? `ALERTA: ${selectedCar.defects.join(', ')}` 
                    : "Placa: REGULAR";
                // Clear previous plate checks to avoid spam
                setActionLog(prev => [result, ...prev.filter(l => !l.includes('Placa:') && !l.includes('ALERTA: Placa') && !l.includes('ALERTA: Roubado'))].slice(0, 6));
                return; // Return early

            case 'check_lights':
                result = selectedCar.defects.includes('Farol Quebrado') ? "ALERTA: Farol Quebrado" : "Luzes: OK";
                // Clear previous light checks
                setActionLog(prev => [result, ...prev.filter(l => !l.includes('Luzes:') && !l.includes('ALERTA: Farol'))].slice(0, 6));
                return; // Return early

            case 'search':
                result = Math.random() < 0.1 ? "ENCONTRADO: Contrabando!" : "Busca: Nada encontrado.";
                break;
            case 'ticket_menu':
                setShowFineMenu(true);
                return;
            case 'apply_ticket':
                result = `Multa aplicada: $${value}`;
                setTicketsIssued(prev => prev + 1);
                setShowFineMenu(false);
                setTimeout(() => setSelectedCar(null), 1000);
                break;
            case 'arrest':
                result = "Motorista preso. Carro apreendido.";
                setArrestedCount(prev => prev + 1);
                setCars([]); // Clear instantly
                setSelectedCar(null);
                break;
            case 'release':
                result = "Veículo liberado.";
                setTimeout(() => setSelectedCar(null), 500);
                break;
        }
        setActionLog(prev => [result, ...prev].slice(0, 6));
    };

    // --- PEDESTRIAN ACTIONS ---
    const handleStopPedestrian = (ped: Pedestrian) => {
        setSelectedCar(null); 
        setSelectedPedestrian(ped);
        setShowFineMenu(false);
        setActionLog([`${ped.name} abordado.`]);
    };

    const handlePedestrianAction = (action: string, value?: number) => {
        if (!selectedPedestrian) return;
        let result = "";

        switch (action) {
            case 'id':
                result = selectedPedestrian.isWanted ? "ALERTA: MANDADO DE PRISÃO!" : "Documento: Limpo.";
                // Clear previous ID checks
                setActionLog(prev => [result, ...prev.filter(l => !l.includes('Documento:') && !l.includes('ALERTA: MANDADO'))].slice(0, 6));
                return;

            case 'search':
                result = selectedPedestrian.hasIllegalItem ? "ENCONTRADO: Substância Ilícita!" : "Revista: Nada encontrado.";
                break;
            case 'ticket_menu':
                setShowFineMenu(true);
                return;
            case 'apply_ticket':
                result = `Multa aplicada: $${value}`;
                setTicketsIssued(prev => prev + 1);
                setShowFineMenu(false);
                setTimeout(() => setSelectedPedestrian(null), 1000);
                break;
            case 'warn':
                result = "Cidadão advertido e liberado.";
                setTimeout(() => setSelectedPedestrian(null), 800);
                break;
            case 'arrest':
                result = "Suspeito detido e conduzido.";
                setArrestedCount(prev => prev + 1);
                setPedestrians([]); // Clear instantly
                setSelectedPedestrian(null);
                break;
        }
        setActionLog(prev => [result, ...prev].slice(0, 6));
    };

    // --- RENDER HELPERS ---
    const renderBuilding = (type: number, i: number) => {
        const heights = ['h-64', 'h-80', 'h-56', 'h-72'];
        const colors = ['bg-[#a87e6e]', 'bg-[#7c766e]', 'bg-[#8b5a42]', 'bg-[#6b7280]'];
        return (
            <div key={i} className={`w-32 ${heights[type % 4]} ${colors[type % 4]} relative border-r-4 border-black/20 flex flex-col items-center pt-4 shrink-0`}>
                <div className="grid grid-cols-2 gap-2 w-full px-4">
                    {Array.from({ length: 6 }).map((_, w) => (
                        <div key={w} className="h-8 bg-[#2d3748] border-b-2 border-white/20">
                            {Math.random() > 0.8 && <div className="w-2 h-4 bg-black mx-auto mt-4"></div>}
                        </div>
                    ))}
                </div>
                <div className="mt-auto w-full h-16 bg-[#1a202c] border-t-4 border-yellow-500 relative">
                    <div className="text-[8px] text-yellow-500 text-center mt-1 font-mono uppercase">
                        {['Loja', 'Donuts', 'Mercado', 'Hotel'][type % 4]}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1a202c] flex flex-col overflow-hidden font-mono select-none">
            
            {/* --- SCENE (TOP 65%) --- */}
            <div className="flex-1 relative bg-gradient-to-b from-[#4a5568] to-[#2d3748] overflow-hidden border-b-8 border-black">
                
                <button onClick={onBack} className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded hover:bg-black">
                    <ArrowLeft />
                </button>

                {/* Phase Indicator */}
                <div className="absolute top-4 right-4 z-40 bg-black/60 text-white text-[10px] px-2 py-1 rounded border border-white/20 font-bold uppercase animate-pulse">
                    FLUXO: {trafficPhase === 'CARS' ? 'VEÍCULOS' : 'PEDESTRES'}
                </div>

                <div className="absolute bottom-[80px] left-0 w-[200%] flex items-end overflow-x-hidden opacity-80">
                    {Array.from({ length: 8 }).map((_, i) => renderBuilding(i, i))}
                </div>

                {/* Street Area */}
                <div className="absolute bottom-0 w-full h-20 bg-[#2d3748] border-t-4 border-gray-600">
                    <div className="absolute top-[-20px] w-full h-5 bg-[#718096] border-b-2 border-gray-500 z-10"></div>
                    
                    {/* Pedestrians */}
                    {pedestrians.map(ped => (
                        <div 
                            key={ped.id}
                            onClick={() => handleStopPedestrian(ped)}
                            className="absolute bottom-[20px] w-8 h-12 cursor-pointer hover:scale-110 transition-transform z-20 flex flex-col items-center"
                            style={{ left: `${ped.x}%` }}
                        >
                            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: ped.skinColor }}></div>
                            <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: ped.shirtColor }}></div>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-4 bg-black animate-pulse"></div>
                                <div className="w-1.5 h-4 bg-black animate-pulse delay-75"></div>
                            </div>
                        </div>
                    ))}

                    {/* Cars */}
                    {cars.map(car => (
                        <div 
                            key={car.id}
                            onClick={() => handleStopCar(car)}
                            className="absolute bottom-10 w-40 h-16 cursor-pointer transition-transform hover:scale-105 z-30"
                            style={{ left: `${car.x}%` }}
                        >
                            <div className="w-full h-full relative">
                                <div className="absolute top-1 left-6 w-24 h-6 bg-black/20 z-0 rounded-t-lg skew-x-12"></div>
                                <div className="absolute top-0 left-5 w-26 h-6 rounded-t-lg z-10" style={{ backgroundColor: car.color }}></div>
                                <div className="absolute top-1 left-6 w-24 h-4 bg-[#81e6d9] z-10 flex"><div className="w-1/2 h-full border-r-2 border-black/20"></div></div>
                                <div className="absolute top-5 left-0 w-40 h-10 rounded-lg z-10 border-b-4 border-black/30 shadow-sm" style={{ backgroundColor: car.color }}></div>
                                <div className="absolute top-6 right-0 w-1 h-3 bg-yellow-200 rounded-l-sm z-20 shadow-[2px_0_5px_rgba(253,224,71,0.8)]"></div>
                                <div className="absolute top-6 left-0 w-1 h-3 bg-red-600 rounded-r-sm z-20"></div>
                                <div className="absolute bottom-2 left-[-2px] w-[102%] h-2 bg-gray-700 rounded-sm z-10"></div>
                                {car.type === 'taxi' && <div className="absolute top-8 left-0 w-40 h-2 bg-black/20 z-20 flex gap-1 px-1">{Array.from({length:12}).map((_,i) => <div key={i} className="w-2 h-full bg-yellow-300"></div>)}</div>}
                                <div className="absolute bottom-[-2px] left-6 w-8 h-8 bg-black rounded-full border-4 border-gray-600 z-20 flex items-center justify-center animate-spin"><div className="w-2 h-2 bg-gray-400 rounded-full"></div></div>
                                <div className="absolute bottom-[-2px] right-6 w-8 h-8 bg-black rounded-full border-4 border-gray-600 z-20 flex items-center justify-center animate-spin"><div className="w-2 h-2 bg-gray-400 rounded-full"></div></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MENUS (Car/Pedestrian) */}
                {(selectedCar || selectedPedestrian) && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-[#c0c0c0] border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 z-50">
                        <div className="bg-[#000080] text-white text-xs px-2 py-1 mb-1 flex justify-between items-center">
                            <span>{selectedCar ? 'VEÍCULO' : 'CIDADÃO'}</span>
                            <button onClick={() => { setSelectedCar(null); setSelectedPedestrian(null); }} className="font-bold bg-red-500 px-2 hover:bg-red-600">X</button>
                        </div>
                        
                        {showFineMenu ? (
                            <div className="flex flex-col gap-1 bg-gray-200 p-1">
                                <div className="text-black text-xs font-bold text-center mb-1">VALOR DA MULTA</div>
                                <button onClick={() => selectedCar ? handleCarAction('apply_ticket', 50) : handlePedestrianAction('apply_ticket', 50)} className="bg-white hover:bg-gray-100 border border-gray-400 text-black text-xs font-bold py-1 px-1">$50 - Leve</button>
                                <button onClick={() => selectedCar ? handleCarAction('apply_ticket', 150) : handlePedestrianAction('apply_ticket', 150)} className="bg-white hover:bg-gray-100 border border-gray-400 text-black text-xs font-bold py-1 px-1">$150 - Média</button>
                                <button onClick={() => selectedCar ? handleCarAction('apply_ticket', 500) : handlePedestrianAction('apply_ticket', 500)} className="bg-white hover:bg-gray-100 border border-gray-400 text-black text-xs font-bold py-1 px-1">$500 - Grave</button>
                                <button onClick={() => setShowFineMenu(false)} className="bg-red-200 hover:bg-red-300 border border-red-400 text-red-900 text-xs font-bold py-1 px-1 mt-1">Voltar</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {selectedCar ? (
                                    <>
                                        <button onClick={() => handleCarAction('check_plate')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">VERIFICAR PLACA</button>
                                        <button onClick={() => handleCarAction('check_lights')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">CHECAR LUZES</button>
                                        <button onClick={() => handleCarAction('search')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">REVISTAR CARRO</button>
                                        <button onClick={() => handleCarAction('ticket_menu')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">MULTAR...</button>
                                        <button onClick={() => handleCarAction('arrest')} className="bg-[#c0c0c0] hover:bg-red-600 hover:text-white border-2 border-gray-500 text-red-900 text-xs font-bold py-2 px-2 text-left">PRENDER</button>
                                        <button onClick={() => handleCarAction('release')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-blue-900 text-xs font-bold py-2 px-2 text-center mt-1">LIBERAR</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handlePedestrianAction('id')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">PEDIR RG</button>
                                        <button onClick={() => handlePedestrianAction('search')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">REVISTAR</button>
                                        <button onClick={() => handlePedestrianAction('ticket_menu')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-left">MULTAR...</button>
                                        <button onClick={() => handlePedestrianAction('arrest')} className="bg-[#c0c0c0] hover:bg-red-600 hover:text-white border-2 border-gray-500 text-red-900 text-xs font-bold py-2 px-2 text-left">PRENDER</button>
                                        <button onClick={() => handlePedestrianAction('warn')} className="bg-[#c0c0c0] hover:bg-white border-2 border-gray-500 text-black text-xs font-bold py-2 px-2 text-center mt-1">ADVERTIR</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- DASHBOARD (BOTTOM 35% - OPTIMIZED) --- */}
            <div className="h-[35%] bg-[#111] relative border-t-4 border-[#333] p-4 flex items-center gap-2">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

                {/* Radio - Full Width/Height Optimized */}
                <div className="flex-1 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 relative flex flex-col">
                    <div className="w-full h-1 bg-black mb-1"></div>
                    <div className="bg-[#2d4f2d] text-[#4ade80] font-mono text-[10px] p-2 flex-1 overflow-y-auto leading-tight border-2 border-[#111] inset-shadow relative no-scrollbar">
                        {actionLog.map((log, i) => <div key={i} className="mb-1 border-b border-[#4ade80]/20 pb-1">{`> ${log}`}</div>)}
                    </div>
                    <div className="absolute -top-6 right-2 w-1 h-10 bg-gray-400"></div>
                    <div className="absolute bottom-1 right-1 text-gray-500 text-[8px] flex items-center gap-1">
                        <Radio size={10} /> RÁDIO COP
                    </div>
                </div>

                {/* Computer/Clock - Optimized Layout */}
                <div className="flex-1 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 flex flex-col items-center justify-center relative">
                    <div className="bg-[#9ca3af] w-full h-full rounded border-4 border-[#4b5563] p-2 flex flex-col gap-1 relative shadow-inner">
                        {/* Clock */}
                        <div className="bg-[#8da399] w-full h-1/3 border-2 border-gray-600 font-mono flex items-center justify-center text-xl tracking-widest text-black/80 shadow-inner">
                            {shiftTime}
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="w-full flex-1 grid grid-cols-2 gap-1">
                            <div className="bg-[#fef3c7] border border-gray-400 text-[10px] font-bold text-center font-serif shadow-sm flex flex-col justify-center leading-none">
                                <span className="block mb-1">MULTAS</span>
                                <span className="text-lg">{ticketsIssued}</span>
                            </div>
                            <div className="bg-[#fecaca] border border-gray-400 text-[10px] font-bold text-center font-serif shadow-sm flex flex-col justify-center leading-none text-red-900">
                                <span className="block mb-1">PRESOS</span>
                                <span className="text-lg">{arrestedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoliceModeView;
