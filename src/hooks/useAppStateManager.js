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

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(getSystemDateISO())); // Initialize with system date
  const [resetPeriod, setResetPeriod] = useState('all');
  const [resetMonth, setResetMonth] = useState(new Date(getSystemDateISO()).getMonth());
  const [resetYear, setResetYear] = useState(new Date(getSystemDateISO()).getFullYear());

  const handleAddTransaction = (transaction) => {
    const newTransaction = { ...transaction, id: transaction.id || uuidv4(), date: formatInputDate(transaction.date) };
    setTransactions(prev => [...(prev || []), newTransaction]);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(prev => (prev || []).map(t => t.id === updatedTransaction.id ? {...updatedTransaction, date: formatInputDate(updatedTransaction.date)} : t));
  };

  const handleDeleteTransaction = (transactionId) => {
    setTransactions(prev => (prev || []).filter(t => t.id !== transactionId));
  };

  const handleSetTransactions = (newTransactions) => {
    setTransactions(newTransactions.map(t => ({...t, date: formatInputDate(t.date) })));
  };

  const handleAddInvestment = (investment) => {
    const newInvestment = { ...investment, id: investment.id || uuidv4(), date: formatInputDate(investment.date || getSystemDateISO()) };
    setInvestments(prev => [...(prev || []), newInvestment]);
    
    const expenseTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: newInvestment.totalInvested,
      description: `Investimento em ${newInvestment.name}`,
      category: 'investimentos', 
      date: newInvestment.date,
      tags: ['investimento', newInvestment.name.toLowerCase().replace(/\s+/g, '-')],
      relatedInvestmentId: newInvestment.id,
    };
    setTransactions(prev => [...(prev || []), expenseTransaction]);
  };
  
  const handleUpdateInvestment = (updatedInvestment) => {
    setInvestments(prev => {
      return (prev || []).map(inv => {
        if (inv.id === updatedInvestment.id) {
          // Calcula o valor adicional investido (diferença do totalInvested anterior e o novo)
          const amountAdded = updatedInvestment.totalInvested - inv.totalInvested;

          if (amountAdded > 0) {
            // Cria a nova transação de despesa para essa aplicação adicional
            const expenseTransaction = {
              id: uuidv4(),
              type: 'expense',
              amount: amountAdded,
              description: `Investimento em ${updatedInvestment.name}`,
              category: 'investimentos',
              date: formatInputDate(updatedInvestment.date || getSystemDateISO()),
              tags: ['investimento', updatedInvestment.name.toLowerCase().replace(/\s+/g, '-')],
              relatedInvestmentId: updatedInvestment.id,
            };
            setTransactions(prevTransactions => [...(prevTransactions || []), expenseTransaction]);
          }

          return { ...updatedInvestment, date: formatInputDate(updatedInvestment.date || inv.date) };
        }
        return inv;
      });
    });
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
    setGoals(prev => [...(prev || []), {...newGoal, monthlyContribution}]);
  };

  const handleUpdateGoal = (updatedGoal) => {
    const goalWithParsedDates = {
      ...updatedGoal,
      deadline: updatedGoal.deadline ? formatInputDate(updatedGoal.deadline) : null,
      creationDate: formatInputDate(updatedGoal.creationDate || getSystemDateISO())
    };
    const monthlyContribution = goalWithParsedDates.deadline ? calculateMonthlyContribution(goalWithParsedDates.targetAmount, goalWithParsedDates.currentAmount, goalWithParsedDates.deadline) : 0;
    setGoals(prev => (prev || []).map(g => g.id === updatedGoal.id ? {...goalWithParsedDates, monthlyContribution} : g));
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
        return !(isValid(tDate) && isWithinInterval(tDate, { start: periodStart, end: periodEnd }));
      }));
      setInvestments(prev => (prev || []).filter(i => {
        const iDate = parseDate(i.date); 
        return !(isValid(iDate) && isWithinInterval(iDate, { start: periodStart, end: periodEnd }));
      }));
      setGoals(prev => (prev || []).map(g => {
        const gCreationDate = parseDate(g.creationDate); 
        const gDeadline = g.deadline ? parseDate(g.deadline) : null;
        
        let resetGoalContributions = false;
        if (isValid(gCreationDate) && isWithinInterval(gCreationDate, { start: periodStart, end: periodEnd })) {
           resetGoalContributions = true;
        }
        if (gDeadline && isValid(gDeadline) && isWithinInterval(gDeadline, { start: periodStart, end: periodEnd })) {
           resetGoalContributions = true;
        }
        
        if (resetGoalContributions) {
          return { ...g, currentAmount: 0 }; 
        }
        return g;
      }).filter(Boolean));

      setBudgets(prev => (prev || []).filter(b => 
        !(b.month === targetMonth && b.year === targetYear)
      ));

      setAccountsPayable(prev => (prev || []).filter(ap => {
        const apDate = parseDate(ap.dueDate);
        return !(isValid(apDate) && isWithinInterval(apDate, { start: periodStart, end: periodEnd }));
      }));
      
      if (toast && typeof toast === 'function') {
        toast({
          title: `Dados de ${getMonthName(targetMonth)}/${targetYear} Resetados!`,
          description: `Os dados do período selecionado foram apagados.`,
        });
      }
    }
  };

  const handlePayAccount = (accountToPay) => {
    const paymentDate = getSystemDateISO();
    const paymentTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: accountToPay.amount,
      description: `Pagamento de ${accountToPay.name}`,
      category: 'contas a pagar',
      date: paymentDate,
      tags: ['contas-a-pagar', accountToPay.name.toLowerCase().replace(/\s+/g, '-')],
      relatedAccountPayableId: accountToPay.id,
    };
    setTransactions(prev => [...(prev || []), paymentTransaction]);
    setAccountsPayable(prev => (prev || []).filter(ap => ap.id !== accountToPay.id));
  };

  // Retorna os estados e funções para manipulação
  return {
    transactions,
    investments,
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
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSetTransactions,
    handleAddInvestment,
    handleUpdateInvestment,
    handleDeleteInvestment,
    handleAddGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddGoalContribution,
    handleMonthChange,
    handleResetData,
    handlePayAccount,
  };
};
