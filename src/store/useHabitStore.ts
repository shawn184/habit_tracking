import { useState, useEffect } from 'react';
import type { Habit, HabitLog } from '../types';

export function useHabitsStore() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('habit-tracker-habits');
      const parsed = saved ? JSON.parse(saved) : [];
      // Migration from weeklyTarget to target and frequency
      return parsed.map((h: any) => {
        if (h.weeklyTarget && !h.frequency) {
          return { ...h, target: h.weeklyTarget, frequency: 'weekly', weeklyTarget: undefined };
        }
        return h;
      });
    } catch { return []; }
  });

  const [logs, setLogs] = useState<HabitLog[]>(() => {
    try {
      const saved = localStorage.getItem('habit-tracker-logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('habit-tracker-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habit-tracker-logs', JSON.stringify(logs));
  }, [logs]);

  const addHabit = (habit: Omit<Habit, 'id' | 'isActive' | 'createdAt' | 'weeklyTarget'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, partial: Partial<Habit>) => {
    setHabits(habits.map(h => (h.id === id ? { ...h, ...partial } : h)));
  };

  const removeHabit = (id: string) => {
    updateHabit(id, { isActive: false, removedAt: new Date().toISOString() });
  };

  const toggleLog = (habitId: string, inputDate: string, description?: string) => {
    const existingLog = logs.find(l => l.habitId === habitId && l.date === inputDate);
    if (existingLog) {
      setLogs(logs.filter(l => l.id !== existingLog.id));
    } else {
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date: inputDate,
        description,
        completedAt: new Date().toISOString(),
      };
      setLogs([...logs, newLog]);
    }
  };

  return {
    habits,
    logs,
    addHabit,
    updateHabit,
    removeHabit,
    toggleLog,
  };
}
