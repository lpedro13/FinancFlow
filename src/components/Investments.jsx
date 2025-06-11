import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const Investments = ({
  investments,
  setInvestments,
  allTransactions,
  setTransactions
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    date: '',
  });

  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const { name, type, quantity, purchasePrice, date } = formData;
    if (!name || !type || !quantity || !purchasePrice || !date) {
      toast({ title: 'Erro', description: 'Preencha todos os campos!', variant: 'destructive' });
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(purchasePrice.replace(',', '.'));
    const totalPurchaseValue = qty * price;

    const existingIndex = investments.findIndex((inv) => inv.name === name);
    let updatedInvestments = [...investments];

    if (existingIndex !== -1) {
      const existing = updatedInvestments[existingIndex];
      const newQuantity = existing.quantity + qty;
      const newTotalValue = existing.totalValue + totalPurchaseValue;
      const newAveragePrice = newTotalValue / newQuantity;

      updatedInvestments[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        totalValue: newTotalValue,
        averagePrice: newAveragePrice,
      };
    } else {
      updatedInvestments.push({
        id: uuidv4(),
        name,
        type,
        quantity: qty,
        totalValue: totalPurchaseValue,
        averagePrice: price,
      });
    }

    setInvestments(updatedInvestments);

    // Cria a transação correspondente
    const newTransaction = {
      id: uuidv4(),
      type: 'expense',
      description: `Compra de ${qty}x ${name}`,
      amount: totalPurchaseValue,
      date,
      category: 'Investimentos',
    };

    setTransactions([newTransaction, ...allTransactions]);

    // Resetar form
    setFormData({
      name: '',
      type: '',
      quantity: '',
      purchasePrice: '',
      date: '',
    });
    setIsFormOpen(false);

    toast({ title: 'Sucesso', description: 'Investimento adicionado com sucesso!' });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Investimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">+ Novo Invest.</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Investimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Nome do Ativo</Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <Label>Tipo do Ativo</Label>
                <Input name="type" value={formData.type} onChange={handleChange} />
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input name="quantity" value={formData.quantity} onChange={handleChange} keyboardType="numeric" />
              </div>
              <div>
                <Label>Preço por Cota</Label>
                <Input name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} keyboardType="numeric" />
              </div>
              <div>
                <Label>Data</Label>
                <Input name="date" value={formData.date} onChange={handleChange} placeholder="YYYY-MM-DD" />
              </div>
              <Button onClick={handleSubmit}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-6 space-y-4">
          {investments.length === 0 ? (
            <p>Nenhum investimento cadastrado.</p>
          ) : (
            investments.map((inv) => (
              <Card key={inv.id}>
                <CardHeader>
                  <CardTitle>{inv.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tipo: {inv.type}</p>
                  <p>Quantidade: {inv.quantity}</p>
                  <p>Valor Total: {formatCurrency(inv.totalValue)}</p>
                  <p>Preço Médio: {formatCurrency(inv.averagePrice)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Investments;
