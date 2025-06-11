import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatInputDate, getSystemDateISO } from '@/utils/date';
import { v4 as uuidv4 } from 'uuid';

export const useAppStateManager = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [billsToPay, setBillsToPay] = useState([]);

  const resetApp = useCallback(() => {
    setIncomes([]);
    setExpenses([]);
    setGoals([]);
    setInvestments([]);
    setTransactions([]);
    setBudgets([]);
    setBillsToPay([]);
  }, []);

  const handleAddIncome = (income) => {
    const newIncome = {
      ...income,
      id: uuidv4(),
      date: formatInputDate(income.date || getSystemDateISO())
    };

    setIncomes(prev => [...(prev || []), newIncome]);

    const incomeTransaction = {
      id: uuidv4(),
      type: 'income',
      amount: newIncome.amount,
      description: newIncome.description,
      category: newIncome.category,
      date: newIncome.date,
    };

    setTransactions(prev => [...(prev || []), incomeTransaction]);
  };

  const handleAddExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: uuidv4(),
      date: formatInputDate(expense.date || getSystemDateISO())
    };

    setExpenses(prev => [...(prev || []), newExpense]);

    const expenseTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: newExpense.amount,
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.date,
    };

    setTransactions(prev => [...(prev || []), expenseTransaction]);
  };

  const handleAddInvestment = (investment) => {
    const date = formatInputDate(investment.date || getSystemDateISO());
    const quantity = parseFloat(investment.quantity || 1);
    const unitPrice = parseFloat(investment.unitPrice || investment.totalInvested || 0);
    const totalPurchase = quantity * unitPrice;

    let found = false;
    const updatedInvestments = investments.map((inv) => {
      if (inv.name === investment.name) {
        found = true;
        const newQuantity = inv.quantity + quantity;
        const newTotal = inv.totalValue + totalPurchase;
        const newAverage = newTotal / newQuantity;
        return {
          ...inv,
          quantity: newQuantity,
          totalValue: newTotal,
          averagePrice: newAverage,
          date,
        };
      }
      return inv;
    });

    if (!found) {
      updatedInvestments.push({
        id: uuidv4(),
        name: investment.name,
        type: investment.type,
        quantity,
        totalValue: totalPurchase,
        averagePrice: unitPrice,
        date,
      });
    }

    setInvestments(updatedInvestments);

    const expenseTransaction = {
      id: uuidv4(),
      type: 'expense',
      amount: totalPurchase,
      description: `Compra de ${quantity}x ${investment.name}`,
      category: 'Investimentos',
      date,
    };

    setTransactions(prev => [...(prev || []), expenseTransaction]);
  };

  const handleAddGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: uuidv4(),
      date: formatInputDate(goal.date || getSystemDateISO())
    };
    setGoals(prev => [...(prev || []), newGoal]);
  };

  const handleAddBillToPay = (bill) => {
    const newBill = {
      ...bill,
      id: uuidv4(),
      date: formatInputDate(bill.date || getSystemDateISO())
    };

    setBillsToPay(prev => [...(prev || []), newBill]);
  };

  const handleAddBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: uuidv4(),
      date: formatInputDate(budget.date || getSystemDateISO())
    };

    setBudgets(prev => [...(prev || []), newBudget]);
  };

  const totalIncome = useMemo(
    () => incomes.reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
    [incomes]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
    [expenses]
  );

  const totalInvested = useMemo(
    () => investments.reduce((acc, curr) => acc + parseFloat(curr.totalValue || 0), 0),
    [investments]
  );

  const totalBalance = useMemo(
    () => totalIncome - totalExpenses - totalInvested,
    [totalIncome, totalExpenses, totalInvested]
  );

  return {
    incomes,
    expenses,
    goals,
    investments,
    transactions,
    budgets,
    billsToPay,
    setIncomes,
    setExpenses,
    setGoals,
    setInvestments,
    setTransactions,
    setBudgets,
    setBillsToPay,
    handleAddIncome,
    handleAddExpense,
    handleAddGoal,
    handleAddInvestment,
    handleAddBillToPay,
    handleAddBudget,
    resetApp,
    totalIncome,
    totalExpenses,
    totalInvested,
    totalBalance
  };
};
