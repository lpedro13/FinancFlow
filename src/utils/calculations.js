import { differenceInMonths, parseISO, format, isWithinInterval, startOfDay, endOfDay, isValid } from 'date-fns';

export const calculateMonthlyContribution = (targetAmount, currentAmount, deadline) => {
  const today = new Date();
  const targetDate = parseISO(deadline); 
  
  if (!isValid(targetDate)) return 0;

  let monthsLeft = differenceInMonths(targetDate, today);
  
  if (targetDate.getDate() < today.getDate() && monthsLeft > 0) {
    monthsLeft -=1;
  }
  if (monthsLeft <= 0) return targetAmount - currentAmount > 0 ? targetAmount - currentAmount : 0;
  
  const remainingAmount = targetAmount - currentAmount;
  return remainingAmount > 0 ? remainingAmount / monthsLeft : 0;
};

export const calculateInvestmentMetrics = (investment) => {
  const totalReturn = investment.currentValue - investment.totalInvested;
  const returnPercentage = investment.totalInvested !== 0 ? (totalReturn / investment.totalInvested) * 100 : 0;
  const totalDividends = investment.dividends || 0;
  const dividendYield = investment.totalInvested !== 0 ? (totalDividends / investment.totalInvested) * 100 : 0;

  return {
    totalReturn,
    returnPercentage,
    totalDividends,
    dividendYield
  };
};

export const calculatePortfolioMetrics = (investments) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalDividends = investments.reduce((sum, inv) => sum + (inv.dividends || 0), 0);
  
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested !== 0 ? (totalReturn / totalInvested) * 100 : 0;
  const dividendYield = totalInvested !== 0 ? (totalDividends / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalValue,
    totalDividends,
    totalReturn,
    returnPercentage,
    dividendYield
  };
};

export const filterTransactionsByPeriod = (transactions, startDate, endDate) => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) return transactions;
  
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    if (!isValid(transactionDate)) return false;
    return isWithinInterval(transactionDate, { start, end });
  });
};

export const groupTransactionsByCategory = (transactions) => {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        transactions: []
      };
    }
    acc[category].total += transaction.amount;
    acc[category].count += 1;
    acc[category].transactions.push(transaction);
    return acc;
  }, {});
};

export const calculateDailyBalances = (transactions) => {
  const dailyBalances = {};
  let runningBalance = 0;

  transactions
    .filter(t => isValid(parseISO(t.date))) 
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))
    .forEach(transaction => {
      const transactionDate = parseISO(transaction.date);
      const date = format(transactionDate, 'yyyy-MM-dd');
      
      if (!dailyBalances[date]) {
        dailyBalances[date] = runningBalance;
      }
      runningBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      dailyBalances[date] = runningBalance;
    });

  return Object.entries(dailyBalances).map(([date, balance]) => ({
    date,
    balance
  }));
};