export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export type Habit = {
  id: string;
  title: string;
  target: number; // e.g., 3 means 3 times a frequency period
  frequency: HabitFrequency;
  weeklyTarget?: number; // legacy support, to be migrated out
  requiresDescription: boolean;
  isActive: boolean;
  createdAt: string; // ISO format
  removedAt?: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  description?: string;
  completedAt: string; // ISO format
};
