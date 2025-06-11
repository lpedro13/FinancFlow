import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatPercentage, formatDate, parseDate } from '@/utils/formatters';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Edit, Trash2, LineChart as LineChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import InvestmentManager from '@/components/InvestmentManager';
import InvestmentUpdate from '@/components/InvestmentUpdate';
import MonthSelector from '@/components/MonthSelector';
import InvestmentChart from '@/components/InvestmentChart';
import { calculatePortfolioMetrics, calculateInvestmentMetrics } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';

const Investments = ({ 
  investments, 
  setInvestments, 
  updateInvestment,
  deleteInvestment,
  investmentTypes, 
  setInvestmentTypes,
  currentMonthDate,
  onMonthChange,
  allTransactions
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const { toast } = useToast();

  const initialFormData = {
    name: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    sector: '',
    date: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.quantity || !formData.purchasePrice || !formData.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const purchasePrice = parseFloat(formData.purchasePrice);
    
    const purchaseDateObj = parseDate(formData.date);
    if (isNaN(purchaseDateObj.getTime())) {
      toast({ title: "Erro", description: "Data da compra inválida.", variant: "destructive" });
      return;
    }
    const purchaseDate = purchaseDateObj.toISOString().split('T')[0];

    if (isNaN(quantity) || quantity <= 0 || isNaN(purchasePrice) || purchasePrice <= 0) {
      toast({ title: "Erro", description: "Quantidade e preço de compra devem ser números positivos.", variant: "destructive" });
      return;
    }
    
    const existingInvestment = investments.find(inv => inv.name === formData.name && inv.type === formData.type);

    if (editingInvestment) {
      const updatedInvestmentData = {
        ...editingInvestment,
        name: formData.name,
        type: formData.type,
        quantity: quantity,
        purchasePrice: purchasePrice, 
        currentPrice: editingInvestment.currentPrice, 
        totalInvested: quantity * purchasePrice, 
        currentValue: quantity * editingInvestment.currentPrice, 
        sector: formData.sector,
        date: purchaseDate, 
      };
      updateInvestment(updatedInvestmentData);
      toast({ title: "Sucesso!", description: "Investimento atualizado." });
    } else if (existingInvestment) {
      const totalQuantity = existingInvestment.quantity + quantity;
      const newTotalInvested = existingInvestment.totalInvested + (quantity * purchasePrice);
      const newAveragePrice = newTotalInvested / totalQuantity;

      const updatedExistingInvestment = {
        ...existingInvestment,
        quantity: totalQuantity,
        totalInvested: newTotalInvested,
        averagePrice: newAveragePrice,
        currentValue: totalQuantity * existingInvestment.currentPrice, 
        history: [
          ...(existingInvestment.history || []),
          { date: purchaseDate, price: purchasePrice, quantity, type: 'compra', dividends: 0 }
        ]
      };
      updateInvestment(updatedExistingInvestment);
      toast({ title: "Sucesso!", description: `Adicionado a ${formData.name}. Preço médio atualizado.` });

    } else {
      const newInvestment = {
        id: uuidv4(),
        name: formData.name,
        type: formData.type,
        quantity,
        purchasePrice,
        averagePrice: purchasePrice,
        currentPrice: purchasePrice,
        totalInvested: quantity * purchasePrice,
        currentValue: quantity * purchasePrice,
        dividends: 0,
        sector: formData.sector,
        date: purchaseDate,
        history: [{ date: purchaseDate, price: purchasePrice, quantity, type: 'compra', dividends: 0 }]
      };
      setInvestments(prev => [...prev, newInvestment]);  // Corrigido para adicionar ao array
      toast({ title: "Sucesso!", description: "Novo investimento adicionado." });
    }

    setFormData(initialFormData);
    setIsFormOpen(false);
    setEditingInvestment(null);
  };

  const handleEditClick = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      sector: investment.sector || '',
      date: investment.date,
    });
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (id) => {
    deleteInvestment(id);
    toast({ title: "Sucesso!", description: "Investimento removido." });
  };

  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(investments), [investments]);

  const investmentsByType = useMemo(() => {
    return investments.reduce((acc, inv) => {
      const typeInfo = investmentTypes.find(t => t.id === inv.type);
      const typeName = typeInfo ? typeInfo.name : inv.type;
      acc[typeName] = (acc[typeName] || 0) + inv.currentValue;
      return acc;
    }, {});
  }, [investments, investmentTypes]);

  const pieData = useMemo(() => Object.entries(investmentsByType).map(([type, value]) => ({
    name: type,
    value,
    color: investmentTypes.find(t => t.name === type)?.color || '#6b7280'
  })), [investmentsByType, investmentTypes]);

  const performanceData = useMemo(() => investments.map(inv => {
    const metrics = calculateInvestmentMetrics(inv);
    return {
      name: inv.name,
      invested: inv.totalInvested,
      current: inv.currentValue,
      dividends: metrics.totalDividends,
      returnPercentage: metrics.returnPercentage,
    };
  }), [investments]);

  const investmentEvolutionData = useMemo(() => {
    const dailySnapshots = {};

    investments.forEach(inv => {
      (inv.history || []).forEach(event => {
        if (!event.date) return; 
        const eventDate = parseDate(event.date);
        if (isNaN(eventDate.getTime())) return;

        const dateStr = formatDate(eventDate);
        if (!dailySnapshots[dateStr]) {
          dailySnapshots[dateStr] = { date: dateStr, totalInvested: 0, currentValue: 0, dividends: 0 };
        }
      });
    });
    
    const sortedDates = Object.keys(dailySnapshots).sort((a,b) => parseDate(a) - parseDate(b));

    let cumulativeInvested = 0;
    let cumulativeDividends = 0;
    const currentPortfolioState = {}; 

    sortedDates.forEach(dateStr => {
      investments.forEach(inv => {
        if (!currentPortfolioState[inv.id]) {
          currentPortfolioState[inv.id] = { quantity: 0, totalInvested: 0, currentPrice: inv.purchasePrice, dividends: 0 };
        }

        (inv.history || []).forEach(event => {
          if (!event.date) return;
          const eventDate = parseDate(event.date);
          if (isNaN(eventDate.getTime())) return;
          
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

  }, [investments]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Investimentos</CardTitle>
          <Button variant="outline" onClick={() => { setIsFormOpen(true); setEditingInvestment(null); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo investimento
          </Button>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p>Nenhum investimento cadastrado.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Preço Médio</th>
                  <th>Valor Atual</th>
                  <th>Setor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.name}</td>
                    <td>{investmentTypes.find(t => t.id === inv.type)?.name || inv.type}</td>
                    <td>{inv.quantity}</td>
                    <td>{formatCurrency(inv.averagePrice)}</td>
                    <td>{formatCurrency(inv.currentValue)}</td>
                    <td>{inv.sector}</td>
                    <td>
                      <Button size="sm" variant="ghost" onClick={() => handleEditClick(inv)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(inv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={value => setFormData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="any"
                value={formData.quantity}
                onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Preço de Compra</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="any"
                value={formData.purchasePrice}
                onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="sector">Setor</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={e => setFormData(prev => ({ ...prev, sector: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Data da Compra</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingInvestment(null); }}>
                Cancelar
              </Button>
              <Button type="submit">{editingInvestment ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Aqui você pode adicionar os gráficos, resumos, e outros componentes que quiser */}
    </>
  );
};

export default Investments;
