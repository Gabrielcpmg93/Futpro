
import React, { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarViewProps {
  onBack: () => void;
  onScheduleFriendly: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBack, onScheduleFriendly }) => {
  const [selectedDay, setSelectedDay] = useState<number>(22); // Default selected based on image

  // Mock data to match the visual reference (November)
  // Days from previous month: 26, 27, 28, 29, 30, 31
  // Days in current month: 1-30
  // Days in next month: 1-6
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Events on specific days (Green underlines)
  const eventDays = [2, 15, 20];

  const renderCalendarGrid = () => {
    const days = [];
    
    // Previous month (Oct) - faded
    const prevMonthDays = [26, 27, 28, 29, 30, 31];
    prevMonthDays.forEach(d => {
      days.push(
        <div key={`prev-${d}`} className="h-14 flex items-center justify-center text-slate-300 font-medium">
          {d}
        </div>
      );
    });

    // Current month (Nov)
    for (let i = 1; i <= 30; i++) {
        const isSelected = selectedDay === i;
        const hasEvent = eventDays.includes(i);

        days.push(
            <div 
                key={`curr-${i}`} 
                onClick={() => setSelectedDay(i)}
                className="h-14 flex flex-col items-center justify-center relative cursor-pointer"
            >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all
                    ${isSelected ? 'bg-black text-white shadow-lg scale-110' : 'text-slate-800 hover:bg-slate-50'}
                `}>
                    {i}
                </div>
                {hasEvent && !isSelected && (
                    <div className="w-8 h-1 bg-emerald-500 rounded-full mt-1"></div>
                )}
            </div>
        );
    }

    // Next month (Dec) - faded
    const nextMonthDays = [1, 2, 3, 4, 5, 6];
    nextMonthDays.forEach(d => {
        days.push(
          <div key={`next-${d}`} className="h-14 flex items-center justify-center text-slate-300 font-medium">
            {d}
          </div>
        );
      });

    return days;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-widest uppercase">NOV.</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 px-4 mb-2">
          {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 py-2">
                  {day}
              </div>
          ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 px-4 mb-8">
          {renderCalendarGrid()}
      </div>

      {/* Selected Date Actions */}
      <div className="flex-1 bg-slate-50 rounded-t-[2.5rem] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between mb-6">
              <div>
                  <h2 className="text-2xl font-bold text-slate-900">Dia {selectedDay}</h2>
                  <p className="text-slate-400">Novembro, 2024</p>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <CalendarIcon className="text-slate-400" />
              </div>
          </div>

          <div className="space-y-4">
              {eventDays.includes(selectedDay) ? (
                   <div className="bg-emerald-100 p-4 rounded-2xl flex items-center gap-4 text-emerald-800 border border-emerald-200">
                       <div className="w-2 h-12 bg-emerald-500 rounded-full"></div>
                       <div>
                           <p className="font-bold text-lg">Dia de Jogo</p>
                           <p className="text-sm text-emerald-600 opacity-80">Partida Agendada</p>
                       </div>
                   </div>
              ) : (
                  <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center gap-2">
                      <p className="text-slate-400 font-medium">Nenhum evento agendado</p>
                  </div>
              )}

              <button 
                onClick={onScheduleFriendly}
                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 transform"
              >
                  <Plus size={20} />
                  Agendar Amistoso
              </button>
          </div>
      </div>
    </div>
  );
};

export default CalendarView;
