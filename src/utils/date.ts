import { format, isToday, isYesterday } from 'date-fns';

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatRecentDayLabel(date: Date, dateFormat = 'MMM d'): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, dateFormat);
}
