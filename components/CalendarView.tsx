import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  isAfter, 
  startOfToday,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { SlotType, Unavailability, User, SLOTS } from '../types';
import { getUnavailabilities, setUnavailability } from '../services/storage';
import { MAX_MONTHS_AHEAD, formatDateKey } from '../constants';
import { Button } from './Button';
import { Card } from './Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [tempSlots, setTempSlots] = useState<SlotType[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Refresh data
  const refreshData = () => {
    setUnavailabilities(getUnavailabilities());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const maxDate = addMonths(new Date(), MAX_MONTHS_AHEAD);

  const handleDateClick = (day: Date) => {
    if (isAfter(day, maxDate)) {
      setErrorMsg('No puede marcar indisponibilidad para más de 6 meses en el futuro');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    
    // Check if it's in the past (optional, but logical for unavailability)
    // Assuming users can't change past availability
    if (isAfter(startOfToday(), day)) {
         // Allow viewing past but maybe warn? For now let's allow it as per requirements not forbidding it strictly
    }

    const dateKey = formatDateKey(day);
    const existing = unavailabilities.find(u => u.userId === currentUser.id && u.date === dateKey);
    
    setTempSlots(existing ? existing.slots : []);
    setSelectedDate(day);
  };

  const toggleSlot = (slot: SlotType) => {
    let newSlots = [...tempSlots];
    
    if (slot === 'todo') {
      // If 'todo' is clicked:
      // If it was already selected, deselect it.
      // If it wasn't, select ONLY 'todo' (clear others).
      if (newSlots.includes('todo')) {
        newSlots = [];
      } else {
        newSlots = ['todo'];
      }
    } else {
      // If specific slot clicked
      // Remove 'todo' if present
      newSlots = newSlots.filter(s => s !== 'todo');
      
      if (newSlots.includes(slot)) {
        newSlots = newSlots.filter(s => s !== slot);
      } else {
        newSlots.push(slot);
      }
    }
    setTempSlots(newSlots);
  };

  const saveSlots = () => {
    if (!selectedDate) return;
    const dateKey = formatDateKey(selectedDate);
    
    // Sort logic handled visually, order doesn't matter for storage strictly but good for consistency
    // If 'todo' is present, it should be the only one, but verify just in case
    const finalSlots = tempSlots.includes('todo') ? ['todo'] : tempSlots;

    const res = setUnavailability(currentUser.id, dateKey, finalSlots as SlotType[]);
    if (res.success) {
      refreshData();
      setSelectedDate(null);
    }
  };

  // Helper to get status color for a day
  const getDayStatus = (day: Date) => {
    const dateKey = formatDateKey(day);
    const record = unavailabilities.find(u => u.userId === currentUser.id && u.date === dateKey);
    if (!record || record.slots.length === 0) return null;
    if (record.slots.includes('todo')) return 'bg-ruby text-white';
    return 'bg-bishop text-white'; // Partial unavailability
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-ruby text-white p-3 text-center animate-pulse border border-white">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gold hover:text-white transition-colors">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-2xl font-deco text-gold uppercase tracking-widest">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gold hover:text-white transition-colors">
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="text-center text-gold/60 font-deco text-sm">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
            // Check padding for first day grid alignment
            const dayIdx = day.getDay();
            const gridColStart = isSameDay(day, startOfMonth(currentDate)) ? `col-start-${dayIdx + 1}` : '';
            const statusClass = getDayStatus(day);
            const isToday = isSameDay(day, new Date());
            const isDisabled = isAfter(day, maxDate);

            return (
              <div 
                key={day.toISOString()} 
                className={`${gridColStart} aspect-square relative group`}
              >
                <button
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`
                    w-full h-full border border-gold/20 flex flex-col items-center justify-center transition-all
                    ${statusClass ? statusClass : 'hover:bg-gold/10 text-gray-300'}
                    ${isToday ? 'ring-2 ring-gold' : ''}
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                >
                  <span className={`font-bold ${statusClass ? 'text-white' : 'text-gold'}`}>{format(day, 'd')}</span>
                  {statusClass && <span className="text-[10px] mt-1 uppercase opacity-80">{statusClass.includes('ruby') ? 'Todo' : 'Parcial'}</span>}
                </button>
              </div>
            );
        })}
      </div>

      <div className="flex justify-center gap-4 text-xs text-gold/70 mt-4">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-bishop"></span> Parcial</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-ruby"></span> Todo</div>
      </div>

      {/* Slots Selection Modal/Overlay */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg" title={`Disponibilidad: ${format(selectedDate, 'dd/MM/yyyy')}`}>
            <div className="space-y-4">
              <p className="text-center text-gray-300 mb-4">Seleccione los horarios en los que <span className="text-ruby font-bold">NO</span> podrá asistir.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {SLOTS.map((slot) => {
                  const isSelected = tempSlots.includes(slot.key);
                  return (
                    <button
                      key={slot.key}
                      onClick={() => toggleSlot(slot.key)}
                      className={`
                        p-4 border transition-all duration-300 flex justify-between items-center group
                        ${isSelected 
                          ? 'bg-gold text-deep border-gold' 
                          : 'bg-transparent text-gold border-gold/40 hover:border-gold'}
                      `}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-deco font-bold uppercase tracking-wider">{slot.label}</span>
                        <span className={`text-xs ${isSelected ? 'text-deep/70' : 'text-gold/60'}`}>{slot.time}</span>
                      </div>
                      <div className={`w-4 h-4 border ${isSelected ? 'bg-deep border-deep' : 'border-gold'}`}></div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gold/20">
                <Button variant="ghost" onClick={() => setSelectedDate(null)} className="flex-1">Cancelar</Button>
                <Button onClick={saveSlots} className="flex-1">Guardar Cambios</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};