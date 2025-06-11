const Investments = ({
  investments,
  setInvestments,
  updateInvestment,
  deleteInvestment,
  investmentTypes,
  setInvestmentTypes,
  currentMonthDate,
  onMonthChange,
  allTransactions,
  transactions,        // ADICIONADO
  setTransactions,     // ADICIONADO
  setBalance           // ADICIONADO (se você tiver um setBalance para o saldo)
}) => {

  // ... resto do código

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // validações...

    const quantity = parseFloat(formData.quantity);
    const purchasePrice = parseFloat(formData.purchasePrice);
    
    // data compra...

    const existingInvestment = investments.find(inv => inv.name === formData.name && inv.type === formData.type);

    if (editingInvestment) {
      // atualização de investimento existente (edição)
      // ... código já existente
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

      // --- ADICIONAR A TRANSAÇÃO DE DESPESA ---
      const newTransaction = {
        id: uuidv4(),
        type: 'despesa',
        category: 'Investimento',
        description: `Compra de ${quantity} ${formData.name}`,
        value: quantity * purchasePrice,
        date: purchaseDate,
      };
      setTransactions(prev => [...prev, newTransaction]);

      // --- DEBITAR DO SALDO TOTAL (SE TIVER) ---
      if (setBalance) {
        setBalance(prev => prev - (quantity * purchasePrice));
      }

      toast({ title: "Sucesso!", description: `Adicionado a ${formData.name}. Preço médio atualizado.` });

    } else {
      // nova aplicação de investimento
      // código existente...

      // também criar a transação para a primeira compra
      const newTransaction = {
        id: uuidv4(),
        type: 'despesa',
        category: 'Investimento',
        description: `Compra de ${quantity} ${formData.name}`,
        value: quantity * purchasePrice,
        date: purchaseDate,
      };
      setTransactions(prev => [...prev, newTransaction]);

      if (setBalance) {
        setBalance(prev => prev - (quantity * purchasePrice));
      }

      toast({ title: "Sucesso!", description: "Novo investimento adicionado." });
    }

    setFormData(initialFormData);
    setIsFormOpen(false);
    setEditingInvestment(null);
  };

  // ...
};
