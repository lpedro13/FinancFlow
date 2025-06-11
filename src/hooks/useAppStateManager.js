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
  const [categories, setCategories] = useLocalStorage(
    'categories',
    defaultCategories
  );
  const [reminders, setReminders] = useLocalStorage('reminders', []);
  const [investmentTypes] = useState(defaultInvestmentTypes);
  const [filters, setFilters] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    category: '',
  });

  const handleAddTransaction = (transaction) => {
    const formattedTransaction = {
      ...transaction,
      id: uuidv4(),
      date: formatInputDate(transaction.date || getSystemDateISO()),
    };
    setTransactions((prev) => [...prev, formattedTransaction]);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddInvestment = (investment) => {
    const newInvestment = {
      ...investment,
      id: investment.id || uuidv4(),
      date: formatInputDate(investment.date || getSystemDateISO()),
    };

    setInvestments((prev) => [...(prev || []), newInvestment]);

    const expenseTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: newInvestment.totalInvested,
      description: `Investimento em ${newInvestment.name}`,
      category: 'Investimentos',
      date: newInvestment.date,
    };

    handleAddTransaction(expenseTransaction);
  };

  const handleUpdateInvestment = (updatedInvestment) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === updatedInvestment.id ? updatedInvestment : inv))
    );
  };

  const handleDeleteInvestment = (id) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleAddGoal = (goal) => {
    const newGoal = { ...goal, id: uuidv4(), color: generateRandomColor() };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoal = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const handleAddReminder = (reminder) => {
    const newReminder = { ...reminder, id: uuidv4() };
    setReminders((prev) => [...prev, newReminder]);
  };

  const handleUpdateReminder = (updatedReminder) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r))
    );
  };

  const handleDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: uuidv4(),
      color: generateRandomColor(),
      icon: generateRandomIcon(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const handleUpdateBudget = (updatedBudget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  };

  const handleDeleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const resetData = () => {
    setTransactions([]);
    setInvestments([]);
    setGoals([]);
    setBudgets([]);
    setCategories(defaultCategories);
    setReminders([]);
  };

  return {
    transactions,
    investments,
    goals,
    budgets,
    categories,
    reminders,
    investmentTypes,
    filters,
    setFilters,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleAddInvestment,
    handleUpdateInvestment,
    handleDeleteInvestment,
    handleAddGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddReminder,
    handleUpdateReminder,
    handleDeleteReminder,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
    resetData,
  };
};
