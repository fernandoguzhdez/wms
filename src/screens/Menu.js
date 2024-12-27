import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, useWindowDimensions } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contex/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import Spinner from 'react-native-loading-spinner-overlay';

export default function Menu({ navigation }) {

  const { menu, url } = useContext(AuthContext);
  const windowsWidth = useWindowDimensions().width;

  useEffect(()=> {
    if (windowsWidth > 500) {
      console.log('Esta es la tab')
    } else {
      console.log('Este es el cel')
    }
  },[])

  const renderCard = ({ item, index }) => {
    const cardColor = generateCardColor(index);
    return (
      <View style={[styles.card, { backgroundColor: cardColor, width: windowsWidth > 500 ? (windowsWidth / 3) - 33 : (windowsWidth / 2) - 40 }]} >
        <TouchableOpacity style={styles.middle} onPress={() => {console.log(item.name); navigation.navigate(item.name, item)}}>
          <Image
            source={{ uri: `${url}${item.icon}` }}
            style={styles.imagenes}
          />
          <Text style={styles.texto}>
            {item.name}
          </Text>
          {/* Otros elementos de la tarjeta */}
        </TouchableOpacity>
      </View>
    );
  };

  // Función para generar colores con diferentes tonalidades
  const generateCardColor = (index) => {
    const baseColor = '#3b5998'; // Color base
    const step = 20; // Paso entre cada tonalidad

    // Cálculo de la tonalidad
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    const delta = index * step;

    // Aplicar la tonalidad
    const newR = Math.min(r + delta, 255);
    const newG = Math.min(g + delta, 255);
    const newB = Math.min(b + delta, 255);

    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  return (
    <View style={styles.container}>
      {menu.length === 0 ? (
        ''
      ) : (
        <FlatList
          numColumns={windowsWidth > 500 ? 3 : 2}
          data={menu}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCard}

        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    margin: 10,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOpacity: 0.5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 10,
        transform: [{ translateY: 5 }], // Mover la tarjeta hacia arriba
      },
      android: {
        elevation: 5,
      },
    }),
  },
  texto: {
    color: '#ffff',
    fontWeight: '600',
    fontSize: 20,
    marginVertical: 10
  },
  imagenes: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  }
});