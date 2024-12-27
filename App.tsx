import React, { useEffect, useContext } from 'react'
import { Navigation } from './src/componentes/Navigation';
import { AuthProvider } from './src/contex/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

export function App() {

  return (
    <NavigationContainer>
      <PaperProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent(appName, () => App);