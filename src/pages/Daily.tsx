import React, { useState } from 'react';
import { useHabits } from '../store/HabitContext';
import type { Habit } from '../types';
import { format } from 'date-fns';

export default function DailyPage() {
  const { habits, logs, toggleLog } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter habits that are either active or have a log today
  const dailyHabits = habits.filter(h => h.isActive || logs.some(l => l.habitId === h.id && l.date === today));

  const handleToggle = (habitId: string, requiresDesc: boolean) => {
    const isCompleted = logs.some(l => l.habitId === habitId && l.date === today);
    if (!isCompleted && requiresDesc) {
      setSelectedHabitId(habitId);
      setDescription('');
    } else {
      toggleLog(habitId, today);
    }
  };

  const handleSaveDescription = () => {
    if (selectedHabitId) {
      toggleLog(selectedHabitId, today, description);
      setSelectedHabitId(null);
    }
  };

  const dailyFreqHabits = dailyHabits.filter(h => h.frequency === 'daily');
  const weeklyFreqHabits = dailyHabits.filter(h => h.frequency === 'weekly');
  const monthlyFreqHabits = dailyHabits.filter(h => h.frequency === 'monthly');
  const quarterlyFreqHabits = dailyHabits.filter(h => h.frequency === 'quarterly');

  const renderSection = (title: string, habitsList: Habit[]) => {
    if (habitsList.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-secondary mb-4 text-lg">{title}</h2>
        <div className="flex flex-col gap-4">
          {habitsList.map(habit => {
            const logForToday = logs.find(l => l.habitId === habit.id && l.date === today);
            const isCompleted = !!logForToday;

            return (
              <div key={habit.id} className="card glass">
                <div className="card-content">
                  <span className="card-title">{habit.title}</span>
                  {logForToday?.description && (
                    <span className="card-meta">Note: {logForToday.description}</span>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggle(habit.id, habit.requiresDescription)}
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
      <h1 className="text-gradient">Today</h1>
      <p className="mb-6 text-secondary">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>

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
