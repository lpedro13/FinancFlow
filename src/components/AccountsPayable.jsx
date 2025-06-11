import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate, parseDate, formatInputDate, getSystemDateISO } from '@/utils/formatters';
import { Plus, Edit, Trash2, CheckCircle, AlertTriangle, CalendarClock, Repeat, WalletCards } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { categories as defaultCategories } from '@/data/mockData';
import { isPast, isToday, differenceInDays, isValid, addMonths } from 'date-fns';

const AccountsPayable = ({ accounts, setAccounts, onPayAccount }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const { toast } = useToast();

  const initialFormData = {
    description: '',
    amount: '',
    dueDate: getSystemDateISO(),
    category: '',
    paid: false,
    isRecurring: false,
    installments: '', 
    recurrenceType: 'monthly', 
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData({ ...initialFormData, dueDate: getSystemDateISO() });
    setEditingAccount(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || !formData.description || !formData.dueDate) {
       toast({
        title: "Atenção",
        description: "Preencha os campos de descrição, valor e data de vencimento.",
        variant: "destructive"
      });
      return;
    }
    
    const installments = formData.isRecurring && formData.recurrenceType === 'installments' ? parseInt(formData.installments) : (formData.isRecurring && formData.recurrenceType === 'monthly' ? Infinity : 1);
    if (formData.isRecurring && formData.recurrenceType === 'installments' && (isNaN(installments) || installments <= 0)) {
        toast({ title: "Atenção", description: "Número de parcelas inválido.", variant: "destructive" });
        return;
    }


    const accountData = {
      id: editingAccount ? editingAccount.id : uuidv4(),
      description: formData.description,
      amount: amount,
      dueDate: formatInputDate(formData.dueDate),
      category: formData.category || 'outros',
      paid: formData.paid || false,
      isRecurring: formData.isRecurring,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
      totalInstallments: formData.isRecurring && formData.recurrenceType === 'installments' ? installments : null,
      currentInstallment: formData.isRecurring && formData.recurrenceType === 'installments' ? 1 : null,
      originalDueDate: formData.isRecurring ? formatInputDate(formData.dueDate) : null,
    };

    if (editingAccount) {
      setAccounts(prev => prev.map(acc => acc.id === editingAccount.id ? accountData : acc));
      toast({ title: "Sucesso!", description: "Conta atualizada." });
    } else {
      setAccounts(prev => [...prev, accountData]);
      toast({ title: "Sucesso!", description: "Conta a pagar adicionada." });
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      description: account.description,
      amount: account.amount.toString(),
      dueDate: formatInputDate(account.dueDate),
      category: account.category,
      paid: account.paid,
      isRecurring: account.isRecurring || false,
      installments: account.totalInstallments && account.totalInstallments !== Infinity ? account.totalInstallments.toString() : '',
      recurrenceType: account.recurrenceType || 'monthly',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    toast({ title: "Sucesso!", description: "Conta removida." });
  };
  
  const sortedAccounts = useMemo(() => 
    [...(accounts || [])].sort((a, b) => {
      const dateA = parseDate(a.dueDate);
      const dateB = parseDate(b.dueDate);
      if (!isValid(dateA)) return 1;
      if (!isValid(dateB)) return -1;
      return dateA - dateB;
    }),[accounts]);

  const pendingAccounts = useMemo(() => sortedAccounts.filter(acc => !acc.paid), [sortedAccounts]);
  const paidAccounts = useMemo(() => sortedAccounts.filter(acc => acc.paid), [sortedAccounts]);

  const totalPendingAmount = useMemo(() => 
    pendingAccounts.reduce((sum, acc) => sum + acc.amount, 0),
  [pendingAccounts]);

  const getDueDateStatus = (dueDateString, paid) => {
    if (paid) return { text: 'Paga', color: 'text-green-400', icon: <CheckCircle className="h-4 w-4" /> };
    const today = parseDate(getSystemDateISO());
    const date = parseDate(dueDateString); 
    
    if (!isValid(date)) return { text: 'Data inválida', color: 'text-gray-400', icon: <AlertTriangle className="h-4 w-4" /> };

    if (isPast(date) && !isToday(date)) return { text: 'Vencida', color: 'text-red-400', icon: <AlertTriangle className="h-4 w-4" /> };
    if (isToday(date)) return { text: 'Vence Hoje', color: 'text-yellow-400', icon: <CalendarClock className="h-4 w-4" /> };
    const daysLeft = differenceInDays(date, today);
    if (daysLeft <= 7 && daysLeft > 0) return { text: `Vence em ${daysLeft} dia(s)`, color: 'text-orange-400', icon: <CalendarClock className="h-4 w-4" /> };
    if (daysLeft > 0) return { text: `Vence em ${daysLeft} dia(s)`, color: 'text-blue-400', icon: <CalendarClock className="h-4 w-4" /> };
    return { text: 'Pendente', color: 'text-gray-400', icon: <CalendarClock className="h-4 w-4" /> }; // Default if none of the above
  };

  const getInstallmentText = (account) => {
    if (!account.isRecurring || !account.recurrenceType) return '';
    if (account.recurrenceType === 'monthly') return '(Fixa)';
    if (account.recurrenceType === 'installments' && account.totalInstallments !== Infinity) {
      if (account.currentInstallment === account.totalInstallments) return `(Última Parcela ${account.currentInstallment}/${account.totalInstallments})`;
      return `(Parcela ${account.currentInstallment}/${account.totalInstallments})`;
    }
    return '';
  }


  return (
    <Card className="glass-effect mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
             <WalletCards className="h-6 w-6 text-purple-400" />
             <CardTitle className="gradient-text">Contas a Pagar</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Pendente:</p>
            <p className="text-lg font-semibold text-red-400">{formatCurrency(totalPendingAmount)}</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-9 text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="gradient-text">{editingAccount ? 'Editar Conta' : 'Nova Conta a Pagar'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div><Label htmlFor="accDesc">Descrição</Label><Input id="accDesc" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="accAmount">Valor</Label><Input id="accAmount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} /></div>
                  <div><Label htmlFor="accDueDate">Data de Vencimento</Label><Input id="accDueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} /></div>
                </div>
                <div><Label htmlFor="accCat">Categoria</Label><Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger><SelectContent>{defaultCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}<SelectItem value="outros">Outros</SelectItem></SelectContent></Select></div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="isRecurring" checked={formData.isRecurring} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))} />
                  <Label htmlFor="isRecurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Conta Recorrente?
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-slate-700 ml-2">
                    <div>
                      <Label htmlFor="recurrenceType">Tipo de Recorrência</Label>
                      <Select value={formData.recurrenceType} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceType: value }))}>
                        <SelectTrigger id="recurrenceType"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal (fixo)</SelectItem>
                          <SelectItem value="installments">Parcelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.recurrenceType === 'installments' && (
                      <div>
                        <Label htmlFor="installments">Número de Parcelas</Label>
                        <Input id="installments" type="number" value={formData.installments} onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))} placeholder="Ex: 12" />
                      </div>
                    )}
                  </div>
                )}
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">{editingAccount ? 'Atualizar Conta' : 'Adicionar Conta'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4"> {/* Added ScrollArea */}
          <div className="space-y-3">
            {pendingAccounts.length === 0 && paidAccounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conta a pagar cadastrada.</p>
              </div>
            )}
            {pendingAccounts.map((account, index) => {
              const status = getDueDateStatus(account.dueDate, account.paid);
              const category = defaultCategories.find(c => c.id === account.category);
              const installmentText = getInstallmentText(account);
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border ${
                    status.color === 'text-red-400' ? 'border-red-500/30 bg-red-500/10' : 
                    status.color === 'text-yellow-400' ? 'border-yellow-500/30 bg-yellow-500/10' :
                    'border-slate-700 bg-slate-800/50 hover:bg-slate-800/70'
                  } transition-colors gap-2 sm:gap-0`}
                >
                  <div className="flex items-center gap-3 flex-grow">
                    <span className={`text-md ${status.color}`}>{status.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{account.description} {installmentText && <span className="text-xs text-blue-400 ml-1">{installmentText}</span>} </p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                        <span className={status.color}>{status.text}</span>
                        <span>•</span><span>{formatDate(account.dueDate)}</span>
                        {category && (<><span>•</span><span className="flex items-center">{category.icon}<span className="ml-1">{category.name}</span></span></>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                    <div className="text-right flex-grow sm:flex-grow-0"><p className={`font-semibold text-sm ${status.color}`}>{formatCurrency(account.amount)}</p></div>
                    {!account.paid && (
                      <Button variant="outline" size="sm" onClick={() => onPayAccount(account)} className="h-7 text-xs border-green-500/50 text-green-400 hover:bg-green-500/20 hover:text-green-300">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Pagar
                      </Button>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="h-7 w-7 p-0 hover:bg-blue-500/20"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)} className="h-7 w-7 p-0 hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {paidAccounts.length > 0 && (
              <>
                <div className="pt-4 pb-2 text-sm font-semibold text-muted-foreground">Contas Pagas Recentemente</div>
                {paidAccounts.map((account, index) => { // Removed slice to show all paid accounts for scroll test
                  const status = getDueDateStatus(account.dueDate, account.paid);
                  const category = defaultCategories.find(c => c.id === account.category);
                  const installmentText = getInstallmentText(account);
                  return (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (pendingAccounts.length + index) * 0.03 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-800/30 rounded-md border border-slate-700/50 opacity-70 gap-2 sm:gap-0"
                    >
                       <div className="flex items-center gap-3 flex-grow">
                        <span className={`text-md ${status.color}`}>{status.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{account.description} {installmentText && <span className="text-xs text-blue-400 ml-1">{installmentText}</span>}</p>
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                            <span className={status.color}>{status.text}</span>
                            <span>•</span><span>{formatDate(account.dueDate)}</span>
                            {category && (<><span>•</span><span className="flex items-center">{category.icon}<span className="ml-1">{category.name}</span></span></>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                        <div className="text-right flex-grow sm:flex-grow-0"><p className={`font-semibold text-sm ${status.color}`}>{formatCurrency(account.amount)}</p></div>
                         <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="h-7 w-7 p-0 hover:bg-blue-500/20"><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)} className="h-7 w-7 p-0 hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AccountsPayable;