import React, { useState, useEffect, useContext } from 'react';
import {
    SafeAreaView,
    Text,
    Alert,
    StyleSheet,
    View,
    ScrollView,
    useWindowDimensions
} from 'react-native';
import { AuthContext } from '../../../contex/AuthContext';
import { Icon } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native';
import { DataTable } from 'react-native-paper';
import { Input, BottomSheet, ListItem } from '@rneui/themed';
import { Button, SearchBar } from 'react-native-elements'
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from "react-native-modal";
import NoResult from "../../../componentes/NoResult";

export function SeriesLotes({ route }) {

    const [swipe, setSwipe] = useState(-195);
    const navigation = useNavigation();
    const { filtrarSerie, searchSerie, articulo, setArticulo, serialsLotes, setSerialsLotes, contadorSerie, url, tokenInfo, setArraySeries, verificarEscaneoSerie,
        textSerie, setTextSerie, setModuloScan, lote, setLote, verificarLote, guardarConteoLote, lotes, setLotes, setCantidadSerieLote, cantidadSerieLote,
        contadorClic, setContadorClic, isLoading, setIsLoading, setIsModalInvSeriesLotes, isModalInvSeriesLotes, FilterInventarioSeriesLotes, getArticulos, cargarTablaLotes, masterDataSourceArticulos } = useContext(AuthContext);
    const { docEntry, lineNum, itemCode, barCode, itemDesc, gestionItem, whsCode, totalQty, countQty, counted, binEntry, binCode } = articulo;
    const { idCode, sysNumber, quantityCounted } = lote;
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([10, 20, 30, 40, 50]);
    const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, serialsLotes.length || lotes.length);
    const windowsWidth = useWindowDimensions().width;
    const windowsHeight = useWindowDimensions().height;
    const [cantidad, setCantidad] = useState('1');
    const [enableButton, setEnableButton] = useState(false);
    const [isVisibleBottomSheet, setIsVisibleBottomSheet] = useState(false);
    const [valueText, setValueText] = useState(null)
    const [itemSeleccionado, setItemSeleccionado] = useState([])

    const limpiarVariables = () => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setLotes([])
            setArticulo([])
            setItemSeleccionado([])
            setTextSerie(null)
            setCantidadSerieLote(0)
            setSerialsLotes([])
            setLote([])
        });
        return unsubscribe;
    }

    useEffect(() => {
        limpiarVariables()
    }, []);


    useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const FiltrarArticulo = () => {
        masterDataSourceArticulos.map((item) => {
            if (item.itemCode == route.params.itemCode && item.whsCode == route.params.whsCode && item.binEntry == route.params.binEntry) {
                setArticulo(item)
                getArticulos(item.docEntry)
                cargarTablaLotes(item.docEntry, item.lineNum, item.itemCode, item.gestionItem)
                if (item.gestionItem == 'S') {
                    verificarEscaneoSerie(item.docEntry, item.lineNum, item.itemCode, item.gestionItem, valueText, item.whsCode, item.binEntry, item.binCode, item.barCode, item.itemDesc, item.totalQty, item.countQty)
                } else {
                    verificarLote(valueText, 'manual', item.itemCode, item.gestionItem, item.whsCode, item.binEntry);
                }
            }
        })
    }

    handleEliminarSL = (id, item) => {
        setIsLoading(true)
        const newArray = lotes.filter((elemento, index) => index !== id);

        // Set headers
        const headers = {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        axios
            .put(`${url}/api/InventoryCount/Update_CountInventory`, {
                "docEntry": route.params.docEntry,
                "Items": [
                    {
                        "DocEntry": route.params.docEntry,
                        "LineNum": route.params.lineNum,
                        "ItemCode": route.params.barCode,
                        "BarCode": route.params.itemCode,
                        "ItemDesc": route.params.itemDesc,
                        "GestionItem": route.params.gestionItem,
                        "WhsCode": route.params.whsCode,
                        "totalQty": Number(route.params.countQty) - Number(item.quantityCounted),
                        "QuantityCounted": 0,
                        "BinEntry": route.params.binEntry,
                        "BinCode": route.params.binCode,
                        "serialandManbach": newArray
                    }
                ]
            }, { headers })
            .then((response) => {
                setIsLoading(false)
                Alert.alert('Info', '¡Elemento eliminado con exito!', [
                    {
                        text: 'OK', onPress: () => {
                            cargarTablaLotes(route.params.docEntry, route.params.lineNum, route.params.itemCode, route.params.gestionItem)
                            getArticulos(route.params.docEntry)
                        }
                    },
                ]);
            })
            .catch(error => {
                setIsLoading(false)
                Alert.alert('Advertencia', 'Error al intentar eliminar el elemento >>>  ' + error, [
                    { text: 'OK' },
                ]);
            });
    }

    const handleActualizarSL = () => {
        const updatedItems = lotes.map(item =>
            item.idCode === itemSeleccionado.idCode
                ? { ...item, quantityCounted: Number(cantidadSerieLote) }
                : item
        );

        const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantityCounted, 0);

        if (Number(totalQuantity) > Number(route.params.totalQty)) return Alert.alert('Advertencia', 'Has excedido el límite disponible. El total permitido es de: ' + route.params.totalQty, [
            { text: 'OK', onPress: () => { } },
        ]);

        // Set headers
        const headers = {
            Accept: "application/json",
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        axios
            .put(`${url}/api/InventoryCount/Update_CountInventory`, {
                "docEntry": route.params.docEntry,
                "Items": [
                    {
                        "DocEntry": route.params.docEntry,
                        "LineNum": route.params.lineNum,
                        "ItemCode": route.params.barCode,
                        "BarCode": route.params.itemCode,
                        "ItemDesc": route.params.itemDesc,
                        "GestionItem": route.params.gestionItem,
                        "WhsCode": route.params.whsCode,
                        "totalQty": totalQuantity,
                        "QuantityCounted": 0,
                        "BinEntry": route.params.binEntry,
                        "BinCode": route.params.binCode,
                        "serialandManbach": updatedItems
                    }
                ]
            }, { headers })
            .then((response) => {
                setIsLoading(false)
                Alert.alert('Info', '¡Elemento actualizado con exito!', [
                    {
                        text: 'OK', onPress: () => {
                            setItemSeleccionado([])
                            setCantidadSerieLote(0)
                            cargarTablaLotes(route.params.docEntry, route.params.lineNum, route.params.itemCode, route.params.gestionItem)
                            getArticulos(route.params.docEntry)
                            setIsVisibleBottomSheet(false)
                        }
                    },
                ]);
            })
            .catch(error => {
                setItemSeleccionado([])
                setIsLoading(false)
                setIsVisibleBottomSheet(false)
                Alert.alert('Advertencia', 'Error al intentar actualizar el elemento >>>  ' + error, [
                    { text: 'OK' },
                ]);
            });
    }

    return (
        <View style={{ flex: 1, padding: 10, backgroundColor: '#fff' }}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <SearchBar
                platform="default"
                onChangeText={(text) => {
                    FilterInventarioSeriesLotes(text);
                    text == '' ? setTextSerie(null) : setTextSerie(text.toLocaleUpperCase())
                }}
                onClearText={(text) => {
                    FilterInventarioSeriesLotes(text)
                }}
                placeholder="Buscar aqui..."
                placeholderTextColor="#888"
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                onCancel={() => console.log('cancelando...')}
                value={textSerie}
                //onSubmitEditing={handleSubmit}
                inputStyle={{ backgroundColor: '#f4f4f4', borderRadius: 10, color: '#000' }}
                containerStyle={{ backgroundColor: '#f4f4f4', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4' }}
                theme
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Button
                    title="Agregar"
                    icon={
                        <Icon
                            name="plus"
                            type="font-awesome"
                            color="#ffff"
                            size={15}
                            iconStyle={{ marginLeft: 10, padding: 5 }}
                        />
                    }
                    iconLeft
                    buttonStyle={{
                        backgroundColor: '#3b5998',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        marginVertical: 10
                    }}
                    onPress={() => setIsVisibleBottomSheet(true)}
                />
            </View>

            <ScrollView>
                {serialsLotes.length === 0 && isLoading === false ?
                    <View style={{
                        height: windowsHeight / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 10,
                    }}>
                        <NoResult texto="No se encontraron resultados" />
                    </View> :
                    <DataTable>
                        <DataTable.Header style={{ backgroundColor: '#00913f' }}>
                            <DataTable.Title textStyle={styles.titleTable}>{route.params.gestionItem == 'S' ? 'Serie' : 'Lote'}</DataTable.Title>
                            <DataTable.Title textStyle={styles.titleTable}>Almacen</DataTable.Title>
                            <DataTable.Title textStyle={styles.titleTable}>Ubicacion</DataTable.Title>
                            <DataTable.Title textStyle={styles.titleTable}>Cantidad</DataTable.Title>
                            <DataTable.Title textStyle={styles.titleTable}></DataTable.Title>
                        </DataTable.Header>
                        {serialsLotes.slice(from, to).map((item, index) => (
                            <DataTable.Row key={item.idCode}>
                                <DataTable.Cell textStyle={{ fontSize: windowsWidth > 500 ? 28 : 18, color: '#000' }}>{item.idCode}</DataTable.Cell>
                                <DataTable.Cell textStyle={{ fontSize: windowsWidth > 500 ? 28 : 18, color: '#000' }}>{item.whsCode}</DataTable.Cell>
                                <DataTable.Cell textStyle={{ fontSize: windowsWidth > 500 ? 28 : 18, color: '#000' }}>{item.binEntry}</DataTable.Cell>
                                <DataTable.Cell textStyle={{ fontSize: windowsWidth > 500 ? 28 : 18, color: '#000' }}>{item.quantityCounted}</DataTable.Cell>
                                <DataTable.Cell textStyle={{ fontSize: windowsWidth > 500 ? 28 : 18, color: '#000' }}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Icon
                                            raised
                                            name='delete'
                                            size={18}
                                            iconStyle={{ fontWeight: 'bold', color: '#FF0000' }}
                                            type='material-icons'
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
                                                                handleEliminarSL(index, item)
                                                            },
                                                        },
                                                    ],
                                                );
                                            }} />
                                        {route.params.gestionItem === 'L' ?
                                            <Icon
                                                raised
                                                name='edit'
                                                size={18}
                                                iconStyle={{ fontWeight: 'bold', color: '#3b5998' }}
                                                type='material-icons'
                                                onPress={() => {
                                                    setIsVisibleBottomSheet(true)
                                                    setItemSeleccionado(item)
                                                    setCantidadSerieLote(item.quantityCounted)
                                                }} /> : ''

                                        }
                                    </View>
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(serialsLotes.length / itemsPerPage)}
                            onPageChange={(page) => setPage(page)}
                            label={`${from + 1}-${to} of ${serialsLotes.length}`}
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            numberOfItemsPerPage={itemsPerPage}
                            onItemsPerPageChange={onItemsPerPageChange}
                            showFastPaginationControls
                            selectPageDropdownLabel={'Rows per page'}
                        />
                    </DataTable>
                }
            </ScrollView>

            <Modal isVisible={isModalInvSeriesLotes} style={{}} animationInTiming={1000} >
                <ScrollView style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: windowsWidth > 500 ? 30 : 15 }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Conteo Lotes</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.contentIdCode}>
                            <Text style={styles.titleIdCode}>Id_Code:</Text> {idCode}
                        </Text>
                        <Text style={styles.contentIdCode}>
                            <Text style={styles.titleIdCode}>Almacen:</Text> {whsCode}
                        </Text>
                        <Text style={styles.contentIdCode}>
                            <Text style={styles.titleIdCode}>Ubicacion:</Text> {binEntry}
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
                                if (cantidadSerieLote <= 0) {
                                    setCantidadSerieLote('0')
                                } else {
                                    setCantidadSerieLote(parseInt(cantidadSerieLote) - 1)
                                }
                            }} />
                        <Input
                            value={cantidadSerieLote.toString()}
                            onChangeText={text => {
                                const nuevaCadena = text.replace(/[^0-9.]/g, '');
                                // Verificar si hay más de un punto decimal
                                if ((nuevaCadena.match(/\./g) || []).length > 1) {
                                    return;
                                }
                                setCantidadSerieLote(nuevaCadena)
                            }}
                            style={{ fontWeight: 'bold', fontSize: 25, textAlign: 'center', borderWidth: 1, borderColor: '#3b5998', borderCurve: 'circular', color: '#000' }}
                            keyboardType='numeric'
                            containerStyle={{ flex: .5 }}
                        />
                        <Icon
                            raised
                            name='add'
                            size={18}
                            type='material-icons'
                            onPress={() => {
                                if (cantidadSerieLote === '' || cantidadSerieLote < 0) {
                                    setCantidadSerieLote('0')
                                } else {
                                    setCantidadSerieLote(parseInt(cantidadSerieLote) + 1)
                                }

                            }} />
                    </View>

                    <View style={{ width: '50%', rowGap: 20, alignSelf: 'center', marginTop: 30 }}>
                        <Button
                            title="Guardar Conteo"
                            onPress={() => {
                                console.log()
                                const totalQuantity = (serialsLotes.reduce((acc, item) => acc + item.quantityCounted, 0)) + Number(cantidadSerieLote);
                                console.log('Suma: ', totalQuantity)

                                if (Number(totalQuantity) > Number(route.params.totalQty)) {
                                    Alert.alert('Advertencia', 'Has excedido el límite disponible. El total permitido es de: ' + route.params.totalQty, [
                                        { text: 'OK', onPress: () => { } },
                                    ]);
                                } else {
                                    guardarConteoLote(cantidadSerieLote, idCode, sysNumber, route.params.docEntry);
                                    setCantidadSerieLote('0');
                                    setIsLoading(true)
                                    setIsModalInvSeriesLotes(!isModalInvSeriesLotes)
                                }
                            }}
                            disabled={cantidadSerieLote > 0 ? false : true}
                        />
                        <Button
                            title="Cancelar"
                            onPress={() => { setIsModalInvSeriesLotes(!isModalInvSeriesLotes); setCantidadSerieLote('0') }}
                            buttonStyle={{ backgroundColor: '#F80000' }}
                            disabled={enableButton}
                        />
                    </View>
                </ScrollView>
            </Modal>

            <BottomSheet modalProps={{}} isVisible={isVisibleBottomSheet}>
                <View style={{ paddingTop: 20, backgroundColor: '#fff', alignItems: 'center' }}>
                    {itemSeleccionado.length != 0 ?
                        <View style={{ flexDirection: 'row', marginTop: 50, width: '100%', justifyContent: 'center' }}>
                            <Icon
                                raised
                                name='remove'
                                size={18}
                                iconStyle={{ fontWeight: 'bold' }}
                                type='material-icons'
                                onPress={() => {
                                    if (cantidadSerieLote <= 0) {
                                        setCantidadSerieLote('0')
                                    } else {
                                        setCantidadSerieLote(parseInt(cantidadSerieLote) - 1)
                                    }
                                }} />
                            <Input
                                value={cantidadSerieLote.toString()}
                                onChangeText={text => {
                                    const nuevaCadena = text.replace(/[^0-9.]/g, '');
                                    // Verificar si hay más de un punto decimal
                                    if ((nuevaCadena.match(/\./g) || []).length > 1) {
                                        return;
                                    }
                                    setCantidadSerieLote(nuevaCadena)
                                }}
                                style={{ fontWeight: 'bold', fontSize: 25, textAlign: 'center', borderWidth: 1, borderColor: '#3b5998', borderCurve: 'circular', color: '#000' }}
                                keyboardType='numeric'
                                containerStyle={{ flex: .5 }}
                            />
                            <Icon
                                raised
                                name='add'
                                size={18}
                                type='material-icons'
                                onPress={() => {
                                    if (cantidadSerieLote === '' || cantidadSerieLote < 0) {
                                        setCantidadSerieLote('0')
                                    } else {
                                        setCantidadSerieLote(parseInt(cantidadSerieLote) + 1)
                                    }

                                }} />
                        </View> :
                        <SearchBar
                            platform="default"
                            onChangeText={(text) => {
                                text === '' ? setValueText(null) : setValueText(text.toLocaleUpperCase())
                            }}
                            onClearText={(text) => {
                                setValueText(text)
                            }}
                            placeholder={route.params.gestionItem === 'L' ? 'Ingrese el lote a buscar' : 'Ingrese la serie a buscar'}
                            placeholderTextColor="#888"
                            cancelButtonTitle="Cancel"
                            cancelButtonProps={{}}
                            onCancel={() => console.log('cancelando...')}
                            value={valueText}
                            //onSubmitEditing={handleSubmit}
                            inputStyle={{ backgroundColor: '#ffff', borderRadius: 10, color: '#000' }}
                            containerStyle={{ backgroundColor: '#ffff', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4', width: '70%' }}
                            theme
                        />}
                    {itemSeleccionado.length != 0 ?
                        <Button
                            title="Actualizar"
                            onPress={() => { handleActualizarSL() }}
                            containerStyle={{ width: '70%', margin: 5 }}
                            titleStyle={{ color: '#fff' }}
                        /> :
                        <Button
                            title="Buscar"
                            onPress={() => { FiltrarArticulo(), setIsVisibleBottomSheet(false), setValueText(null) }}
                            containerStyle={{ width: '70%', margin: 5 }}
                            titleStyle={{ color: '#fff' }}
                        />
                    }

                    <Button
                        title="Cancelar"
                        onPress={() => { setIsVisibleBottomSheet(false), setItemSeleccionado([]), setCantidadSerieLote(0), setValueText(null) }}
                        buttonStyle={{ backgroundColor: '#F80000' }}
                        containerStyle={{ width: '70%', margin: 5 }}
                        titleStyle={{ color: '#fff' }}
                    />
                </View>
            </BottomSheet>
        </View>
    );
};


const styles = StyleSheet.create({
    titleTable: {
        color: '#ffff',
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'roboto',
    },
    titleIdCode: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 26,
    },
    contentIdCode: {
        color: '#000',
        fontSize: 24,
        padding: 10
    }
});
