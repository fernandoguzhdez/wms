import { View, Text, StyleSheet, TextInput, TouchableHighlight, Switch } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../../contex/AuthContext';
import { Input, Icon } from '@rneui/themed';


export function Conexion({ navigation }) {

    const { conectarApi, user, pass, company, url, setUrl, setUser, setCompany, setPass } = useContext(AuthContext);

    return (

        <View style={styles.container}>
            <Input
                leftIcon={{ type: 'font-awesome', name: 'link' }}
                placeholder='Example -->  http://11.124.25.212:900'
                value={url}
                onChangeText={text => setUrl(text)}
            />
            <Input
                leftIcon={{ type: 'font-awesome', name: 'user' }}
                placeholder='Ingresa el usuario'
                value={user}
                onChangeText={text => setUser(text)}
            />
            <Input
                leftIcon={{ type: 'font-awesome', name: 'key' }}
                placeholder="Ingresa tu password"
                value={pass}
                secureTextEntry={true}
                onChangeText={text => setPass(text)}
            />
            <Input
                leftIcon={{ type: 'font-awesome', name: 'database' }}
                placeholder="Ingresa el nombre de la base de datos"
                value={company}
                onChangeText={text => setCompany(text)}
            />

            <TouchableHighlight
                style={styles.btnLogin}
                onPress={() => { conectarApi(user, pass, 'probarConexion') }}
            >
                <Text style={{ fontWeight: '700', fontSize: 18, color: 'white' }}>Probar Conexion</Text>
            </TouchableHighlight>
            <TouchableHighlight
                style={styles.btnLogin}
                onPress={() => { navigation.navigate('Login'), conectarApi(user, pass, 'conectarApi') }}
            >
                <Text style={{ fontWeight: '700', fontSize: 18, color: 'white' }}>Conectar</Text>
            </TouchableHighlight>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    btnLogin: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#005d68',
        height: 50,
        fontWeight: '500',
        margin: 12
    }
});