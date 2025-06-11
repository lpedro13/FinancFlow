import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/components/ui/use-toast';

const GoalContribution = ({ goalId, goalName, onAddContribution, type = "contribution" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const isWithdrawal = type === "withdrawal";

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido.",
        variant: "destructive"
      });
      return;
    }

    onAddContribution(goalId, value, type);
    setAmount('');
    setIsOpen(false);
    
    toast({
      title: "Sucesso!",
      description: `${formatCurrency(value)} ${isWithdrawal ? 'retirado da' : 'adicionado à'} meta "${goalName}".`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={isWithdrawal ? "destructive-outline" : "outline"} size="sm" className="h-8 text-xs sm:text-sm">
          {isWithdrawal ? <MinusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> : <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
          {isWithdrawal ? 'Retirar Saldo' : 'Adicionar Saldo'}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">{isWithdrawal ? 'Retirar Saldo da' : 'Adicionar Saldo à'} Meta: {goalName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="contributionAmount">Valor da {isWithdrawal ? 'Retirada' : 'Contribuição'}</Label>
            <Input
              id="contributionAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 150,00"
            />
          </div>
          <Button type="submit" className={`w-full ${isWithdrawal ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {isWithdrawal ? 'Confirmar Retirada' : 'Adicionar Saldo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalContribution;