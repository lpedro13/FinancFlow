import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

const InvestmentDetailsModal = ({ isOpen, onClose, investments, totalInvestmentValue, investmentReturn, investmentReturnPercentage }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Detalhes dos Investimentos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-sm">
              <p className="text-lg font-semibold">Valor Total da Carteira: <span className="text-purple-400">{formatCurrency(totalInvestmentValue)}</span></p>
              <p>Retorno Total: <span className={investmentReturn >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(investmentReturn)} ({formatPercentage(investmentReturnPercentage)})</span></p>
            </CardContent>
          </Card>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {investments.length > 0 ? investments.map(investment => {
                const returnValue = investment.currentValue - investment.totalInvested;
                const returnPercent = investment.totalInvested > 0 ? (returnValue / investment.totalInvested) * 100 : 0;
                return (
                  <Card key={investment.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{investment.name} <span className="text-xs text-muted-foreground">({investment.type})</span></p>
                          <p className="text-xs text-muted-foreground">{investment.quantity} cotas @ {formatCurrency(investment.averagePrice)} (Preço Médio)</p>
                          {investment.sector && <p className="text-xs text-muted-foreground">Setor: {investment.sector}</p>}
                        </div>
                        <div className="text-right">
                           <p className="text-sm">Valor Atual: {formatCurrency(investment.currentValue)}</p>
                           <p className={`text-sm ${returnValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             Retorno: {formatCurrency(returnValue)} ({formatPercentage(returnPercent)})
                           </p>
                           {investment.dividends > 0 && <p className="text-xs text-amber-400">Dividendos: {formatCurrency(investment.dividends)}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : <p className="text-muted-foreground text-center">Nenhum investimento para exibir.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDetailsModal;