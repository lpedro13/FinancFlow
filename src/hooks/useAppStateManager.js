import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { categories as defaultCategories, investmentTypes as defaultInvestmentTypes, generateRandomColor, generateRandomIcon } from '@/data/mockData';
import { parseDate, getMonthName, formatDate, formatInputDate, getSystemDateISO } from '@/utils/formatters';
import { calculateMonthlyContribution } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';
import { startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear as dfnsGetYear, addMonths, isSameDay, subMonths, isValid } from 'date-fns';

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
    const newTransaction = { ...transaction, id: transaction.id || uuidv4(), date: formatInputDate(transaction.date) };
    setTransactions(prev => [...(prev || []), newTransaction]);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(prev => (prev || []).map(t => t.id === updatedTransaction.id ? { ...updatedTransaction, date: formatInputDate(updatedTransaction.date) } : t));
  };

  const handleDeleteTransaction = (transactionId) => {
    setTransactions(prev => (prev || []).filter(t => t.id !== transactionId));
  };

  const handleSetTransactions = (newTransactions) => {
    setTransactions(newTransactions.map(t => ({ ...t, date: formatInputDate(t.date) })));
  };

  // ✅ FUNÇÃO CORRIGIDA: uso do campo 'amount' no lugar de 'value'
  const handleAddOrUpdateInvestmentPurchase = (investmentPurchase) => {
    const dateFormatted = formatInputDate(investmentPurchase.date || getSystemDateISO());

    const existingInvestment = investments.find(inv => inv.id === investmentPurchase.id);

    if (existingInvestment) {
      const updatedInvestment = {
        ...existingInvestment,
        totalInvested: existingInvestment.totalInvested + investmentPurchase.totalInvested,
        quantity: (existingInvestment.quantity || 0) + (investmentPurchase.quantity || 0),
        date: dateFormatted,
      };

      setInvestments(prev => prev.map(inv => inv.id === updatedInvestment.id ? updatedInvestment : inv));

      const expenseTransaction = {
        id: uuidv4(),
        type: 'expense',
        amount: investmentPurchase.totalInvested,
        description: `Compra adicional em ${updatedInvestment.name}`,
        category: 'investimentos',
        date: dateFormatted,
        tags: ['investimento', updatedInvestment.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: updatedInvestment.id,
      };

      setTransactions(prev => [...(prev || []), expenseTransaction]);

    } else {
      const newInvestment = {
        ...investmentPurchase,
        id: investmentPurchase.id || uuidv4(),
        date: dateFormatted,
      };

      setInvestments(prev => [...(prev || []), newInvestment]);

      const expenseTransaction = {
        id: uuidv4(),
        type: 'expense',
        amount: newInvestment.totalInvested,
        description: `Investimento em ${newInvestment.name}`,
        category: 'investimentos',
        date: dateFormatted,
        tags: ['investimento', newInvestment.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: newInvestment.id,
      };

      setTransactions(prev => [...(prev || []), expenseTransaction]);
    }
  };

  const handleUpdateInvestment = (updatedInvestment) => {
    setInvestments(prev => (prev || []).map(inv => inv.id === updatedInvestment.id ? { ...updatedInvestment, date: formatInputDate(updatedInvestment.date || inv.date) } : inv));
  };

  const handleDeleteInvestment = (investmentId) => {
    setInvestments(prev => (prev || []).filter(inv => inv.id !== investmentId));
    setTransactions(prev => (prev || []).filter(t => t.relatedInvestmentId !== investmentId));
  };

  const handleAddGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: goal.id || uuidv4(),
      deadline: goal.deadline ? formatInputDate(goal.deadline) : null,
      creationDate: formatInputDate(goal.creationDate || getSystemDateISO())
    };
    const monthlyContribution = newGoal.deadline ? calculateMonthlyContribution(newGoal.targetAmount, newGoal.currentAmount, newGoal.deadline) : 0;
    setGoals(prev => [...(prev || []), { ...newGoal, monthlyContribution }]);
  };

  const handleUpdateGoal = (updatedGoal) => {
    const goalWithParsedDates = {
      ...updatedGoal,
      deadline: updatedGoal.deadline ? formatInputDate(updatedGoal.deadline) : null,
      creationDate: formatInputDate(updatedGoal.creationDate || getSystemDateISO())
    };
    const monthlyContribution = goalWithParsedDates.deadline ? calculateMonthlyContribution(goalWithParsedDates.targetAmount, goalWithParsedDates.currentAmount, goalWithParsedDates.deadline) : 0;
    setGoals(prev => (prev || []).map(g => g.id === updatedGoal.id ? { ...goalWithParsedDates, monthlyContribution } : g));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => (prev || []).filter(g => g.id !== goalId));
  };

  const handleAddGoalContribution = (goalId, amount, type = 'contribution') => {
    setGoals(prevGoals => (prevGoals || []).map(goal => {
      if (goal.id === goalId) {
        const newCurrentAmount = type === 'contribution'
          ? goal.currentAmount + amount
          : goal.currentAmount - amount;
        return { ...goal, currentAmount: Math.max(0, newCurrentAmount) };
      }
      return goal;
    }));

    const currentGoals = goals || [];
    const goal = currentGoals.find(g => g.id === goalId);
    if (goal) {
      const transactionType = type === 'contribution' ? 'expense' : 'income';
      const descriptionPrefix = type === 'contribution' ? 'Aporte para meta:' : 'Retirada da meta:';
      const category = type === 'contribution' ? 'metas' : 'outros';

      const goalTransaction = {
        id: uuidv4(),
        type: transactionType,
        amount: amount,
        description: `${descriptionPrefix} ${goal.name}`,
        category: category,
        date: getSystemDateISO(),
        tags: [type === 'contribution' ? 'meta' : 'retirada-meta', goal.name.toLowerCase().replace(/\s+/g, '-')]
      };
      setTransactions(prev => [...(prev || []), goalTransaction]);
    }
  };

  const handleMonthChange = (newDate) => {
    const prevMonth = subMonths(currentMonthDate, 1);
    const prevMonthYear = dfnsGetYear(prevMonth);
    const prevMonthMonth = getMonth(prevMonth);

    const prevMonthTransactions = transactions.filter(t => {
      const tDate = parseDate(t.date);
      return isValid(tDate) && getMonth(tDate) === prevMonthMonth && dfnsGetYear(tDate) === prevMonthYear;
    });

    const income = prevMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = prevMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    setPreviousMonthBalance(balance > 0 ? balance : 0);
    setCurrentMonthDate(newDate);
  };

  const handleResetData = (toast) => {
    if (resetPeriod === 'all') {
      setTransactions([]);
      setInvestments([]);
      setGoals([]);
      setBudgets([]);
      setAccountsPayable([]);
      setUserDefinedAlerts([]);
      setPreviousMonthBalance(0);
      if (toast && typeof toast === 'function') {
        toast({
          title: "Todos os Dados Resetados!",
          description: "Todos os seus dados foram apagados com sucesso.",
        });
      }
    } else if (resetPeriod === 'month') {
      const targetMonth = parseInt(resetMonth);
      const targetYear = parseInt(resetYear);
      const periodStart = startOfMonth(new Date(targetYear, targetMonth));
      const periodEnd = endOfMonth(new Date(targetYear, targetMonth));

      setTransactions(prev => (prev || []).filter(t => {
        const tDate = parseDate(t.date);
        return !isWithinInterval(tDate, { start: periodStart, end: periodEnd });
      }));

      setInvestments(prev => (prev || []).filter(inv => {
        const invDate = parseDate(inv.date);
        return !isWithinInterval(invDate, { start: periodStart, end: periodEnd });
      }));

      setGoals(prev => (prev || []).filter(goal => {
        const goalDate = parseDate(goal.creationDate);
        return !isWithinInterval(goalDate, { start: periodStart, end: periodEnd });
      }));

      if (toast && typeof toast === 'function') {
        toast({
          title: `Dados do mês ${getMonthName(targetMonth)} de ${targetYear} resetados!`,
          description: `Dados referentes ao mês selecionado foram apagados.`,
        });
      }
    }
  };

  return {
    investments,
    transactions,
    goals,
    budgets,
    categories,
    investmentTypes,
    accountsPayable,
    userDefinedAlerts,
    previousMonthBalance,
    currentMonthDate,
    resetPeriod,
    resetMonth,
    resetYear,
    setResetPeriod,
    setResetMonth,
    setResetYear,
    setCurrentMonthDate,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSetTransactions,
    handleAddOrUpdateInvestmentPurchase,
    handleUpdateInvestment,
    handleDeleteInvestment,
    handleAddGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddGoalContribution,
    handleMonthChange,
    handleResetData,
  };
};
