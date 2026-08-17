'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Survey date picker, ported from the inline calendar in
 * kaamasaan-mobile/src/mobile/screens/survey/BookSurveyScreen.tsx.
 *
 * Same rules: a 42-cell grid starting on Sunday, past dates disabled, and the
 * time slot fixed to "To be confirmed by team".
 *
 * Mobile shows it in a modal; on web it is inline — the calendar is the primary
 * decision on the page and a dialog would add a step for no benefit.
 */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getCalendarDays = (monthDate: Date) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDate = new Date(firstDay);
  firstGridDate.setDate(firstDay.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const value = new Date(firstGridDate);
    value.setDate(firstGridDate.getDate() + index);
    return value;
  });
};

export const SurveyDatePicker = ({
  selectedDate,
  onSelect,
  error
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  error?: string;
}) => {
  const today = startOfLocalDay(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() =>
    selectedDate ? startOfLocalDay(selectedDate) : today
  );

  const days = getCalendarDays(visibleMonth);
  const shiftMonth = (delta: number) =>
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1));

  return (
    <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-kaam-navy hover:bg-kaam-surface"
        >
          <ChevronLeft size={18} className="rtl:rotate-180" aria-hidden />
        </button>
        <p className="text-sm font-extrabold text-kaam-navy" aria-live="polite">
          {formatMonthTitle(visibleMonth)}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-kaam-navy hover:bg-kaam-surface"
        >
          <ChevronRight size={18} className="rtl:rotate-180" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-[10px] font-bold uppercase text-kaam-muted">
            {day}
          </span>
        ))}

        {days.map((day) => {
          const inMonth = day.getMonth() === visibleMonth.getMonth();
          const isPast = day < today;
          const isSelected = selectedDate
            ? formatDateKey(day) === formatDateKey(selectedDate)
            : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={formatDisplayDate(day)}
              className={cn(
                'flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                isSelected
                  ? 'bg-kaam-yellow font-extrabold text-kaam-navy'
                  : isPast
                    ? 'cursor-not-allowed text-kaam-muted/40'
                    : inMonth
                      ? 'text-kaam-navy hover:bg-kaam-surface'
                      : 'text-kaam-muted/60 hover:bg-kaam-surface'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-2 text-xs font-bold text-kaam-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
