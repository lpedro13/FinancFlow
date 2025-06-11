import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppState } from "../hooks/useAppStateManager";
import InvestmentList from "./InvestmentList";
import InvestmentForm from "./InvestmentForm";

const Investments = () => {
  const {
    investments,
    setInvestments,
    transactions,
    setTransactions,
    investmentTypes,
  } = useAppState();

  const [showForm, setShowForm] = useState(false);

  const handleAddInvestment = (newInvestment) => {
    const existingInvestmentIndex = investments.findIndex(
      (inv) => inv.name === newInvestment.name
    );

    const quantity = parseFloat(newInvestment.quantity);
    const purchasePrice = parseFloat(newInvestment.purchasePrice);
    const purchaseDate = newInvestment.purchaseDate;

    if (existingInvestmentIndex !== -1) {
      // Ativo já existe, atualiza quantidade e preço médio
      const existing = investments[existingInvestmentIndex];
      const totalQty = existing.quantity + quantity;
      const totalInvested =
        existing.quantity * existing.averagePrice + quantity * purchasePrice;
      const updatedAveragePrice = totalInvested / totalQty;

      const updatedInvestments = [...investments];
      updatedInvestments[existingInvestmentIndex] = {
        ...existing,
        quantity: totalQty,
        averagePrice: updatedAveragePrice,
      };

      setInvestments(updatedInvestments);
    } else {
      // Novo ativo
      const investmentToAdd = {
        id: uuidv4(),
        name: newInvestment.name,
        type: newInvestment.type,
        quantity: quantity,
        averagePrice: purchasePrice,
        purchaseDate,
      };
      setInvestments([...investments, investmentToAdd]);
    }

    // Gera a transação de despesa
    const newTransaction = {
      id: uuidv4(),
      type: "Despesa",
      name: newInvestment.name,
      category: "Investimentos",
      value: quantity * purchasePrice,
      date: purchaseDate,
    };
    setTransactions((prev) => [...prev, newTransaction]);

    setShowForm(false);
  };

  return (
    <div className="investments-container">
      <h2>Investimentos</h2>
      <button onClick={() => setShowForm(!showForm)}>+ novo invest.</button>
      {showForm && (
        <InvestmentForm
          onSubmit={handleAddInvestment}
          investmentTypes={investmentTypes}
        />
      )}
      <InvestmentList investments={investments} />
    </div>
  );
};

export default Investments;
