import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, FlatList } from 'react-native'
import React, { useState, useContext } from 'react'
import { AuthContext } from '../../contex/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { ScrollView } from 'react-native';


export default function Compras({ navigation, route }) {

    const {  } = useContext(AuthContext);
    const windowsWidth = useWindowDimensions().width;
    const windowsHeight = useWindowDimensions().height;

    const renderCard = ({ item, index }) => {
        const cardColor = generateCardColor(index);
        return (
            <View style={[styles.card, { backgroundColor: cardColor, width: windowsWidth > 500 ? (windowsWidth / 3) - 33 : (windowsWidth / 2) - 40 }]}>
                <TouchableOpacity style={styles.middle} onPress={() => {
                    switch (item.nameForm) {
                        case 'CmpEntd':
                            navigation.navigate('DocumentosCompras');
                            break;

                        default: 0
                            break;
                    }
                }}>
                    <Text style={{...styles.texto, fontSize: windowsWidth > 500 ? 24: 20}}>
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
            {route.params.detalleSubMenus.length === 0 ? (
                <Text>Cargando...</Text>
            ) : (
                <FlatList
                    data={route.params.detalleSubMenus}
                    renderItem={renderCard}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={windowsWidth > 500 ? 3 : 2 }
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
    detalleSubmenu: {
        backgroundColor: '#3b5998',
        height: 200,
        margin: 10,
        borderRadius: 10,
        flexWrap: 'nowrap',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#ececec',
        borderWidth: 5
    },
    texto: {
        color: '#ffff',
        fontWeight: '600',
    }
});
