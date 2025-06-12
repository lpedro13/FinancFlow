const handleAddInvestment = (investment) => {
  const date = formatInputDate(investment.date || getSystemDateISO());
  const quantity = parseFloat(investment.quantity || 1);
  const unitPrice = parseFloat(investment.unitPrice || investment.totalInvested || 0);
  const totalPurchase = quantity * unitPrice;

  let found = false;
  const updatedInvestments = investments.map((inv) => {
    if (inv.name === investment.name) {
      found = true;
      const newQuantity = inv.quantity + quantity;
      const newTotal = inv.totalValue + totalPurchase;
      const newAverage = newTotal / newQuantity;
      return {
        ...inv,
        quantity: newQuantity,
        totalValue: newTotal,
        averagePrice: newAverage,
        date,
      };
    }
    return inv;
  });

  if (!found) {
    updatedInvestments.push({
      id: uuidv4(),
      name: investment.name,
      type: investment.type,
      quantity,
      totalValue: totalPurchase,
      averagePrice: unitPrice,
      date,
    });
  }

  setInvestments(updatedInvestments);

  // SEMPRE cria uma transação de despesa, independente de ser novo ativo ou compra adicional
  const expenseTransaction = {
    id: uuidv4(),
    type: 'expense',
    amount: totalPurchase,
    description: `Compra de ${quantity}x ${investment.name}`,
    category: 'Investimentos',
    date,
  };

  setTransactions(prev => [...(prev || []), expenseTransaction]);
};
