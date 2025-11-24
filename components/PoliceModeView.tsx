
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Siren, Search, FileText, Car, AlertTriangle, CheckCircle, Radio } from 'lucide-react';

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

const PoliceModeView: React.FC<PoliceModeViewProps> = ({ onBack }) => {
    const [cars, setCars] = useState<TrafficCar[]>([]);
    const [selectedCar, setSelectedCar] = useState<TrafficCar | null>(null);
    const [actionLog, setActionLog] = useState<string[]>([]);
    const [ticketsIssued, setTicketsIssued] = useState(0);
    const [shiftTime, setShiftTime] = useState("08:30");

    // --- CAR GENERATION LOGIC ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (cars.length < 3 && !selectedCar) {
                const newCar: TrafficCar = {
                    id: Date.now(),
                    type: ['sedan', 'taxi', 'truck', 'sports'][Math.floor(Math.random() * 4)] as any,
                    color: ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#64748b', '#000000'][Math.floor(Math.random() * 6)],
                    x: -20, // Start off screen left
                    speed: 0.2 + Math.random() * 0.3,
                    plate: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
                    defects: []
                };

                // Randomly assign defects (30% chance)
                if (Math.random() < 0.3) {
                    const issues = ['Placa Vencida', 'Farol Quebrado', 'Roubado', 'Sem Seguro'];
                    newCar.defects.push(issues[Math.floor(Math.random() * issues.length)]);
                }

                setCars(prev => [...prev, newCar]);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [cars.length, selectedCar]);

    // --- GAME LOOP ---
    useEffect(() => {
        if (selectedCar) return; // Pause traffic when stopped

        const loop = setInterval(() => {
            setCars(prev => prev.map(c => ({
                ...c,
                x: c.x + c.speed
            })).filter(c => c.x < 120)); // Remove when off screen right
        }, 30);

        return () => clearInterval(loop);
    }, [selectedCar]);

    // --- ACTIONS ---
    const handleStopCar = (car: TrafficCar) => {
        setSelectedCar(car);
        setActionLog([`Veículo ${car.plate} parado.`]);
    };

    const handleAction = (action: string) => {
        if (!selectedCar) return;

        let result = "";
        switch (action) {
            case 'check_plate':
                result = selectedCar.defects.includes('Placa Vencida') || selectedCar.defects.includes('Roubado') 
                    ? `ALERTA: ${selectedCar.defects.join(', ')}` 
                    : "Placa: REGULAR";
                break;
            case 'check_lights':
                result = selectedCar.defects.includes('Farol Quebrado') 
                    ? "ALERTA: Farol Quebrado" 
                    : "Luzes: OK";
                break;
            case 'search':
                result = Math.random() < 0.1 ? "ENCONTRADO: Contrabando!" : "Busca: Nada encontrado.";
                break;
            case 'ticket':
                if (selectedCar.defects.length > 0 || actionLog.some(l => l.includes("Contrabando"))) {
                    result = "Multa aplicada com sucesso (+ $50)";
                    setTicketsIssued(prev => prev + 1);
                } else {
                    result = "Erro: Multa indevida (Advertência)";
                }
                setTimeout(() => setSelectedCar(null), 1500); // Release car
                break;
            case 'release':
                result = "Veículo liberado.";
                setTimeout(() => setSelectedCar(null), 500);
                break;
        }
        setActionLog(prev => [result, ...prev].slice(0, 3));
    };

    // --- VISUAL COMPONENTS (CSS PIXEL ART STYLE) ---
    
    const renderBuilding = (type: number, i: number) => {
        // CSS Art for buildings
        const heights = ['h-64', 'h-80', 'h-56', 'h-72'];
        const colors = ['bg-[#a87e6e]', 'bg-[#7c766e]', 'bg-[#8b5a42]', 'bg-[#6b7280]'];
        
        return (
            <div key={i} className={`w-32 ${heights[type % 4]} ${colors[type % 4]} relative border-r-4 border-black/20 flex flex-col items-center pt-4 shrink-0`}>
                {/* Windows */}
                <div className="grid grid-cols-2 gap-2 w-full px-4">
                    {Array.from({ length: 6 }).map((_, w) => (
                        <div key={w} className="h-8 bg-[#2d3748] border-b-2 border-white/20">
                            {/* Random person in window */}
                            {Math.random() > 0.8 && <div className="w-2 h-4 bg-black mx-auto mt-4"></div>}
                        </div>
                    ))}
                </div>
                {/* Shop at bottom */}
                <div className="mt-auto w-full h-16 bg-[#1a202c] border-t-4 border-yellow-500 relative">
                    <div className="text-[8px] text-yellow-500 text-center mt-1 font-mono uppercase">
                        {['Pawn Shop', 'Donuts', 'Market', 'Hotel'][type % 4]}
                    </div>
                </div>
            </div>
        );
    };

    const renderCar = (car: TrafficCar) => {
        return (
            <div 
                onClick={() => handleStopCar(car)}
                className="absolute bottom-10 w-32 h-14 cursor-pointer transition-transform hover:scale-105"
                style={{ left: `${car.x}%` }}
            >
                {/* Speech Bubble */}
                <div className="absolute -top-12 left-0 bg-[#d6cfa2] text-black text-[8px] p-2 rounded-md border-2 border-black font-mono w-40 leading-tight z-20">
                    {['Cadê a seta?!', 'Vou atrasar...', 'Olha o guarda!', 'Bip Bip!'][Math.floor(car.id % 4)]}
                    <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-[#d6cfa2] border-r-2 border-b-2 border-black transform rotate-45"></div>
                </div>

                {/* Car Body */}
                <div className="w-full h-full relative">
                    {/* Roof */}
                    <div className="absolute top-0 left-4 w-20 h-6 rounded-t-lg z-10" style={{ backgroundColor: car.color }}></div>
                    {/* Windows */}
                    <div className="absolute top-1 left-5 w-18 h-4 bg-[#81e6d9] z-10"></div>
                    
                    {/* Main Body */}
                    <div className="absolute top-5 left-0 w-32 h-8 rounded-md z-10 border-b-4 border-black/20" style={{ backgroundColor: car.color }}></div>
                    
                    {/* Stripe for Taxi */}
                    {car.type === 'taxi' && (
                        <div className="absolute top-8 left-0 w-32 h-2 bg-black/20 z-20 flex gap-1 px-1">
                            {Array.from({length:10}).map((_,i) => <div key={i} className="w-2 h-full bg-yellow-300"></div>)}
                        </div>
                    )}

                    {/* Wheels */}
                    <div className="absolute bottom-[-4px] left-4 w-6 h-6 bg-black rounded-full border-2 border-gray-500 z-20 animate-spin"></div>
                    <div className="absolute bottom-[-4px] right-4 w-6 h-6 bg-black rounded-full border-2 border-gray-500 z-20 animate-spin"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1a202c] flex flex-col overflow-hidden font-mono">
            
            {/* --- SCENE (TOP 70%) --- */}
            <div className="flex-1 relative bg-gradient-to-b from-[#4a5568] to-[#2d3748] overflow-hidden border-b-8 border-black">
                
                {/* Back Button */}
                <button onClick={onBack} className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded hover:bg-black">
                    <ArrowLeft />
                </button>

                {/* Buildings Background (Parallax-ish) */}
                <div className="absolute bottom-[80px] left-0 w-[200%] flex items-end overflow-x-hidden opacity-80">
                    {Array.from({ length: 8 }).map((_, i) => renderBuilding(i, i))}
                </div>

                {/* Street */}
                <div className="absolute bottom-0 w-full h-20 bg-[#2d3748] border-t-4 border-gray-600">
                    {/* Sidewalk */}
                    <div className="absolute top-[-20px] w-full h-5 bg-[#718096] border-b-2 border-gray-500"></div>
                    
                    {/* Cars */}
                    {cars.map(car => renderCar(car))}

                    {/* Pedestrian (Static for now) */}
                    <div className="absolute bottom-24 left-1/2 w-4 h-8 bg-pink-500 rounded-sm z-0"></div>
                </div>

                {/* Interaction Menu Overlay */}
                {selectedCar && (
                    <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-48 bg-[#c0c0c0] border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 z-50">
                        <div className="bg-[#000080] text-white text-[10px] px-1 mb-1 flex justify-between">
                            <span>POLICE MENU</span>
                            <span onClick={() => setSelectedCar(null)} className="cursor-pointer">X</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => handleAction('check_plate')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left active:border-t-gray-500 active:border-l-gray-500">CHECK PLATES</button>
                            <button onClick={() => handleAction('check_lights')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left active:border-t-gray-500 active:border-l-gray-500">CHECK LIGHTS</button>
                            <button onClick={() => handleAction('search')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left active:border-t-gray-500 active:border-l-gray-500">SEARCH CAR</button>
                            <button onClick={() => handleAction('ticket')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-black text-[10px] font-bold py-2 px-1 text-left active:border-t-gray-500 active:border-l-gray-500">WRITE TICKET</button>
                            <div className="h-1"></div>
                            <button onClick={() => handleAction('release')} className="bg-[#c0c0c0] hover:bg-white border-2 border-white border-b-gray-500 border-r-gray-500 text-red-900 text-[10px] font-bold py-2 px-1 text-center active:border-t-gray-500 active:border-l-gray-500">RELEASE</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- DASHBOARD (BOTTOM 30%) --- */}
            <div className="h-40 bg-[#111] relative border-t-4 border-[#333] p-4 flex items-center justify-between">
                {/* Texture */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

                {/* Radio */}
                <div className="w-1/3 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 relative flex flex-col">
                    <div className="w-full h-2 bg-black mb-1"></div> {/* Speaker grill */}
                    <div className="w-full h-2 bg-black mb-2"></div> 
                    <div className="bg-[#2d4f2d] text-[#4ade80] font-mono text-[10px] p-2 h-12 overflow-hidden leading-tight border-2 border-[#111] inset-shadow">
                        {actionLog.map((log, i) => <div key={i}>{`> ${log}`}</div>)}
                    </div>
                    <div className="absolute -top-10 right-2 w-2 h-20 bg-gray-400"></div> {/* Antenna */}
                    <div className="absolute bottom-2 right-2 text-gray-500 text-[8px] flex items-center gap-1">
                        <Radio size={12} /> MOTORULEZ
                    </div>
                </div>

                {/* Steering Wheel / Center */}
                <div className="w-1/3 h-full flex flex-col items-center justify-end">
                    <div className="w-32 h-32 rounded-full border-[12px] border-[#222] border-b-0 translate-y-12 shadow-xl"></div>
                </div>

                {/* Watch / Computer */}
                <div className="w-1/3 h-full bg-[#222] rounded-lg border-2 border-[#444] p-2 flex flex-col items-center justify-center relative">
                    <div className="bg-[#9ca3af] w-full h-full rounded border-4 border-[#4b5563] p-2 flex flex-col items-center justify-center relative shadow-inner">
                        {/* Digital Watch Face */}
                        <div className="bg-[#8da399] w-full h-16 border-2 border-gray-600 font-mono flex items-center justify-center text-2xl tracking-widest text-black/80 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]">
                            {shiftTime} <span className="text-[10px] ml-1 mt-2">AM</span>
                        </div>
                        
                        {/* Tickets Count */}
                        <div className="w-full bg-[#fef3c7] mt-2 p-1 border border-gray-400 text-[10px] font-bold text-center font-serif -rotate-1 shadow-sm">
                            TICKETS: {ticketsIssued}
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-2 text-[6px] text-white opacity-50">ZIBRA SECURITY</div>
                </div>

            </div>
        </div>
    );
};

export default PoliceModeView;
