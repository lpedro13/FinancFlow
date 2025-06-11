import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';

const Investments = () => {
  const { state, dispatch } = useAppState();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = () => {
    if (!assetName || !assetType || !quantity || !purchasePrice || !purchaseDate) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(purchasePrice.replace(',', '.'));
    const totalPurchase = qty * price;

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      Alert.alert('Erro', 'Valores inválidos!');
      return;
    }

    const existingIndex = state.investments.findIndex(
      (inv) => inv.name.toLowerCase() === assetName.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Atualiza investimento existente
      const updated = [...state.investments];
      const existing = updated[existingIndex];

      const newQuantity = existing.quantity + qty;
      const newTotalValue = existing.totalValue + totalPurchase;
      const newAveragePrice = newTotalValue / newQuantity;

      updated[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        totalValue: newTotalValue,
        averagePrice: newAveragePrice,
      };

      dispatch({ type: 'SET_INVESTMENTS', payload: updated });
    } else {
      // Novo investimento
      dispatch({
        type: 'ADD_INVESTMENT',
        payload: {
          name: assetName,
          type: assetType,
          quantity: qty,
          totalValue: totalPurchase,
          averagePrice: price,
          date: purchaseDate,
        },
      });
    }

    // Cria transação
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: Date.now().toString(),
        type: 'expense',
        description: `Compra de ${qty}x ${assetName}`,
        amount: totalPurchase,
        date: purchaseDate,
        category: 'Investimentos',
      },
    });

    // Debita do saldo
    dispatch({
      type: 'SET_BALANCE',
      payload: state.balance - totalPurchase,
    });

    // Limpa formulário
    setAssetName('');
    setAssetType('');
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate('');
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
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço por Cota"
        keyboardType="numeric"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
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
