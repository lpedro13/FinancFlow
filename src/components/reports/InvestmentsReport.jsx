import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, formatDate, parseDate } from '@/utils/formatters';
import { TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';
import InvestmentChart from '@/components/InvestmentChart';
import { calculatePortfolioMetrics } from '@/utils/calculations';

const InvestmentsReport = ({ investments, investmentTypes, startDate, endDate }) => {
  const filteredInvestments = useMemo(() => {
    if (!investments) return [];
    return investments.filter(inv => {
      if (!inv.date) return false;
      const invDate = parseDate(inv.date);
      if (isNaN(invDate.getTime())) return false;
      return invDate >= startDate && invDate <= endDate;
    });
  }, [investments, startDate, endDate]);

  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(filteredInvestments), [filteredInvestments]);

  const investmentEvolutionData = useMemo(() => {
    const dailySnapshots = {};
    if (!filteredInvestments) return [];

    filteredInvestments.forEach(inv => {
      (inv.history || []).forEach(event => {
        if (!event.date) return;
        const eventDate = parseDate(event.date);
        if (isNaN(eventDate.getTime())) return;
        if (eventDate < startDate || eventDate > endDate) return;

        const dateStr = formatDate(eventDate);
        if (!dailySnapshots[dateStr]) {
          dailySnapshots[dateStr] = { date: dateStr, totalInvested: 0, currentValue: 0, dividends: 0 };
        }
      });
    });

    const sortedDates = Object.keys(dailySnapshots).sort((a, b) => parseDate(a) - parseDate(b));

    let cumulativeInvested = 0;
    let cumulativeDividends = 0;
    const currentPortfolioState = {};

    sortedDates.forEach(dateStr => {
      filteredInvestments.forEach(inv => {
        if (!currentPortfolioState[inv.id]) {
          currentPortfolioState[inv.id] = { quantity: 0, totalInvested: 0, currentPrice: inv.purchasePrice, dividends: 0 };
        }

        (inv.history || []).forEach(event => {
          if (!event.date) return;
          const eventDate = parseDate(event.date);
          if (isNaN(eventDate.getTime())) return;
          if (eventDate < startDate || eventDate > endDate) return;

          if (formatDate(eventDate) === dateStr) {
            if (event.type === 'compra') {
              currentPortfolioState[inv.id].totalInvested += event.quantity * event.price;
              currentPortfolioState[inv.id].quantity += event.quantity;
              cumulativeInvested += event.quantity * event.price;
            }
            if (event.type === 'update') {
              currentPortfolioState[inv.id].currentPrice = event.price;
              currentPortfolioState[inv.id].dividends += event.dividends || 0;
              cumulativeDividends += event.dividends || 0;
            }
          }
        });
      });

      let currentDayValue = 0;
      Object.values(currentPortfolioState).forEach(state => {
        currentDayValue += state.quantity * state.currentPrice;
      });

      dailySnapshots[dateStr].totalInvested = cumulativeInvested;
      dailySnapshots[dateStr].currentValue = currentDayValue;
      dailySnapshots[dateStr].dividends = cumulativeDividends;
    });

    return Object.values(dailySnapshots);
  }, [filteredInvestments, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect border-blue-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-400">Total Investido (Período)</CardTitle><DollarSign className="h-4 w-4 text-blue-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-400">{formatCurrency(portfolioMetrics.totalInvested)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-green-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-400">Valor Atual (Período)</CardTitle><TrendingUp className="h-4 w-4 text-green-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{formatCurrency(portfolioMetrics.totalValue)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-purple-400">Retorno Total (Período)</CardTitle><TrendingUp className="h-4 w-4 text-purple-400" /></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioMetrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(portfolioMetrics.totalReturn + portfolioMetrics.totalDividends)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentage(portfolioMetrics.returnPercentage)} (sem dividendos)</p>
            <p className="text-xs text-muted-foreground">Dividendos: {formatCurrency(portfolioMetrics.totalDividends)}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-effect">
        <CardHeader><CardTitle className="gradient-text">Evolução dos Investimentos no Período</CardTitle></CardHeader>
        <CardContent>
          {investmentEvolutionData.length > 1 ? (
            <InvestmentChart data={investmentEvolutionData} type="area" />
          ) : (
            <p className="text-muted-foreground text-center py-10">Dados insuficientes para exibir a evolução dos investimentos no período selecionado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentsReport;