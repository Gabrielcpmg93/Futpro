
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Siren, Search, FileText, Car, AlertTriangle, CheckCircle, Radio, User } from 'lucide-react';

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

    // --- PHASE TOGGLE LOGIC ---
    useEffect(() => {
        // Toggle phase every 30 seconds
        const interval = setInterval(() => {
            setTrafficPhase(prev => prev === 'CARS' ? 'PEDS' : 'CARS');
            setActionLog(prev => [`Mudança de Fluxo: ${trafficPhase === 'CARS' ? 'PEDESTRES' : 'VEÍCULOS'}`, ...prev].slice(0, 6));
        }, 30000);
        return () => clearInterval(interval);
    }, [trafficPhase]);

    // --- GENERATION LOGIC (CARS & PEDESTRIANS) ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Generate Cars (Only if in CARS phase)
            if (trafficPhase === 'CARS' && cars.length < 3 && !selectedCar) {
                const newCar: TrafficCar = {
                    id: Date.now(),
                    type: ['sedan', 'taxi', 'truck', 'sports'][Math.floor(Math.random() * 4)] as any,
                    color: ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#64748b', '#000000'][Math.floor(Math.random() * 6)],
                    x: -20,
                    speed: 0.2 + Math.random() * 0.3,
                    plate: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
                    defects: []
                };
                if (Math.random() < 0.3) {
                    const issues = ['Placa Vencida', 'Farol Quebrado', 'Roubado', 'Sem Seguro'];
                    newCar.defects.push(issues[Math.floor(Math.random() * issues.length)]);
                }
                setCars(prev => [...prev, newCar]);
            }

            // Generate Pedestrians (Only if in PEDS phase)
            if (trafficPhase === 'PEDS' && pedestrians.length < 4 && !selectedPedestrian) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                const newPed: Pedestrian = {
                    id: Date.now() + Math.random(),
                    x: dir === 1 ? -10 : 110,
                    speed: (0.05 + Math.random() * 0.05) * dir,
                    direction: dir as 1 | -1,
                    skinColor: ['#f5d0b0', '#e0ac69', '#5c3a21'][Math.floor(Math.random() * 3)],
                    shirtColor: ['#ef4444', '#3b82f6', '#ffffff', '#000000'][Math.floor(Math.random() * 4)],
                    hasIllegalItem: Math.random() < 0.15,
                    isWanted: Math.random() < 0.1,
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
            // Move Cars
            setCars(prev => prev.map(c => ({
                ...c,
                x: c.x + c.speed
            })).filter(c => c.x < 120));

            // Move Pedestrians
            setPedestrians(prev => prev.map(p => ({
                ...p,
                x: p.x + p.speed
            })).filter(p => p.x > -20 && p.x < 120));

        }, 30);

        return () => clearInterval(loop);
    }, [selectedCar, selectedPedestrian]);

    // --- CAR ACTIONS ---
    const handleStopCar = (car: TrafficCar) => {
        setSelectedPedestrian(null); // Deselect pedestrian if any
        setSelectedCar(car);
        setActionLog([`Veículo ${car.plate} parado.`]);
    };

    const handleCarAction = (action: string) => {
        if (!selectedCar) return;
        let result = "";
        
        switch (action) {
            case 'check_plate':
                result = selectedCar.defects.includes('Placa Vencida') || selectedCar.defects.includes('Roubado') 
                    ? `ALERTA: ${selectedCar.defects.join(', ')}` 
                    : "Placa: REGULAR";
                break;
            case 'check_lights':
                result = selectedCar.defects.includes('Farol Quebrado') ? "ALERTA: Farol Quebrado" : "Luzes: OK";
                break;
            case 'search':
                result = Math.random() < 0.1 ? "ENCONTRADO: Contrabando!" : "Busca: Nada encontrado.";
                break;
            case 'ticket':
                result = "Multa aplicada (+$50)";
                setTicketsIssued(prev => prev + 1);
                setTimeout(() => setSelectedCar(null), 1500);
                break;
            case 'arrest':
                result = "Motorista preso. Carro apreendido.";
                setArrestedCount(prev => prev + 1);
                setCars(prev => prev.filter(c => c.id !== selectedCar.id));
                setSelectedCar(null);
                break;
            case 'release':
                result = "Veículo liberado.";
                setTimeout(() => setSelectedCar(null), 500);
                break;
        }
        if (action !== 'arrest') setActionLog(prev => [result, ...prev].slice(0, 6));
        else setActionLog(prev => [result, ...prev].slice(0, 6));
    };

    // --- PEDESTRIAN ACTIONS ---
    const handleStopPedestrian = (ped: Pedestrian) => {
        setSelectedCar(null); // Deselect car if any
        setSelectedPedestrian(ped);
        setActionLog([`${ped.name} abordado.`]);
    };

    const handlePedestrianAction = (action: string) => {
        if (!selectedPedestrian) return;
        let result = "";

        switch (action) {
            case 'id':
                result = selectedPedestrian.isWanted ? "ALERTA: MANDADO DE PRISÃO!" : "Documento: Limpo.";
                break;
            case 'search':
                result = selectedPedestrian.hasIllegalItem ? "ENCONTRADO: Substância Ilícita!" : "Revista: Nada encontrado.";
                break;
            case 'warn':
                result = "Cidadão advertido e liberado.";
                setTimeout(() => setSelectedPedestrian(null), 800);
                break;
            case 'arrest':
                result = "Suspeito detido e conduzido.";
                setArrestedCount(prev => prev + 1);
                setPedestrians(prev => prev.filter(p => p.id !== selectedPedestrian.id)); // Remove pedestrian
                setSelectedPedestrian(null);
                break;
        }
        if (action !== 'arrest') setActionLog(prev => [result, ...prev].slice(0, 6));
        else setActionLog(prev => [result, ...prev].slice(0, 6));
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
            
            {/* --- SCENE --- */}
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
                    
                    {/* Sidewalk */}
                    <div className="absolute top-[-20px] w-full h-5 bg-[#718096] border-b-2 border-gray-500 z-10"></div>
                    
                    {/* Pedestrians (On Sidewalk) */}
                    {pedestrians.map(ped => (
                        <div 
                            key={ped.id}
                            onClick={() => handleStopPedestrian(ped)}
                            className="absolute bottom-[20px] w-6 h-10 cursor-pointer hover:scale-110 transition-transform z-20 flex flex-col items-center"
                            style={{ left: `${ped.x}%` }}
                        >
                            {/* Head */}
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ped.skinColor }}></div>
                            {/* Body */}
                            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: ped.shirtColor }}></div>
                            {/* Legs (Animated) */}
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-black animate-pulse"></div>
                                <div className="w-1 h-3 bg-black animate-pulse delay-75"></div>
                            </div>
                        </div>
                    ))}

                    {/* Cars */}
                    {cars.map(car => (
                        <div 
                            key={car.id}
                            onClick={() => handleStopCar(car)}
                            className="absolute bottom-10 w-36 h-16 cursor-pointer transition-transform hover:scale-105 z-30"
                            style={{ left: `${car.x}%` }}
                        >
                            {/* Simple Car Render */}
                            <div className="w-full h-full relative">
                                <div className="absolute top-1 left-6 w-20 h-6 bg-black/20 z-0 rounded-t-lg skew-x-12"></div>
                                <div className="absolute top-0 left-5 w-22 h-6 rounded-t-lg z-10" style={{ backgroundColor: car.color }}></div>
                                <div className="absolute top-1 left-6 w-20 h-4 bg-[#81e6d9] z-10 flex"><div className="w-1/2 h-full border-r-2 border-black/20"></div></div>
                                <div className="absolute top-5 left-0 w-36 h-9 rounded-lg z-10 border-b-4 border-black/30 shadow-sm" style={{ backgroundColor: car.color }}></div>
                                <div className="absolute top-6 right-0 w-1 h-3 bg-yellow-200 rounded-l-sm z-20 shadow-[2px_0_5px_rgba(253,224,71,0.8)]"></div>
                                <div className="absolute top-6 left-0 w-1 h-3 bg-red-600 rounded-r-sm z-20"></div>
                                <div className="absolute bottom-2 left-[-2px] w-[102%] h-2 bg-gray-700 rounded-sm z-10"></div>
                                {car.type === 'taxi' && <div className="absolute top-8 left-0 w-36 h-2 bg-black/20 z-20 flex gap-1 px-1">{Array.from({length:12}).map((_,i) => <div key={i} className="w-2 h-full bg-yellow-300"></div>)}</div>}
                                <div className="absolute bottom-[-2px] left-5 w-7 h-7 bg-black rounded-full border-4 border-gray-600 z-20 flex items-center justify-center animate-spin"><div className="w-2 h-2 bg-gray-400 rounded-full"></div></div>
                                <div className="absolute bottom-[-2px] right-5 w-7 h-7 bg-black rounded-full border-4 border-gray-600 z-20 flex items-center justify-center animate-spin"><div className="w-2 h-2 bg-gray-400 rounded-full"></div></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CAR MENU */}
                {selectedCar && (
                    <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-48 bg-[#c0c0c0] border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 z-50">
                        <div className="bg-[#000080] text-white text-[10px] px-1 mb-1 flex justify-between">
                            <span>VEÍCULO</span>
                            <span onClick={() => setSelectedCar(null)} className="cursor-pointer font-bold">X</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => handleCarAction('check_plate')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">VERIFICAR PLACA</button>
                            <button onClick={() => handleCarAction('check_lights')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">CHECAR LUZES</button>
                            <button onClick={() => handleCarAction('search')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">REVISTAR CARRO</button>
                            <button onClick={() => handleCarAction('ticket')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">MULTAR</button>
                            <button onClick={() => handleCarAction('arrest')} className="bg-[#c0c0c0] hover:bg-red-600 hover:text-white border-2 border-white border-b-gray-500 border-r-gray-500 text-red-900 text-[10px] font-bold py-2 px-1 text-left">PRENDER</button>
                            <div className="h-1"></div>
                            <button onClick={() => handleCarAction('release')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-blue-900 text-[10px] font-bold py-2 px-1 text-center">LIBERAR</button>
                        </div>
                    </div>
                )}

                {/* PEDESTRIAN MENU */}
                {selectedPedestrian && (
                    <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-48 bg-[#c0c0c0] border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 z-50">
                        <div className="bg-[#000080] text-white text-[10px] px-1 mb-1 flex justify-between">
                            <span>CIDADÃO</span>
                            <span onClick={() => setSelectedPedestrian(null)} className="cursor-pointer font-bold">X</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => handlePedestrianAction('id')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">PEDIR RG</button>
                            <button onClick={() => handlePedestrianAction('search')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left">REVISTAR</button>
                            <button onClick={() => handlePedestrianAction('arrest')} className="bg-[#c0c0c0] hover:bg-red-600 hover:text-white border-2 border-white border-b-gray-500 border-r-gray-500 text-red-900 text-[10px] font-bold py-2 px-1 text-left">PRENDER</button>
                            <div className="h-1"></div>
                            <button onClick={() => handlePedestrianAction('warn')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-center">ADVERTIR</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- DASHBOARD --- */}
            <div className="h-48 bg-[#111] relative border-t-4 border-[#333] p-4 flex items-center justify-between">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

                {/* Radio */}
                <div className="w-5/12 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 relative flex flex-col">
                    <div className="w-full h-2 bg-black mb-1"></div>
                    <div className="w-full h-2 bg-black mb-2"></div> 
                    <div className="bg-[#2d4f2d] text-[#4ade80] font-mono text-[10px] p-2 flex-1 overflow-hidden leading-tight border-2 border-[#111] inset-shadow relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]"></div>
                        {actionLog.map((log, i) => <div key={i} className="mb-1 border-b border-[#4ade80]/20 pb-1">{`> ${log}`}</div>)}
                    </div>
                    <div className="absolute -top-10 right-2 w-1 h-20 bg-gray-400"></div>
                    <div className="absolute bottom-2 right-2 text-gray-500 text-[8px] flex items-center gap-1">
                        <Radio size={12} /> RÁDIO COP
                    </div>
                </div>

                {/* Center Wheel */}
                <div className="w-2/12 h-full flex flex-col items-center justify-end">
                    <div className="w-32 h-32 rounded-full border-[12px] border-[#222] border-b-0 translate-y-12 shadow-xl bg-[#1a1a1a]"></div>
                </div>

                {/* Computer/Clock */}
                <div className="w-4/12 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 flex flex-col items-center justify-center relative">
                    <div className="bg-[#9ca3af] w-full h-full rounded border-4 border-[#4b5563] p-2 flex flex-col items-center justify-center relative shadow-inner">
                        <div className="bg-[#8da399] w-full h-12 border-2 border-gray-600 font-mono flex items-center justify-center text-2xl tracking-widest text-black/80 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)] mb-2">
                            {shiftTime}
                        </div>
                        
                        <div className="w-full flex gap-1">
                            <div className="flex-1 bg-[#fef3c7] p-1 border border-gray-400 text-[10px] font-bold text-center font-serif shadow-sm leading-tight flex flex-col justify-center">
                                <span>MULTAS</span>
                                <span className="text-lg">{ticketsIssued}</span>
                            </div>
                            <div className="flex-1 bg-[#fecaca] p-1 border border-gray-400 text-[10px] font-bold text-center font-serif shadow-sm leading-tight flex flex-col justify-center text-red-900">
                                <span>PRESOS</span>
                                <span className="text-lg">{arrestedCount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-2 text-[6px] text-white opacity-50">ZIBRA SECURITY</div>
                </div>
            </div>
        </div>
    );
};

export default PoliceModeView;
