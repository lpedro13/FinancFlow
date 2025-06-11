import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';
import { formatCurrency } from '../utils/format';

const Investments = () => {
  const { state, dispatch } = useAppState();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = () => {
    if (!assetName || !assetType || !purchaseValue || !purchaseDate) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const purchaseAmount = parseFloat(purchaseValue.replace(',', '.'));

    // Verifica se o ativo já existe
    const existingAssetIndex = state.investments.findIndex(
      (inv) => inv.name === assetName
    );

    if (existingAssetIndex !== -1) {
      // Atualiza o ativo existente
      const updatedInvestments = [...state.investments];
      const existing = updatedInvestments[existingAssetIndex];

      const totalValue = existing.totalValue + purchaseAmount;
      const totalQuantity = existing.quantity + 1; // ou adicione uma entrada de quantidade, se houver
      const averagePrice = totalValue / totalQuantity;

      updatedInvestments[existingAssetIndex] = {
        ...existing,
        totalValue,
        quantity: totalQuantity,
        averagePrice,
      };

      dispatch({ type: 'SET_INVESTMENTS', payload: updatedInvestments });
    } else {
      // Cria novo ativo
      dispatch({
        type: 'ADD_INVESTMENT',
        payload: {
          name: assetName,
          type: assetType,
          totalValue: purchaseAmount,
          quantity: 1,
          averagePrice: purchaseAmount,
          date: purchaseDate,
        },
      });
    }

    // Cria transação de despesa associada ao investimento
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: Date.now().toString(),
        type: 'expense',
        description: `Compra de ${assetName}`,
        amount: purchaseAmount,
        date: purchaseDate,
        category: 'Investimentos',
      },
    });

    // Limpa os campos
    setAssetName('');
    setAssetType('');
    setPurchaseValue('');
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
        placeholder="Valor da Compra"
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
