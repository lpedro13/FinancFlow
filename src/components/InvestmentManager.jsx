import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { generateRandomColor } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const InvestmentManager = ({ onAddType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newTypeName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do tipo de investimento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const type = {
      id: uuidv4(),
      name: newTypeName.trim(),
      color: generateRandomColor()
    };

    onAddType(type);
    setNewTypeName('');
    setIsOpen(false);
    
    toast({
      title: "Sucesso!",
      description: "Tipo de investimento adicionado."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          Novo Tipo
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Adicionar Novo Tipo de Investimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="typeName">Nome do Tipo</Label>
            <Input
              id="typeName"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Ex: Tesouro Direto, Ações BR"
            />
          </div>
          <Button type="submit" className="w-full">Adicionar Tipo</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentManager;