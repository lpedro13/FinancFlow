import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

const TransactionDetailsModal = ({ isOpen, onClose, transactions, type, balance, totalIncome, totalExpenses, categories = [] }) => {
  let title = '';
  let dataToDisplay = [];
  let summary = null;

  const getCategoryInfo = (categoryId) => {
    if (!categories || !Array.isArray(categories)) {
      return { name: categoryId, icon: '🏷️' }; 
    }
    return categories.find(c => c.id === categoryId) || { name: categoryId, icon: '🏷️' };
  };

  if (type === 'balance') {
    title = 'Detalhes do Saldo Total';
    dataToDisplay = transactions;
    summary = (
      <>
        <p className="text-lg font-semibold">Saldo Atual: <span className="text-green-400">{formatCurrency(balance)}</span></p>
        <p>Total de Receitas: {formatCurrency(totalIncome)}</p>
        <p>Total de Despesas: {formatCurrency(totalExpenses)}</p>
      </>
    );
  } else if (type === 'income') {
    title = 'Detalhes das Receitas';
    dataToDisplay = transactions.filter(t => t.type === 'income');
    summary = <p className="text-lg font-semibold">Total de Receitas: <span className="text-green-400">{formatCurrency(totalIncome)}</span></p>;
  } else if (type === 'expenses') {
    title = 'Detalhes das Despesas';
    dataToDisplay = transactions.filter(t => t.type === 'expense');
    summary = <p className="text-lg font-semibold">Total de Despesas: <span className="text-red-400">{formatCurrency(totalExpenses)}</span></p>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect sm:max-w-[625px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="gradient-text">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {summary && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-sm">
                {summary}
              </CardContent>
            </Card>
          )}
          <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
            <div className="space-y-3">
              {dataToDisplay.length > 0 ? dataToDisplay.map(transaction => {
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
                }) : <p className="text-muted-foreground text-center">Nenhuma transação para exibir.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;