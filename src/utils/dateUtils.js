import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateFull = (date) => {
  return format(new Date(date), 'PPP', { locale: ptBR });
};

export const formatMonthYear = (date) => {
  return format(new Date(date), 'MMMM yyyy', { locale: ptBR });
};

export const getDateRange = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      return {
        start: startOfDay(now),
        end: endOfDay(now)
      };
    case 'monthly':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case '3months':
      return {
        start: startOfMonth(subMonths(now, 3)),
        end: endOfMonth(now)
      };
    case '6months':
      return {
        start: startOfMonth(subMonths(now, 6)),
        end: endOfMonth(now)
      };
    case '1year':
      return {
        start: startOfMonth(subMonths(now, 12)),
        end: endOfMonth(now)
      };
    default:
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
  }
};