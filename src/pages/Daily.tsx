import React, { useState } from 'react';
import { useHabits } from '../store/HabitContext';
import type { Habit } from '../types';
import { format, subDays, addDays, isToday, isFuture, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DailyPage() {
  const { habits, logs, toggleLog } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(currentDate);

  const openDatePicker = () => {
    setCalendarMonth(currentDate);
    setShowDatePicker(true);
  };

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const isCurrentDay = isToday(currentDate);

  const goToPrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => {
    const next = addDays(currentDate, 1);
    if (!isFuture(next) || isToday(next)) {
      setCurrentDate(next);
    }
  };
  const goToToday = () => setCurrentDate(new Date());

  // Filter habits that are either active or have a log on the selected date
  const dailyHabits = habits.filter(h => h.isActive || logs.some(l => l.habitId === h.id && l.date === dateStr));

  const handleToggle = (habitId: string, requiresDesc: boolean) => {
    const isCompleted = logs.some(l => l.habitId === habitId && l.date === dateStr);
    if (!isCompleted && requiresDesc) {
      setSelectedHabitId(habitId);
      setDescription('');
    } else {
      toggleLog(habitId, dateStr);
    }
  };

  const handleSaveDescription = () => {
    if (selectedHabitId) {
      toggleLog(selectedHabitId, dateStr, description);
      setSelectedHabitId(null);
    }
  };

  const dailyFreqHabits = dailyHabits.filter(h => h.frequency === 'daily');
  const weeklyFreqHabits = dailyHabits.filter(h => h.frequency === 'weekly');
  const monthlyFreqHabits = dailyHabits.filter(h => h.frequency === 'monthly');
  const quarterlyFreqHabits = dailyHabits.filter(h => h.frequency === 'quarterly');

  // Check if next day navigation should be disabled
  const nextDayDate = addDays(currentDate, 1);
  const canGoNext = !isFuture(nextDayDate) || isToday(nextDayDate);

  const renderSection = (title: string, habitsList: Habit[]) => {
    if (habitsList.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-secondary mb-4 text-lg">{title}</h2>
        <div className="flex flex-col gap-4">
          {habitsList.map(habit => {
            const logForDay = logs.find(l => l.habitId === habit.id && l.date === dateStr);
            const isCompleted = !!logForDay;

            return (
              <div 
                key={habit.id} 
                className="card glass" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggle(habit.id, habit.requiresDescription)}
              >
                <div className="card-content">
                  <span className="card-title">{habit.title}</span>
                  {logForDay?.description && (
                    <span className="card-meta">Note: {logForDay.description}</span>
                  )}
                  {!isCurrentDay && isCompleted && (
                    <span className="card-meta" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>
                      Tap to remove log
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isCompleted}
                  style={{ pointerEvents: 'none' }}
                  readOnly
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Date navigation header */}
      <div className="daily-date-nav">
        <button className="btn-icon" onClick={goToPrevDay} aria-label="Previous day">
          <ChevronLeft />
        </button>
        <div className="daily-date-center" onClick={openDatePicker} style={{ cursor: 'pointer' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            {isCurrentDay ? 'Today' : format(currentDate, 'MMM d, yyyy')}
          </h1>
          <p className="text-secondary" style={{ margin: 0 }}>
            {format(currentDate, 'EEEE, MMMM do, yyyy')}
          </p>
          <span className="daily-today-hint">Tap to select date</span>
        </div>
        <button 
          className="btn-icon" 
          onClick={goToNextDay} 
          disabled={!canGoNext}
          aria-label="Next day"
          style={{ opacity: canGoNext ? 1 : 0.3, cursor: canGoNext ? 'pointer' : 'default' }}
        >
          <ChevronRight />
        </button>
      </div>

      {dailyHabits.length === 0 ? (
        <div className="card glass">
          <p className="text-center w-full text-secondary">No habits to display. Go to Manage to add some!</p>
        </div>
      ) : (
        <div>
          {renderSection('Daily Habits', dailyFreqHabits)}
          {renderSection('Weekly Habits', weeklyFreqHabits)}
          {renderSection('Monthly Habits', monthlyFreqHabits)}
          {renderSection('Quarterly Habits', quarterlyFreqHabits)}
        </div>
      )}

      {showDatePicker && (
        <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="modal glass p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <button className="btn-icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                <ChevronLeft />
              </button>
              <h2 className="text-lg m-0" style={{ marginBottom: 0 }}>{format(calendarMonth, 'MMMM yyyy')}</h2>
              <button 
                className="btn-icon" 
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                disabled={isSameMonth(calendarMonth, new Date()) || isFuture(addMonths(calendarMonth, 1))}
                style={{ opacity: (isSameMonth(calendarMonth, new Date()) || isFuture(addMonths(calendarMonth, 1))) ? 0.3 : 1 }}
              >
                <ChevronRight />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-secondary text-sm font-bold py-1">{day}</div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(calendarMonth)),
                end: endOfWeek(endOfMonth(calendarMonth))
              }).map(day => {
                const isCurrentMonth = isSameMonth(day, calendarMonth);
                const isSelected = isSameDay(day, currentDate);
                const isTodayDate = isToday(day);
                const isDisabled = isFuture(day) && !isTodayDate;
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => {
                      if (!isDisabled) {
                        setCurrentDate(day);
                        setShowDatePicker(false);
                      }
                    }}
                    disabled={isDisabled}
                    style={{ 
                      aspectRatio: '1',
                      borderRadius: '8px',
                      border: isTodayDate && !isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      opacity: !isCurrentMonth ? 0.4 : (isDisabled ? 0.2 : 1),
                      cursor: isDisabled ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      boxShadow: isSelected ? '0 0 10px rgba(249,115,22,0.4)' : 'none'
                    }}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-6 flex justify-between gap-2">
              <button className="btn" onClick={() => { setCurrentDate(new Date()); setShowDatePicker(false); }}>Go to Today</button>
              <button className="btn btn-primary" onClick={() => setShowDatePicker(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedHabitId && (
        <div className="modal-overlay">
          <div className="modal glass p-6">
            <h2 className="mb-4">Add a Note</h2>
            <p className="mb-4 text-secondary">This habit requires a description/note.</p>
            <input
              type="text"
              className="mb-4"
              placeholder="How did it go?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-between">
              <button className="btn" onClick={() => setSelectedHabitId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveDescription}>Mark Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
