import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';

const Investments = () => {
  const { state, dispatch } = useAppState();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = () => {
    if (!assetName || !assetType || !purchaseValue || !purchaseDate || !quantity) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const purchaseAmount = parseFloat(purchaseValue.replace(',', '.'));
    const qty = parseFloat(quantity);

    if (isNaN(purchaseAmount) || isNaN(qty) || qty <= 0) {
      Alert.alert('Erro', 'Quantidade ou valor inválido!');
      return;
    }

    const totalValue = purchaseAmount * qty;

    const existingAssetIndex = state.investments.findIndex(
      (inv) => inv.name.toLowerCase() === assetName.toLowerCase()
    );

    if (existingAssetIndex !== -1) {
      const updatedInvestments = [...state.investments];
      const existing = updatedInvestments[existingAssetIndex];

      const newQuantity = existing.quantity + qty;
      const newTotalValue = existing.totalValue + totalValue;
      const newAveragePrice = newTotalValue / newQuantity;

      updatedInvestments[existingAssetIndex] = {
        ...existing,
        quantity: newQuantity,
        totalValue: newTotalValue,
        averagePrice: newAveragePrice,
      };

      dispatch({ type: 'SET_INVESTMENTS', payload: updatedInvestments });
    } else {
      dispatch({
        type: 'ADD_INVESTMENT',
        payload: {
          name: assetName,
          type: assetType,
          quantity: qty,
          totalValue,
          averagePrice: purchaseAmount,
          date: purchaseDate,
        },
      });
    }

    // ✅ Cria uma transação de despesa associada ao investimento
    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      description: `Compra de ${qty}x ${assetName}`,
      amount: totalValue,
      date: purchaseDate,
      category: 'Investimentos',
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

    // ✅ Debita do saldo principal
    const updatedBalance = state.balance - totalValue;
    dispatch({ type: 'SET_BALANCE', payload: updatedBalance });

    // ✅ Limpa os campos
    setAssetName('');
    setAssetType('');
    setPurchaseValue('');
    setPurchaseDate('');
    setQuantity('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Investimento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Ativo"
        value={assetName}
        onChangeText={setAssetName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tipo do Ativo"
        value={assetType}
        onChangeText={setAssetType}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade de Cotas"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor por Cota"
        keyboardType="numeric"
        value={purchaseValue}
        onChangeText={setPurchaseValue}
      />
      <TextInput
        style={styles.input}
        placeholder="Data da Compra (YYYY-MM-DD)"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />

      <Button title="+ Novo Invest." onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
});

export default Investments;
