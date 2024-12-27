import React, { useState, useEffect, useContext } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  SafeAreaView,
  BottomSheet,
} from 'react-native';
import { Icon, ListItem, Button, Avatar } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';
import { AuthContext } from '../../contex/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Input, Dialog } from '@rneui/themed';
import { SelectList } from 'react-native-dropdown-select-list';

const MenuSettings = ({ navigation }) => {
  const {
    printersList,
    getPrintersList,
    defaultPrinter,
    setDefaultPrinter,
    selectedPrinter,
    setSelectedPrinter,
    loadDefaultPrinter,
    isLoading,
    crearUsuario,
    usuario,
    setUsuario,
    password,
    setPassword,
    selectedIdRole,
    setSelectedIdRole,
    get_Users,
    setUsuarios,
    usuarios
  } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCollapsedCuentasUsuarios, setIsCollapsedCuentasUsuarios] = useState(true);
  const [visibilityPass, setVisibilityPass] = useState(true)
  const [dataIdRole, setDataIdRole] = useState([
    { key: 1, value: "Administrador" },
    { key: 0, value: "Usuario" }
  ])
  const [idRole, setIdRol] = useState()
  const [isVisibleUsuarios, setIsVisibleUsuarios] = useState(false);

  useEffect(() => {
    loadDefaultPrinter()
  }, []);

  useEffect(() => {
    getidRole()
  }, []);

  const getidRole = async () => {
    const dato = await AsyncStorage.getItem('idRole')
    const idrolenumber = JSON.parse(dato)
    setIdRol(idrolenumber)
    console.log('idrole...', idRole)
  }

  const toggleExpanded = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      getPrintersList();
    }
  };

  const toggleExpandedCuentasUsuarios = () => {
    setIsCollapsedCuentasUsuarios(!isCollapsedCuentasUsuarios);
  }

  const handlePrinterSelect = async printer => {
    try {
      await AsyncStorage.setItem('defaultPrinter', JSON.stringify(printer));
      Alert.alert(`Impresora Predeterminada: ${printer.value}`);
      setDefaultPrinter(printer);
    } catch (error) {
      console.error('Error al guardar en el almacenamiento local: ', error);
    }
  };

  const toggleDialog = () => {
    setIsVisibleUsuarios(!isVisibleUsuarios);
  };

  const renderUserList = ({ item }) => (
    <ListItem bottomDivider key={item.id}>
      <Icon
        name="user"
        type="font-awesome"
        size={24}
        style={styles.icon}
        iconStyle={{ color: item.color }}
      />
      <ListItem.Content>
        <ListItem.Title>
          <Text>{item.UserName}</Text>
        </ListItem.Title>
        <ListItem.Subtitle>
          <Text>{item.IdRole == 1 ? 'Administrador' : 'Usuario'}</Text>
        </ListItem.Subtitle>
      </ListItem.Content>
      <TouchableOpacity onPress={() => { }}>

        <Icon
          name="edit"
          type="material-icons"
          size={24}
          style={styles.icon}
          iconStyle={{ color: item.color }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { }}>

        <Icon
          name="delete"
          type="material-icons"
          size={24}
          style={styles.icon}
          iconStyle={{ color: item.color }}
        />
      </TouchableOpacity>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginVertical: 10 }}>
        Configuracion de impresion
      </Text>
      <TouchableOpacity onPress={toggleExpanded}>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title style={{ color: '#000' }}>Impresoras</ListItem.Title>
          </ListItem.Content>
          <Icon
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            type="font-awesome"
          />
        </ListItem>
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed}>
        <View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            printersList.map((printer, index) => (
              <TouchableOpacity
                key={index}
                style={{ marginLeft: 20 }}
                onPress={() => { }}>
                <ListItem
                  bottomDivider
                  containerStyle={{ backgroundColor: '#f0f0f0' }}>
                  <ListItem.Content>
                    <ListItem.Title style={{ color: '#000' }}>{printer.value}</ListItem.Title>
                  </ListItem.Content>
                  {printer.key === defaultPrinter.key ? (
                    <Icon
                      name="check"
                      type="material-icons"
                      size={24}
                      style={styles.icon}
                      iconStyle={{ color: '#808000' }}
                    />
                  ) : (
                    <Button
                      title="Establecer como predeterminada"
                      onPress={() => handlePrinterSelect(printer)}
                      type="clear"
                      titleStyle={{ color: '#0833a2' }}
                    />
                  )}
                </ListItem>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Collapsible>

      {/* Cuentas de usuarios */}
      {idRole == 1 ?
        <View>
          <Text style={{ fontSize: 24, marginVertical: 10 }}>
            Configuracion de usuarios
          </Text>
          <TouchableOpacity onPress={toggleExpandedCuentasUsuarios}>
            <ListItem bottomDivider>
              <ListItem.Content>
                <ListItem.Title style={{ color: '#000' }}><Text>Cuentas de usuarios</Text></ListItem.Title>
              </ListItem.Content>
              <Icon
                name={isCollapsedCuentasUsuarios ? 'chevron-down' : 'chevron-up'}
                type="font-awesome"
              />
            </ListItem>
          </TouchableOpacity>

          <Collapsible collapsed={isCollapsedCuentasUsuarios} style={{ backgroundColor: '#fff' }}>

            <View style={{ margin: 30 }}>
              <ScrollView>
                <Card containerStyle={{}} wrapperStyle={{}}>
                  <Card.Title style={{ color: '#536878' }}>Alta Usuario</Card.Title>
                  <Card.Divider />
                  <Input
                    placeholder='Usuario'
                    leftIcon={{ type: 'font-awesome', name: 'user' }}
                    onChangeText={text => setUsuario(text)}
                    style={styles.input}
                    placeholderTextColor='#8a9597'
                  />
                  <Input
                    placeholder="Contraseña"
                    secureTextEntry={visibilityPass}
                    leftIcon={{ type: 'material-icons', name: 'password' }}
                    rightIcon={{ type: 'material-icons', name: visibilityPass === true ? 'visibility-off' : 'visibility', onPress: () => setVisibilityPass(!visibilityPass) }}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    placeholderTextColor='#8a9597'
                  />
                  <SelectList
                    data={dataIdRole}
                    setSelected={(val) => setSelectedIdRole(val)}
                    placeholder="Rol de usuario"
                    searchPlaceholder='Buscar...'
                    inputStyles={{ color: '#000' }}
                    dropdownTextStyles={{ color: '#616d71' }}
                  />
                  <Button
                    icon={
                      <Icon
                        name="send"
                        color="#ffffff"
                        iconStyle={{ marginRight: 10 }}
                      />
                    }
                    buttonStyle={{
                      alignSelf: 'center',
                      borderRadius: 0,
                      marginLeft: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginTop: 20,
                      width: '50%'
                    }}
                    onPress={() => {
                      if (selectedIdRole.length == 0 || usuario == null || password == null) {
                        Alert.alert('Info', 'No puede haber campos vacio!', [
                          {
                            text: 'OK', onPress: () => {
                            }
                          }
                        ]);
                      } else {
                        Alert.alert(
                          'Info',
                          '¿Estas seguro de continuar?',
                          [
                            ,
                            {
                              text: 'Si',
                              onPress: () => {
                                crearUsuario(usuario, password, selectedIdRole)
                              },
                            },
                            {
                              text: 'Cancelar',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                          ],
                        );
                      }
                    }}
                    title="Crear Usuario"
                  />
                  <Button
                    icon={
                      <Icon
                        name="visibility"
                        color="#ffffff"
                        iconStyle={{ marginRight: 10 }}
                      />
                    }
                    buttonStyle={{
                      alignSelf: 'center',
                      borderRadius: 0,
                      marginLeft: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginTop: 20,
                      width: '50%'
                    }}
                    onPress={() => {
                      setIsVisibleUsuarios(!isVisibleUsuarios)
                      get_Users()
                    }}
                    title="Ver Usuarios"
                  />
                </Card>
              </ScrollView>
            </View>

          </Collapsible>

        </View> : ''}
      <Dialog
        isVisible={isVisibleUsuarios}
        onBackdropPress={toggleDialog}
        overlayStyle={{ flex: .5, borderRadius: 15 }}
        animationType='slide'
      >
        <Dialog.Title title="Cuentas de usuarios" titleStyle={{ backgroundColor: '#536878', height: 50, borderRadius: 15, textAlign: 'center', verticalAlign: 'middle', color: '#fff', fontSize: 26 }} />
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderUserList}
          style={{}}
        />
        <Button
          icon={
            <Icon
              name="logout"
              color="#ffffff"
              iconStyle={{ marginRight: 10 }}
            />
          }
          buttonStyle={{
            alignSelf: 'center',
            borderRadius: 0,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            marginTop: 20,
            width: '50%',
            backgroundColor: '#ff0000'
          }}
          onPress={() => {
            setIsVisibleUsuarios(!isVisibleUsuarios)
          }}
          title="Salir"
        />
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    color: '#000',
    fontWeight: '500'
  }
});

export default MenuSettings;
