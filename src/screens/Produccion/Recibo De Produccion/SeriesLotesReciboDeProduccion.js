/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../../../contex/AuthContext';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { Input, Card, lightColors, Chip } from '@rneui/themed';
import { Icon, SearchBar, Button } from 'react-native-elements';
import Modal from 'react-native-modal';
import { SelectList } from 'react-native-dropdown-select-list';
import Spinner from 'react-native-loading-spinner-overlay';
import { DataTable } from 'react-native-paper';
import ComponenteCantidad from '../../../componentes/componenteCantidad';
import { Overlay } from '@rneui/themed';

export function SeriesLotesReciboDeProduccion({ navigation, route }) {
  const {
    isLoading,
    dataSLReciboProd,
    displayForm,
    setDisplayform,
    setValueSLReciboProd,
    filtroDataSLReciboProd,
    setFiltroDataSLReciboProd,
    setDataSLReciboProd,
    eliminarSLRecProd,
    isModalSLReciboProd,
    setIsModalSLReciboProd,
    itemSelectRecProd,
    setItemSelectRecProd,
    visibleFormCantidad,
    setVisibleFormCantidad,
    artSelectRecProd,
    setArtSelectRecProd,
    enviarDatosReciboProd,
    cerrarDocReciboProd
  } = useContext(AuthContext);

  const [cantidad, setCantidad] = useState('1');
  const windowsWidth = useWindowDimensions().width;
  const windowsHeight = useWindowDimensions().height;
  const [enableButton, setEnableButton] = useState(false);
  const [valueSearchSLRecProd, setValueSearchSLRecProd] = useState(null);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([50, 100, 150, 200]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0],
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filtroDataSLReciboProd.length);

  useEffect(() => {
    limpiarVariables();
  }, []);

  useEffect(() => {
  }, [artSelectRecProd]);

  const limpiarVariables = () => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setValueSLReciboProd(null);
      setDataSLReciboProd([]);
      setFiltroDataSLReciboProd([]);
      setDisplayform(false);
    });
    return unsubscribe;
  };

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  const filtrarSLRecProd = text => {
    // Check if searched text is not blank
    if (text) {
      setFiltroDataSLReciboProd(
        dataSLReciboProd.filter(item =>
          item.idCode.toUpperCase().includes(text.toUpperCase()),
        ),
      );
      setValueSearchSLRecProd(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with tablaSolicitudTransfer
      setFiltroDataSLReciboProd(dataSLReciboProd);
      setValueSearchSLRecProd(text);
    }
  };

  const toggleOverlay = item => {
    setDisplayform(false);
    setVisibleFormCantidad(!visibleFormCantidad);
    setItemSelectRecProd(item);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10 }}>
      <Spinner visible={isLoading} size={60} color="#ffff" />
      <View style={{ margin: windowsWidth > 500 ? 20 : 0 }}>
        <SearchBar
          platform="default"
          onChangeText={text => filtrarSLRecProd(text)}
          onClearText={text => searchFilterFunctionSolicitudT('')}
          placeholder="Buscar aqui..."
          placeholderTextColor="#888"
          cancelButtonTitle="Cancel"
          cancelButtonProps={{}}
          onCancel={() => console.log('cancelando...')}
          value={valueSearchSLRecProd}
          //onSubmitEditing={handleSubmit}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            buttonStyle={{
              backgroundColor: '#ff0000'
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
                    cerrarDocReciboProd(route.params.docEntry);
                    navigation.navigate('DocsReciboDeProduccion')
                  },
                },
              ]);
            }}
            iconTop
            title="Enviar Recibo"
          />
          <Icon
            raised
            name="add"
            size={24}
            type="material-icons"
            style={{ backgroundColor: 'blue' }}
            containerStyle={{
              width: 'auto',
              marginBottom: 10,
              display: displayForm == false ? 'flex' : 'none',
            }}
            iconStyle={{
              color: '#ffff',
              backgroundColor: '#3b5998',
              width: '100%',
              height: '100%',
              textAlign: 'center',
              textAlignVertical: 'center',
            }}
            onPress={() => {
              setDisplayform(!displayForm);
            }}
          />
        </View>
        <View
          style={{
            display:
              displayForm == false && artSelectRecProd.gestionItem != 'I'
                ? 'none'
                : 'flex',
          }}>
          <ComponenteCantidad
            itemSeleccionado={artSelectRecProd}
            tipo="insertarSL"
          />
        </View>

        <View style={{ flexDirection: 'row', height: 'auto', flexWrap: 'wrap' }}>
          <ScrollView>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#00913f' }}>
                <DataTable.Title
                  textStyle={styles.cellTitle}
                  style={styles.cellContent}>
                  {artSelectRecProd.gestionItem == 'S' ? 'N° Serie' : 'N° Lote'}
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.cellTitle}
                  style={[styles.cellContent, styles.numericCell]}>
                  Almacen
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.cellTitle}
                  style={[styles.cellContent, styles.numericCell]}>
                  Ubicacion
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.cellTitle}
                  style={[styles.cellContent, styles.numericCell]}>
                  Tipo Clase
                </DataTable.Title>
                {artSelectRecProd.gestionItem == 'L' ? (
                  <DataTable.Title
                    textStyle={styles.cellTitle}
                    style={[styles.cellContent, styles.numericCell]}>
                    Cantidad
                  </DataTable.Title>
                ) : (
                  ''
                )}
                <DataTable.Title
                  textStyle={styles.cellTitle}
                  style={[styles.cellContent, styles.numericCell]}>
                  Accion
                </DataTable.Title>
              </DataTable.Header>

              {filtroDataSLReciboProd.slice(from, to).map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell
                    textStyle={{
                      fontSize: 22,
                      flex: 1,
                      flexWrap: 'wrap',
                      minHeight: 60,
                    }}
                    style={styles.cellContent}>
                    <View>
                      <Text style={styles.cellContent}>{item.idCode}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{
                      fontSize: 22,
                      flex: 1,
                      flexWrap: 'wrap',
                      minHeight: 60,
                    }}
                    style={{
                      maxWidth: 120,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text style={styles.cellContent}>{item.whsCode}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{
                      fontSize: 22,
                      flex: 1,
                      flexWrap: 'wrap',
                      minHeight: 60,
                    }}
                    style={{
                      maxWidth: 120,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text style={styles.cellContent}>{item.binEntry}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{
                      fontSize: 22,
                      flex: 1,
                      flexWrap: 'wrap',
                      minHeight: 60,
                    }}
                    style={{
                      maxWidth: 120,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text style={styles.cellContent}>{item.ClaseOp}</Text>
                    </View>
                  </DataTable.Cell>
                  {artSelectRecProd.gestionItem == 'L' ? (
                    <DataTable.Cell
                      textStyle={{
                        fontSize: 22,
                        flex: 1,
                        flexWrap: 'wrap',
                        minHeight: 60,
                      }}
                      style={{
                        maxWidth: 120,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}>
                      <View>
                        <Text style={styles.cellContent}>
                          {item.quantityCounted}
                        </Text>
                      </View>
                    </DataTable.Cell>
                  ) : (
                    ''
                  )}
                  <DataTable.Cell
                    textStyle={{
                      fontSize: 22,
                      flex: 1,
                      flexWrap: 'wrap',
                      minHeight: 60,
                    }}
                    style={{
                      maxWidth: 120,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text style={styles.cellContent}>
                        <Icon
                          name="edit"
                          disabledStyle={{ backgroundColor: '#ffff' }}
                          iconStyle={{ color: '#3b5998' }}
                          size={windowsWidth > 500 ? 35 : 20}
                          type="font-awesome"
                          containerStyle={{ paddingHorizontal: 5 }}
                          onPress={() => {
                            toggleOverlay(item);
                          }}
                        />
                        <Icon
                          name="trash"
                          disabledStyle={{ backgroundColor: '#ffff' }}
                          iconStyle={{ color: '#FF0000' }}
                          size={windowsWidth > 500 ? 35 : 20}
                          type="font-awesome"
                          containerStyle={{ paddingHorizontal: 5 }}
                          onPress={() => {
                            Alert.alert(
                              'Advertencia',
                              '¿Estas seguro de eliminar el elemento seleccionado?',
                              [
                                {
                                  text: 'Cancelar',
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'Eliminar',
                                  onPress: () => {
                                    eliminarSLRecProd(
                                      index,
                                      artSelectRecProd,
                                      item,
                                    );
                                  },
                                },
                              ],
                            );
                          }}
                        />
                      </Text>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(
                  filtroDataSLReciboProd.length / itemsPerPage,
                )}
                onPageChange={page => setPage(page)}
                label={`${from + 1}-${to} of ${filtroDataSLReciboProd.length}`}
                numberOfItemsPerPageList={numberOfItemsPerPageList}
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                showFastPaginationControls
                selectPageDropdownLabel={'Filas por pagina'}
              />
            </DataTable>
          </ScrollView>
        </View>
      </View>
      <Overlay
        isVisible={visibleFormCantidad}
        onBackdropPress={toggleOverlay}
        overlayStyle={{ width: '50%', height: 'auto' }}>
        <Text style={{ fontSize: 26, textAlign: 'center', margin: 10 }}>
          Editar Elemento
        </Text>
        <ComponenteCantidad
          articulo={artSelectRecProd}
          itemSeleccionado={itemSelectRecProd}
          tipo="Edicion"
        />
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  titleTable: {
    color: '#ffff',
    fontWeight: 'bold',
    fontFamily: 'roboto',
  },
  textTitleCard: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#f5f8fa',
  },
  textCardValue: {
    color: '#008F39',
    fontSize: 14,
    marginVertical: 10,
    fontFamily: 'Georgia',
    textDecorationColor: '#3b5998',
  },
  cellContent: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    margin: 5,
    fontSize: 22,
    color: '#000',
    minHeight: 60,
  },
  cellTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  numericTitle: {
    maxWidth: 120,
  },
  numericCell: {
    maxWidth: 120,
    justifyContent: 'flex-start',
  },
  input: {
    backgroundColor: '#ffff',
    color: '#000',
    height: 50,
    fontSize: 20,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 10,
    fontWeight: '500',
    borderColor: '#000',
    borderWidth: 1,
  },
});
