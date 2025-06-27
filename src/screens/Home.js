//Navigation
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../componentes/CustomDrawer';
//Screens
import Menu from './Menu';
import Inventario from './Inventario/Inventario';
import Compras from './Compras/Compras';
import Ventas from './Ventas';
import MenuSettings from '../screens/Settings/MenuSettings'
//React
import { AuthContext } from '../contex/AuthContext';
import React, { useContext, useEffect } from 'react';
import { Button, TouchableOpacity } from 'react-native'
//Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'

const Drawer = createDrawerNavigator();

export function Home({ navigation }) {

  const { getData } = useContext(AuthContext);

  useEffect(() => {
    getData();
  }, []);

  return (
    <Drawer.Navigator initialRouteName='Menu' drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Menu" component={Menu} options={{
        headerShown: true,
        headerTitleAlign: 'center',
        drawerLabel: 'Home',
        drawerIcon: ({ color }) => (
          <FontAwesomeIcon icon={faHome} style={{ alignSelf: 'center', color: 'lightblue' }} size={30} />
        )
      }} />
      <Drawer.Screen name="Configuraciones" component={MenuSettings} options={{
        headerShown: true,
        headerTitleAlign: 'center',
        drawerLabel: 'Settings',
        drawerIcon: ({ color }) => (
          <FontAwesomeIcon icon={faCog} style={{ alignSelf: 'center', color: 'lightblue' }} size={30} />
        )
      }} />
      <Drawer.Screen name="Inventario" component={Inventario} options={{
        drawerItemStyle: { display: 'none' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ color: 'gray', left: 15 }} size={30} />
          </TouchableOpacity>
        )
      }} />
      {/* <Drawer.Screen name="Ventas" component={Ventas} options={{
        drawerItemStyle: { display: 'none' }, drawerItemStyle: { display: 'none' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ color: 'gray', left: 15 }} size={30} />
          </TouchableOpacity>
        )
      }} /> */}
      <Drawer.Screen name="Compras" component={Compras} options={{
        drawerItemStyle: { display: 'none' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ color: 'gray', left: 15 }} size={30} />
          </TouchableOpacity>
        )
      }} />
    </Drawer.Navigator>
  );
}