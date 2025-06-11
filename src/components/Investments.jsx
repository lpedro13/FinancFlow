import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';
import { formatCurrency } from '../utils/format';

const Investments = () => {
  const { state, dispatch } = useAppState();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = () => {
    if (!assetName || !assetType || !purchaseValue || !quantity || !purchaseDate) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const unitPrice = parseFloat(purchaseValue.replace(',', '.'));
    const quantityValue = parseFloat(quantity);

    if (isNaN(unitPrice) || isNaN(quantityValue) || unitPrice <= 0 || quantityValue <= 0) {
      Alert.alert('Erro', 'Valores inválidos para valor ou quantidade.');
      return;
    }

    const totalInvestment = unitPrice * quantityValue;

    const existingAssetIndex = state.investments.findIndex(
      (inv) => inv.name === assetName
    );

    if (existingAssetIndex !== -1) {
      const updatedInvestments = [...state.investments];
      const existing = updatedInvestments[existingAssetIndex];

      const newTotalValue = existing.totalValue + totalInvestment;
      const newTotalQuantity = existing.quantity + quantityValue;
      const newAveragePrice = newTotalValue / newTotalQuantity;

      updatedInvestments[existingAssetIndex] = {
        ...existing,
        totalValue: newTotalValue,
        quantity: newTotalQuantity,
        averagePrice: newAveragePrice,
      };

      dispatch({ type: 'SET_INVESTMENTS', payload: updatedInvestments });
    } else {
      dispatch({
        type: 'ADD_INVESTMENT',
        payload: {
          name: assetName,
          type: assetType,
          totalValue: totalInvestment,
          quantity: quantityValue,
          averagePrice: unitPrice,
          date: purchaseDate,
        },
      });
    }

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: Date.now().toString(),
        type: 'expense',
        description: `Compra de ${quantityValue}x ${assetName}`,
        amount: totalInvestment,
        date: purchaseDate,
        category: 'Investimentos',
      },
    });

    // Limpa os campos
    setAssetName('');
    setAssetType('');
    setPurchaseValue('');
    setQuantity('');
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
        placeholder="Valor Unitário da Compra"
        keyboardType="numeric"
        value={purchaseValue}
        onChangeText={setPurchaseValue}
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
