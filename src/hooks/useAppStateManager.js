import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatInputDate, getSystemDateISO } from '@/utils/date';
import { v4 as uuidv4 } from 'uuid';

export const useAppStateManager = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [billsToPay, setBillsToPay] = useState([]);

  const resetApp = useCallback(() => {
    setIncomes([]);
    setExpenses([]);
    setGoals([]);
    setInvestments([]);
    setTransactions([]);
    setBudgets([]);
    setBillsToPay([]);
  }, []);

  // [Manter todas as outras funções existentes...]

  const handleAddInvestment = (investment) => {
    const date = formatInputDate(investment.date || getSystemDateISO());
    const quantity = parseFloat(investment.quantity);
    const unitPrice = parseFloat(investment.unitPrice);
    const totalPurchase = quantity * unitPrice;

    const updatedInvestments = investments.map(inv => 
      inv.name === investment.name ? {
        ...inv,
        quantity: inv.quantity + quantity,
        totalValue: inv.totalValue + totalPurchase,
        averagePrice: (inv.totalValue + totalPurchase) / (inv.quantity + quantity),
        date
      } : inv
    );

    if (!investments.some(inv => inv.name === investment.name)) {
      updatedInvestments.push({
        id: uuidv4(),
        name: investment.name,
        type: investment.type,
        quantity,
        totalValue: totalPurchase,
        averagePrice: unitPrice,
        date,
        purchaseHistory: [{ quantity, unitPrice, date }]
      });
    } else {
      const index = updatedInvestments.findIndex(inv => inv.name === investment.name);
      updatedInvestments[index].purchaseHistory = [
        ...(updatedInvestments[index].purchaseHistory || []),
        { quantity, unitPrice, date }
      ];
    }

    setInvestments(updatedInvestments);

    // Cria transação de compra
    setTransactions(prev => [...prev, {
      id: uuidv4(),
      type: 'investment_out',
      amount: -totalPurchase,
      description: `Compra de ${quantity}x ${investment.name} @ R$${unitPrice.toFixed(2)}`,
      category: 'Investimentos',
      date,
    }]);
  };

  const handleSellInvestment = (sale) => {
    const date = formatInputDate(sale.date || getSystemDateISO());
    const quantity = parseFloat(sale.quantity);
    const unitPrice = parseFloat(sale.unitPrice);
    const totalSale = quantity * unitPrice;

    const investment = investments.find(inv => inv.name === sale.name);
    if (!investment || investment.quantity < quantity) {
      Alert.alert('Erro', 'Quantidade insuficiente para venda');
      return;
    }

    // Cálculo do preço médio e lucro
    const averagePrice = investment.averagePrice;
    const profit = (unitPrice - averagePrice) * quantity;

    // Atualiza investimento
    const updatedInvestments = investments.map(inv => 
      inv.name === sale.name ? {
        ...inv,
        quantity: inv.quantity - quantity,
        totalValue: inv.totalValue - (averagePrice * quantity),
        averagePrice: inv.quantity - quantity === 0 ? 0 : inv.averagePrice,
        saleHistory: [...(inv.saleHistory || []), { quantity, unitPrice, date, profit }]
      } : inv
    ).filter(inv => inv.quantity > 0);

    setInvestments(updatedInvestments);

    // Cria transação de venda
    setTransactions(prev => [...prev, {
      id: uuidv4(),
      type: 'investment_in',
      amount: totalSale,
      description: `Venda de ${quantity}x ${sale.name} @ R$${unitPrice.toFixed(2)}`,
      category: 'Investimentos',
      date,
    }]);

    // Se houve lucro, cria uma transação adicional
    if (profit > 0) {
      setTransactions(prev => [...prev, {
        id: uuidv4(),
        type: 'investment_profit',
        amount: profit,
        description: `Lucro na venda de ${sale.name}`,
        category: 'Investimentos',
        date,
      }]);
    }
  };

  // [Manter o restante das funções existentes...]

  const totalInvested = useMemo(
    () => investments.reduce((acc, curr) => acc + (curr.quantity * curr.averagePrice), 0),
    [investments]
  );

  const investmentReturns = useMemo(
    () => investments.reduce((acc, curr) => {
      const currentValue = curr.quantity * (curr.currentPrice || curr.averagePrice);
      const investedValue = curr.quantity * curr.averagePrice;
      return acc + (currentValue - investedValue);
    }, 0),
    [investments]
  );

  const totalBalance = useMemo(
    () => totalIncome - totalExpenses - totalInvested + investmentReturns,
    [totalIncome, totalExpenses, totalInvested, investmentReturns]
  );

  return {
    // [Manter todos os retornos existentes...]
    handleSellInvestment,
    investmentReturns
  };
};
