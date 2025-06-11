import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { format, isValid } from 'date-fns';

const TrendsReport = ({ transactions }) => {
  const monthlyTrendData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const transactionDate = parseDate(t.date);
      if (!isValid(transactionDate)) return acc;
      const monthYear = format(transactionDate, 'yyyy-MM');
      if (!acc[monthYear]) {
        acc[monthYear] = { date: monthYear, income: 0, expenses: 0, balance: 0 };
      }
      if (t.type === 'income') {
        acc[monthYear].income += t.amount;
        acc[monthYear].balance += t.amount;
      } else {
        acc[monthYear].expenses += t.amount;
        acc[monthYear].balance -= t.amount;
      }
      return acc;
    }, {});
    return Object.values(grouped).sort((a,b) => parseDate(a.date) - parseDate(b.date)).map(d => ({...d, date: format(parseDate(d.date), 'MMM/yy')}));
  }, [transactions]);

  return (
    <Card className="glass-effect">
      <CardHeader><CardTitle className="gradient-text">Tendências Financeiras</CardTitle></CardHeader>
      <CardContent>
        {monthlyTrendData.length > 1 ? ( 
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, true)} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Receitas" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Despesas" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Saldo" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-10">Dados insuficientes para exibir tendências (necessário mais de um período).</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendsReport;