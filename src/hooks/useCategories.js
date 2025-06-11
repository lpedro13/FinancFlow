import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { categories as defaultCategories } from '@/data/mockData';

export function useCategories() {
  const [categories, setCategories] = useLocalStorage('categories', defaultCategories);

  const addCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const updateCategory = (categoryId, updates) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  return {
    categories,
    addCategory,
    removeCategory,
    updateCategory
  };
}