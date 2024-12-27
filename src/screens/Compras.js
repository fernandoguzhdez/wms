import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'

export default function Compras ({ navigation, route }) {
    console.log(route.params.detalleSubMenus)
    return (
        <View style={styles.container}>
            {route.params.detalleSubMenus.map((key) =>
                <TouchableOpacity key={key.idSubMenu} style={styles.detalleSubmenu} >
                    <View >
                        <Text style={styles.texto}>
                            {key.name}
                        </Text>
                    </View>
                </TouchableOpacity>

            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flex: 1,
      flexWrap: 'wrap',
      justifyContent: 'start',
      backgroundColor: '#fff',
      padding: 10,
      margin: 10,
    },
    detalleSubmenu: {
      backgroundColor: 'gray',
      height: 100,
      margin: 10,
      width: '44%',
      borderRadius: 15,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center'
    },
    texto: {
      color: 'white',
      fontWeight: '600',
      fontSize: 20,
    }
  });
