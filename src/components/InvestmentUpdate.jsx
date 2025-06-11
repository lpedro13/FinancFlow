import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit3 } from 'lucide-react';
import { formatCurrency, parseDate } from '@/utils/formatters';
import { useToast } from '@/components/ui/use-toast';

const InvestmentUpdate = ({ investment, onUpdateInvestment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPrice: '',
    dividendsPerShare: '', 
    updateDate: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    if (investment && isOpen) {
      setFormData({
        currentPrice: investment.currentPrice ? investment.currentPrice.toString() : '',
        dividendsPerShare: '', 
        updateDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [investment, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const currentPrice = parseFloat(formData.currentPrice);
    const dividendsPerShare = parseFloat(formData.dividendsPerShare) || 0; 
    const updateDate = parseDate(formData.updateDate).toISOString().split('T')[0];

    if (isNaN(currentPrice) || currentPrice < 0) {
      toast({
        title: "Erro",
        description: "Preço atual inválido.",
        variant: "destructive"
      });
      return;
    }
     if (isNaN(dividendsPerShare) || dividendsPerShare < 0) {
      toast({
        title: "Erro",
        description: "Valor de dividendos por cota inválido.",
        variant: "destructive"
      });
      return;
    }
    if (!updateDate || isNaN(parseDate(updateDate).getTime())) {
      toast({
        title: "Erro",
        description: "Data da atualização é obrigatória e válida.",
        variant: "destructive"
      });
      return;
    }

    const totalDividendsReceived = dividendsPerShare * investment.quantity;

    const updatedInvestmentData = {
      ...investment,
      currentPrice: currentPrice,
      currentValue: currentPrice * investment.quantity,
      dividends: (investment.dividends || 0) + totalDividendsReceived,
      history: [
        ...(investment.history || []),
        { 
          date: updateDate, 
          price: currentPrice, 
          quantity: investment.quantity, 
          type: 'update', 
          dividends: totalDividendsReceived 
        }
      ]
    };
    
    onUpdateInvestment(updatedInvestmentData); 
    setIsOpen(false);
    
    toast({
      title: "Sucesso!",
      description: `Investimento "${investment.name}" atualizado.`
    });
  };

  if (!investment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Atualizar {investment.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Preço Atual por Cota</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              value={formData.currentPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
              placeholder={`Atual: ${formatCurrency(investment.currentPrice || 0)}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dividendsPerShare">Dividendos/Proventos por Cota (desde a última atualização)</Label>
            <Input
              id="dividendsPerShare"
              type="number"
              step="0.0001" 
              value={formData.dividendsPerShare}
              onChange={(e) => setFormData(prev => ({ ...prev, dividendsPerShare: e.target.value }))}
              placeholder="Ex: 0,5025"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="updateDate">Data da Atualização</Label>
            <Input
              id="updateDate"
              type="date"
              value={formData.updateDate}
              onChange={(e) => setFormData(prev => ({ ...prev, updateDate: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full">Atualizar Investimento</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentUpdate;