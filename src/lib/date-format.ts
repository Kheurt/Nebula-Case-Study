import { format } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'MMM d');
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDateShort(start)} – ${formatDate(end)}`;
}
