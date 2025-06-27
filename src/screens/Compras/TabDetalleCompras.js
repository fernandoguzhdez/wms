// TabDetalleCompras.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { AuthContext } from '../../contex/AuthContext';
import axios from 'axios';

import DetalleCompras from '../../screens/Compras/DetalleCompras';
import SeriesLotesCompras from '../../screens/Compras/SeriesLotesCompras';

const Tab = createMaterialTopTabNavigator();

export const TabDetalleCompras = ({ route }) => {
  const { documento } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarIndicatorStyle: { backgroundColor: '#007bff' },
        tabBarLabelStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen name="Detalles">
        {() => <DetalleCompras route={{ params: { documento } }} />}
      </Tab.Screen>

      <Tab.Screen name="Series/Lotes">
        {() => <SeriesLotesWrapper documento={documento} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const SeriesLotesWrapper = ({ documento }) => {
  const { tokenInfo, url } = useContext(AuthContext);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        const response = await axios.get(
          `${url}/api/Purchase/Get_Details?IdDocumentCnt=${documento.DocNum}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenInfo.token}`,
            },
          }
        );
        setDetalles(response.data?.POR1 || []);
      } catch (error) {
        console.error('Error al cargar detalles:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, []);

  if (detalleSeleccionado) {
    return <SeriesLotesCompras route={{ params: { detalle: detalleSeleccionado } }} />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Selecciona un detalle para ingresar Series/Lotes:</Text>
      <FlatList
        data={detalles}
        keyExtractor={(item) => `${item.DocEntry}-${item.LineNum}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setDetalleSeleccionado(item)}
          >
            <Text style={styles.cardTitle}>
              {item.ItemCode} - {item.ItemName}
            </Text>
            <Text style={styles.smallText}>Gestión: {item.GestionItem}</Text>
            <Text style={styles.smallText}>Almacén: {item.WhsCode}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default TabDetalleCompras;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  instruction: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  smallText: {
    fontSize: 14,
    color: '#444',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
