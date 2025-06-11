import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportFilters from '@/components/ReportFilters'; 
import OverviewReport from '@/components/reports/OverviewReport';
import CategoriesReport from '@/components/reports/CategoriesReport';
import TrendsReport from '@/components/reports/TrendsReport';
import InvestmentsReport from '@/components/reports/InvestmentsReport';
import { getDateRange } from '@/utils/dateUtils';
import { filterTransactionsByPeriod } from '@/utils/calculations';
import { formatDate, parseDate } from '@/utils/formatters'; 
import { isValid } from 'date-fns';


const Reports = ({ transactions, investments, goals, categories, investmentTypes }) => {
  const [periodOption, setPeriodOption] = useState('monthly'); 
  const [customStartDate, setCustomStartDate] = useState(getDateRange('monthly').start);
  const [customEndDate, setCustomEndDate] = useState(getDateRange('monthly').end);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { start, end } = useMemo(() => {
    if (periodOption === 'custom') {
      return { start: customStartDate, end: customEndDate };
    }
    return getDateRange(periodOption);
  }, [periodOption, customStartDate, customEndDate]);

  const filteredTransactions = useMemo(() => {
    let filtered = filterTransactionsByPeriod(transactions, start, end);
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    return filtered;
  }, [transactions, start, end, selectedCategory]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => {
        const invDate = parseDate(inv.date); 
        if (!isValid(invDate)) return false;
        return invDate >= start && invDate <= end;
    });
  }, [investments, start, end]);


  const exportReport = () => {
    const reportData = {
      period: {
        option: periodOption,
        startDate: formatDate(start, { dateStyle: 'short' }),
        endDate: formatDate(end, { dateStyle: 'short' }),
      },
      categoryFilter: selectedCategory,
      summary: {
        totalIncome: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      },
      transactions: filteredTransactions,
      investments: filteredInvestments,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeflow-${formatDate(new Date(), {year:'numeric',month:'2-digit',day:'2-digit'})}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="gradient-text">Relatórios e Análises</CardTitle>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReportFilters
            period={periodOption}
            onPeriodChange={setPeriodOption}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 glass-effect">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="investments">Investimentos</TabsTrigger>
        </TabsList>

        <motion.div
          key={periodOption + selectedCategory + (start ? formatDate(start) : '') + (end ? formatDate(end): '')} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TabsContent value="overview">
            <OverviewReport transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesReport transactions={filteredTransactions} categories={categories} />
          </TabsContent>

          <TabsContent value="trends">
            <TrendsReport transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentsReport investments={filteredInvestments} investmentTypes={investmentTypes} startDate={start} endDate={end} />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default Reports;