import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../contex/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faGear, width } from '@fortawesome/free-solid-svg-icons/faGear'

export function Login({ navigation }) {

  const { isLoading, conectarApi, user, pass, setUser, setPass, tokenInfo } = useContext(AuthContext);

  console.log('Token desde login....', tokenInfo.token)

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', alignItems: 'flex-end', padding: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Conexion')} >
          <FontAwesomeIcon icon={faGear} style={{ color: 'lightgray' }} size={25} />
        </TouchableOpacity>
      </View>
      <View style={{ ...styles.container, width: '70%' }}>
        <Text style={{ fontSize: 50, color: '#ffff' }}>
          Bienvenido
        </Text>
        <Text style={{ fontSize: 20, color: '#ffff', marginBottom: 20 }}>
          Cuenta de Acceso WMS
        </Text>
        <TextInput
          style={styles.input}
          value={user}
          onChangeText={text => setUser(text)}
          placeholder="Ingresa tu usuario"
        />
        <TextInput
          style={styles.input}
          value={pass}
          onChangeText={text => setPass(text)}
          placeholder="Ingresa tu password"
          secureTextEntry={true}

        />
        <Text style={{color: 'white'}}>
          {
            tokenInfo.token
          }
        </Text>
        <View style={styles.viewBtn}>
          <TouchableOpacity
            style={styles.btnLogin}
            onPress={() => { conectarApi(user, pass, 'Login') }}
          >
            <Text style={{ fontWeight: '700', fontSize: 18, color: 'white' }}>Acceder</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 10, color: '#ffff' }}>
          Version 1.0.0
        </Text>
        <Spinner visible={isLoading} size={60} color='white' />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3e999b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#ffff',
    color: '#000',
    width: '100%',
    height: 50,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    fontWeight: '500'
  },
  viewBtn: {
    width: '100%',
    height: 50,
    marginTop: 20,
    marginBottom: 10
  },
  btnLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    height: 50,
    fontWeight: '500',
    borderRadius: 10
  }
});