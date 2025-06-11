
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingDown, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, parseDate, getMonthName } from '@/utils/formatters';
import { getMonth, getYear as dfnsGetYear, subMonths, isSameMonth } from 'date-fns';

const FinancialEducation = ({ transactions, categories, currentMonthDate }) => {
  const tips = [
    {
      id: 'review-subscriptions',
      title: 'Revise suas Assinaturas',
      content: 'Verifique todas as suas assinaturas mensais (streaming, apps, etc.). Cancele aquelas que você não usa com frequência para economizar.',
      icon: <TrendingDown className="h-5 w-5 text-red-400" />,
    },
    {
      id: 'compare-prices',
      title: 'Compare Preços Antes de Comprar',
      content: 'Antes de fazer uma compra grande, pesquise e compare preços em diferentes lojas ou online. Pequenas diferenças podem somar uma grande economia.',
      icon: <BarChart2 className="h-5 w-5 text-blue-400" />,
    },
    {
      id: 'meal-prep',
      title: 'Planeje suas Refeições',
      content: 'Cozinhar em casa e planejar suas refeições da semana pode reduzir significativamente os gastos com delivery e restaurantes.',
      icon: <TrendingDown className="h-5 w-5 text-green-400" />,
    },
    {
      id: 'emergency-fund',
      title: 'Crie uma Reserva de Emergência',
      content: 'Ter uma reserva de emergência (idealmente 3-6 meses de despesas) evita que você precise se endividar em imprevistos.',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    },
    {
      id: 'automate-savings',
      title: 'Automatize suas Economias',
      content: 'Configure transferências automáticas para sua conta de poupança ou investimentos assim que receber seu salário. "Pague-se primeiro".',
      icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
    },
  ];

  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && isSameMonth(parseDate(t.date), currentMonthDate));
  }, [transactions, currentMonthDate]);

  const previousMonthDate = subMonths(currentMonthDate, 1);
  const previousMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && isSameMonth(parseDate(t.date), previousMonthDate));
  }, [transactions, previousMonthDate]);

  const spendingInsights = useMemo(() => {
    const insights = [];
    const currentMonthTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    if (currentMonthTotal > 0 && previousMonthTotal > 0) {
      const diff = currentMonthTotal - previousMonthTotal;
      const percentChange = (diff / previousMonthTotal) * 100;
      if (Math.abs(percentChange) > 10) { // Only show if change is significant
        insights.push({
          id: 'month-comparison',
          title: `Gastos ${percentChange > 0 ? 'Maiores' : 'Menores'} este Mês`,
          content: `Você gastou ${formatCurrency(Math.abs(diff))} (${Math.abs(percentChange).toFixed(1)}%) ${percentChange > 0 ? 'a mais' : 'a menos'} em ${getMonthName(getMonth(currentMonthDate))} comparado a ${getMonthName(getMonth(previousMonthDate))}.`,
          icon: percentChange > 0 ? <TrendingUp className="h-5 w-5 text-red-400" /> : <TrendingDown className="h-5 w-5 text-green-400" />,
        });
      }
    }

    const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
      const categoryInfo = categories.find(c => c.id === t.category);
      const categoryName = categoryInfo?.name || t.category;
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {});

    const sortedCategories = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a);
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      insights.push({
        id: 'top-spending-category',
        title: `Maior Gasto: ${topCategory[0]}`,
        content: `Sua principal categoria de despesa este mês é ${topCategory[0]}, totalizando ${formatCurrency(topCategory[1])}. Considere revisar esses gastos.`,
        icon: <BarChart2 className="h-5 w-5 text-orange-400" />,
      });
    }
    return insights;
  }, [currentMonthExpenses, previousMonthExpenses, categories, currentMonthDate]);

  const allTipsAndInsights = [...spendingInsights, ...tips];

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Dicas Financeiras e Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Aprenda a gerenciar melhor seu dinheiro com estas dicas e análises personalizadas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTipsAndInsights.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <CardTitle className="text-md text-slate-200">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialEducation;
