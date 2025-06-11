import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, parseDate, formatInputDate, getSystemDateISO } from '@/utils/formatters';
import { List, CalendarDays, Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { isValid } from 'date-fns';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const RecentTransactions = ({ transactions, categories = [], onEditTransaction, onDeleteTransaction, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getSystemDateISO()); // Set initial to current system date
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const [editFormData, setEditFormData] = useState({
    id: '', type: 'expense', amount: '', description: '', category: '', date: '', tags: ''
  });

  useEffect(() => {
    // Update selectedDate if modal opens and it's not the current system date (e.g., after month change)
    if (isModalOpen) {
        setSelectedDate(getSystemDateISO());
    }
  }, [isModalOpen]);


  const recentTransactionsPreview = transactions
    .sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if(!isValid(dateA)) return 1;
        if(!isValid(dateB)) return -1;
        return dateB - dateA;
    })
    .slice(0, 4);

  const transactionsForSelectedDate = transactions
    .filter(t => formatInputDate(t.date) === selectedDate)
    .sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if(!isValid(dateA)) return 1;
        if(!isValid(dateB)) return -1;
        return dateB - dateA;
    });

  const getCategoryInfo = (categoryId) => {
    if (!categories || !Array.isArray(categories)) {
      return { name: categoryId, icon: '🏷️' }; 
    }
    return categories.find(c => c.id === categoryId) || { name: categoryId, icon: '🏷️' };
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: formatInputDate(transaction.date),
      tags: transaction.tags?.join(', ') || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(editFormData.amount);
    if (isNaN(amount) || !editFormData.description || !editFormData.date) {
      toast({ title: "Atenção", description: "Preencha valor, descrição e data.", variant: "destructive" });
      return;
    }
    const updatedTransaction = {
      ...editingTransaction,
      ...editFormData,
      amount: amount,
      date: formatInputDate(editFormData.date),
      tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    onEditTransaction(updatedTransaction);
    toast({ title: "Sucesso!", description: "Transação atualizada." });
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteClick = (transactionId) => {
    onDeleteTransaction(transactionId);
    toast({ title: "Sucesso!", description: "Transação removida." });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="gradient-text flex items-center gap-2">
              <List className="h-5 w-5" />
              Transações Recentes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => { setSelectedDate(getSystemDateISO()); setIsModalOpen(true); } }>
              Ver Todas do Dia
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactionsPreview.length > 0 ? recentTransactionsPreview.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            const transactionDate = parseDate(transaction.date);
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md hover:bg-slate-800/70 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{categoryInfo.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryInfo.name} - {!isValid(transactionDate) ? 'Data inválida' : formatDate(transactionDate)}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            );
          }) : <p className="text-sm text-muted-foreground text-center">Nenhuma transação recente.</p>}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-effect sm:max-w-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Transações de
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto inline-flex h-8 text-sm bg-slate-800 border-slate-700 focus:bg-slate-700 text-slate-100" // Added focus and text color
              />
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 mt-4">
            {transactionsForSelectedDate.length > 0 ? transactionsForSelectedDate.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{categoryInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(transaction)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(transaction.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação para {formatDate(parseDate(selectedDate))}.</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-effect sm:max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Editar Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label htmlFor="editTransType">Tipo</Label><Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="editTransAmount">Valor</Label><Input id="editTransAmount" type="number" step="0.01" value={editFormData.amount} onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))} /></div>
            </div>
            <div><Label htmlFor="editTransDesc">Descrição</Label><Input id="editTransDesc" value={editFormData.description} onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label htmlFor="editTransCat">Categoria</Label><Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}<SelectItem value="outros">Outros</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="editTransDate">Data</Label><Input id="editTransDate" type="date" value={editFormData.date} onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))} /></div>
            </div>
            <div><Label htmlFor="editTransTags">Tags</Label><Input id="editTransTags" value={editFormData.tags} onChange={(e) => setEditFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="Ex: viagem, urgente (opcional)" /></div>
            <Button type="submit" className="w-full">Atualizar Transação</Button>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default RecentTransactions;