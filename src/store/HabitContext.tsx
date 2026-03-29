import React, { createContext, useContext, type ReactNode } from 'react';
import { useHabitsStore } from './useHabitStore';
import type { Habit, HabitLog } from '../types';

type HabitsContextType = {
  habits: Habit[];
  logs: HabitLog[];
  addHabit: (habit: Omit<Habit, 'id' | 'isActive' | 'createdAt'>) => void;
  updateHabit: (id: string, partial: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string, description?: string) => void;
};

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const store = useHabitsStore();
  return (
    <HabitsContext.Provider value={store}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}
