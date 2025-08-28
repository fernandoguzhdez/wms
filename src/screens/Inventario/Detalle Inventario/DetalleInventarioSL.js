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
  TextInput,
  TouchableHighlight,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import { List } from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import { Icon, SearchBar } from 'react-native-elements';
import Modal from 'react-native-modal';
import { Button } from 'react-native-elements';
import { Card, Badge, Input } from '@rneui/themed';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';
import { SelectList } from 'react-native-dropdown-select-list';

export const DetalleInventarioSL = ({ navigation, route }) => {
  const {
    url,
    tokenInfo,
    fetchDataDetalleInvSL,
    isLoading,
    setIsLoading,
    data,
    setData,
    dataComplete,
    searchDetalleInvSL,
    setSearchDetalleInvSL,
    setModuloScan,
    handleSearchDetalleInvSL,
    printersList,
    setSelectedPrinter,
    selectedPrinter,
    getPrintersList,
    defaultPrinter,
    loadDefaultPrinter,
    searchDetalleInv,
    setSearchDetalleInv,
    searchIdCode
  } = useContext(AuthContext);

  const [page, setPage] = useState(1);
  const handlePress = () => { setExpanded(!expanded), console.log() };
  const [expanded, setExpanded] = React.useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(0);
  const windowsWidth = useWindowDimensions().width;
  const windowsHeight = useWindowDimensions().height;
  const [isModalImpresionEtiquetas, setIsModalImpresionEtiquetas] =
    useState(false);
  const [isModalCantidad, setIsModalCantidad] = useState(false);
  const [isModalImpresionSL, setIsModalImpresionSL] = useState(false);
  const [cantidad, setCantidad] = useState('1');
  const [filteredData, setFilteredData] = useState(data);
  let nuevaColumna = 'cantidadEtiquetas';
  let cantidadEtiquetas = 1;
  const [impresionEtiquetas, setImpresionEtiquetas] = useState([]);
  let sumaItems = 0;
  //const { ItemCode, WhsCode, GestionItem, IdCode } = route.params;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Número de elementos por página
  const [enableCheck, setEnableCheck] = useState(false);
  const [modalUbicaciones, setModalUbicaciones] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState([])

  const limpiarVariables = () => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setSearchDetalleInv(null);
    });
    return unsubscribe;
  };

  const actualizarUbicacion = () => {
    console.log('Datos a enviar...', [{
      "gestionItem": loteSeleccionado.GestionItem,
      "itemCode": loteSeleccionado.ItemCode,
      "whsCode": loteSeleccionado.WhsCode,
      "binEntry": ubicacionSeleccionada.AbsEntry,
      "binName": ubicacionSeleccionada.BinCode,
      "serialOrLote": loteSeleccionado.IdCode
    }])
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenInfo.token}`,
    };
    axios
      .put(`${url}/api/Inventory/Upd_Batchs_Serials`,
        [{
          "gestionItem": loteSeleccionado.GestionItem,
          "itemCode": loteSeleccionado.ItemCode,
          "whsCode": loteSeleccionado.WhsCode,
          "binEntry": ubicacionSeleccionada.AbsEntry,
          "binName": ubicacionSeleccionada.BinCode,
          "serialOrLote": loteSeleccionado.IdCode
        }], { headers })
      .then(response => {
        console.log(response.status);
        Alert.alert('Info', 'Actualizado exitosamente!!', [
          ,
          {
            text: 'OK',
            onPress: () => {
              fetchDataDetalleInvSL(loteSeleccionado.ItemCode, loteSeleccionado.WhsCode, loteSeleccionado.GestionItem)
              setModalUbicaciones(false)
              setUbicacionSeleccionada(null)
              setUbicaciones([])
              setSearchText('')
              setLoteSeleccionado([])
            },
          },
        ]);
      })
      .catch(error => {
        Alert.alert('Error', `Error al actualizar ubicacion : ${error}`, [
          {
            text: 'OK', onPress: () => {
              setModalUbicaciones(false)
              setUbicacionSeleccionada(null)
              setUbicaciones([])
              setSearchText('')
              setLoteSeleccionado([])
            }
          },
        ]);
      });
  }

  const buscarUbicaciones = (texto) => {
    setSearchText(texto);
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenInfo.token}`,
    };
    axios
      .get(`${url}/api/MasterDetails/Get_Bins?NameBin=${texto}`, { headers })
      .then(response => {
        setUbicaciones(response.data.OBIN || []);
      })
      .catch(error => {
        console.error('Error al buscar ubicaciones:', error);
        setUbicaciones([]);
      });
  };

  useEffect(() => {
    if (searchIdCode) {
      setSearchDetalleInvSL(searchIdCode)
    }
  }, []);

  useEffect(() => {
    if (dataComplete.length > 0) {
      if (route.params != undefined) {
        handleSearchDetalleInvSL(route.params.IdCode, 'conScan');
      } else {
        handleSearchDetalleInvSL(searchDetalleInvSL, 'conScan');
      }
    }
  }, [dataComplete]);

  // Lógica para obtener los elementos de la página actual
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let prueba = [];
    prueba.push(data.slice(startIndex, endIndex));
    sumaItems = prueba[0].length + prueba[0].length;
    console.log('suma de items', sumaItems);
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    limpiarVariables()
    getPrintersList()
    loadDefaultPrinter()
    console.log('lote...', searchDetalleInv)
  }, []);


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
      setModuloScan(7);
      navigation.navigate('Scanner');
    }
  };

  const imprimirEtiquetas = () => {
    itemsSeleccionados.map(item => {
      impresionEtiquetas.push({
        gestionItem: item.GestionItem,
        itemCode: item.ItemCode,
        whsCode: item.WhsCode,
        binEntry: item.BinEntry,
        serialOrLote: item.IdCode,
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
        paddingRight: 20,
      }}>
      <CheckBox
        value={selectedItems.includes(item.Id)}
        onValueChange={() => handleCheckboxToggle(item.Id, item)}
        style={{ minHeight: '100%', minWidth: 0 }}
        tintColors={{ true: '#F15927', false: 'black' }}
      />
      <List.Accordion
        style={{ flex: 1, minWidth: '100%', backgroundColor: '#ffffff' }}
        titleStyle={{
          fontSize: windowsWidth > 500 ? 26 : 20,
          fontWeight: '600',
          color: '#000000',
        }}
        title={'Almacen - ' + item.WhsCode + ' - ' + item.IdCode}
        left={props => <List.Icon {...props} icon="folder" color="#828282" />}
        onPress={handlePress}>
        <View style={{ marginVertical: 10 }}>
          <Text
            style={{
              ...styles.tituloListItem,
              fontSize: windowsWidth > 500 ? 24 : 20,
            }}>
            Código de articulo:{' '}
            <Text style={styles.tituloListItemData}>{item.ItemCode}</Text>
          </Text>
          <Text
            style={{
              ...styles.tituloListItem,
              fontSize: windowsWidth > 500 ? 24 : 20,
            }}>
            {item.GestionItem == 'L' ? 'Lote' : 'Serie'}:{' '}
            <Text style={styles.tituloListItemData}>{item.IdCode}</Text>
          </Text>
          <Text
            style={{
              ...styles.tituloListItem,
              fontSize: windowsWidth > 500 ? 24 : 20,
            }}>
            Cantidad disponible:{' '}
            <Text style={styles.tituloListItemData}>{item.QuantityDisp}</Text>
          </Text>
          <Text
            style={{
              ...styles.tituloListItem,
              fontSize: windowsWidth > 500 ? 24 : 20,
            }}>
            Almacen:{' '}
            <Text style={styles.tituloListItemData}>{item.WhsCode}</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                ...styles.tituloListItem,
                fontSize: windowsWidth > 500 ? 24 : 20,
                marginRight: 5,
              }}
            >
              Ubicación:
            </Text>

            <TouchableOpacity
              onPress={() => {
                setModalUbicaciones(true);
                setLoteSeleccionado(item);
                buscarUbicaciones('')
              }}
              style={{
                justifyContent: 'center',
              }}
            >
              {item.BinCode ? (
                <Text style={styles.tituloListItemData}>{item.BinCode}</Text>
              ) : (
                <Icon
                  raised
                  name="plus"
                  type="font-awesome"
                  size={20}
                  color="#FF0000"
                  containerStyle={{ marginTop: 2, left: 15 }}
                />
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={{
              ...styles.tituloListItem,
              fontSize: windowsWidth > 500 ? 24 : 20,
            }}>
            En fecha:{' '}
            <Text style={styles.tituloListItemData}>
              {moment(item.InDate).utc().format('DD/MM/YYYY')}
            </Text>
          </Text>
        </View>
      </List.Accordion>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Spinner visible={isLoading} size={60} color="#ffffff" />
      <SearchBar
        searchIcon={{ size: 24 }}
        onChangeText={text => handleSearchDetalleInvSL(text)}
        onClear={text => handleSearchDetalleInvSL('')}
        placeholder="Buscar..."
        style={{ color: '#000000', fontSize: windowsWidth > 500 ? 26 : 20 }}
        value={searchDetalleInvSL}
        inputStyle={{ backgroundColor: '#ffffff', borderRadius: 10 }}
        containerStyle={{
          backgroundColor: '#ffffff',
          borderRadius: 50,
          margin: 20,
          padding: 0,
          borderColor: '#ffffff',
        }}
        theme
      />
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            flex: 0.6,
            alignItems: 'flex-start',
            flexDirection: 'row',
            paddingLeft: '5%',
          }}>
          {selectedItems.length > 0 ? (
            <Text
              onPress={() => {
                Alert.alert(
                  'Advertencia',
                  '¿Estas seguro de quitar de la lista de seleccion?',
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
              Quitar seleccion
            </Text>
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
          <Text style={{ fontSize: 20, marginHorizontal: 20 }}>
            {itemsPerPage * currentPage - 19 + '-' + itemsPerPage * currentPage}{' '}
            de {data.length}
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
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 20, color: '#999' }}>
              No se encontró el artículo
            </Text>
          </View>
        )}
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
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: windowsWidth > 500 ? 40 : 15,
            margin: windowsWidth > 500 ? '10%' : '1%',
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
                  }}>
                  <Badge
                    status="success"
                    value={item.cantidadEtiquetas}
                    containerStyle={{
                      position: 'absolute',
                      top: -25,
                      right: -25,
                    }}
                    textStyle={{ fontSize: 18 }}
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
                      color: '#000',
                      fontWeight: 'bold',
                    }}>
                    {item.IdCode}
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
              }
              }
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
              inputStyles={{ color: '#000' }}
              dropdownTextStyles={{ color: '#616d71' }}
              boxStyles={styles.selectBox}
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
            Ingresa Cantidad {itemSeleccionado}
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
      {/* Ventana de series y lotes */}
      <Modal
        isVisible={isModalImpresionSL}
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
            Impresion Series y Lotes
          </Text>
          <ScrollView>
            <View style={{ flex: 1, padding: 20 }}></View>
          </ScrollView>
          <View style={{ marginTop: 20, rowGap: 10 }}>
            <Button
              title="Guardar"
              onPress={() => {
                imprimirEtiquetas();
                setIsModalImpresionSL(!isModalImpresionSL);
              }}
              buttonStyle={{ backgroundColor: '#3B5998' }}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsModalImpresionSL(!isModalImpresionSL);
              }}
              buttonStyle={{ backgroundColor: '#DC3545' }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para cargar las ubicaciones */}
      <Modal isVisible={modalUbicaciones} animationInTiming={1000}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 20,
          margin: '10%',
          height: '100%'
        }}>
          {/* Botón "X" para cerrar el modal */}
          <TouchableOpacity
            onPress={() => {
              setModalUbicaciones(false);
              setUbicacionSeleccionada(null);
              setUbicaciones([]);
              setSearchText('');
              setLoteSeleccionado([]);
            }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              padding: 5
            }}
          >
            <Text style={{ fontSize: 20, color: '#999' }}>✕</Text>
          </TouchableOpacity>

          {/* Título + Icono Guardar */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text style={{ fontSize: 24, color: '#000', marginRight: 10 }}>
              Actualizar ubicación
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <TextInput
              placeholder="Buscar ubicación..."
              value={searchText}
              onChangeText={buscarUbicaciones}
              style={{
                flex: 1, // para que tome el ancho disponible
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                color: '#000',
                marginRight: 10, // separación entre el input y el icono
              }}
              placeholderTextColor="#cdcdcd"
            />

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Advertencia',
                  '¿Estas seguro de actualizar la ubicación?',
                  [
                    {
                      text: 'Aceptar',
                      onPress: () => {
                        setModalUbicaciones(false);
                        actualizarUbicacion();
                      },
                    },
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                  ],
                );
              }}
              disabled={!ubicacionSeleccionada} // opcional: deshabilitar si no hay selección
            >
              <Icon
                name="save"
                type="font-awesome"
                color={ubicacionSeleccionada ? "#3B5998" : "#ccc"}
                size={28}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            keyboardShouldPersistTaps="handled"
            data={ubicaciones}
            keyExtractor={(item) => item.AbsEntry.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setUbicacionSeleccionada(item)
                }}
                style={{
                  padding: 10,
                  backgroundColor: ubicacionSeleccionada?.AbsEntry === item.AbsEntry ? '#D0E6FF' : '#F0F0F0',
                  marginBottom: 8,
                  borderRadius: 6,
                  maxHeight: 400
                }}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>{item.BinCode}</Text>
              </TouchableOpacity>
            )}
            style={{ height: '100%' }}
          />
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
    fontSize: 20,
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
  }
});
