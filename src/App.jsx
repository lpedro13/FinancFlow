import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/components/Dashboard';
import Transactions from '@/components/Transactions';
import Investments from '@/components/Investments';
import Goals from '@/components/Goals';
import Reports from '@/components/reports/Reports'; 
import Budgets from '@/components/Budgets';
import FinancialEducation from '@/components/FinancialEducation';
import { BarChart3, TrendingUp, Target, FileText, Wallet, PiggyBank, Trash2, BookOpen, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMonthName, parseDate, getSystemDate } from '@/utils/formatters';
import { useAppStateManager } from '@/hooks/useAppStateManager';
import { subMonths, getMonth, getYear as dfnsGetYear } from 'date-fns';

function App() {
  const {
    transactions,
    investments,
    goals,
    budgets,
    accountsPayable,
    userDefinedAlerts,
    categories,
    investmentTypes,
    currentMonthDate,
    previousMonthBalance,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleSetTransactions,
    handleAddInvestment,
    handleUpdateInvestment,
    handleDeleteInvestment,
    handleAddGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddGoalContribution,
    handleMonthChange,
    handleResetData,
    setResetPeriod,
    setResetMonth,
    setResetYear,
    resetPeriod,
    resetMonth,
    resetYear,
    availableYears,
    setCategories,
    setInvestmentTypes,
    setAccountsPayable,
    setUserDefinedAlerts,
    setBudgets,
    handlePayAccount,
    handleGenerateRecurringAccounts,
    handleDeleteCategory,
    handleUpdateCategory,
    handleAddCategory,
    handleDeleteInvestmentType,
    handleUpdateInvestmentType,
    handleAddInvestmentType,
  } = useAppStateManager();
  
  const { toast } = useToast();

  const isValidDate = (d) => d instanceof Date && !isNaN(d);

  React.useEffect(() => {
    handleGenerateRecurringAccounts();
  }, [currentMonthDate, handleGenerateRecurringAccounts]);


  const filteredTransactionsForCurrentMonth = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const transactionDate = parseDate(t.date);
      return isValidDate(transactionDate) && transactionDate.getMonth() === currentMonthDate.getMonth() && transactionDate.getFullYear() === currentMonthDate.getFullYear();
    });
  }, [transactions, currentMonthDate]);

  const filteredInvestments = useMemo(() => {
    return investments || [];
  }, [investments]);

  const filteredGoals = useMemo(() => {
    return goals || [];
  }, [goals]);

  const currentMonthBalanceCarriedOver = useMemo(() => {
    const prevMonth = subMonths(currentMonthDate, 1);
    const prevMonthYear = dfnsGetYear(prevMonth);
    const prevMonthMonth = getMonth(prevMonth);

    const prevMonthTransactions = transactions.filter(t => {
        const tDate = parseDate(t.date);
        return isValidDate(tDate) && getMonth(tDate) === prevMonthMonth && dfnsGetYear(tDate) === prevMonthYear;
    });
    const income = prevMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = prevMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expenses > 0 ? income - expenses : 0;
  }, [transactions, currentMonthDate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold gradient-text mb-3 sm:mb-4 animate-float">
            💰 FinanceFlow
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto">
            Controle financeiro completo e inteligente. Gerencie receitas, despesas, investimentos e metas em um só lugar.
          </p>
        </motion.div>

        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 glass-effect p-1">
              <TabsTrigger value="dashboard" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Painel</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Transações</span>
                <span className="sm:hidden">Trans.</span>
              </TabsTrigger>
              <TabsTrigger value="investments" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Investim.</span>
                <span className="sm:hidden">Invest.</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Metas</span>
                <span className="sm:hidden">Metas</span>
              </TabsTrigger>
              <TabsTrigger value="budgets" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <Landmark className="h-4 w-4" />
                <span className="hidden sm:inline">Orçamentos</span>
                <span className="sm:hidden">Orçam.</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
                <span className="sm:hidden">Relat.</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Educação</span>
                <span className="sm:hidden">Dicas</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TabsContent value="dashboard">
              <Dashboard 
                transactions={transactions || []}
                investments={filteredInvestments}
                goals={filteredGoals}
                budgets={budgets || []}
                accountsPayable={accountsPayable || []}
                currentMonthDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                categories={categories || []}
                userDefinedAlerts={userDefinedAlerts || []}
                setUserDefinedAlerts={setUserDefinedAlerts}
                previousMonthBalance={currentMonthBalanceCarriedOver}
                onEditTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onAddTransaction={handleAddTransaction}
              />
            </TabsContent>

            <TabsContent value="transactions">
              <Transactions 
                transactions={transactions || []} 
                setTransactions={handleSetTransactions}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                categories={categories || []}
                setCategories={setCategories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpdateCategory={handleUpdateCategory}
                accountsPayable={accountsPayable || []}
                setAccountsPayable={setAccountsPayable}
                currentMonthDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                onPayAccount={handlePayAccount}
              />
            </TabsContent>

            <TabsContent value="investments">
              <Investments 
                investments={investments || []}
                setInvestments={handleAddInvestment}
                updateInvestment={handleUpdateInvestment}
                deleteInvestment={handleDeleteInvestment}
                investmentTypes={investmentTypes || []}
                setInvestmentTypes={setInvestmentTypes}
                onAddInvestmentType={handleAddInvestmentType}
                onUpdateInvestmentType={handleUpdateInvestmentType}
                onDeleteInvestmentType={handleDeleteInvestmentType}
                currentMonthDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                allTransactions={transactions || []}
              />
            </TabsContent>

            <TabsContent value="goals">
              <Goals 
                goals={goals || []}
                setGoals={handleAddGoal}
                updateGoal={handleUpdateGoal}
                deleteGoal={handleDeleteGoal}
                onAddContribution={handleAddGoalContribution}
                currentMonthDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                transactions={transactions || []}
              />
            </TabsContent>
            
            <TabsContent value="budgets">
              <Budgets
                budgets={budgets || []}
                setBudgets={setBudgets}
                categories={categories || []}
                transactions={transactions || []}
                currentMonthDate={currentMonthDate}
                onMonthChange={handleMonthChange}
              />
            </TabsContent>

            <TabsContent value="reports">
              <Reports 
                transactions={transactions || []}
                investments={investments || []}
                goals={goals || []}
                categories={categories || []}
                investmentTypes={investmentTypes || []}
              />
            </TabsContent>

            <TabsContent value="education">
              <FinancialEducation 
                transactions={transactions || []}
                categories={categories || []}
                currentMonthDate={currentMonthDate}
              />
            </TabsContent>
          </motion.div>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="glass-effect rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <PiggyBank className="h-5 sm:h-6 w-5 sm:w-6 text-green-400" />
              <span className="text-base sm:text-lg font-semibold gradient-text">FinanceFlow</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Transformando sua relação com o dinheiro através de tecnologia e inteligência financeira.
            </p>
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Resetar Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-effect">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="gradient-text">Confirmar Reset de Dados</AlertDialogTitle>
                    <AlertDialogDescription>
                      Selecione o período para resetar os dados. Esta ação é irreversível.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 my-4">
                    <div>
                      <Label htmlFor="reset-period" className="text-sm font-medium text-slate-300">Período para Resetar</Label>
                      <Select value={resetPeriod} onValueChange={setResetPeriod}>
                        <SelectTrigger id="reset-period" className="w-full mt-1">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Dados</SelectItem>
                          <SelectItem value="month">Mês Específico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {resetPeriod === 'month' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reset-month" className="text-sm font-medium text-slate-300">Mês</Label>
                          <Select value={String(resetMonth)} onValueChange={(val) => setResetMonth(Number(val))}>
                            <SelectTrigger id="reset-month" className="w-full mt-1">
                              <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>{getMonthName(i)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reset-year" className="text-sm font-medium text-slate-300">Ano</Label>
                          <Select value={String(resetYear)} onValueChange={(val) => setResetYear(Number(val))}>
                            <SelectTrigger id="reset-year" className="w-full mt-1">
                              <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableYears.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleResetData(toast)} className="bg-destructive hover:bg-destructive/90">
                      Sim, Resetar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="text-xs text-slate-600 mt-3 sm:mt-4">
              © {getSystemDate().getFullYear()} FinanceFlow. Todos os direitos reservados.
            </p>
          </div>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;