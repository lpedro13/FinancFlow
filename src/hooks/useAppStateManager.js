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
    setInvestments(prev => (prev || []).map(inv => inv.id === updatedInvestment.id ? {...updatedInvestment, date: formatInputDate(updatedInvestment.date || inv.date)} : inv));
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
    const expenseTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: accountToPay.amount,
      description: `Pagamento: ${accountToPay.description}`,
      category: accountToPay.category || 'contas',
      date: paymentDate,
      tags: ['conta-paga', accountToPay.category || ''],
      relatedAccountId: accountToPay.id,
    };
    setTransactions(prev => [...(prev || []), expenseTransaction]);
    
    setAccountsPayable(prevAccounts => 
      prevAccounts.map(acc => acc.id === accountToPay.id ? { ...acc, paid: true, paymentDate: paymentDate } : acc)
    );
  };

  const handleGenerateRecurringAccounts = useCallback(() => {
    const currentMonth = getMonth(currentMonthDate);
    const currentYear = dfnsGetYear(currentMonthDate);

    setAccountsPayable(prevAccounts => {
      const newAccounts = [...prevAccounts];
      prevAccounts.forEach(acc => {
        if (acc.isRecurring && !acc.paid && acc.originalDueDate) { // Ensure originalDueDate exists
          const originalDueDate = parseDate(acc.originalDueDate);
          if (!isValid(originalDueDate)) return;

          let nextIterationDate = addMonths(originalDueDate, acc.currentInstallment || 0); // Start from the original due date for calculation
          
          // For monthly fixed, we need to ensure it's generated for the current view month if not paid
          if (acc.recurrenceType === 'monthly') {
            nextIterationDate = new Date(currentYear, currentMonth, originalDueDate.getDate());
          }

          const alreadyExists = newAccounts.some(existingAcc => 
            existingAcc.description === acc.description &&
            formatInputDate(existingAcc.dueDate) === formatInputDate(nextIterationDate) && // Compare formatted dates
            existingAcc.id !== acc.id // Don't compare with self if it's an update scenario
          );

          if (!alreadyExists && isValid(nextIterationDate) && (nextIterationDate <= endOfMonth(currentMonthDate))) {
             if (acc.recurrenceType === 'monthly') {
                // Check if an instance for this month already exists and is not the current one
                const monthInstanceExists = newAccounts.some(existingAcc => 
                    existingAcc.description === acc.description &&
                    getMonth(parseDate(existingAcc.dueDate)) === currentMonth &&
                    dfnsGetYear(parseDate(existingAcc.dueDate)) === currentYear &&
                    existingAcc.id !== acc.id
                );
                if (!monthInstanceExists) {
                    newAccounts.push({
                      ...acc,
                      id: uuidv4(), // New ID for new instance
                      dueDate: formatInputDate(nextIterationDate),
                      paid: false,
                      // originalDueDate: acc.originalDueDate, // Keep original due date
                      // currentInstallment will be null for monthly
                    });
                }
            } else if (acc.recurrenceType === 'installments') {
                // Iterate for installments up to the current view month
                let installmentNumber = acc.currentInstallment || 1;
                let installmentDueDate = addMonths(originalDueDate, installmentNumber -1);

                while(installmentNumber <= acc.totalInstallments && installmentDueDate <= endOfMonth(currentMonthDate)) {
                     const installmentExists = newAccounts.some(existingAcc => 
                        existingAcc.description === acc.description &&
                        existingAcc.originalDueDate === acc.originalDueDate && // Match original due date for installments
                        existingAcc.currentInstallment === installmentNumber
                    );

                    if(!installmentExists){
                        newAccounts.push({
                          ...acc,
                          id: uuidv4(),
                          dueDate: formatInputDate(installmentDueDate),
                          paid: false,
                          currentInstallment: installmentNumber,
                          // originalDueDate: acc.originalDueDate, // Keep original due date
                        });
                    }
                    installmentNumber++;
                    installmentDueDate = addMonths(originalDueDate, installmentNumber -1);
                }
            }
          }
        }
      });
      // Deduplicate based on a more robust key for recurring items
      return newAccounts.filter((value, index, self) => 
        index === self.findIndex((t) => (
          t.description === value.description && 
          t.amount === value.amount &&
          t.originalDueDate === value.originalDueDate && // Important for recurring
          t.currentInstallment === value.currentInstallment && // Important for installments
          (t.id === value.id) // If IDs are the same, it's the same instance
        ))
      );
    });
  }, [currentMonthDate, setAccountsPayable]);

  const handleAddCategory = (category) => {
    setCategories(prev => [...prev, category]);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setTransactions(prevTrans => prevTrans.map(t => 
      t.category === categoryId ? { ...t, category: 'outros' } : t
    ));
    setBudgets(prevBudgets => prevBudgets.filter(b => b.category !== categoryId));
  };

  const handleUpdateCategory = (categoryId, updatedCategoryData) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, ...updatedCategoryData } : cat));
  };

  const handleAddInvestmentType = (investmentType) => {
    setInvestmentTypes(prev => [...prev, { ...investmentType, id: uuidv4(), color: generateRandomColor() }]);
  };

  const handleDeleteInvestmentType = (typeId) => {
    setInvestmentTypes(prev => prev.filter(it => it.id !== typeId));
    setInvestments(prevInvestments => prevInvestments.map(inv => 
      inv.type === typeId ? { ...inv, type: 'outros-investimentos' } : inv 
    ));
  };

  const handleUpdateInvestmentType = (typeId, updatedTypeData) => {
    setInvestmentTypes(prev => prev.map(it => it.id === typeId ? { ...it, ...updatedTypeData } : it));
  };


  const availableYears = useMemo(() => {
    const currentYr = new Date(getSystemDateISO()).getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYr - i);
  }, []);

  return {
    transactions, setTransactions,
    investments, setInvestments,
    goals, setGoals,
    budgets, setBudgets,
    categories, setCategories,
    investmentTypes, setInvestmentTypes,
    accountsPayable, setAccountsPayable,
    userDefinedAlerts, setUserDefinedAlerts,
    currentMonthDate, setCurrentMonthDate,
    previousMonthBalance,
    resetPeriod, setResetPeriod,
    resetMonth, setResetMonth,
    resetYear, setResetYear,
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
    availableYears,
    handlePayAccount,
    handleGenerateRecurringAccounts,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategory,
    handleAddInvestmentType,
    handleDeleteInvestmentType,
    handleUpdateInvestmentType,
  };
};