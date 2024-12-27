/* eslint-disable react-native/no-inline-styles */
/* eslint-disable eqeqeq */
/* eslint-disable quotes */
/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useContext, useState} from 'react';
import {AuthContext} from '../../../contex/AuthContext';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import {Input, Card, lightColors} from '@rneui/themed';
import {Button, SearchBar, Icon, Badge} from 'react-native-elements';
import Modal from 'react-native-modal';
import {SelectList} from 'react-native-dropdown-select-list';
import Spinner from 'react-native-loading-spinner-overlay';
import {SwipeListView} from 'react-native-swipe-list-view';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';

export function ArticulosProduccion({navigation, route}) {
  const {
    url,
    isEnter,
    tokenInfo,
    isLoading,
    tablaArtProd,
    dataArtProd,
    filterDataArtProd,
    setFilterDataArtProd,
    setDataArtProd,
    valueArtProd,
    setValueArtProd,
    filterArtProd,
    guardarOrdenProdArt,
    isModalArtProd,
    setIsModalArtProd,
    itemSeleccionadoProd,
    setItemSeleccionadoProd,
    splitCadenaEscaner,
    isModalSLProd,
    setIsModalSLProd,
  } = useContext(AuthContext);
  const [cantidad, setCantidad] = useState('1');
  const windowsWidth = useWindowDimensions().width;
  const [enableButton, setEnableButton] = useState(false);
  const [swipe, setSwipe] = useState(-150);

  useEffect(() => {
    tablaArtProd(route.params.docEntry);
    limpiarVariables();
  }, []);

  const limpiarVariables = () => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setValueArtProd(null);
      setItemSeleccionadoProd([]);
      setFilterDataArtProd([]);
      setDataArtProd([]);
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (isEnter == true) {
      navigation.navigate('SeriesLotesProduccion', itemSeleccionadoProd);
      setIsModalSLProd(!isModalSLProd);
    }
  }, [isEnter]);

  const handleSubmit = () => {
    splitCadenaEscaner(
      valueArtProd,
      route.params.docEntry,
      'EnterProduccionArticulo',
    );
  };

  const seleccionarArticulo = item => {
    setIsModalArtProd(!isModalArtProd);
    setItemSeleccionadoProd(item);
  };

  // Componente de tarjeta reutilizable
  /* const Card = ({ item, btnTitle, metodo, icono }) => (
        <View style={{ ...styles.card, width: windowsWidth > 500 ? 350 : 300 }}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.itemCode}</Text>
            </View>
            <View style={styles.ContainerContent}>
                <Text style={styles.content}>{item.itemDesc}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ flexDirection: 'col' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Almacen</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <Text style={styles.content}>{item.whsCode}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'col' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Ubicacion</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <Text style={styles.content}>{item.binEntry}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Contados</Text>
                        <Text style={styles.content}>{item.countQty}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Total</Text>
                        <Text style={styles.content}>{item.totalQty}</Text>
                    </View>
                </View>
            </View>
            <View style={{ margin: 20 }}>
                <Button
                    buttonStyle={{ backgroundColor: '#3b5958', width: '100%' }}
                    titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10, color: '#fff' }}
                    containerStyle={{ alignItems: 'center' }}
                    onPress={metodo}
                    icon={
                        <Icon
                            name={icono}
                            type='font-awesome'
                            size={25}
                            color="#fff"
                            iconStyle={{ paddingHorizontal: 10 }}
                        />
                    }
                    title={btnTitle}
                />
            </View>
        </View>
    ); */

  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <TouchableHighlight
        disabled={item.status == 'C' ? true : false}
        style={{marginVertical: 2}}
        key={item.docEntry}
        onPress={() => {
          item.gestionItem == 'I'
            ? seleccionarArticulo(item)
            : navigation.navigate('SeriesLotesProduccion', item);
          //setIsLoading(true)
        }}>
        <View
          style={{
            backgroundColor: '#f1f3f4',
            opacity: item.status == 'C' ? 0.4 : 1,
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}>
          <View style={styles.itemTexto}>
            <Text style={styles.texto}>
              {item.itemCode} | Alm: {item.whsCode}
              {item.binEntry == 0 ? '' : `  |  Ubi:  ` + item.binEntry}
              {'  |  Env: ' + item.countQty}{' '}
              {'  |  Cant Req: ' + item.totalQty + '    '}
              {item.gestionItem == 'S' ? (
                <Badge
                  status="success"
                  value="  Serie  "
                  style={styles.badge}
                />
              ) : item.gestionItem == 'L' ? (
                <Badge status="warning" value="  Lote  " style={styles.badge} />
              ) : (
                ''
              )}
            </Text>
            <Text style={{...styles.texto}}>
              {item.itemDesc.substring(0, 60 - 3)}...
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        height: 'auto',
        overflow: 'hidden',
      }}>
      <Spinner visible={isLoading} size={60} color="#ffff" />
      <SearchBar
        platform="default"
        onChangeText={text => {
          filterArtProd(text);
          text == ''
            ? setValueArtProd(null)
            : setValueArtProd(text.toLocaleUpperCase());
        }}
        onClearText={text => {
          filterArtProd(text);
        }}
        placeholder="Buscar aqui..."
        placeholderTextColor="#888"
        cancelButtonTitle="Cancel"
        cancelButtonProps={{}}
        onCancel={() => console.log('cancelando...')}
        value={valueArtProd}
        onSubmitEditing={handleSubmit}
        inputStyle={{
          backgroundColor: '#f4f4f4',
          borderRadius: 10,
          color: '#000',
        }}
        containerStyle={{
          backgroundColor: '#f4f4f4',
          borderRadius: 50,
          margin: 20,
          padding: 0,
          borderColor: '#f4f4f4',
        }}
        theme
      />
      <SwipeListView
        data={filterDataArtProd}
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
                Alert.alert(
                  'Info',
                  '¿Estas seguro de continuar con la transferencia?',
                  [
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Enviar',
                      onPress: () => {
                        //enviarTransferencia(data.item.docEntry);
                        //setIsLoading(true);
                      },
                    },
                  ],
                );
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
              title="Transferir"
            />
          </View>
        )}
        rightOpenValue={swipe}
        stopLeftSwipe={-1}
        stopRightSwipe={-1}
      />
      {/* <FlatList
                data={filterDataArtProd}
                renderItem={({ item }) =>
                    <Card
                        item={item}
                        btnTitle={item.gestionItem == 'I' ? 'Seleccionar Articulo' : item.gestionItem == 'L' ? 'Ver Lotes' : 'Ver Series'}
                        icono={item.gestionItem == 'I' ? 'arrows-alt' : 'eye'}
                        metodo={item.gestionItem == 'I' ? () => {
                            setIsModalArtProd(!isModalArtProd)
                            setItemSeleccionadoProd(item)
                        } : () => {
                            navigation.navigate('SeriesLotesProduccion', item)
                        }}
                    />}
                keyExtractor={(item, index) => index.toString()}
                numColumns={windowsWidth > 500 ? 2 : 1}
                contentContainerStyle={styles.flatListContent}
            /> */}

      <Modal isVisible={isModalArtProd} style={{}} animationInTiming={1000}>
        <ScrollView
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: windowsWidth > 500 ? 30 : 15,
          }}>
          <Text style={{fontSize: 26, textAlign: 'center', margin: 20}}>
            Confirmar cantidad
          </Text>
          <View style={{alignItems: 'center', marginVertical: 40}}>
            <Text style={styles.content}>{itemSeleccionadoProd.itemCode}</Text>
            <Text style={styles.content}>{itemSeleccionadoProd.itemDesc}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              width: '100%',
              justifyContent: 'center',
            }}>
            <Icon
              raised
              name="remove"
              size={18}
              iconStyle={{fontWeight: 'bold'}}
              type="material-icons"
              onPress={() => {
                if (cantidad <= 0) {
                  setCantidad('0');
                } else {
                  setCantidad(parseInt(cantidad) - 1);
                }
              }}
            />
            <Input
              value={cantidad.toString()}
              onChangeText={text => {
                const nuevaCadena = text.replace(/[^0-9.]/g, '');
                // Verificar si hay más de un punto decimal
                if ((nuevaCadena.match(/\./g) || []).length > 1) {
                  return;
                }
                setCantidad(nuevaCadena);
              }}
              style={{
                fontWeight: 'bold',
                fontSize: 25,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: '#3b5998',
                borderCurve: 'circular',
              }}
              keyboardType="numeric"
              containerStyle={{flex: 0.5}}
            />
            <Icon
              raised
              name="add"
              size={18}
              type="material-icons"
              onPress={() => {
                if (cantidad === '' || cantidad < 0) {
                  setCantidad('0');
                } else {
                  setCantidad(parseInt(cantidad) + 1);
                }
              }}
            />
          </View>

          <View
            style={{
              width: '50%',
              rowGap: 20,
              alignSelf: 'center',
              marginTop: 30,
            }}>
            <Button
              title="Confirmar y enviar"
              onPress={() => {
                setItemSeleccionadoProd([]);
                if (
                  Number(itemSeleccionadoProd.countQty) + Number(cantidad) <=
                  Number(itemSeleccionadoProd.totalQty)
                ) {
                  guardarOrdenProdArt(itemSeleccionadoProd, cantidad);
                  setCantidad('1');
                  setIsModalArtProd(!isModalArtProd);
                } else {
                  console.log(
                    'Suma...',
                    cantidad + ' : ' + Number(itemSeleccionadoProd.countQty),
                  );
                  Alert.alert(
                    'Advertencia',
                    '¡La cantidad sobrepasa el total de articulos!',
                    [{text: 'OK', onPress: () => {}}],
                  );
                }
              }}
              disabled={cantidad > 0 ? false : true}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsModalArtProd(!isModalArtProd);
                setItemSeleccionadoProd([]);
                setCantidad('1');
                setItemSeleccionadoProd([]);
              }}
              buttonStyle={{backgroundColor: '#F80000'}}
            />
          </View>
        </ScrollView>
      </Modal>

      <TouchableOpacity style={styles.floatingButtonPrint} onPress={() => {}}>
        <Icon name="barcode" size={24} color="#FFF" type="font-awesome" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 'auto',
    margin: '3.5%', // Ajusta el margen entre las tarjetas
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#3b5998',
    marginHorizontal: 20,
    padding: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    bottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
  },
  ContainerContent: {
    padding: 5,
    gap: 15,
  },
  content: {
    fontSize: 28,
    color: '#9b9b9b',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    textAlign: 'center',
  },
  flatListContent: {
    alignItems: 'center',
  },
  floatingButtonPrint: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 32,
    bottom: 32,
    backgroundColor: '#800000', // Change the color as needed
    borderRadius: 28,
    elevation: 8, // Android shadow
  },
  itemStyle: {
    padding: 10,
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  itemTexto: {
    height: 130,
    width: 'auto',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  texto: {
    padding: 10,
    color: '#384347',
    fontWeight: 'bold',
    fontSize: 26,
  },
  badge: {
    color: '#fff',
    fontSize: 26,
  },
  rowBack: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 0,
    height: 130,
    marginVertical: 2,
  },
  rowBackButtonEliminar: {
    backgroundColor: '#ff0000',
    width: 150,
    height: 130,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});
