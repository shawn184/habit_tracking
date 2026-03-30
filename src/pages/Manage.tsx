import React, { useState } from 'react';
import type { HabitFrequency, Habit } from '../types';
import { useHabits } from '../store/HabitContext';
import { Trash2, Edit2 } from 'lucide-react';

export default function ManagePage() {
  const { habits, addHabit, removeHabit, updateHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(1);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [requiresDescription, setRequiresDescription] = useState(false);

  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState(1);
  const [editFrequency, setEditFrequency] = useState<HabitFrequency>('daily');
  const [editRequiresDescription, setEditRequiresDescription] = useState(false);

  const activeHabits = habits.filter(h => h.isActive);

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditTitle(habit.title);
    setEditTarget(habit.target);
    setEditFrequency(habit.frequency);
    setEditRequiresDescription(habit.requiresDescription);
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateHabit(id, {
      title: editTitle.trim(),
      target: editTarget,
      frequency: editFrequency,
      requiresDescription: editRequiresDescription
    });
    setEditingHabitId(null);
  };

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
            <div key={habit.id} className="card glass flex-wrap gap-4" style={{ justifyContent: 'space-between' }}>
              {editingHabitId === habit.id ? (
                <div className="flex flex-col w-full gap-4">
                  <div>
                    <label className="text-secondary text-sm mb-1 block">Habit Name</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-secondary text-sm mb-1 block">Frequency</label>
                      <select
                        className="w-full p-2 rounded glass"
                        style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)' }}
                        value={editFrequency}
                        onChange={e => {
                          setEditFrequency(e.target.value as HabitFrequency);
                          setEditTarget(1);
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-secondary text-sm mb-1 block">Goal</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={editFrequency === 'daily' ? 10 : editFrequency === 'weekly' ? 7 : editFrequency === 'monthly' ? 31 : 90} 
                        value={editTarget} 
                        onChange={e => setEditTarget(Number(e.target.value))} 
                        className="w-24"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={editRequiresDescription} 
                      onChange={e => setEditRequiresDescription(e.target.checked)} 
                    />
                    <span className="text-secondary text-sm">Require a description when marking done</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="btn btn-primary px-4 py-2" onClick={() => saveEdit(habit.id)}>
                      Save
                    </button>
                    <button className="btn px-4 py-2" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-content flex-1 min-w-0">
                    <span className="card-title truncate" style={{ display: 'block' }}>{habit.title}</span>
                    <span className="card-meta">
                      Goal: {habit.target}x / {habit.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn-icon" 
                      onClick={() => startEditing(habit)}
                      title="Edit Habit"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => removeHabit(habit.id)}
                      title="Remove Habit"
                      style={{ color: 'var(--error, #ef4444)' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
