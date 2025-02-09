import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  TouchableHighlight,
  PixelRatio,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import { List } from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import { Icon, SearchBar } from 'react-native-elements';
import Modal from 'react-native-modal';
import { Button } from 'react-native-elements';
import { Card, Badge, Input } from '@rneui/themed';
import { SelectList } from 'react-native-dropdown-select-list';
import Spinner from 'react-native-loading-spinner-overlay';

export const DetalleInventario = ({ navigation }) => {
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const {
    url,
    tokenInfo,
    setModuloScan,
    dataDetalleInv,
    setDataDetalleInv,
    abrirDetalleInvSL,
    data,
    paramsDetalleInvSL,
    setParamsDetalleInvSL,
    dataComplete,
    fetchDataDetalleInvSL,
    isLoading,
    setIsLoading,
    searchDetalleInv,
    setSearchDetalleInv,
    handleSearchDetalleInv,
    dataCompleteDI,
    setDataCompleteDI,
    fetchDataDetalleInv,
    setData,
    setDataComplete,
    setSearchDetalleInvSL,
    printersList,
    setSelectedPrinter,
    selectedPrinter,
    getPrintersList,
    defaultPrinter,
    loadDefaultPrinter
  } = useContext(AuthContext);
  const handlePress = () => setExpanded(!expanded);
  const [expanded, setExpanded] = React.useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(0);
  const windowsWidth = useWindowDimensions().width;
  const windowsHeight = useWindowDimensions().height;
  const [isModalImpresionEtiquetas, setIsModalImpresionEtiquetas] =
    useState(false);
  const [isModalCantidad, setIsModalCantidad] = useState(false);
  const [cantidad, setCantidad] = useState('1');
  let nuevaColumna = 'cantidadEtiquetas';
  const [impresionEtiquetas, setImpresionEtiquetas] = useState([]);
  let sumaItems = 0;
  const [opcion1Seleccionada, setOpcion1Seleccionada] = useState(false);
  const [opcion2Seleccionada, setOpcion2Seleccionada] = useState(false);
  const [opcion3Seleccionada, setOpcion3Seleccionada] = useState(false);
  const [buscarCategoria, setBuscarCategoria] = useState(false);
  const [enableCheck, setEnableCheck] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Número de elementos por página

  // Lógica para obtener los elementos de la página actual
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let prueba = [];
    prueba.push(dataDetalleInv.slice(startIndex, endIndex));
    sumaItems = prueba[0].length + prueba[0].length;
    return dataDetalleInv.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDataDetalleInv();
    setSearchDetalleInv('');
    getPrintersList();
    loadDefaultPrinter()
    console.log('Impresora por default...', defaultPrinter)
  }, []);

  useEffect(() => {
    if (paramsDetalleInvSL.length > 0) {
      //console.log('si tiene datos', paramsDetalleInvSL[0].ItemCode, paramsDetalleInvSL[0].WhsCode, paramsDetalleInvSL[0].GestionItem)
      //navigation.navigate('DetalleInventarioSL', paramsDetalleInvSL[0])
      fetchDataDetalleInvSL(
        paramsDetalleInvSL[0].ItemCode,
        paramsDetalleInvSL[0].WhsCode,
        paramsDetalleInvSL[0].GestionItem,
        paramsDetalleInvSL[0].IdCode,
        paramsDetalleInvSL[0].conEscaner,
      );
    }
  }, [paramsDetalleInvSL]);

  useEffect(() => {
    if (dataComplete != undefined && dataComplete.length > 0) {
      navigation.navigate('DetalleInventarioSL', paramsDetalleInvSL[0]);
    }
  }, [dataComplete]);

  const handleAccordionPress = index => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const renderFooter = () => {
    return isLoading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : null;
  };

  const handleCheckboxToggle = (itemId, item) => {
    //itemsSeleccionados.push(item)
    const updatedSelection = selectedItems.includes(item.Id)
      ? selectedItems.filter(id => id !== item.Id)
      : [...selectedItems, item.Id];
    setSelectedItems(updatedSelection);

    let dato = updatedSelection.filter(id => id == item.Id);
    if (dato.length > 0) {
      let arrayItem = [item];
      let array = arrayItem.map(item => ({ ...item, [nuevaColumna]: 1 }));
      itemsSeleccionados.push(array[0]);
    } else {
      const updatedArray = itemsSeleccionados.filter(
        element => element.Id !== item.Id,
      );
      setItemsSeleccionados(updatedArray);
    }
  };

  const handleFloatingButtonPress = accion => {
    if (accion == 'print') {
      // Add your logic here
      if (itemsSeleccionados.length > 0) {
        setIsModalImpresionEtiquetas(!isModalImpresionEtiquetas);
      } else {
        Alert.alert('Info', 'No ha seleccionado ningun item', [, { text: 'OK' }]);
      }
    } else {
      setModuloScan(6);
      navigation.navigate('Scanner', dataCompleteDI);
    }
  };

  const handleSubmit = () => {
    const partes = searchDetalleInv.split('||');
    const codigoArticulo = partes[0];
    const idCodeSerieLote = partes[1];
    const almacen = partes[2];
    const ubicacion = partes[3];
    const gestionArticulo = [];

    dataCompleteDI.map(item => {
      if (item.ItemCode == codigoArticulo) {
        gestionArticulo.push(item.GestionItem);
        console.log('si es igual', item.GestionItem);
      }
    });
    const gestionA = gestionArticulo[0];

    fetchDataDetalleInvSL(
      codigoArticulo,
      almacen,
      gestionA,
      idCodeSerieLote,
      true,
    );
    setSearchDetalleInvSL(idCodeSerieLote);
    setSearchDetalleInv('');
    setDataDetalleInv(dataCompleteDI);
  };

  const imprimirEtiquetas = () => {
    itemsSeleccionados.map(item => {
      impresionEtiquetas.push({
        gestionItem: item.GestionItem,
        itemCode: item.ItemCode,
        whsCode: item.WhsCode,
        binEntry: item.AbsEntry,
        serialOrLote: '',
        printer: selectedPrinter !== defaultPrinter.key ? selectedPrinter : defaultPrinter.value,
        quantity: item.StckDsp,
        copys: item.cantidadEtiquetas,
        type: 0,
      });
    });

    console.log('que hay aqui....', impresionEtiquetas)
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenInfo.token}`,
    };
    axios
      .put(`${url}/api/Inventory/Print_Item_Etq`, impresionEtiquetas, { headers })
      .then(response => {
        console.log(response.status);
        Alert.alert('Info', 'Enviado exitosamente!!', [
          ,
          {
            text: 'OK',
            onPress: () => {
              setSelectedItems([]);
              setItemsSeleccionados([]);
              setImpresionEtiquetas([]);
              setSelectedPrinter([])
            },
          },
        ]);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const renderItem = ({ item, index }) => (
    <View
      style={{
        padding: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        paddingRight: item.GestionItem == 'I' ? 20 : 0,
      }}>
      {item.GestionItem == 'I' ? (
        <CheckBox
          value={selectedItems.includes(item.Id)}
          onValueChange={() => handleCheckboxToggle(item.Id, item)}
          style={{ minHeight: '100%', minWidth: 0 }}
          tintColors={{ true: '#F15927', false: 'black' }}
        />
      ) : (
        ''
      )}

      <List.Accordion
        style={{ flex: 1, minWidth: '100%', backgroundColor: '#FFFFFF' }}
        titleStyle={{
          fontSize: windowsWidth > 500 ? 26 : 20,
          fontWeight: '600',
          color: '#000000',
        }}
        title={
          'Almacen - ' +
          item.WhsCode +
          ' - ' +
          item.ItemCode +
          ' - ' +
          item.ItemName
        }
        left={props => <List.Icon {...props} icon="folder" color="#828282" />}
        expanded={expandedIndex === item.Id}
        onPress={() => {handleAccordionPress(item.Id), console.log('click', item)}}>
        <View style={{ marginVertical: 10, flexDirection: 'row', width: '100%' }}>
          <View style={{ flex: 0.8 }}>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Código de articulo producto:{' '}
              <Text style={styles.tituloListItemData}>{item.CodeBars}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Nombre del articulo:{' '}
              <Text style={styles.tituloListItemData}>{item.ItemName}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Almacen:{' '}
              <Text style={styles.tituloListItemData}>{item.WhsCode}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Ubicacion:{' '}
              <Text style={styles.tituloListItemData}>{item.BinCode}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              En Stock:{' '}
              <Text style={styles.tituloListItemData}>{item.OnHand}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Disponible:{' '}
              <Text style={styles.tituloListItemData}>{item.StckDsp}</Text>
            </Text>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
              }}>
              Unidad de medida:{' '}
              <Text style={styles.tituloListItemData}>{item.InvntryUom}</Text>
            </Text>
            {item.GestionItem == 'I' ? (
              ''
            ) : (
              <Text
                style={{
                  ...styles.tituloListItem,
                  fontSize: windowsWidth > 500 ? 24 : 20,
                }}>
                Gestion del articulo:{' '}
                <Text style={styles.tituloListItemData}>
                  {item.GestionItem == 'S' ? 'Serie' : 'Lote'}
                </Text>
              </Text>
            )}
          </View>
          <View
            style={{ justifyContent: 'center', flex: 0.2, alignItems: 'center' }}>
            {item.GestionItem != 'I' ? (
              <>
                <Icon
                  containerStyle={{ alignSelf: 'center' }}
                  name="eye"
                  iconStyle={{ color: '#3b5998' }}
                  size={windowsWidth > 500 ? 35 : 25}
                  type="font-awesome"
                  onPress={() => {
                    if (item.IdBatchSern.toLowerCase() === searchDetalleInv) {
                      navigation.navigate('DetalleInventarioSL');
                      fetchDataDetalleInvSL(item.ItemCode, item.WhsCode, item.GestionItem);
                      setSearchDetalleInvSL(searchDetalleInv)
                      handleAccordionPress(item.Id);
                      setData([]);
                      setDataComplete([]);
                      setDataDetalleInv(dataCompleteDI);
                      console.log('Es igual el lote....')

                    } else {
                      setDataDetalleInv(dataCompleteDI);
                      fetchDataDetalleInvSL(item.ItemCode, item.WhsCode, item.GestionItem);
                      navigation.navigate('DetalleInventarioSL');
                      handleAccordionPress(item.Id);
                      setData([]);
                      setDataComplete([]);
                      setSearchDetalleInvSL('');
                    }

                  }}
                />

                <Text
                  style={{
                    color: '#000000',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: windowsWidth > 500 ? 16 : 12,
                  }}>
                  {' '}
                  {item.GestionItem === 'S' && item.IdBatchSern.toLowerCase() === searchDetalleInv ? 'Ver Serie' : item.GestionItem === 'L' && item.IdBatchSern.toLowerCase() === searchDetalleInv ? 'Ver Lote' : item.GestionItem === 'S' && item.IdBatchSern.toLowerCase() != searchDetalleInv ? 'Ver Series' : 'Ver Lotes'}
                </Text>
              </>
            ) : (
              ''
            )}
          </View>
        </View>
      </List.Accordion>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Spinner visible={isLoading} size={60} color="#ffffff" />
      <View style={{ flexDirection: 'row', paddingHorizontal: 10, columnGap: 5 }}>
        <SearchBar
          searchIcon={{ size: windowsWidth > 500 ? 30 : 20 }}
          onChangeText={text => handleSearchDetalleInv(text.toLowerCase())}
          onClear={text => handleSearchDetalleInv(text)}
          onSubmitEditing={handleSubmit}
          style={{ color: '#000000', fontSize: windowsWidth > 500 ? 26 : 20 }}
          placeholder="Buscar..."
          value={searchDetalleInv}
          inputStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            fontSize: windowsWidth > 500 ? 22 : 18,
          }}
          containerStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 50,
            marginVertical: 20,
            padding: 0,
            borderColor: '#ffffff',
            flex: 1,
          }}
          theme
        />
        {/* {tune == true ?
                    <Icon
                        name='tune'
                        size={windowsWidth > 500 ? 35 : 26}
                        containerStyle={{ justifyContent: 'center' }}
                        type='material-icons'
                        onPress={() => {setBuscarCategoria(!buscarCategoria); setTune(false)}} /> :
                    <Icon
                        name='close'
                        size={windowsWidth > 500 ? 35 : 26}
                        containerStyle={{ justifyContent: 'center' }}
                        type='material-icons'
                        onPress={() => {setBuscarCategoria(!buscarCategoria); setTune(true)}} />
                } */}
      </View>
      {buscarCategoria == true ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          <CheckBox
            value={opcion1Seleccionada}
            onValueChange={value => {
              setOpcion1Seleccionada(value);
              setOpcion2Seleccionada(value);
              setOpcion3Seleccionada(value);
            }}
          />
          <Text style={{ textAlignVertical: 'center' }}>Todas</Text>

          <CheckBox
            value={opcion2Seleccionada}
            onValueChange={value => setOpcion2Seleccionada(value)}
          />
          <Text style={{ textAlignVertical: 'center' }}>Codigo de articulo</Text>

          <CheckBox
            value={opcion3Seleccionada}
            onValueChange={value => setOpcion3Seleccionada(value)}
          />
          <Text style={{ textAlignVertical: 'center' }}>Almacen</Text>
        </View>
      ) : (
        ''
      )}

      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            flex: 0.6,
            alignItems: 'flex-start',
            flexDirection: 'row',
            paddingLeft: 5,
          }}>
          {selectedItems.length > 0 ? (
            <>
              <Icon
                name="close"
                size={windowsWidth > 500 ? 28 : 22}
                type="material-icons"
                containerStyle={{ alignSelf: 'center' }}
                onPress={() => {
                  Alert.alert(
                    'Advertencia',
                    '¿Estas seguro de eliminar selección?',
                    [
                      ,
                      {
                        text: 'Si',
                        onPress: () => {
                          setItemsSeleccionados([]);
                          setSelectedItems([]);
                        },
                      },
                      {
                        text: 'Cancelar',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );
                }}
              />
              <Text
                onPress={() => {
                  Alert.alert(
                    'Advertencia',
                    '¿Estas seguro de eliminar selección?',
                    [
                      ,
                      {
                        text: 'Si',
                        onPress: () => {
                          setItemsSeleccionados([]);
                          setSelectedItems([]);
                        },
                      },
                      {
                        text: 'Cancelar',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );
                }}
                style={{
                  alignSelf: 'center',
                  fontSize: windowsWidth > 500 ? 20 : 16,
                  textDecorationLine: 'underline',
                }}>
                Eliminar seleccion
              </Text>
            </>
          ) : (
            ''
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            alignItems: 'center',
            flex: 0.6,
          }}>
          <Text
            style={{
              fontSize: windowsWidth > 500 ? 20 : 16,
              marginHorizontal: 20,
            }}>
            {itemsPerPage * currentPage - 19 + '-' + itemsPerPage * currentPage}{' '}
            de {dataDetalleInv.length}
          </Text>
          <Icon
            name="arrow-left"
            size={35}
            type="material-icons"
            onPress={() =>
              setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
            }
          />
          <Icon
            name="arrow-right"
            size={35}
            type="material-icons"
            onPress={() => setCurrentPage(currentPage + 1)}
          />
        </View>
      </View>
      <FlatList
        data={getPaginatedData()}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={{}}
      />

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => handleFloatingButtonPress('print')}>
        <Icon name="print" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.floatingButtonPrint}
        onPress={() => handleFloatingButtonPress('scan')}>
        <Icon name="barcode" size={24} color="#FFF" type="font-awesome" />
      </TouchableOpacity>

      <Modal
        isVisible={isModalImpresionEtiquetas}
        style={{ flex: 1 }}
        animationInTiming={1000}>
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: windowsWidth > 500 ? 40 : 15,
            margin: windowsWidth > 500 ? '10%' : '5%',
            flexDirection: 'col',
            height: '100%',
          }}>
          <Text
            style={{ fontSize: 26, textAlign: 'center', margin: 20, gap: 20 }}>
            Impresion Etiquetas
          </Text>
          <ScrollView>
            <View style={{ flex: 1, padding: 20 }}>
              {itemsSeleccionados.map((item, index) => (
                <Card
                  key={index}
                  containerStyle={{
                    backgroundColor: '#f5f8fa',
                    borderRadius: 20,
                    flexDirection: 'column',
                    height: 'auto',
                    marginBottom: 20,
                  }}>
                  <Badge
                    status="success"
                    value={item.cantidadEtiquetas}
                    containerStyle={{
                      position: 'absolute',
                      top: -35,
                      right: -25,
                    }}
                    textStyle={{ fontSize: 30, color: '#ffffff' }}
                    badgeStyle={{ width: 'auto', height: 'auto' }}
                    onPress={() => {
                      setCantidad(item.cantidadEtiquetas);
                      setIsModalCantidad(!isModalCantidad);
                      setItemSeleccionado(index);
                    }}
                  />
                  <Card.Title
                    style={{
                      fontSize: windowsWidth > 500 ? 30 : 24,
                      color: '#000000',
                      fontWeight: 'bold',
                    }}>
                    {item.ItemCode}
                  </Card.Title>
                  <Card.Divider width={1} color="#808080" />
                  <View
                    style={{
                      flexDirection: 'column',
                      width: '100%',
                      gap: 15,
                    }}></View>
                </Card>
              ))}
            </View>
          </ScrollView>
          <View style={{ marginTop: 20, rowGap: 10 }}>
            <Button
              title="Enviar"
              onPress={() => {
                if (selectedPrinter.length === 0 && defaultPrinter.length === 0) {
                  Alert.alert('Info', 'No has seleccionado impresora', [
                    { text: 'OK', onPress: () => { } },
                  ]);
                } else {
                  Alert.alert('Advertencia', '¿Estas seguro de proceder?', [
                    ,
                    {
                      text: 'Imprimir',
                      onPress: () => {
                        imprimirEtiquetas();
                        setIsModalImpresionEtiquetas(!isModalImpresionEtiquetas);
                        setSelectedPrinter([])
                      },
                    },
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                  ]);
                }
              }}
              buttonStyle={{ backgroundColor: '#3B5998' }}
            />
            <SelectList
              data={printersList}
              setSelected={(val) => setSelectedPrinter(val)}
              save='value'
              placeholder="Selecciona una impresora..."
              defaultOption={{
                key: defaultPrinter.key,
                value: defaultPrinter.value,
              }}
              boxStyles={styles.selectBox}
              inputStyles={{ color: '#000' }}
              dropdownTextStyles={{ color: '#616d71' }}
              searchPlaceholder="Buscar..."
            />
            <Button
              title="Salir y borrar todo"
              onPress={() => {
                Alert.alert(
                  'Advertencia',
                  '¿Estas seguro de eliminar los elementos seleccionados?',
                  [
                    ,
                    {
                      text: 'Aceptar',
                      onPress: () => {
                        setItemsSeleccionados([]);
                        setSelectedItems([]);
                        setSelectedPrinter([])
                        setIsModalImpresionEtiquetas(
                          !isModalImpresionEtiquetas,
                        );
                      },
                    },
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                  ],
                );
              }}
              buttonStyle={{ backgroundColor: '#3B5998' }}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsModalImpresionEtiquetas(!isModalImpresionEtiquetas);
                setSelectedPrinter([])
              }}
              buttonStyle={{ backgroundColor: '#DC3545' }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={isModalCantidad}
        style={{ flex: 1 }}
        animationInTiming={1000}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 40,
            margin: '10%',
            flexDirection: 'col',
          }}>
          <Text
            style={{ fontSize: 26, textAlign: 'center', margin: 20, gap: 20 }}>
            Ingresa Cantidad
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
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
                style={{ fontWeight: 'bold', fontSize: 25 }}
                keyboardType="numeric"
              />
            </View>
            <View>
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
              <Icon
                raised
                name="remove"
                size={18}
                type="material-icons"
                onPress={() => {
                  if (cantidad <= 0) {
                    setCantidad('0');
                  } else {
                    setCantidad(parseInt(cantidad) - 1);
                  }
                }}
              />
            </View>
          </View>
          <View style={{ marginTop: 20, rowGap: 10 }}>
            <Button
              title="Guardar"
              onPress={() => {
                itemsSeleccionados.map((item, index) => {
                  if (index == itemSeleccionado) {
                    item.cantidadEtiquetas = cantidad;
                  }
                });
                setIsModalCantidad(!isModalCantidad);
              }}
              buttonStyle={{ backgroundColor: '#3B5998' }}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsModalCantidad(!isModalCantidad);
              }}
              buttonStyle={{ backgroundColor: '#DC3545' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tituloListItem: {
    fontWeight: 'bold',
    color: '#000',
    paddingVertical: 5,
  },
  tituloListItemData: {
    fontWeight: 'normal',
    color: '#000',
    textDecorationLine: 'underline',
  },
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF', // Change the color as needed
    borderRadius: 28,
    elevation: 8, // Android shadow
  },
  floatingButtonPrint: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 84,
    backgroundColor: '#afbdd4', // Change the color as needed
    borderRadius: 28,
    elevation: 8, // Android shadow
  },
});
