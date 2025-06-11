import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate, parseDate, formatInputDate, getSystemDateISO } from '@/utils/formatters';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, ListFilter, FilePieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import CategoryManager from '@/components/CategoryManager';
import AccountsPayable from '@/components/AccountsPayable';
import { v4 as uuidv4 } from 'uuid';
import MonthSelector from '@/components/MonthSelector';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';


const Transactions = ({ 
  transactions, 
  setTransactions, 
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  categories, 
  setCategories, 
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  accountsPayable, 
  setAccountsPayable, 
  currentMonthDate, 
  onMonthChange,
  onPayAccount
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const { toast } = useToast();

  const initialFormState = {
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: getSystemDateISO(),
    tags: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData({...initialFormState, date: getSystemDateISO()});
    setEditingTransaction(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || !formData.description || !formData.date) {
      toast({
        title: "Atenção",
        description: "Preencha os campos de valor, descrição e data.",
        variant: "destructive"
      });
      return;
    }

    const transaction = {
      id: editingTransaction ? editingTransaction.id : uuidv4(),
      type: formData.type,
      amount: amount,
      description: formData.description,
      category: formData.category || 'outros',
      date: formatInputDate(formData.date),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (editingTransaction) {
      onUpdateTransaction(transaction);
      toast({ title: "Sucesso!", description: "Transação atualizada." });
    } else {
      onAddTransaction(transaction);
      toast({ title: "Sucesso!", description: "Transação adicionada." });
    }

    resetForm();
    setIsFormOpen(false);
  };
  
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: formatInputDate(transaction.date), 
      tags: transaction.tags?.join(', ') || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    onDeleteTransaction(id);
    toast({ title: "Sucesso!", description: "Transação removida." });
  };

  const handleLocalMonthChange = (newDate) => {
    onMonthChange(newDate);
  };

  const transactionsForCurrentMonth = useMemo(() => {
    const start = startOfMonth(currentMonthDate);
    const end = endOfMonth(currentMonthDate);
    return transactions.filter(t => {
      const transactionDate = parseDate(t.date); 
      return isValid(transactionDate) && isWithinInterval(transactionDate, { start, end });
    });
  }, [transactions, currentMonthDate]);


  const filteredTransactionsToDisplay = useMemo(() => {
    return transactionsForCurrentMonth.filter(transaction => {
      const searchLower = searchTerm.toLowerCase();
      const categoryInfo = categories.find(c => c.id === transaction.category);
      const categoryName = categoryInfo ? categoryInfo.name.toLowerCase() : (transaction.category || '').toLowerCase();

      const matchesSearch = transaction.description.toLowerCase().includes(searchLower) ||
                           categoryName.includes(searchLower) ||
                           (transaction.tags && transaction.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if(!isValid(dateA)) return 1;
      if(!isValid(dateB)) return -1;
      return dateB - dateA;
    });
  }, [transactionsForCurrentMonth, searchTerm, filterCategory, filterType, categories]);

  const totalIncome = useMemo(() => 
    filteredTransactionsToDisplay.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactionsToDisplay]);

  const totalExpenses = useMemo(() =>
    filteredTransactionsToDisplay.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactionsToDisplay]);
  
  const expensesByCategoryChartData = useMemo(() => {
    const grouped = filteredTransactionsToDisplay
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryInfo = categories.find(c => c.id === t.category);
        const name = categoryInfo ? categoryInfo.name : (t.category || 'Outros');
        const color = categoryInfo ? categoryInfo.color : '#8884d8';
        if (!acc[name]) {
          acc[name] = { name, value: 0, color };
        }
        acc[name].value += t.amount;
        return acc;
      }, {});
    return Object.values(grouped);
  }, [filteredTransactionsToDisplay, categories]);


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="glass-effect border-green-500/20">
          <CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-green-400">Receitas (Mês)</CardTitle><TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" /></CardHeader>
          <CardContent className="pt-1 sm:pt-0"><div className="text-lg sm:text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-red-500/20">
          <CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-red-400">Despesas (Mês)</CardTitle><TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" /></CardHeader>
          <CardContent className="pt-1 sm:pt-0"><div className="text-lg sm:text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div></CardContent>
        </Card>
        <Card className="glass-effect border-blue-500/20">
          <CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-blue-400">Saldo (Mês)</CardTitle><TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" /></CardHeader>
          <CardContent className="pt-1 sm:pt-0"><div className={`text-lg sm:text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(totalIncome - totalExpenses)}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <FilePieChart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              <CardTitle className="gradient-text text-base sm:text-lg">Transações do Mês</CardTitle>
            </div>
            <MonthSelector currentMonth={currentMonthDate} onMonthChange={handleLocalMonthChange} />
            <div className="flex gap-2 self-end sm:self-center">
              <CategoryManager 
                categories={categories} 
                onAddCategory={onAddCategory} 
                onDeleteCategory={onDeleteCategory}
                onUpdateCategory={onUpdateCategory}
              />
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild><Button onClick={resetForm} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-9 text-xs sm:text-sm"><Plus className="h-4 w-4 mr-1 sm:mr-2" />Nova Transação</Button></DialogTrigger>
                <DialogContent className="glass-effect w-[90vw] max-w-lg">
                  <DialogHeader><DialogTitle className="gradient-text">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle></DialogHeader>
                  <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="transType">Tipo</Label><Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent></Select></div>
                      <div><Label htmlFor="transAmount">Valor</Label><Input id="transAmount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} /></div>
                    </div>
                    <div><Label htmlFor="transDesc">Descrição</Label><Input id="transDesc" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="transCat">Categoria</Label><Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}<SelectItem value="outros">Outros</SelectItem></SelectContent></Select></div>
                      <div><Label htmlFor="transDate">Data</Label><Input id="transDate" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} /></div>
                    </div>
                    <div><Label htmlFor="transTags">Tags</Label><Input id="transTags" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="Ex: viagem, urgente (opcional)" /></div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">{editingTransaction ? 'Atualizar' : 'Adicionar'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="relative flex-1"><Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 sm:pl-10 h-9 text-xs sm:text-sm" /></div>
            <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-full sm:w-40 md:w-48 h-9 text-xs sm:text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}<SelectItem value="all">Todas Categorias</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select>
            <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-full sm:w-28 md:w-32 h-9 text-xs sm:text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="income">Receitas</SelectItem><SelectItem value="expense">Despesas</SelectItem></SelectContent></Select>
          </div>
          <ScrollArea className="h-[300px] pr-4"> {/* Added ScrollArea and limited height */}
            <div className="space-y-3">
              {filteredTransactionsToDisplay.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><ListFilter className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 opacity-50" /><p className="text-xs sm:text-sm">Nenhuma transação encontrada para este mês ou filtros.</p></div>
              ) : (
                filteredTransactionsToDisplay.map((transaction, index) => {
                  const category = categories.find(c => c.id === transaction.category);
                  return (
                    <motion.div key={transaction.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/60 rounded-md hover:bg-slate-800/80 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-md">{category?.icon || '🏷️'}</span>
                          <div>
                            <p className="font-medium text-xs sm:text-sm">{transaction.description}</p>
                            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                              <span>{category?.name || transaction.category}</span><span>•</span><span>{formatDate(parseDate(transaction.date))}</span>
                              {transaction.tags && transaction.tags.length > 0 && (<><span>•</span><div className="flex gap-1">{transaction.tags.map((tag, i) => (<span key={i} className="px-1 py-0.5 sm:px-1.5 bg-blue-500/20 text-blue-400 rounded text-xs">{tag}</span>))}</div></>)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="text-right"><p className={`font-semibold text-xs sm:text-sm ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</p></div>
                        <div className="flex gap-0.5 sm:gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(transaction)} className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-blue-500/20"><Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(transaction.id)} className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-red-500/20"><Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card className="glass-effect mt-4 sm:mt-6">
        <CardHeader><CardTitle className="gradient-text text-base sm:text-lg">Gastos por Categoria (Mês)</CardTitle></CardHeader>
        <CardContent>
          {expensesByCategoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expensesByCategoryChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={window.innerWidth < 640 ? 60 : 80} fill="#8884d8" dataKey="value"  labelStyle={{ fontSize: '10px' }}>
                  {expensesByCategoryChartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10 text-xs sm:text-sm">Nenhuma despesa neste mês para exibir no gráfico.</p>
          )}
        </CardContent>
      </Card>

      <AccountsPayable accounts={accountsPayable || []} setAccounts={setAccountsPayable} onPayAccount={onPayAccount} />
    </div>
  );
};

export default Transactions;