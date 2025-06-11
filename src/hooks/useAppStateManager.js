// 🔽 CÓDIGO CORRIGIDO - useAppStateManager.js
import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  categories as defaultCategories,
  investmentTypes as defaultInvestmentTypes,
  generateRandomColor,
  generateRandomIcon,
} from '@/data/mockData';
import {
  parseDate,
  getMonthName,
  formatDate,
  formatInputDate,
  getSystemDateISO,
} from '@/utils/formatters';
import { calculateMonthlyContribution } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getMonth,
  getYear as dfnsGetYear,
  addMonths,
  isSameDay,
  subMonths,
  isValid,
} from 'date-fns';

export const useAppStateManager = () => {
  const [transactions, setTransactions] = useLocalStorage('transactions', []);
  const [investments, setInvestments] = useLocalStorage('investments', []);
  const [goals, setGoals] = useLocalStorage('goals', []);
  const [budgets, setBudgets] = useLocalStorage('budgets', []);
  const [categories, setCategories] = useLocalStorage('categories', defaultCategories);
  const [investmentTypes, setInvestmentTypes] = useLocalStorage('investmentTypesList', defaultInvestmentTypes);
  const [accountsPayable, setAccountsPayable] = useLocalStorage('accountsPayable', []);
  const [userDefinedAlerts, setUserDefinedAlerts] = useLocalStorage('dashboardUserAlerts', []);
  const [previousMonthBalance, setPreviousMonthBalance] = useLocalStorage('previousMonthBalance', 0);

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(getSystemDateISO()));
  const [resetPeriod, setResetPeriod] = useState('all');
  const [resetMonth, setResetMonth] = useState(new Date(getSystemDateISO()).getMonth());
  const [resetYear, setResetYear] = useState(new Date(getSystemDateISO()).getFullYear());

  const handleAddTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: transaction.id || uuidv4(),
      date: formatInputDate(transaction.date),
    };
    setTransactions(prev => [...(prev || []), newTransaction]);
  };

  const addInvestment = (newInvestment) => {
    const { name, quantity, unitPrice, date, type, sector } = newInvestment;
    const existingInvestment = investments.find(inv => inv.name === name && inv.type === type);

    const investmentToSave = {
      id: uuidv4(),
      name,
      quantity,
      unitPrice,
      type,
      date: formatInputDate(date),
      sector,
    };

    let updatedInvestments;
    if (existingInvestment) {
      updatedInvestments = investments.map(inv => {
        if (inv.name === name && inv.type === type) {
          return {
            ...inv,
            quantity: inv.quantity + quantity,
            unitPrice: ((inv.unitPrice * inv.quantity) + (unitPrice * quantity)) / (inv.quantity + quantity),
            date: formatInputDate(date),
          };
        }
        return inv;
      });
    } else {
      updatedInvestments = [...investments, investmentToSave];
    }

    setInvestments(updatedInvestments);

    // 🟢 Adiciona transação de despesa referente à nova compra do ativo
    const totalCost = quantity * unitPrice;
    handleAddTransaction({
      id: uuidv4(),
      title: `Compra de ${quantity}x ${name}`,
      type: 'despesa',
      value: totalCost,
      category: 'Investimentos',
      date: formatInputDate(date),
    });
  };

  return {
    transactions,
    setTransactions,
    investments,
    setInvestments,
    addInvestment,
    goals,
    setGoals,
    budgets,
    setBudgets,
    categories,
    setCategories,
    investmentTypes,
    setInvestmentTypes,
    accountsPayable,
    setAccountsPayable,
    userDefinedAlerts,
    setUserDefinedAlerts,
    currentMonthDate,
    setCurrentMonthDate,
    previousMonthBalance,
    setPreviousMonthBalance,
    resetPeriod,
    setResetPeriod,
    resetMonth,
    setResetMonth,
    resetYear,
    setResetYear,
    handleAddTransaction,
  };
};
