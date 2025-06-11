import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, parseDate } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { calculateDailyBalances } from '@/utils/calculations';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const OverviewReport = ({ transactions }) => {
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    return { totalIncome, totalExpenses, balance, savingsRate };
  }, [transactions]);

  const dailyBalancesData = useMemo(() => calculateDailyBalances(transactions), [transactions]);
  
  const incomeExpenseChartData = useMemo(() => {
    const groupedByDate = transactions.reduce((acc, t) => {
      const transactionDate = parseDate(t.date);
      if (!isValid(transactionDate)) return acc;
      const dateKey = format(transactionDate, 'dd/MM');
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, income: 0, expenses: 0 };
      }
      if (t.type === 'income') acc[dateKey].income += t.amount;
      else acc[dateKey].expenses += t.amount;
      return acc;
    }, {});
    return Object.values(groupedByDate).sort((a,b) => {
        const dateA = parseDate(`2000/${a.date.split('/')[1]}/${a.date.split('/')[0]}`); 
        const dateB = parseDate(`2000/${b.date.split('/')[1]}/${b.date.split('/')[0]}`);
        return dateA - dateB;
    });

  }, [transactions]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect border-green-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-400">Receitas</CardTitle><TrendingUp className="h-4 w-4 text-green-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalIncome)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-red-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-400">Despesas</CardTitle><TrendingDown className="h-4 w-4 text-red-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalExpenses)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-blue-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-400">Saldo</CardTitle><DollarSign className="h-4 w-4 text-blue-400" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(summary.balance)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-purple-400">Taxa de Poupança</CardTitle><Percent className="h-4 w-4 text-purple-400" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${summary.savingsRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercentage(summary.savingsRate)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader><CardTitle className="gradient-text">Receitas vs Despesas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, true)} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                <Bar dataKey="income" fill="#10b981" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader><CardTitle className="gradient-text">Evolução do Saldo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyBalancesData}>
                <defs><linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(value) => format(parseDate(value), 'dd/MM')} />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, true)} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => format(parseDate(label), 'dd/MM/yyyy')} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#balanceGradient)" name="Saldo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewReport;