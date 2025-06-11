import { format, parseISO, isValid as isValidDateFns } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const TIME_ZONE = 'America/Sao_Paulo'; // UTC-03:00

export const getZonedDate = (dateInput) => {
  if (!dateInput) return new Date(NaN);
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValidDateFns(date)) return new Date(NaN);
  return utcToZonedTime(date, TIME_ZONE);
};

export const formatCurrency = (value, short = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  }
  if (short) {
    if (Math.abs(value) >= 1e6) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 1e6) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 1e3) + 'k';
    }
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const parseDate = (dateString) => {
  if (!dateString) return new Date(NaN);
  try {
    const date = parseISO(dateString);
    return isValidDateFns(date) ? date : new Date(NaN);
  } catch (error) {
    return new Date(NaN);
  }
};

export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return 'Data inválida';
  
  const date = getZonedDate(dateInput);

  if (!isValidDateFns(date)) return 'Data inválida';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  let formatString = 'dd/MM/yyyy';
  if (options.month === 'short' && options.year === '2-digit') {
    formatString = 'dd MMM yy';
  } else if (options.month === 'short') {
     formatString = 'dd MMM yyyy';
  } else if (options.year === '2-digit') {
     formatString = 'dd/MM/yy';
  } else if (options.dateStyle === 'short') {
    formatString = 'dd/MM/yy';
  } else if (options.year && options.month && !options.day) {
    formatString = 'MM/yyyy';
  } else if (options.dateStyle === 'full' && options.timeStyle === 'short') {
    formatString = 'PPPPp';
  }


  try {
    return format(date, formatString, { locale: ptBR, timeZone: TIME_ZONE });
  } catch (error) {
    return 'Data inválida';
  }
};

export const formatInputDate = (dateStringOrDate) => {
  if (!dateStringOrDate) return '';
  try {
    const date = getZonedDate(dateStringOrDate);
    if (!isValidDateFns(date)) return '';
    return format(date, 'yyyy-MM-dd', { timeZone: TIME_ZONE });
  } catch (error) {
    return '';
  }
};


export const formatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const getMonthName = (monthIndex) => {
  const date = new Date(2000, monthIndex, 1); // Use a fixed year to avoid DST issues with month names
  return format(date, 'MMMM', { locale: ptBR, timeZone: TIME_ZONE });
};

export const getShortMonthName = (monthIndex) => {
  const date = new Date(2000, monthIndex, 1);
  return format(date, 'MMM', { locale: ptBR, timeZone: TIME_ZONE });
};

export const getYear = (dateString) => {
  if (!dateString) return '';
  try {
    const date = getZonedDate(dateString);
    if (!isValidDateFns(date)) return '';
    return format(date, 'yyyy', { timeZone: TIME_ZONE });
  } catch (error) {
    return '';
  }
};

export const getSystemDate = () => {
  return utcToZonedTime(new Date(), TIME_ZONE);
};

export const getSystemDateISO = () => {
  return getSystemDate().toISOString().split('T')[0];
};