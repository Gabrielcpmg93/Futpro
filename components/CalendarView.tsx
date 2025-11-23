
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarViewProps {
  onBack: () => void;
  onScheduleFriendly: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBack, onScheduleFriendly }) => {
  // Get current system date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  const currentDay = now.getDate();

  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  const monthNamesShort = [
      "JAN.", "FEV.", "MAR.", "ABR.", "MAI.", "JUN.",
      "JUL.", "AGO.", "SET.", "OUT.", "NOV.", "DEZ."
  ];
  
  const monthNamesFull = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const prevMonthDaysToShow = firstDayIndex;

  // Mock event days (randomized for visual effect in this demo)
  // In a real app, this would check against a database of matches
  const [eventDays] = useState(() => {
      const events = [];
      // Create fake events on random days to look good
      // Ensure we don't error if daysInCurrentMonth is small
      if (daysInCurrentMonth > 5) {
         events.push(Math.min(daysInCurrentMonth, 5));
         events.push(Math.min(daysInCurrentMonth, 15));
         events.push(Math.min(daysInCurrentMonth, 25));
      }
      return events;
  });

  const renderCalendarGrid = () => {
    const days = [];
    
    // Previous month days (faded)
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        days.push(
            <div key={`prev-${dayNum}`} className="h-14 flex items-center justify-center text-slate-300 font-medium">
                {dayNum}
            </div>
        );
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        const isSelected = selectedDay === i;
        const isToday = i === currentDay;
        const hasEvent = eventDays.includes(i);

        days.push(
            <div 
                key={`curr-${i}`} 
                onClick={() => setSelectedDay(i)}
                className="h-14 flex flex-col items-center justify-center relative cursor-pointer"
            >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all
                    ${isSelected ? 'bg-black text-white shadow-lg scale-110' : 'text-slate-800 hover:bg-slate-50'}
                    ${!isSelected && isToday ? 'border border-emerald-500 text-emerald-600' : ''}
                `}>
                    {i}
                </div>
                {hasEvent && !isSelected && (
                    <div className="w-8 h-1 bg-emerald-500 rounded-full mt-1"></div>
                )}
            </div>
        );
    }

    // Next month days to fill the grid rows (display up to 42 cells max to cover 6 weeks)
    const totalCellsSoFar = prevMonthDaysToShow + daysInCurrentMonth;
    const cellsToFill = 42 - totalCellsSoFar; // Fill remaining grid

    for (let i = 1; i <= cellsToFill; i++) {
        days.push(
          <div key={`next-${i}`} className="h-14 flex items-center justify-center text-slate-300 font-medium">
            {i}
          </div>
        );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-widest uppercase">
            {monthNamesShort[currentMonth]} <span className="text-slate-400 ml-1">{currentYear}</span>
        </h1>
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
                  <p className="text-slate-400">{monthNamesFull[currentMonth]}, {currentYear}</p>
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
