import React from 'react';
import { useHabits } from '../store/HabitContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { CheckCircle } from 'lucide-react';

export default function WeeklyPage() {
  const { habits, logs } = useHabits();
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get habits that are active or have logs in this week, only for daily/weekly frequencies
  const weeklyHabits = habits.filter(h => {
    if (h.frequency !== 'daily' && h.frequency !== 'weekly') return false;
    if (h.isActive) return true;
    const hasLogsThisWeek = logs.some(l => 
      l.habitId === h.id && 
      isWithinInterval(new Date(l.date), { start: weekStart, end: weekEnd })
    );
    return hasLogsThisWeek;
  });

  const getWeekProgress = (habitId: string) => {
    return logs.filter(l => 
      l.habitId === habitId && 
      isWithinInterval(new Date(l.date), { start: weekStart, end: weekEnd })
    ).length;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient">Weekly Progress</h1>
      <p className="mb-6 text-secondary">
        {format(weekStart, 'MMM do')} - {format(weekEnd, 'MMM do, yyyy')}
      </p>

      {weeklyHabits.length === 0 ? (
        <div className="card glass">
          <p className="text-center w-full text-secondary">No habits tracked this week.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {weeklyHabits.map(habit => {
            const progress = getWeekProgress(habit.id);
            const expectedTarget = habit.frequency === 'daily' ? habit.target * 7 : habit.target;
            const achieved = progress >= expectedTarget;
            const percentage = Math.min((progress / expectedTarget) * 100, 100);

            return (
              <div key={habit.id} className="card glass flex-col" style={{ alignItems: 'flex-start' }}>
                <div className="flex justify-between w-full mb-4">
                  <div>
                    <span className="card-title block">{habit.title} {!habit.isActive ? '(Removed)' : ''}</span>
                    <span className="card-meta">{progress} / {expectedTarget} times this week</span>
                  </div>
                  {achieved && (
                    <div className="flex items-center gap-2 text-[var(--success)] bg-[rgba(16,185,129,0.1)] px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle size={16} />
                      Achieved
                    </div>
                  )}
                </div>

                <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary)] transition-all ease-out duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      boxShadow: '0 0 10px var(--primary-glow)' 
                    }}
                  />
                </div>
                
                <div className="flex justify-between w-full mt-4 text-xs text-secondary">
                  {daysInWeek.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const hasLog = logs.some(l => l.habitId === habit.id && l.date === dateStr);
                    return (
                      <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                        <span>{format(day, 'E')}</span>
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-medium
                            ${hasLog ? 'bg-[var(--primary)] text-white' : 'bg-[rgba(255,255,255,0.05)] text-transparent'}`}
                          style={{ border: hasLog ? 'none' : '1px solid var(--surface-border)' }}
                        >
                          {hasLog ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
