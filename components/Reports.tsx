import React, { useState, useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { User, Unavailability, SlotType } from '../types';
import { getUnavailabilities, getUsers } from '../services/storage';
import { Button } from './Button';
import { Download } from 'lucide-react';

interface ReportsProps {
  currentUser: User;
}

export const Reports: React.FC<ReportsProps> = ({ currentUser }) => {
  // Default to current month
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const users = useMemo(() => getUsers(), []);
  const allRecords = useMemo(() => getUnavailabilities(), [startDate, endDate]); // Trigger re-fetch logic if needed, but for localstorage sync straightforward

  const canViewStats = ['admin', 'superuser'].includes(currentUser.role);

  // Generate Report Data
  const reportData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end) || start > end) return [];

    const days = eachDayOfInterval({ start, end });
    const totalDays = days.length;

    // Calculate absence percentages per user globally for the period (Optional extra context, or per cell as requested?)
    // Prompt says: "Celda: usuarios... porcentaje de ausencia (esquina superior)".
    // This implies the percentage is the user's total absence rate up to that point or for the selected period?
    // "Porcentajes de ausencia visibles solo para administradores" usually implies a generic stat.
    // Let's interpret as: User's absence % for the selected range.
    
    const userAbsenceCounts: Record<string, number> = {};
    // Pre-calculate total absences for percentage
    users.forEach(u => userAbsenceCounts[u.id] = 0);
    
    // Count days with ANY unavailability as an absence or count per slot? 
    // Usually "percentage of absence" refers to attendance. 
    // If I miss Matinee, did I miss 33% of the day? Or 1 day?
    // Simplified logic: If user marked ANY slot on a day, count as 1 absence unit for that day for simplicity in a "Calendar" context,
    // OR more granularly. Let's stick to "Days with unavailability / Total Days in range".
    
    allRecords.forEach(r => {
        if (r.date >= startDate && r.date <= endDate) {
             if (userAbsenceCounts[r.userId] !== undefined) {
                 userAbsenceCounts[r.userId]++;
             }
        }
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      
      const getCellContent = (slot: SlotType) => {
        // Find users who have this slot (or 'todo' if slot is not 'todo', because 'todo' covers all)
        // Wait, prompt says columns: Matinée, Vermuth, Noche, Todo.
        // If I select 'todo', do I appear in 'Matinée'?
        // Logic: 
        // Col Matinée: Shows users who explicitly selected Matinée.
        // Col Todo: Shows users who explicitly selected Todo.
        // It's cleaner to keep them exclusive based on selection.
        
        const unavailableUsers = users.filter(user => {
            const record = allRecords.find(r => r.userId === user.id && r.date === dateKey);
            if (!record) return false;
            return record.slots.includes(slot);
        });

        if (unavailableUsers.length === 0) return '-';

        return unavailableUsers.map(u => {
            let label = `${u.name} (${u.id})`;
            if (canViewStats) {
                const pct = ((userAbsenceCounts[u.id] / totalDays) * 100).toFixed(1);
                label += ` ${pct}%`;
            }
            return label;
        }).join(', ');
      };

      return {
        date: dateKey,
        matinee: getCellContent('matinee'),
        vermuth: getCellContent('vermuth'),
        noche: getCellContent('noche'),
        todo: getCellContent('todo')
      };
    });
  }, [startDate, endDate, users, allRecords, canViewStats]);

  const downloadCSV = () => {
    const headers = ['Fecha', 'Matinée (8:00-13:00)', 'Vermuth (13:01-20:00)', 'Noche (20:01-7:59)', 'Día completo (todo)'];
    
    // For CSV, percentages in brackets
    const csvRows = reportData.map(row => {
        const cleanCell = (content: string) => {
            if (content === '-') return '';
            // If viewing stats, the content is "Name (ID) XX%".
            // CSV Requirement: "porcentajes en corchetes solo para administradores".
            // My screen logic produces "Name (ID) XX%". I need to convert to "Name (ID) [XX%]" for CSV if admin.
            // Or just reuse the string but format it nicely.
            if (canViewStats) {
                // Regex to wrap percentage in brackets: 40.0% -> [40.0%]
                return content.replace(/ (\d+\.\d+%)/g, ' [$1]');
            }
            return content;
        };

        return [
            row.date,
            `"${cleanCell(row.matinee)}"`,
            `"${cleanCell(row.vermuth)}"`,
            `"${cleanCell(row.noche)}"`,
            `"${cleanCell(row.todo)}"`
        ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `informe_4uror4_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewStats) {
    return <div className="text-center text-ruby p-4">Acceso denegado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-deep/50 p-4 border border-gold/20">
        <div>
          <label className="block text-gold text-xs uppercase mb-1">Desde</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-deep border border-gold text-gold p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-gold text-xs uppercase mb-1">Hasta</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-deep border border-gold text-gold p-2 text-sm"
          />
        </div>
        <Button onClick={downloadCSV} variant="secondary" className="flex items-center gap-2">
          <Download size={16} /> Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto border border-gold/30">
        <table className="w-full text-sm text-left">
          <thead className="bg-gold text-deep font-deco uppercase text-xs">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Matinée</th>
              <th className="p-3">Vermuth</th>
              <th className="p-3">Noche</th>
              <th className="p-3">Todo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10 text-gray-300">
            {reportData.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">Sin datos o rango inválido.</td></tr>
            ) : (
                reportData.map((row) => (
                <tr key={row.date} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-gold">{row.date}</td>
                    <td className="p-3 border-l border-gold/10">{row.matinee}</td>
                    <td className="p-3 border-l border-gold/10">{row.vermuth}</td>
                    <td className="p-3 border-l border-gold/10">{row.noche}</td>
                    <td className="p-3 border-l border-gold/10 bg-ruby/10">{row.todo}</td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};