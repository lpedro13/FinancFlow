import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency, parseDate } from '@/utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { differenceInDays, isBefore, addDays, parseISO, isToday, getMonth, getYear as dfnsGetYear, subMonths } from 'date-fns';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import MonthlyEvolutionChart from '@/components/dashboard/MonthlyEvolutionChart';
import GoalsProgress from '@/components/dashboard/GoalsProgress';
import SmartAlerts from '@/components/dashboard/SmartAlerts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import InvestmentDetailsModal from '@/components/InvestmentDetailsModal';
import MonthlyReportModal from '@/components/MonthlyReportModal';

const Dashboard = ({ transactions, investments, goals, accountsPayable, categories, userDefinedAlerts, setUserDefinedAlerts, currentMonthDate }) => {

  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [isInvestmentDetailsOpen, setIsInvestmentDetailsOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [selectedCardType, setSelectedCardType] = useState(null);

  const handleAddAlert = (newAlert) => {
    setUserDefinedAlerts(prevAlerts => [...prevAlerts, { ...newAlert, id: uuidv4(), type: 'user' }]);
  };

  const handleUpdateAlert = (updatedAlert) => {
    setUserDefinedAlerts(prevAlerts => prevAlerts.map(a => (a.id === updatedAlert.id && a.type === 'user') ? updatedAlert : a));
  };

  const handleDeleteAlert = (alertId) => {
    setUserDefinedAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId || a.type !== 'user'));
  };

  const accountsPayableAlerts = useMemo(() => {
    if (!accountsPayable) return [];
    const today = new Date();
    
    return accountsPayable
      .filter(acc => !acc.paid)
      .map(acc => {
        try {
          const dueDate = parseISO(acc.dueDate);
          const daysLeft = differenceInDays(dueDate, today);
          
          if ((daysLeft >= 0 && daysLeft <= 2) || (isToday(dueDate) && daysLeft === 0)) {
             let alertMessage = `Vence em ${daysLeft} dia(s)`;
            if (daysLeft === 0) alertMessage = 'Vence Hoje!';
            else if (daysLeft === 1) alertMessage = 'Vence Amanhã!';

            return {
              id: `ap-${acc.id}`,
              name: `Conta a Vencer: ${acc.description}`,
              description: `${alertMessage} (${formatDate(acc.dueDate)}). Valor: ${formatCurrency(acc.amount)}`,
              type: 'system-bill',
              dueDate: acc.dueDate,
            };
          }
          return null;
        } catch (error) {
          console.error("Error parsing due date for account:", acc, error);
          return null;
        }
      })
      .filter(Boolean);
  }, [accountsPayable]);

  const combinedAlerts = useMemo(() => {
    return [...accountsPayableAlerts, ...userDefinedAlerts].sort((a, b) => {
      if (a.type === 'system-bill' && b.type !== 'system-bill') return -1;
      if (a.type !== 'system-bill' && b.type === 'system-bill') return 1;
      if (a.type === 'system-bill' && b.type === 'system-bill') {
        try {
          return parseISO(a.dueDate) - parseISO(b.dueDate);
        } catch { return 0; }
      }
      return 0; 
    });
  }, [accountsPayableAlerts, userDefinedAlerts]);


  const dashboardData = useMemo(() => {
    const currentMonth = getMonth(currentMonthDate);
    const currentYear = dfnsGetYear(currentMonthDate);
    const previousMonthDate = subMonths(currentMonthDate, 1);
    const previousMonth = getMonth(previousMonthDate);
    const previousYear = dfnsGetYear(previousMonthDate);

    const currentMonthTransactions = transactions.filter(t => {
      const tDate = parseDate(t.date);
      return getMonth(tDate) === currentMonth && dfnsGetYear(tDate) === currentYear;
    });

    const previousMonthTransactions = transactions.filter(t => {
      const tDate = parseDate(t.date);
      return getMonth(tDate) === previousMonth && dfnsGetYear(tDate) === previousYear;
    });

    const totalIncomeCurrentMonth = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesCurrentMonth = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balanceCurrentMonth = totalIncomeCurrentMonth - totalExpensesCurrentMonth;

    const totalIncomePreviousMonth = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesPreviousMonth = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balancePreviousMonth = totalIncomePreviousMonth - totalExpensesPreviousMonth;
    
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : (current < 0 ? -100 : 0);
      if (current === 0 && previous === 0) return 0;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    const balanceChangePercentage = calculatePercentageChange(balanceCurrentMonth, balancePreviousMonth);
    const incomeChangePercentage = calculatePercentageChange(totalIncomeCurrentMonth, totalIncomePreviousMonth);
    const expensesChangePercentage = calculatePercentageChange(totalExpensesCurrentMonth, totalExpensesPreviousMonth);


    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const investmentReturn = totalInvestmentValue - totalInvested;
    const investmentReturnPercentage = totalInvested > 0 ? (investmentReturn / totalInvested) * 100 : 0;

    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryInfo = categories.find(c => c.id === t.category);
        const categoryName = categoryInfo ? categoryInfo.name : (t.category || 'Outros');
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {});

    const pieData = Object.entries(expensesByCategory).map(([categoryName, amount]) => {
      const categoryInfo = categories.find(c => c.name === categoryName) || categories.find(c => c.id === categoryName);
      return {
        name: categoryName,
        value: amount,
        color: categoryInfo ? categoryInfo.color : `#${Math.floor(Math.random() * 16777215).toString(16)}`
      };
    });

    const monthlyDataRaw = transactions.reduce((acc, t) => {
      const tDate = parseDate(t.date);
      const monthYear = formatDate(tDate, { month: 'short', year: '2-digit' });
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expenses: 0, transactions: [] };
      }
      if (t.type === 'income') {
        acc[monthYear].income += t.amount;
      } else {
        acc[monthYear].expenses += t.amount;
      }
      acc[monthYear].transactions.push(t);
      return acc;
    }, {});
    
    const monthlyData = Object.values(monthlyDataRaw).sort((a,b) => {
        const dateA = parseDate(a.transactions[0].date);
        const dateB = parseDate(b.transactions[0].date);
        return dateA - dateB;
    });


    return {
      totalIncome: totalIncomeCurrentMonth,
      totalExpenses: totalExpensesCurrentMonth,
      balance: balanceCurrentMonth,
      balanceChangePercentage,
      incomeChangePercentage,
      expensesChangePercentage,
      totalInvested,
      totalInvestmentValue,
      investmentReturn,
      investmentReturnPercentage,
      pieData,
      monthlyData,
    };
  }, [transactions, investments, categories, currentMonthDate]);
  
  const handleCardClick = (type) => {
    setSelectedCardType(type);
    if (type === 'balance' || type === 'income' || type === 'expenses') {
      setIsTransactionDetailsOpen(true);
    } else if (type === 'investments') {
      setIsInvestmentDetailsOpen(true);
    }
  };

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const monthData = dashboardData.monthlyData.find(m => m.month === data.activePayload[0].payload.month);
      if (monthData) {
        setSelectedMonthData(monthData);
        setIsMonthlyReportOpen(true);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <DashboardHeader
        balance={dashboardData.balance}
        totalIncome={dashboardData.totalIncome}
        totalExpenses={dashboardData.totalExpenses}
        totalInvestmentValue={dashboardData.totalInvestmentValue}
        investmentReturnPercentage={dashboardData.investmentReturnPercentage}
        balanceChangePercentage={dashboardData.balanceChangePercentage}
        incomeChangePercentage={dashboardData.incomeChangePercentage}
        expensesChangePercentage={dashboardData.expensesChangePercentage}
        onCardClick={handleCardClick}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensesChart data={dashboardData.pieData} />
        <MonthlyEvolutionChart data={dashboardData.monthlyData} onBarClick={handleBarClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsProgress goals={goals} />
        <SmartAlerts 
            alerts={combinedAlerts} 
            onAddAlert={handleAddAlert}
            onUpdateAlert={handleUpdateAlert}
            onDeleteAlert={handleDeleteAlert}
        />
      </div>

      <RecentTransactions transactions={transactions} categories={categories} />

      <TransactionDetailsModal
        isOpen={isTransactionDetailsOpen && (selectedCardType === 'balance' || selectedCardType === 'income' || selectedCardType === 'expenses')}
        onClose={() => setIsTransactionDetailsOpen(false)}
        transactions={transactions}
        type={selectedCardType}
        balance={dashboardData.balance}
        totalIncome={dashboardData.totalIncome}
        totalExpenses={dashboardData.totalExpenses}
        categories={categories}
      />

      <InvestmentDetailsModal
        isOpen={isInvestmentDetailsOpen && selectedCardType === 'investments'}
        onClose={() => setIsInvestmentDetailsOpen(false)}
        investments={investments}
        totalInvestmentValue={dashboardData.totalInvestmentValue}
        investmentReturn={dashboardData.investmentReturn}
        investmentReturnPercentage={dashboardData.investmentReturnPercentage}
      />
      
      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        monthData={selectedMonthData}
        categories={categories}
      />
    </motion.div>
  );
};

export default Dashboard;