import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';

export const VisorPDF = ({ route }) => {
  const { path } = route.params;

  const handlePrint = async () => {
    try {
      await RNPrint.print({ filePath: path });
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: `file://${path}` }}
        style={styles.pdf}
      />
      
      <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
        <Text style={styles.printButtonText}>🖨️ Imprimir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  printButton: {
    backgroundColor: '#007bff',
    padding: 14,
    alignItems: 'center',
  },
  printButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
