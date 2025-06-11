import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { Plus, Target, CalendarDays, TrendingUp, Edit, Trash2, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { calculateMonthlyContribution } from '@/utils/calculations';
import GoalContribution from '@/components/GoalContribution';
import { v4 as uuidv4 } from 'uuid';
import MonthSelector from '@/components/MonthSelector';

const Goals = ({ goals, setGoals, updateGoal, deleteGoal, onAddContribution, transactions, currentMonthDate, onMonthChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { toast } = useToast();

  const initialFormData = {
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;

    if (!formData.name || isNaN(targetAmount) || targetAmount <= 0 || !formData.deadline) {
      toast({
        title: "Erro",
        description: "Nome, valor objetivo e prazo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    if (currentAmount < 0 || currentAmount > targetAmount) {
        toast({
            title: "Erro",
            description: "Valor atual inválido.",
            variant: "destructive"
        });
        return;
    }

    const deadlineDate = parseDate(formData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      toast({ title: "Erro", description: "Data de prazo inválida.", variant: "destructive" });
      return;
    }

    const goalData = {
      id: editingGoal ? editingGoal.id : uuidv4(),
      name: formData.name,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      deadline: deadlineDate.toISOString().split('T')[0],
      category: formData.category
    };

    if (editingGoal) {
      updateGoal(goalData);
      toast({ title: "Sucesso!", description: "Meta atualizada." });
    } else {
      setGoals(goalData); 
      toast({ title: "Sucesso!", description: "Meta criada." });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingGoal(null);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteGoal(id);
    toast({ title: "Sucesso!", description: "Meta removida." });
  };
  
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

  const goalTransactions = useMemo(() => {
    return transactions.filter(t => t.category === 'metas' || t.tags?.some(tag => tag.startsWith('meta-') || tag.startsWith('retirada-meta-')));
  }, [transactions]);

  return (
    <div className="space-y-4 sm:space-y-6">
       <div className="flex justify-end">
        <MonthSelector currentMonth={currentMonthDate} onMonthChange={onMonthChange} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <Card className="glass-effect border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-400">Total de Metas</CardTitle>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{goals.length}</div>
            <p className="text-xs text-muted-foreground">{completedGoals} concluídas</p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-400">Valor Objetivo</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-400">{formatCurrency(totalTargetAmount)}</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-400">Valor Atual</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-purple-400">{formatCurrency(totalCurrentAmount)}</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-400">Progresso Geral</CardTitle>
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-yellow-400">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="mt-1 sm:mt-2 h-1.5 sm:h-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="gradient-text">Minhas Metas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-9 text-xs sm:text-sm">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect w-[90vw] max-w-lg">
                <DialogHeader>
                  <DialogTitle className="gradient-text">{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="goalName">Nome da Meta</Label>
                    <Input id="goalName" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetAmount">Valor Objetivo</Label>
                      <Input id="targetAmount" type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="currentAmount">Valor Atual (opcional)</Label>
                      <Input id="currentAmount" type="number" step="0.01" value={formData.currentAmount} onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline">Prazo</Label>
                      <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="goalCategory">Categoria (opcional)</Label>
                      <Input id="goalCategory" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    {editingGoal ? 'Atualizar Meta' : 'Criar Meta'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Nenhuma meta cadastrada.</p>
                <p className="text-xs sm:text-sm">Crie sua primeira meta financeira!</p>
              </div>
            ) : (
              goals.map((goal, index) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                const monthlyNeeded = goal.monthlyContribution;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 sm:p-6 rounded-lg border transition-all ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-700'}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-base sm:text-xl font-semibold flex items-center gap-2">
                          {goal.name} {isCompleted && <span className="text-green-400">✓</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span>📅 {formatDate(goal.deadline)}</span>
                          {goal.category && (<><span>•</span><span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{goal.category}</span></>)}
                        </div>
                      </div>
                      <div className="flex gap-1 self-start sm:self-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-500/20"><Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Progresso</span>
                        <span className="text-xs sm:text-sm font-medium">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2 sm:h-3" />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm">
                        <span className={`font-medium ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>{progress.toFixed(1)}% concluído</span>
                        {!isCompleted && monthlyNeeded > 0 && (<span className="text-muted-foreground mt-1 sm:mt-0">{formatCurrency(monthlyNeeded)}/mês necessário</span>)}
                      </div>
                      {!isCompleted && (
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                           <GoalContribution goalId={goal.id} goalName={goal.name} onAddContribution={onAddContribution} type="contribution" />
                           <GoalContribution goalId={goal.id} goalName={goal.name} onAddContribution={onAddContribution} type="withdrawal" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2"><List className="h-5 w-5" /> Transações das Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {goalTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma transação relacionada a metas ainda.</p>
            ) : (
              goalTransactions.map((transaction, index) => (
                <motion.div 
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/60 rounded-md text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;