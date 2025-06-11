import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

const CategoriesReport = ({ transactions, categories }) => {
  const expensesByCategory = useMemo(() => {
    const grouped = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryInfo = categories.find(c => c.id === t.category);
        const categoryName = categoryInfo ? categoryInfo.name : t.category;
        const categoryColor = categoryInfo ? categoryInfo.color : '#6b7280';
        const categoryIcon = categoryInfo ? categoryInfo.icon : '📦';

        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color: categoryColor, icon: categoryIcon, count: 0 };
        }
        acc[categoryName].value += t.amount;
        acc[categoryName].count += 1;
        return acc;
      }, {});
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const totalExpenses = useMemo(() => 
    expensesByCategory.reduce((sum, cat) => sum + cat.value, 0), 
  [expensesByCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect">
        <CardHeader><CardTitle className="gradient-text">Gastos por Categoria (Gráfico)</CardTitle></CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expensesByCategory} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {expensesByCategory.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">Nenhuma despesa no período para exibir.</p>
          )}
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader><CardTitle className="gradient-text">Detalhes dos Gastos por Categoria</CardTitle></CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-3">
                {expensesByCategory.map(category => {
                  const percentage = totalExpenses > 0 ? (category.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={category.name} className="p-3 bg-slate-800/50 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium flex items-center">{category.icon} <span className="ml-2">{category.name}</span></span>
                        <span className="font-semibold">{formatCurrency(category.value)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{category.count} transações</span>
                        <span>{percentage.toFixed(1)}% do total</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: category.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
             <p className="text-muted-foreground text-center py-10">Nenhuma despesa no período para exibir.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesReport;