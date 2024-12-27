import React, { useState, useEffect, useContext } from 'react';
import { DarkTheme, useNavigation } from '@react-navigation/native';
import { DataTable } from 'react-native-paper';
import { AuthContext } from '../../../contex/AuthContext';
import axios from 'axios';
import { View, StyleSheet, Text, Alert, useWindowDimensions, FlatList, TouchableOpacity, TouchableHighlight, ScrollView } from 'react-native';
import { Input, Card, lightColors } from '@rneui/themed';
import { Button, SearchBar, Icon, Badge } from 'react-native-elements'
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'
import Spinner from 'react-native-loading-spinner-overlay';
import { SwipeListView } from 'react-native-swipe-list-view';

export function Articulos({ route, navigation }) {

    const { isLoading, filteredDataSourceArticulos, FilterInventarioArticulos, valueFilterInvArticulos, setValueFilterInvArticulos, isModalInvArticulos, setIsModalInvArticulos,
        guardarConteoArticulo, setArticulo, articulo, cargarTablaLotes, masterDataSourceArticulos, verificarEscaneoSerie, verificarLote, getArticulos, setSerieLoteTransfer,
        setItemsTraslados, tablaItemsTraslados, setModuloScan, setFilteredDataSourceArticulos, setMasterDataSourceArticulos } = useContext(AuthContext);
    const [swipe, setSwipe] = useState(-150);
    const windowsWidth = useWindowDimensions().width;
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([50, 100, 150, 200]);
    const [itemsPerPage, onItemsPerPageChange] = useState(
        numberOfItemsPerPageList[0]
    );
    const [cantidad, setCantidad] = useState('1');
    const [enableButton, setEnableButton] = useState(false);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState([])
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, filteredDataSourceArticulos.length);

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setValueFilterInvArticulos(null)
            setFilteredDataSourceArticulos([])
            setMasterDataSourceArticulos([])
            console.log('Limpiando al salir')
        });
        return unsubscribe;
    }, [])

    const handleSubmit = () => {
        const cadena = valueFilterInvArticulos.split('||')
        switch (cadena.length) {
            case 3:
                FilterInventarioArticulos(cadena[0]);
                setValueFilterInvArticulos(null)
                break;

            case 4:
                FiltrarArticulo(cadena[0], cadena[1], cadena[2], cadena[3])
                //setValueFilterInvArticulos(null)
                //navigation.navigate('SeriesLotes', route.params)
                break;

            default:
                break;
        }
    }

    const FiltrarArticulo = (itemCode, idCode, whsCode, binEntry) => {
        console.log('Cadena...', itemCode, idCode, whsCode, binEntry)
        masterDataSourceArticulos.map((item) => {
            if (item.itemCode == itemCode && item.whsCode == whsCode && item.binEntry == binEntry) {
                navigation.navigate('SeriesLotes', item)
                setArticulo(item)
                console.log('estoy en el metodo FiltrarArticulo...', item.docEntry)
                getArticulos(item.docEntry)
                cargarTablaLotes(item.docEntry, item.lineNum, item.itemCode, item.gestionItem)
                if (item.gestionItem == 'S') {
                    verificarEscaneoSerie(item.docEntry, item.lineNum, item.itemCode, item.gestionItem, idCode, item.whsCode, item.binEntry, item.binCode, item.barCode, item.itemDesc, item.totalQty, item.countQty)
                } else {
                    verificarLote(idCode, 'manual', item.itemCode, item.gestionItem, item.whsCode, item.binEntry);
                }
            }
        })

    }

    const esArticulo = (item) => {
        setIsModalInvArticulos(!isModalInvArticulos)
        setArticulo(item)
    }

    const esSerieLote = (item) => {
        cargarTablaLotes(item.docEntry, item.lineNum, item.itemCode, item.gestionItem)
        navigation.navigate('SeriesLotes', item)
    }

    const ItemView = ({ item }) => {
        return (
            // Flat List Item
            <TouchableHighlight disabled={item.status == 'C' ? true : false} style={{ marginVertical: 2 }} key={item.docEntry}
                onPress={() => {
                    item.gestionItem == 'I' ? esArticulo(item) : esSerieLote(item)
                    //setIsLoading(true)
                }} >
                <View style={{ backgroundColor: '#f1f3f4', opacity: item.status == 'C' ? 0.4 : 1, justifyContent: 'flex-start', flexDirection: 'row' }}  >
                    <View style={styles.itemTexto}>
                        <Text style={styles.texto}>
                            Alm: {item.whsCode}
                            {item.binEntry == 0 ? '' : `  |  Ubi:  ` + item.binEntry}
                            {'  |  Contados: ' + item.countQty} {'  |  Total: ' + item.totalQty + '    '}
                            {item.gestionItem == 'S' ? <Badge status="success" value='  Serie  ' style={styles.badge} /> : item.gestionItem == 'L' ? <Badge status="warning" value='  Lote  ' style={styles.badge} /> : ''}
                        </Text>
                        <Text style={{ ...styles.texto }}>
                            {item.itemCode}  |  {item.itemDesc.substring(0, 50 - 3)}...
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', height: 'auto', overflow: 'hidden' }}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <SearchBar
                platform="default"
                onChangeText={(text) => {
                    FilterInventarioArticulos(text);
                    text == '' ? setValueFilterInvArticulos(null) : setValueFilterInvArticulos(text.toLocaleUpperCase())

                }}
                onClearText={(text) => {
                    FilterInventarioArticulos(text)
                }}
                placeholder="Buscar aqui..."
                placeholderTextColor="#888"
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                onCancel={() => console.log('cancelando...')}
                value={valueFilterInvArticulos}
                onSubmitEditing={handleSubmit}
                inputStyle={{ backgroundColor: '#f4f4f4', borderRadius: 10, color: '#000' }}
                containerStyle={{ backgroundColor: '#f4f4f4', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4' }}
                theme
            />
            <SwipeListView
                data={filteredDataSourceArticulos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={ItemView}
                style={{ marginVertical: 20 }}
                renderHiddenItem={(data, rowMap) => (
                    <View style={styles.rowBack}>

                    </View>
                )}
                rightOpenValue={swipe}
                stopLeftSwipe={-1}
                stopRightSwipe={-1}
            />

            <Modal isVisible={isModalInvArticulos} style={{}} animationInTiming={1000} >
                <ScrollView style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: windowsWidth > 500 ? 30 : 15 }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Inventario Articulos</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.content}>
                            {articulo.itemCode}
                        </Text>
                        <Text style={styles.content}>
                            {articulo.itemDesc}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 50, width: '100%', justifyContent: 'center' }}>
                        <Icon
                            raised
                            name='remove'
                            size={18}
                            iconStyle={{ fontWeight: 'bold' }}
                            type='material-icons'
                            onPress={() => {
                                if (cantidad <= 0) {
                                    setCantidad('0')
                                } else {
                                    setCantidad(parseInt(cantidad) - 1)
                                }
                            }} />
                        <Input
                            value={cantidad.toString()}
                            onChangeText={text => {
                                const nuevaCadena = text.replace(/[^0-9.]/g, '');
                                // Verificar si hay más de un punto decimal
                                if ((nuevaCadena.match(/\./g) || []).length > 1) {
                                    return;
                                }
                                setCantidad(nuevaCadena)
                            }}
                            style={{ fontWeight: 'bold', fontSize: 25, textAlign: 'center', borderWidth: 1, borderColor: '#3b5998', borderCurve: 'circular' }}
                            keyboardType='numeric'
                            containerStyle={{ flex: .5 }}
                        />
                        <Icon
                            raised
                            name='add'
                            size={18}
                            type='material-icons'
                            onPress={() => {
                                if (cantidad === '' || cantidad < 0) {
                                    setCantidad('0')
                                } else {
                                    setCantidad(parseInt(cantidad) + 1)
                                }

                            }} />
                    </View>

                    <View style={{ width: '50%', rowGap: 20, alignSelf: 'center', marginTop: 30 }}>
                        <Button
                            title="Guardar Conteo"
                            onPress={() => {
                                guardarConteoArticulo(cantidad, articulo.docEntry)
                            }}
                            disabled={cantidad > 0 ? false : true}
                        />
                        <Button
                            title="Cancelar"
                            onPress={() => { setIsModalInvArticulos(!isModalInvArticulos); setCantidad('1') }}
                            buttonStyle={{ backgroundColor: '#F80000' }}
                            disabled={enableButton}
                        />
                    </View>
                </ScrollView>
            </Modal>

            <TouchableOpacity
                style={styles.floatingButtonPrint}
                onPress={() => {
                    setSerieLoteTransfer(null)
                    navigation.navigate('Scanner', route.params.docEntry);
                    setItemsTraslados(tablaItemsTraslados)
                    setModuloScan(4)
                }}
            >
                <Icon name="barcode" size={24} color="#FFF" type='font-awesome' />
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        padding: 10
    },
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
        justifyContent: 'space-between'
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
        gap: 15
    },
    content: {
        fontSize: 28,
        color: '#9b9b9b'
    },
    title: {
        color: '#fff',
        fontSize: 26,
        textAlign: 'center'
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
    itemTexto: {
        height: 150,
        width: 'auto',
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    texto: {
        padding: 10,
        color: '#384347',
        fontWeight: 'bold',
        fontSize: 24,
    },
    badge: {
        color: '#fff',
        fontSize: 26,
    },
    rowBack: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderRadius: 0,
        height: 90,
        marginVertical: 2,
    },
    rowBackButtonEliminar: {
        backgroundColor: '#ff0000',
        width: 150,
        height: 90,
        textAlign: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    }
});
