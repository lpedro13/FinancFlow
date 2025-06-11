
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, parseDate, getMonthName } from '@/utils/formatters';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import MonthSelector from '@/components/MonthSelector';
import { getMonth, getYear as dfnsGetYear, isSameMonth } from 'date-fns';

const Budgets = ({ budgets, setBudgets, categories, transactions, currentMonthDate, onMonthChange }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const { toast } = useToast();

  const initialFormData = {
    category: '',
    amount: '',
    month: getMonth(currentMonthDate),
    year: dfnsGetYear(currentMonthDate),
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      month: getMonth(currentMonthDate),
      year: dfnsGetYear(currentMonthDate),
    });
    setEditingBudget(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (!formData.category || isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Categoria e valor do orçamento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const budgetData = {
      id: editingBudget ? editingBudget.id : uuidv4(),
      category: formData.category,
      amount: amount,
      month: parseInt(formData.month),
      year: parseInt(formData.year),
    };

    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? budgetData : b));
      toast({ title: "Sucesso!", description: "Orçamento atualizado." });
    } else {
      const existingBudget = budgets.find(b => b.category === budgetData.category && b.month === budgetData.month && b.year === budgetData.year);
      if (existingBudget) {
        toast({ title: "Erro", description: "Já existe um orçamento para esta categoria neste mês.", variant: "destructive" });
        return;
      }
      setBudgets(prev => [...prev, budgetData]);
      toast({ title: "Sucesso!", description: "Orçamento adicionado." });
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast({ title: "Sucesso!", description: "Orçamento removido." });
  };

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === getMonth(currentMonthDate) && b.year === dfnsGetYear(currentMonthDate));
  }, [budgets, currentMonthDate]);

  const budgetDetails = useMemo(() => {
    return currentMonthBudgets.map(budget => {
      const categoryInfo = categories.find(c => c.id === budget.category);
      const spentAmount = transactions
        .filter(t => t.category === budget.category && t.type === 'expense' && isSameMonth(parseDate(t.date), currentMonthDate))
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
      const remaining = budget.amount - spentAmount;
      
      let status = 'normal';
      let statusColor = 'bg-green-400';
      let indicatorColor = '!bg-green-600';

      if (progress > 100) {
        status = 'over';
        statusColor = 'bg-red-400';
        indicatorColor = '!bg-red-600';
        toast({
          title: `Orçamento Estourado: ${categoryInfo?.name || budget.category}`,
          description: `Você ultrapassou o orçamento em ${formatCurrency(Math.abs(remaining))}.`,
          variant: "destructive",
          duration: 7000,
        });
      } else if (progress >= 85) {
        status = 'warning';
        statusColor = 'bg-yellow-400';
        indicatorColor = '!bg-yellow-600';
        toast({
          title: `Alerta de Orçamento: ${categoryInfo?.name || budget.category}`,
          description: `Você já utilizou ${progress.toFixed(0)}% do seu orçamento. Restam ${formatCurrency(remaining)}.`,
          variant: "default",
          duration: 7000,
        });
      }


      return {
        ...budget,
        categoryName: categoryInfo?.name || budget.category,
        categoryIcon: categoryInfo?.icon || '💰',
        spentAmount,
        progress,
        remaining,
        status,
        statusColor,
        indicatorColor,
      };
    }).sort((a,b) => (b.spentAmount / b.amount) - (a.spentAmount / a.amount));
  }, [currentMonthBudgets, categories, transactions, currentMonthDate, toast]);

  const totalBudgeted = useMemo(() => budgetDetails.reduce((sum, b) => sum + b.amount, 0), [budgetDetails]);
  const totalSpent = useMemo(() => budgetDetails.reduce((sum, b) => sum + b.spentAmount, 0), [budgetDetails]);

  const availableYears = useMemo(() => {
    const currentYr = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYr - 2 + i); 
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <MonthSelector currentMonth={currentMonthDate} onMonthChange={onMonthChange} />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-9 text-xs sm:text-sm self-end sm:self-center">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect w-[90vw] max-w-lg">
            <DialogHeader>
              <DialogTitle className="gradient-text">{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento Mensal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMonth">Mês</Label>
                  <Select value={String(formData.month)} onValueChange={(val) => setFormData(prev => ({ ...prev, month: Number(val) }))}>
                    <SelectTrigger id="budgetMonth"><SelectValue /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i} value={String(i)}>{getMonthName(i)}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budgetYear">Ano</Label>
                  <Select value={String(formData.year)} onValueChange={(val) => setFormData(prev => ({ ...prev, year: Number(val) }))}>
                    <SelectTrigger id="budgetYear"><SelectValue /></SelectTrigger>
                    <SelectContent>{availableYears.map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="budgetCategory">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger id="budgetCategory"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budgetAmount">Valor do Orçamento</Label>
                <Input id="budgetAmount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                {editingBudget ? 'Atualizar Orçamento' : 'Adicionar Orçamento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Orçamentos para {getMonthName(getMonth(currentMonthDate))} de {dfnsGetYear(currentMonthDate)}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Orçado: {formatCurrency(totalBudgeted)} | Total Gasto: {formatCurrency(totalSpent)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Landmark className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Nenhum orçamento cadastrado para este mês.</p>
              </div>
            ) : (
              budgetDetails.map((budget, index) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    budget.status === 'over' ? 'border-red-500/50 bg-red-500/10' :
                    budget.status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' :
                    'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                    <div className="flex items-center gap-2 mb-1 sm:mb-0">
                      <span className="text-lg">{budget.categoryIcon}</span>
                      <h3 className="text-base sm:text-lg font-semibold">{budget.categoryName}</h3>
                      {budget.status === 'over' && <AlertCircle className="h-5 w-5 text-red-400" />}
                      {budget.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                      {budget.progress <= 100 && budget.status !== 'warning' && budget.status !== 'over' && <CheckCircle className="h-5 w-5 text-green-400" />}
                    </div>
                    <div className="flex gap-1 self-start sm:self-center">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-500/20"><Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                    </div>
                  </div>
                  <Progress value={Math.min(budget.progress, 100)} className={`h-2 sm:h-3 ${budget.statusColor}`} 
                    indicatorClassName={budget.indicatorColor}
                  />
                  <div className="flex justify-between items-center text-xs sm:text-sm mt-1.5">
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.amount)}
                    </span>
                    <span className={`font-medium ${
                      budget.remaining < 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {budget.remaining < 0 ? `-${formatCurrency(Math.abs(budget.remaining))} excedido` : `${formatCurrency(budget.remaining)} restante`}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;
