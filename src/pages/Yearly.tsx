import React from 'react';
import { useHabits } from '../store/HabitContext';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInQuarters, parseISO, startOfYear } from 'date-fns';
import type { Habit } from '../types';

export default function YearlyPage() {
  const { habits, logs } = useHabits();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const calculateYearlyRate = (habit: Habit) => {
    const createdAt = parseISO(habit.createdAt);
    
    // Bounds check for the year
    if (createdAt.getFullYear() > currentYear) {
      return { fulfilledLogs: 0, expectedLogs: 0, percentage: 0, periodsActive: 0, periodName: 'Periods' };
    }
    
    let removedAt = habit.removedAt ? parseISO(habit.removedAt) : null;
    if (removedAt && removedAt.getFullYear() < currentYear) {
      return { fulfilledLogs: 0, expectedLogs: 0, percentage: 0, periodsActive: 0, periodName: 'Periods' };
    }

    const start = createdAt.getFullYear() < currentYear ? startOfYear(today) : createdAt;
    let end = today;
    if (removedAt && removedAt.getTime() < today.getTime()) {
      end = removedAt;
    }

    // find total logs in current year
    const yearlyLogs = logs.filter(l => {
      if (l.habitId !== habit.id) return false;
      const logYear = parseInt(l.date.split('-')[0], 10);
      return logYear === currentYear;
    });

    let periodsActive = 1;
    let periodName = 'Weeks';
    let expectedLogs = 0;
    let fulfilledLogs = 0;
    let percentage = 0;
    let countLabel = 'Total Logs';

    if (habit.frequency === 'daily') {
      periodsActive = Math.max(1, differenceInDays(end, start) + 1);
      periodName = 'Days';
      expectedLogs = periodsActive * habit.target;
      fulfilledLogs = yearlyLogs.length;
      countLabel = 'Total Logs';
      const percentageVal = expectedLogs > 0 ? (fulfilledLogs / expectedLogs) * 100 : 0;
      percentage = Number(percentageVal.toFixed(2));
    } else {
      const periodCounts: Record<string, number> = {};
      yearlyLogs.forEach(l => {
        const date = parseISO(l.date);
        let key = '';
        if (habit.frequency === 'weekly') {
          key = format(date, 'w'); // week
        } else if (habit.frequency === 'monthly') {
          key = format(date, 'M'); // month
        } else if (habit.frequency === 'quarterly') {
          key = format(date, 'Q'); // quarter
        }
        if (key) {
          periodCounts[key] = (periodCounts[key] || 0) + 1;
        }
      });

      fulfilledLogs = 0;
      Object.values(periodCounts).forEach(count => {
        if (count >= habit.target) {
          fulfilledLogs++;
        }
      });

      if (habit.frequency === 'weekly') {
        periodsActive = Math.max(1, differenceInWeeks(end, start));
        periodName = 'Weeks';
      } else if (habit.frequency === 'monthly') {
        periodsActive = Math.max(1, differenceInMonths(end, start));
        periodName = 'Months';
      } else if (habit.frequency === 'quarterly') {
        periodsActive = Math.max(1, differenceInQuarters(end, start));
        periodName = 'Quarters';
      }

      expectedLogs = periodsActive;
      countLabel = 'Goals Met';
      const percentageVal = expectedLogs > 0 ? (fulfilledLogs / expectedLogs) * 100 : 0;
      percentage = Number(percentageVal.toFixed(2));
    }

    return {
      fulfilledLogs,
      expectedLogs,
      percentage: Math.min(percentage, 100),
      periodsActive,
      periodName,
      countLabel
    };
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient">Yearly Stats</h1>
      <p className="mb-6 text-secondary">{currentYear} Achievement Rate</p>

      {habits.length === 0 ? (
        <div className="card glass">
          <p className="text-center w-full text-secondary">No recorded data yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="card glass flex-col items-center justify-center p-8 mb-4 border-[rgba(139,92,246,0.5)]" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <h2 className="mb-2">Total Year Progress</h2>
            <p className="text-center text-sm text-secondary max-w-[280px]">
              Rate is calculated based on logs tracked vs target required since habit creation this year.
            </p>
          </div>

          {habits.map(habit => {
            const stats = calculateYearlyRate(habit);
            if (stats.expectedLogs === 0) return null; // Created in future or fully removed loop

            return (
              <div key={habit.id} className="card glass flex-col" style={{ alignItems: 'flex-start' }}>
                <div className="flex justify-between w-full mb-3">
                  <span className="card-title">{habit.title} {!habit.isActive ? '(Removed)' : ''}</span>
                  <span className="text-xl font-bold text-gradient">{stats.percentage}%</span>
                </div>
                
                <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-4 overflow-hidden mb-3">
                  <div 
                    className="h-full transition-all ease-out duration-1000"
                    style={{ 
                      width: `${stats.percentage}%`,
                      background: stats.percentage >= 80 ? 'var(--success)' : stats.percentage >= 50 ? '#f59e0b' : 'var(--danger)',
                      boxShadow: stats.percentage >= 80 ? '0 0 10px var(--success-glow)' : 'none' 
                    }}
                  />
                </div>

                <div className="flex justify-between w-full text-sm text-secondary">
                  <span>{stats.fulfilledLogs} / {stats.expectedLogs} {stats.countLabel}</span>
                  <span>{stats.periodsActive} Active {stats.periodName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
