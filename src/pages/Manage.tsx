import React, { useState } from 'react';
import type { HabitFrequency } from '../types';
import { useHabits } from '../store/HabitContext';
import { Trash2 } from 'lucide-react';

export default function ManagePage() {
  const { habits, addHabit, removeHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(1);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [requiresDescription, setRequiresDescription] = useState(false);

  const activeHabits = habits.filter(h => h.isActive);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addHabit({
      title: title.trim(),
      target,
      frequency,
      requiresDescription,
    });
    setTitle('');
    setTarget(1);
    setFrequency('daily');
    setRequiresDescription(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient">Manage Habits</h1>
      
      <div className="card glass mt-8">
        <form onSubmit={handleAdd} className="flex flex-col gap-4 w-full">
          <h2>Add New Habit</h2>
          <div>
            <label className="text-secondary mb-2 block">Habit Name</label>
            <input 
              type="text" 
              placeholder="e.g. Read 10 pages" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-secondary mb-2 block">Frequency</label>
            <select
              className="w-full p-2 rounded glass mb-4"
              style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)' }}
              value={frequency}
              onChange={e => {
                setFrequency(e.target.value as HabitFrequency);
                // Reset target to 1 to avoid invalid states like 7x/quarterly when they meant 1x/quarterly
                setTarget(1);
              }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="text-secondary mb-2 block">
              {frequency === 'daily' ? 'Target times per day (usually 1)' :
               frequency === 'weekly' ? 'Target times per week' :
               frequency === 'monthly' ? 'Target times per month' :
               'Target times per quarter'}
            </label>
            <input 
              type="number" 
              min="1" 
              max={frequency === 'daily' ? 10 : frequency === 'weekly' ? 7 : frequency === 'monthly' ? 31 : 90} 
              value={target} 
              onChange={e => setTarget(Number(e.target.value))} 
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              className="custom-checkbox" 
              checked={requiresDescription} 
              onChange={e => setRequiresDescription(e.target.checked)} 
            />
            <span className="text-secondary">Require a description when marking done</span>
          </div>
          <button type="submit" className="btn btn-primary mt-4">Create Habit</button>
        </form>
      </div>

      <h2 className="mt-8 mb-4 text-gradient">Your Habits</h2>
      {activeHabits.length === 0 ? (
        <p className="text-secondary">No active habits right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeHabits.map(habit => (
            <div key={habit.id} className="card glass justify-between">
              <div className="card-content">
                <span className="card-title">{habit.title}</span>
                <span className="card-meta">
                  Goal: {habit.target}x / {habit.frequency}
                </span>
              </div>
              <button 
                className="btn-icon" 
                onClick={() => removeHabit(habit.id)}
                title="Remove Habit"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
