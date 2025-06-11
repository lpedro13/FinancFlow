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
      setInvestments(newInvestment); 
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <MonthSelector 
          currentMonth={currentMonthDate} 
          onMonthChange={onMonthChange} 
        />
        <div className="flex gap-2 self-end sm:self-center">
          <InvestmentManager investmentTypes={investmentTypes} onAddType={(newType) => setInvestmentTypes(prev => [...prev, newType])} />
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingInvestment(null); setFormData(initialFormData); setIsFormOpen(true); }} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-9 text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                Novo Invest.
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect w-[90vw] max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="gradient-text">{editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nome do Ativo</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: PETR4" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                      <SelectContent>{investmentTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} placeholder="100" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="purchasePrice">Preço de Compra (un.)</Label>
                    <Input id="purchasePrice" type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))} placeholder="32,50" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="date">Data da Compra</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sector">Setor (opcional)</Label>
                  <Input id="sector" value={formData.sector} onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))} placeholder="Ex: Petróleo" />
                </div>
                <Button type="submit" className="w-full">{editingInvestment ? 'Atualizar' : 'Adicionar'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="glass-effect border-blue-500/20"><CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-blue-400">Total Investido</CardTitle><DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" /></CardHeader><CardContent className="pt-1 sm:pt-0"><div className="text-lg sm:text-2xl font-bold text-blue-400">{formatCurrency(portfolioMetrics.totalInvested)}</div></CardContent></Card>
        <Card className="glass-effect border-green-500/20"><CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-green-400">Valor Atual</CardTitle><TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" /></CardHeader><CardContent className="pt-1 sm:pt-0"><div className="text-lg sm:text-2xl font-bold text-green-400">{formatCurrency(portfolioMetrics.totalValue)}</div></CardContent></Card>
        <Card className="glass-effect border-purple-500/20"><CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-purple-400">Retorno Total</CardTitle>{portfolioMetrics.totalReturn >= 0 ? <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" /> : <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />}</CardHeader><CardContent className="pt-1 sm:pt-0"><div className={`text-lg sm:text-2xl font-bold ${portfolioMetrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(portfolioMetrics.totalReturn)}</div><p className="text-xs text-muted-foreground">{formatPercentage(portfolioMetrics.returnPercentage)}</p></CardContent></Card>
        <Card className="glass-effect border-amber-500/20"><CardHeader className="pb-1 sm:pb-2"><CardTitle className="text-xs sm:text-sm font-medium text-amber-400">Dividendos</CardTitle><PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" /></CardHeader><CardContent className="pt-1 sm:pt-0"><div className="text-lg sm:text-2xl font-bold text-amber-400">{formatCurrency(portfolioMetrics.totalDividends)}</div><p className="text-xs text-muted-foreground">{formatPercentage(portfolioMetrics.dividendYield)} de yield</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="glass-effect"><CardHeader><CardTitle className="gradient-text text-base sm:text-lg">Distribuição por Tipo</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={window.innerWidth < 640 ? 60 : 80} fill="#8884d8" dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /><Legend wrapperStyle={{fontSize: "12px"}} /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card className="glass-effect"><CardHeader><CardTitle className="gradient-text text-base sm:text-lg">Performance dos Ativos</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, true)} tick={{fontSize: 10}} /><YAxis type="category" dataKey="name" stroke="#9ca3af" width={window.innerWidth < 640 ? 60 : 80} tick={{fontSize: 10}} /><Tooltip formatter={(value, name) => name === 'returnPercentage' ? formatPercentage(value*100) : formatCurrency(value)} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} /><Legend wrapperStyle={{fontSize: "12px"}} /><Bar dataKey="invested" fill="#3b82f6" name="Investido" stackId="a" barSize={15} /><Bar dataKey="current" fill="#10b981" name="Valor Atual" stackId="a" barSize={15} /><Bar dataKey="dividends" fill="#f59e0b" name="Dividendos" stackId="a" barSize={15} /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
      
      <Card className="glass-effect">
        <CardHeader><CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg"><LineChartIcon /> Evolução Total dos Investimentos</CardTitle></CardHeader>
        <CardContent>
          {investmentEvolutionData.length > 1 ? (
            <InvestmentChart data={investmentEvolutionData} />
          ) : (
            <p className="text-muted-foreground text-center py-10">Dados insuficientes para exibir a evolução. Adicione mais histórico de compras/atualizações.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect">
        <CardHeader><CardTitle className="gradient-text text-base sm:text-lg">Meus Investimentos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {investments.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><BarChart3 className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" /><p>Nenhum investimento cadastrado</p></div>) : 
            (investments.map((investment, index) => {
              const metrics = calculateInvestmentMetrics(investment);
              const typeInfo = investmentTypes.find(t => t.id === investment.type);
              return (
                <motion.div key={investment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-3 sm:p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: typeInfo?.color || '#6b7280' }} />
                      <div>
                        <h3 className="font-semibold text-sm sm:text-lg">{investment.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>{typeInfo?.name || investment.type}</span>
                          {investment.sector && (<><span>•</span><span>{investment.sector}</span></>)}
                          <span>•</span><span>{investment.quantity} cotas</span>
                          <span>•</span><span>PM: {formatCurrency(investment.averagePrice)}</span>
                          <span>•</span><span>Data: {formatDate(investment.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 self-start sm:self-center">
                       <InvestmentUpdate investment={investment} onUpdateInvestment={updateInvestment} />
                       <Button variant="ghost" size="sm" onClick={() => handleEditClick(investment)} className="h-7 w-7 sm:h-8 sm:w-8 p-0"><Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                       <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(investment.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0"><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div><p className="text-muted-foreground">Investido</p><p className="font-medium">{formatCurrency(investment.totalInvested)}</p></div>
                    <div><p className="text-muted-foreground">Valor Atual</p><p className="font-medium">{formatCurrency(investment.currentValue)}</p></div>
                    <div><p className="text-muted-foreground">Retorno</p><p className={`font-bold ${metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>{metrics.totalReturn >= 0 ? '+' : ''}{formatCurrency(metrics.totalReturn)} ({formatPercentage(metrics.returnPercentage)})</p></div>
                    <div><p className="text-muted-foreground">Dividendos</p><p className="font-medium text-amber-400">{formatCurrency(metrics.totalDividends)} ({formatPercentage(metrics.dividendYield)})</p></div>
                  </div>
                </motion.div>
              );
            }))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;