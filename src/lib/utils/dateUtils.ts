import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';

export const isOverdue = (dueDate: string | null, completed: boolean): boolean => {
  if (!dueDate || completed) return false;
  return isPast(startOfDay(new Date(dueDate))) && !isToday(new Date(dueDate));
};

export const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
};
