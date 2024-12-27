import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableHighlight,
  Alert
} from 'react-native';
import { AuthContext } from '../../../contex/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Icon from 'react-native-vector-icons/FontAwesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import moment from "moment";
import { Badge, SearchBar, Button } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';

export function ConteoInventario({ navigation }) {

  const { filteredDataSource, searchFilterFunction, search, activarBuscadorConteoInv, setActivarBuscadorConteoInv, LimpiarPantallaConteoInventario, setActivarBuscadorArticulos,
    url, tokenInfo, getInventario, setIsLoadingCerrarConteo, isLoadingCerrarConteo, setIsLoading, isLoading, getArticulos } = useContext(AuthContext);
  const [swipe, setSwipe] = useState(-100);
  const [deshabilitarBoton, setDeshabilitarBoton] = useState(false);


  const cerrarDocumento = async (docEntry) => {
    const headers = {
      Accept: "application/json",
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenInfo.token}`
    };
    // Make GET request
    await axios.post(`${url}/api/InventoryCount/Close_CountInventory?IdCounted=${docEntry}`,
      {
        docEntry
      },
      { headers }
    ).then(response => {
      console.log(response.status)
      getInventario();
      setIsLoadingCerrarConteo(false)
    })
      .catch(error => {
        setIsLoadingCerrarConteo(false)
        Alert.alert('Error', `Error al cerrar : ${error}`, [
          { text: 'OK', onPress: () => { setFilteredDocsProduccion([]), setDocsProduccion([]), getDocsProduccion() } },
        ]);
      });
  }

  const ItemView = ({ item }) => {
    return (
      // Flat List Item
      <TouchableHighlight disabled={item.status == 'C' ? true : false} style={{ marginVertical: 2 }} key={item.docEntry} onPress={() => { getArticulos(item.docEntry); navigation.navigate('Articulos', item); setActivarBuscadorConteoInv(false); setActivarBuscadorArticulos(false); LimpiarPantallaConteoInventario() }} >
        <View style={{ backgroundColor: '#3b5998', opacity: item.status == 'C' ? 0.4 : 1, justifyContent: 'space-around', flexDirection: 'row' }}  >
          <View style={styles.itemTexto}>
            <Text style={{ ...styles.texto, fontSize: 20 }}>
              No. {item.docNum}
            </Text>
            <Text style={styles.texto}>
              {item.referencia}
            </Text>
          </View>
          <View style={{ height: 90, width: '35%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
            <Text style={styles.texto}>
              {moment(item.createDate).utc().format('DD/MM/YYYY')}
            </Text>
            {
              item.status == 'O' ?
                <Badge status="success" value='Abierto' style={styles.badge} />
                : item.status == 'C' ?
                  <Badge status="error" value='Cerrado' style={styles.badge} />
                  :
                  <Badge status="warning" value='En Proceso' style={styles.badge} />
            }
          </View>
          <View style={{ height: 90, width: '15%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', left: 20 }} size={50} color='#D3D3D3' />
            <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', right: 10 }} size={50} color='#D3D3D3' />
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Spinner visible={isLoading} size={60} color='#ffff' />
      <Spinner visible={isLoadingCerrarConteo} size={60} color='#fff' />
      <View style={styles.container}>
        {activarBuscadorConteoInv != false ?
          <SearchBar
            searchIcon={{ size: 24 }}
            onChangeText={(text) => searchFilterFunction(text)}
            onClear={(text) => searchFilterFunction('')}
            placeholder="Buscar..."
            value={search}
            inputStyle={{ backgroundColor: '#fff', borderRadius: 10 }}
            containerStyle={{ backgroundColor: '#fff', borderRadius: 50, margin: 20, padding: 0, borderColor: '#fff' }}
            theme
          /> :
          <View></View>
        }

        <SwipeListView
          data={filteredDataSource}
          keyExtractor={(item, index) => index.toString()}
          renderItem={ItemView}
          renderHiddenItem={(data, rowMap) => (
            <View style={styles.rowBack}>
              <Button
                buttonStyle={{ ...styles.rowBackButtonEliminar, display: data.item.status == 'C' ? 'none' : 'flex' }}
                onPress={() => {
                  Alert.alert('Info', '¿Estas seguro de cerrar el documento?', [
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Enviar', onPress: () => {
                        cerrarDocumento(data.item.docEntry);
                        setIsLoadingCerrarConteo(true);
                        console.log(data.item.docEntry)
                      }
                    },
                  ]);
                }}
                icon={
                  <Icon
                    reverse
                    name="trash"
                    size={20}
                    color="#fff"
                  />
                }
                iconTop
                title="Enviar"
              />
            </View>
          )}
          rightOpenValue={swipe}
          stopLeftSwipe={-1}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  itemStyle: {
    padding: 10,
  },
  container: {
    flex: 1,
    marginTop: 10
  },
  itemTexto: {
    height: 90,
    width: '50%',
    paddingHorizontal: 10,
    justifyContent: 'center',

  },
  texto: {
    padding: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  badge: {
    backgroundColor: '#000ff',
    color: '#000',
    fontSize: 24,
  },
  rowBack: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 0,
    height: 90,
    marginVertical: 2,
  },
  rowBackButtonCancelar: {
    backgroundColor: '#000ff',
    width: 100,
    height: 90,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  rowBackButtonEliminar: {
    backgroundColor: '#ff0000',
    width: 100,
    height: 90,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }
});
