/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-dupe-keys */
/* eslint-disable react/self-closing-comp */
/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useState, useEffect, useContext} from 'react';
import {
  ScrollView,
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableHighlight,
  Alert,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../../../contex/AuthContext';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Icon from 'react-native-vector-icons/FontAwesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import moment from 'moment';
import {Badge, SearchBar, Button} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';
import Spinner from 'react-native-loading-spinner-overlay';
import ComponenteCantidad from '../../../componentes/componenteCantidad';
import Modal from 'react-native-modal';
import {Overlay} from '@rneui/themed';

export function DocsReciboDeProduccion({navigation}) {
  const {
    url,
    tokenInfo,
    setIsLoading,
    isLoading,
    enviarDatosProduccion,
    getDocsReciboProd,
    filteredDocsReciboProd,
    setFilteredDocsReciboProd,
    docsReciboProd,
    setDocsReciboProd,
    cargarSLEnvRecProd,
    isModalSLReciboProd,
    setIsModalSLReciboProd,
    visibleFormCantidad,
    setVisibleFormCantidad,
    setFiltroDataSLReciboProd,
    setDataSLReciboProd,
    itemSelectRecProd,
    setItemSelectRecProd,
    splitCadenaEscaner,
    searchReciboProd,
    setSearchReciboProd,
    cerrarDocReciboProd,
    artSelectRecProd,
    setArtSelectRecProd,
  } = useContext(AuthContext);

  const [activarBuscadorSolicitudT, setActivarBuscadorSolicitudT] =
    useState(true);
  const [swipe, setSwipe] = useState(-150);

  const limpiarVariables = () => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setSearchReciboProd(null);
      setFilteredDocsReciboProd([]);
      setDocsReciboProd([]);
    });
    return unsubscribe;
  };

  const toggleOverlay = item => {
    setVisibleFormCantidad(!visibleFormCantidad);
  };

  useEffect(() => {
    limpiarVariables();
    setIsLoading(true)
    getDocsReciboProd();
  }, []);

  const searchFilterFunctionSolicitudT = text => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the tablaSolicitudTransfer
      // Update FilteredDataSource
      setFilteredDocsReciboProd(
        filteredDocsReciboProd.filter(
          item =>
            item.prodName.toUpperCase().includes(text.toUpperCase()) ||
            item.docNum.toString().includes(text.toString()),
        ),
      );
      setSearchReciboProd(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with tablaSolicitudTransfer
      setFilteredDocsReciboProd(docsReciboProd);
      setSearchReciboProd(text);
    }
  };

  const handleSubmit = () => {
    splitCadenaEscaner(
      searchReciboProd,
      route.params.docEntry,
      'EnterDocsReciboProd',
    );
    //Se vuelve a llenar la tabla ya que al usar el enter deja en blanco la ventana
    // setItemsTraslados(tablaItemsTraslados)
  };

  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <TouchableHighlight
        disabled={item.status == 'C' ? true : false}
        style={{marginVertical: 2}}
        key={item.docEntry}
        onPress={() => {
          setArtSelectRecProd(item);
          if (item.gestionItem == 'I') {
            //setIsModalSLReciboProd(!isModalSLReciboProd)
            toggleOverlay(item);
          } else {
            navigation.navigate('SeriesLotesReciboDeProduccion', item);
            cargarSLEnvRecProd(item);
            setFiltroDataSLReciboProd([]);
            setDataSLReciboProd([]);
          }
        }}>
        <View
          style={{
            backgroundColor: '#3b5998',
            opacity: item.status == 'C' ? 0.4 : 1,
            justifyContent: 'space-around',
            flexDirection: 'row',
          }}>
          <View style={styles.itemTexto}>
            <Text style={{...styles.texto, fontSize: 20}}>
              No. {item.docNum} | Almacen {item.warehouse} | Recibidos{' '}
              {item.countedQty} | Cantidad Plan. {item.plannedQty}
            </Text>
            <Text style={styles.texto}>
              {item.itemCode} | {item.prodName}
            </Text>
          </View>

          <View
            style={{
              height: 110,
              width: '25%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 20,
            }}>
            {/* <Text style={styles.texto}>
                            {item.gestionItem == 'S' ? 'Serie' : item.gestionItem == 'L' ? 'Lote' : ''}
                        </Text> */}
            <Text style={styles.texto}>
              {moment(item.fecha_fabricacion).utc().format('DD/MM/YYYY')}
            </Text>
            {item.status == 'O' ? (
              <Badge status="success" value="Abierto" style={styles.badge} />
            ) : item.status == 'C' ? (
              <Badge status="error" value="Cerrado" style={styles.badge} />
            ) : (
              <Badge status="warning" value="En Proceso" style={styles.badge} />
            )}
          </View>
          <View
            style={{
              height: 110,
              width: '5%',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexDirection: 'row',
            }}>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{color: '#fff', left: 20}}
              size={50}
              color="#d3d3d3"
            />
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{color: '#fff', right: 10}}
              size={50}
              color="#808080"
            />
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Spinner visible={isLoading} size={60} color="#ffff" />
      <View style={styles.container}>
        {activarBuscadorSolicitudT != false ? (
          <SearchBar
            searchIcon={{size: 24}}
            onChangeText={text => searchFilterFunctionSolicitudT(text)}
            onClear={text => searchFilterFunctionSolicitudT('')}
            placeholder="Buscar..."
            value={searchReciboProd}
            onSubmitEditing={handleSubmit}
            inputStyle={{
              backgroundColor: '#fff',
              borderRadius: 10,
              color: '#000',
            }}
            containerStyle={{
              backgroundColor: '#fff',
              borderRadius: 50,
              margin: 20,
              padding: 0,
              borderColor: '#fff',
            }}
            theme
          />
        ) : (
          <View></View>
        )}

        <SwipeListView
          data={filteredDocsReciboProd}
          keyExtractor={(item, index) => index.toString()}
          renderItem={ItemView}
          renderHiddenItem={(data, rowMap) => (
            <View style={styles.rowBack}>
              <Button
                buttonStyle={{
                  ...styles.rowBackButtonEliminar,
                  display: data.item.status == 'C' ? 'none' : 'flex',
                }}
                onPress={() => {
                  Alert.alert('Info', '¿Estas seguro de cerrar el documento?', [
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Cerrar documento',
                      onPress: () => {
                        cerrarDocReciboProd(data.item.docEntry);
                        setIsLoading(true);
                      },
                    },
                  ]);
                }}
                /* icon={
                                    <Icon
                                        reverse
                                        name="trash"
                                        size={20}
                                        color="#fff"
                                    />
                                } */
                iconTop
                title="Cerrar"
              />
            </View>
          )}
          rightOpenValue={swipe}
          stopLeftSwipe={-1}
        />

        <Modal
          isVisible={isModalSLReciboProd}
          style={{width: 200}}
          animationInTiming={1000}>
          <ScrollView
            style={{backgroundColor: '#ffffff', borderRadius: 10, width: 200}}>
            <Text style={{fontSize: 26, textAlign: 'center', margin: 20}}>
              Confirmar cantidad
            </Text>
            <ComponenteCantidad articulo={artSelectRecProd} />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsModalSLReciboProd(!isModalSLReciboProd);
              }}
              buttonStyle={{backgroundColor: '#F80000'}}
            />
          </ScrollView>
        </Modal>

        <Overlay
          isVisible={visibleFormCantidad}
          onBackdropPress={toggleOverlay}
          overlayStyle={{width: '50%', height: 'auto'}}>
          <Text style={{fontSize: 26, textAlign: 'center', margin: 10}}>
            Confirmar cantidad
          </Text>
          <ComponenteCantidad
            itemSeleccionado={artSelectRecProd}
            tipo="actualizarArticulo"
          />
        </Overlay>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  itemStyle: {
    padding: 10,
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  itemTexto: {
    height: 110,
    width: '70%',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  texto: {
    padding: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  badge: {
    color: '#fff',
    fontSize: 24,
  },
  rowBack: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 0,
    height: 110,
    marginVertical: 2,
  },
  rowBackButtonEliminar: {
    backgroundColor: '#ff0000',
    width: 150,
    height: 110,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});
