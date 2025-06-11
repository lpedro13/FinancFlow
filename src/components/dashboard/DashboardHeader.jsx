import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const DashboardHeader = ({ 
  balance, 
  totalIncome, 
  totalExpenses, 
  totalInvestmentValue, 
  investmentReturnPercentage, 
  balanceChangePercentage,
  incomeChangePercentage,
  expensesChangePercentage,
  onCardClick 
}) => {
  const renderPercentageChange = (percentage) => {
    if (percentage === null || percentage === undefined || isNaN(percentage) || percentage === Infinity || percentage === -Infinity) {
      return <span className="text-xs text-muted-foreground">-</span>;
    }
    const sign = percentage >= 0 ? '+' : '';
    return (
      <p className={`text-xs ${percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {sign}{formatPercentage(percentage)} em relação ao mês anterior
      </p>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div variants={itemVariants} onClick={() => onCardClick('balance')}>
        <Card className="glass-effect card-hover border-green-500/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(balance)}</div>
            {renderPercentageChange(balanceChangePercentage)}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} onClick={() => onCardClick('income')}>
        <Card className="glass-effect card-hover border-blue-500/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalIncome)}</div>
            {renderPercentageChange(incomeChangePercentage)}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} onClick={() => onCardClick('expenses')}>
        <Card className="glass-effect card-hover border-red-500/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
            {renderPercentageChange(expensesChangePercentage)}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} onClick={() => onCardClick('investments')}>
        <Card className="glass-effect card-hover border-purple-500/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Investimentos</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{formatCurrency(totalInvestmentValue)}</div>
            <p className={`text-xs ${investmentReturnPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {investmentReturnPercentage >= 0 ? '+' : ''}{formatPercentage(investmentReturnPercentage)} de rentabilidade
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHeader;