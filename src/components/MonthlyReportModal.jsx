import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

const MonthlyReportModal = ({ isOpen, onClose, monthData, categories = [] }) => {
  if (!monthData) return null;

  const getCategoryInfo = (categoryId) => {
    if (!categories || !Array.isArray(categories)) {
      return { name: categoryId, icon: '🏷️' }; 
    }
    return categories.find(c => c.id === categoryId) || { name: categoryId, icon: '🏷️' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect sm:max-w-[625px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Relatório Mensal - {monthData.month}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-sm">
              <p>Total de Receitas: <span className="text-green-400">{formatCurrency(monthData.income)}</span></p>
              <p>Total de Despesas: <span className="text-red-400">{formatCurrency(monthData.expenses)}</span></p>
              <p className="font-semibold">Saldo do Mês: <span className={monthData.income - monthData.expenses >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(monthData.income - monthData.expenses)}</span></p>
            </CardContent>
          </Card>
          <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
            <div className="space-y-3">
              <h4 className="text-md font-semibold mt-2 mb-1 text-slate-300">Transações do Mês:</h4>
              {monthData.transactions.length > 0 ? monthData.transactions.map(transaction => {
                const categoryInfo = getCategoryInfo(transaction.category);
                const transactionDate = parseDate(transaction.date);
                return (
                  <Card key={transaction.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3 sm:p-4 flex justify-between items-center text-xs sm:text-sm">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-muted-foreground">{categoryInfo.icon} {categoryInfo.name} - {isNaN(transactionDate.getTime()) ? 'Data inválida' : formatDate(transactionDate)}</p>
                      </div>
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </CardContent>
                  </Card>
                );
              }) : <p className="text-muted-foreground text-center">Nenhuma transação neste mês.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyReportModal;