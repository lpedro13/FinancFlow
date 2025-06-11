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
  transactions,
  setTransactions,
  setBalance,
}) => {

  // ... outras definições de estado e variáveis (formData, initialFormData etc.)

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const purchaseDate = formData.purchaseDate || new Date().toISOString().split('T')[0];

    if (isNaN(quantity) || isNaN(purchasePrice) || quantity <= 0 || purchasePrice <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade e preço devem ser maiores que zero.",
        variant: "destructive",
      });
      return;
    }

    const existingInvestment = investments.find(inv => inv.name === formData.name && inv.type === formData.type);

    if (editingInvestment) {
      // Lógica de edição já existente
      // ...
    } else if (existingInvestment) {
      const totalQuantity = existingInvestment.quantity + quantity;
      const newTotalInvested = existingInvestment.totalInvested + (quantity * purchasePrice);
      const newAveragePrice = newTotalInvested / totalQuantity;

      const updatedExistingInvestment = {
        ...existingInvestment,
        quantity: totalQuantity,
        totalInvested: newTotalInvested,
        averagePrice: newAveragePrice,
        currentValue: totalQuantity * (existingInvestment.currentPrice || purchasePrice),
        history: [
          ...(existingInvestment.history || []),
          { date: purchaseDate, price: purchasePrice, quantity, type: 'compra', dividends: 0 },
        ],
      };

      updateInvestment(updatedExistingInvestment);

      // Transação de despesa
      const newTransaction = {
        id: uuidv4(),
        type: 'expense',
        category: 'investimentos',
        description: `Compra de ${quantity} ${formData.name}`,
        amount: quantity * purchasePrice,
        date: purchaseDate,
        tags: ['investimento', formData.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: existingInvestment.id,
      };
      setTransactions(prev => [...prev, newTransaction]);

      if (setBalance) {
        setBalance(prev => prev - (quantity * purchasePrice));
      }

      toast({
        title: "Sucesso!",
        description: `Aportado em ${formData.name}. Preço médio atualizado.`,
      });

    } else {
      const newInvestment = {
        id: uuidv4(),
        name: formData.name,
        type: formData.type,
        quantity,
        averagePrice: purchasePrice,
        totalInvested: quantity * purchasePrice,
        currentPrice: purchasePrice,
        currentValue: quantity * purchasePrice,
        dividends: 0,
        history: [
          { date: purchaseDate, price: purchasePrice, quantity, type: 'compra', dividends: 0 },
        ],
      };

      setInvestments(prev => [...prev, newInvestment]);

      // Transação de despesa
      const newTransaction = {
        id: uuidv4(),
        type: 'expense',
        category: 'investimentos',
        description: `Compra de ${quantity} ${formData.name}`,
        amount: quantity * purchasePrice,
        date: purchaseDate,
        tags: ['investimento', formData.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: newInvestment.id,
      };
      setTransactions(prev => [...prev, newTransaction]);

      if (setBalance) {
        setBalance(prev => prev - (quantity * purchasePrice));
      }

      toast({
        title: "Sucesso!",
        description: "Novo investimento adicionado.",
      });
    }

    setFormData(initialFormData);
    setIsFormOpen(false);
    setEditingInvestment(null);
  };

  // ... restante do componente
};
