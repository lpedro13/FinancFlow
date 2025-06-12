import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';

const Investments = () => {
  const {
    handleAddInvestment
  } = useAppState();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = () => {
    if (!assetName || !assetType || !quantity || !unitPrice || !purchaseDate) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice.replace(',', '.'));

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      Alert.alert('Erro', 'Valores inválidos!');
      return;
    }

    handleAddInvestment({
      name: assetName,
      type: assetType,
      quantity: qty,
      unitPrice: price,
      date: purchaseDate,
    });

    setAssetName('');
    setAssetType('');
    setQuantity('');
    setUnitPrice('');
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
        value={unitPrice}
        onChangeText={setUnitPrice}
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
