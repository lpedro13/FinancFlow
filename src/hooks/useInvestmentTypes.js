import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { investmentTypes as defaultTypes } from '@/data/mockData';

export function useInvestmentTypes() {
  const [types, setTypes] = useLocalStorage('investmentTypes', defaultTypes);

  const addType = (newType) => {
    setTypes(prev => [...prev, newType]);
  };

  const removeType = (typeId) => {
    setTypes(prev => prev.filter(type => type.id !== typeId));
  };

  const updateType = (typeId, updates) => {
    setTypes(prev => prev.map(type => 
      type.id === typeId ? { ...type, ...updates } : type
    ));
  };

  return {
    types,
    addType,
    removeType,
    updateType
  };
}