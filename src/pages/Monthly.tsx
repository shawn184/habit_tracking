import React, { useState } from 'react';
import { useHabits } from '../store/HabitContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Habit } from '../types';

const HABIT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#14b8a6'
];

export default function MonthlyPage() {
  const { habits, logs } = useHabits();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [popupDate, setPopupDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  // Calculate some padding for the start of the week (if Month starts on wednesday, add 3 empty slots)
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const getHabitColor = (habitId: string) => {
    const index = habits.findIndex(h => h.id === habitId);
    return HABIT_COLORS[Math.max(0, index) % HABIT_COLORS.length];
  };

  const getDayData = (dateStr: string) => {
    if (selectedHabitId === 'all') {
      const logsForDay = logs.filter(l => l.date === dateStr);
      const completedHabits = logsForDay.map(l => habits.find(h => h.id === l.habitId)).filter(Boolean) as Habit[];
      return { count: completedHabits.length, completed: completedHabits, logs: logsForDay };
    } else {
      const matchingLogs = logs.filter(l => l.habitId === selectedHabitId && l.date === dateStr);
      const hasLog = matchingLogs.length > 0;
      const completedHabits = hasLog ? [habits.find(h => h.id === selectedHabitId)].filter(Boolean) as Habit[] : [];
      return { count: hasLog ? 1 : 0, completed: completedHabits, logs: matchingLogs };
    }
  };

  // Get full day data for the popup
  const getFullDayData = (dateStr: string) => {
    const logsForDay = logs.filter(l => l.date === dateStr);
    return logsForDay.map(l => {
      const habit = habits.find(h => h.id === l.habitId);
      return { habit, log: l };
    }).filter(item => item.habit);
  };

  const activeHabits = habits.filter(h => h.isActive || logs.some(l => l.habitId === h.id));

  const handleDayClick = (dateStr: string) => {
    setPopupDate(dateStr);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient">Monthly View</h1>
      <p className="mb-6 text-secondary">Track your consistency.</p>

      <div className="card glass flex-col items-center">
        <div className="flex justify-between items-center w-full mb-6">
          <button className="btn-icon" onClick={prevMonth}><ChevronLeft /></button>
          <h2>{format(currentDate, 'MMMM yyyy')}</h2>
          <button className="btn-icon" onClick={nextMonth}><ChevronRight /></button>
        </div>

        <select 
          className="w-full mb-6 p-2 rounded glass" 
          style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)' }}
          value={selectedHabitId}
          onChange={e => setSelectedHabitId(e.target.value)}
        >
          <option value="all">Check Any Habit Done</option>
          {activeHabits.map(h => (
            <option key={h.id} value={h.id}>{h.title} {!h.isActive ? '(Removed)' : ''}</option>
          ))}
        </select>

        <div className="w-full">
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-secondary font-medium">{d}</span>
            ))}
          </div>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {emptyDays.map(d => (
              <div key={`empty-${d}`} className="rounded" style={{aspectRatio: '1', background: 'transparent'}} />
            ))}
            {daysInMonth.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayData = getDayData(dateStr);
              const status = dayData.count;
              
              // Calculate opacity based on intensity
              let bg = 'rgba(255, 255, 255, 0.05)';
              if (selectedHabitId !== 'all') {
                if (status > 0) {
                  const habitColor = getHabitColor(selectedHabitId);
                  bg = `${habitColor}33`;
                }
              } else {
                if (status > 0) bg = `rgba(139, 92, 246, ${Math.min(0.2 + (status * 0.15), 1)})`;
              }

              return (
                <div 
                  key={day.toISOString()} 
                  className="monthly-day-cell rounded flex flex-col items-center justify-start overflow-hidden p-[2px]"
                  style={{ aspectRatio: '1', background: bg, border: '1px solid var(--surface-border)', cursor: 'pointer' }}
                  title={status > 0 ? dayData.completed.map(h => h.title).join(', ') : 'None'}
                  onClick={() => handleDayClick(dateStr)}
                >
                  <span className="font-medium" style={{ fontSize: '0.85rem' }}>{format(day, 'd')}</span>
                  {status > 0 && (
                    <div className="flex flex-col w-full items-center gap-[1px] overflow-hidden mt-1 px-1">
                      {dayData.completed.slice(0, 3).map((habit, i) => (
                        <span 
                          key={i} 
                          className="w-full rounded"
                          style={{ 
                            background: getHabitColor(habit.id),
                            fontSize: '10px',
                            lineHeight: '1',
                            color: 'rgba(255, 255, 255, 0.9)',
                            textAlign: 'center',
                            padding: '2px 4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {habit.title}
                        </span>
                      ))}
                      {dayData.completed.length > 3 && (
                        <span className="text-[10px] leading-tight text-white/70">
                          +{dayData.completed.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day detail popup */}
      {popupDate && (
        <div className="modal-overlay" onClick={() => setPopupDate(null)}>
          <div className="modal glass p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', maxHeight: '80vh', overflow: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ marginBottom: 0 }}>{format(new Date(popupDate + 'T00:00:00'), 'EEEE, MMMM do')}</h2>
              <button className="btn-icon" onClick={() => setPopupDate(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            {(() => {
              const dayItems = getFullDayData(popupDate);
              if (dayItems.length === 0) {
                return (
                  <p className="text-secondary text-center" style={{ padding: '2rem 0' }}>
                    No habits completed on this day.
                  </p>
                );
              }
              return (
                <div className="flex flex-col gap-2">
                  {dayItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="monthly-popup-item"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--border-radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--surface-border)',
                      }}
                    >
                      <div 
                        style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: getHabitColor(item.habit!.id),
                          flexShrink: 0 
                        }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{item.habit!.title}</div>
                        {item.log.description && (
                          <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                            {item.log.description}
                          </div>
                        )}
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {item.habit!.frequency} • target: {item.habit!.target}x
                        </div>
                      </div>
                      <div style={{ 
                        color: 'var(--success)', 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        flexShrink: 0 
                      }}>
                        ✓ Done
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
