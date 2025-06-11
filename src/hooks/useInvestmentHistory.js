import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatISO } from 'date-fns';

export function useInvestmentHistory() {
  const [history, setHistory] = useLocalStorage('investmentHistory', []);

  const addHistoryEntry = (entry) => {
    setHistory(prev => [...prev, {
      ...entry,
      date: formatISO(new Date()) 
    }]);
  };

  const getHistoryForPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return history;
    return history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  };

  const getLatestValues = () => {
    const latest = {};
    history.forEach(entry => {
      if (!latest[entry.date] || new Date(entry.date) > new Date(latest[entry.date])) {
        latest[entry.date] = entry;
      }
    });
    return Object.values(latest);
  };

  return {
    history,
    addHistoryEntry,
    getHistoryForPeriod,
    getLatestValues
  };
}