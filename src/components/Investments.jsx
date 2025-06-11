import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'some-toast-library'; // Ajuste conforme sua lib de toast

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
  const initialFormData = {
    name: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

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

    const existingInvestment = investments.find(
      (inv) => inv.name === formData.name && inv.type === formData.type
    );

    if (editingInvestment) {
      // Lógica de edição - pode ser implementada conforme sua necessidade
      // Exemplo simples para atualizar o investimento editado:
      const updatedInvestment = {
        ...editingInvestment,
        name: formData.name,
        type: formData.type,
        quantity,
        averagePrice: purchasePrice,
        totalInvested: quantity * purchasePrice,
        currentPrice: purchasePrice,
        currentValue: quantity * purchasePrice,
        history: [
          ...(editingInvestment.history || []),
          { date: purchaseDate, price: purchasePrice, quantity, type: 'compra', dividends: 0 },
        ],
      };
      updateInvestment(updatedInvestment);

      // Opcional: atualizar transações relacionadas se desejar

      toast({
        title: "Sucesso!",
        description: "Investimento atualizado.",
      });
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

      const newTransaction = {
        id: uuidv4(),
        type: 'expense',
        category: 'investimentos',
        description: `Compra de ${quantity} ${formData.name}`,
        value: quantity * purchasePrice, // Alterado para 'value'
        date: purchaseDate,
        tags: ['investimento', formData.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: existingInvestment.id,
      };
      setTransactions((prev) => [...prev, newTransaction]);

      if (setBalance) {
        setBalance((prev) => prev - (quantity * purchasePrice));
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

      setInvestments((prev) => [...prev, newInvestment]);

      const newTransaction = {
        id: uuidv4(),
        type: 'expense',
        category: 'investimentos',
        description: `Compra de ${quantity} ${formData.name}`,
        value: quantity * purchasePrice, // Alterado para 'value'
        date: purchaseDate,
        tags: ['investimento', formData.name.toLowerCase().replace(/\s+/g, '-')],
        relatedInvestmentId: newInvestment.id,
      };
      setTransactions((prev) => [...prev, newTransaction]);

      if (setBalance) {
        setBalance((prev) => prev - (quantity * purchasePrice));
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

  // Retorno JSX omitido — adicione sua UI aqui conforme o componente original

  return (
    <div>
      {/* Seu formulário e lista de investimentos aqui */}
      {/* Exemplo de formulário simplificado */}
      {isFormOpen && (
        <form onSubmit={handleSubmit}>
          {/* Campos do formulário: name, type, quantity, purchasePrice, purchaseDate */}
          {/* Exemplo: */}
          <input
            type="text"
            placeholder="Nome do investimento"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Tipo do investimento"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Quantidade"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Preço de compra"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            required
          />
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          />
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setIsFormOpen(false)}>Cancelar</button>
        </form>
      )}
      {/* Resto da UI para listar investimentos */}
    </div>
  );
};

export default Investments;
