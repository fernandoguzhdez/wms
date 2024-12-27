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
} from 'react-native';
import { Input, Card, lightColors, Chip } from '@rneui/themed';
import { Icon, SearchBar, Button } from 'react-native-elements';
import Modal from 'react-native-modal';
import { SelectList } from 'react-native-dropdown-select-list';
import Spinner from 'react-native-loading-spinner-overlay';
import { DataTable } from 'react-native-paper';

export const SeriesLotesProdEnviados = ({ navigation, route }) => {
  const {
    isLoading,
    setSerieLoteTransfer,
    tablaSeriesLotesTransfer,
    dataSLProdEnviado,
    setDataSLProdEnviado,
    eliminarSLProdEnviado,
    enviarDatosProduccion,
    setIsLoading
  } = useContext(AuthContext);
  const [cantidad, setCantidad] = useState('0');
  const windowsWidth = useWindowDimensions().width;
  const windowsHeight = useWindowDimensions().height;
  const [enableButton, setEnableButton] = useState(false);

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([50, 100, 150, 200]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0],
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, dataSLProdEnviado.length);

  useEffect(() => {
    limpiarVariables();
    console.log('DocEntry...', route.params.docEntry);
  }, []);

  const limpiarVariables = () => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      //setDataSLProdEnviado([])
    });
    return unsubscribe;
  };

  useEffect(() => {
    setPage(0);
    setSerieLoteTransfer(null);
  }, [itemsPerPage]);

  const handleSubmit = () => {
    //console.log('enter...', docEntry + '   :  ' + serieLoteTransfer)
    //setIsLoading(true)
    //splitCadenaEscaner(serieLoteTransfer, docEntry, 'EnterSolicitudTransferenciaSeriesLotes')
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10 }}>
      {/* <Spinner visible={isLoading} size={60} color='#ffff' /> */}
      <View style={{ margin: windowsWidth > 500 ? 20 : 0 }}>
        <SearchBar
          platform="default"
          onChangeText={text => {
            console.log(text);
          }}
          onClearText={text => {
            console.log(text);
          }}
          placeholder="Buscar aqui..."
          placeholderTextColor="#888"
          cancelButtonTitle="Cancel"
          cancelButtonProps={{}}
          onCancel={() => console.log('cancelando...')}
          //value={barcodeItemTraslados}
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10
          }}>
          <Button
            buttonStyle={{
              backgroundColor: '#ff0000',
            }}
            onPress={() => {
              Alert.alert('Info', '¿Estas seguro de cerrar el documento?', [
                {
                  text: 'Cancelar',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Cerrar Documento',
                  onPress: () => {
                    enviarDatosProduccion(route.params.docEntry);
                    navigation.navigate('DocsOrdenDeFabricacion');
                    setIsLoading(true);
                  },
                },
              ]);
            }}
            iconTop
            title="Enviar Componentes"
          />
        </View>
        <View style={{ flexDirection: 'row', height: 'auto', flexWrap: 'wrap' }}>
          {dataSLProdEnviado.length == 0 ? (
            <View style={{ width: '100%', minHeight: '90%' }}>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontSize: 30,
                }}>
                Cargando...
              </Text>
            </View>
          ) : (
            <ScrollView>
              <DataTable>
                <DataTable.Header style={{ backgroundColor: '#00913f' }}>
                  <DataTable.Title
                    textStyle={styles.cellTitle}
                    style={styles.cellContent}>
                    {route.params.gestionItem == 'S' ? 'N° Serie' : 'N° Lote'}
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
                  {route.params.gestionItem == 'L' ? (
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

                {dataSLProdEnviado.slice(from, to).map((item, index) => (
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
                    {route.params.gestionItem == 'L' ? (
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
                                    onPress: () =>
                                      console.log('Cancel Pressed'),
                                    style: 'cancel',
                                  },
                                  {
                                    text: 'Eliminar',
                                    onPress: () => {
                                      eliminarSLProdEnviado(
                                        index,
                                        route.params,
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
                    dataSLProdEnviado.length / itemsPerPage,
                  )}
                  onPageChange={page => setPage(page)}
                  label={`${from + 1}-${to} of ${dataSLProdEnviado.length}`}
                  numberOfItemsPerPageList={numberOfItemsPerPageList}
                  numberOfItemsPerPage={itemsPerPage}
                  onItemsPerPageChange={onItemsPerPageChange}
                  showFastPaginationControls
                  selectPageDropdownLabel={'Filas por pagina'}
                />
              </DataTable>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

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
});
