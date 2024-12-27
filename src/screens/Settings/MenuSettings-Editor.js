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
  ScrollView
} from 'react-native';
import { Icon, ListItem, Button, Avatar } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';
import { AuthContext } from '../../contex/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Input } from '@rneui/themed';
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
    get_Users()
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

  const users = [
    {
      id: '1',
      name: 'Juan Pérez',
      type: 'admin',
    },
    {
      id: '2',
      name: 'María García',
      type: 'usuario',
    }, {
      id: '3',
      name: 'Juan Pérez',
      type: 'admin',
    },
    {
      id: '4',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '5',
      name: 'Juan Pérez',
      type: 'admin',
    },
    {
      id: '6',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '7',
      name: 'Juan Pérez',
      type: 'admin',
    },
    {
      id: '8',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '9',
      name: 'Juan Pérez',
      type: 'admin',
    },
    {
      id: '10',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '11',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '12',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '13',
      name: 'María García',
      type: 'usuario',
    },
    {
      id: '14',
      name: 'María García',
      type: 'usuario',
    },
  ];

  const renderUserList = ({ item }) => (
    <ListItem bottomDivider key={item.id} >
      <Icon
        name="user"
        type="font-awesome"
        size={24}
        style={styles.icon}
        iconStyle={{ color: item.color }}
      />
      <ListItem.Content>
        <ListItem.Title>
          <Text>{item.name}</Text>
        </ListItem.Title>
        <ListItem.Subtitle>
          <Text>{item.type == 1 ? 'Administrador' : 'Usuario'}</Text>
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
      {/* <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.key + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
        contentContainerStyle={styles.listContainer}
      /> */}
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

          <Collapsible collapsed={isCollapsedCuentasUsuarios}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserList}
            />
            <Card>
              <Card.Title style={{ color: '#000' }}>Alta Usuario</Card.Title>
              <Card.Divider />
              <Input
                placeholder='Usuario'
                leftIcon={{ type: 'font-awesome', name: 'user' }}
                onChangeText={text => setUsuario(text)}
              />
              <Input
                placeholder="Contraseña"
                secureTextEntry={visibilityPass}
                leftIcon={{ type: 'material-icons', name: 'password' }}
                rightIcon={{ type: 'material-icons', name: visibilityPass === true ? 'visibility-off' : 'visibility', onPress: () => setVisibilityPass(!visibilityPass) }}
                onChangeText={text => setPassword(text)}
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
                  borderRadius: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginTop: 20
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
            </Card>
          </Collapsible>
        </View> : ''}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingVertical: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 16,
  },
  chevron: {
    color: '#c7c7cc',
  },
  sectionHeaderContainer: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 20,
    color: '#6d6d72',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
  },
  sectionSeparator: {
    height: 0,
    backgroundColor: '#f2f2f2',
  },
  subItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
  },
  subItemText: {
    fontSize: 14,
    color: '#6d6d72',
    flex: 1,
  },
  subSubItem: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subSubItemText: {
    fontSize: 12,
    color: '#6d6d72',
  },
});

export default MenuSettings;
