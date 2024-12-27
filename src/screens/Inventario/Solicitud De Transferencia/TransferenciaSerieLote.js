import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../../contex/AuthContext';
import axios from 'axios';
import { View, StyleSheet, Text, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Input, Card, lightColors, Chip } from '@rneui/themed';
import { Icon, SearchBar, Button } from 'react-native-elements'
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'
import Spinner from 'react-native-loading-spinner-overlay';
import { DataTable } from 'react-native-paper';

export const TransferenciaSerieLote = ({ navigation, route }) => {

    const { url, tokenInfo, setModuloScan, setIsLoading, isLoading, barcodeItemTraslados, setBarcodeItemTraslados,
        ComprobarSerieLoteTransfer, itemTraslado, setSerieLoteTransfer, serieLoteTransfer, almacenes, isModalTransferirSerieLote, setIsModalTransferirSerieLote, ActualizarSerieLoteTransfer,
        selectedUbicacionOri, setSelectedUbicacionOri, isModalUbicacion, setIsModalUbicacion, dataSerieLoteTransfer, setDataSerieLoteTransfer, selectedUbicacionDes, setSelectedUbicacionDes,
        tablaSeriesLotesTransfer, setTablaSeriesLotesTransfer, cargarTablaSeriesLotesTransfer, seEscaneo, setSeEscaneo, ubicacionOrigen, ubicacionOri, setUbicacionOri, ubicacionDes, setUbicacionDes,
        splitCadenaEscaner, idCodeSL, getItemsTraslados } = useContext(AuthContext);
    const { docEntry, lineNum, itemCode, barCode, itemDesc, gestionItem, fromWhsCode, fromBinCode, fromBinEntry, toWhsCode, totalQty, countQty, counted, toBinEntry, binCode } = itemTraslado
    const [cantidad, setCantidad] = useState('0');
    const windowsWidth = useWindowDimensions().width;
    const windowsHeight = useWindowDimensions().height;
    const [enableButton, setEnableButton] = useState(false);

    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([50, 100, 150, 200]);
    const [itemsPerPage, onItemsPerPageChange] = useState(
        numberOfItemsPerPageList[0]
    );

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, tablaSeriesLotesTransfer.length);

    useEffect(() => {
        limpiarVariables()
    }, [])

    const limpiarVariables = () => {
        /* const unsubscribe = navigation.addListener('beforeRemove', () => {
            setTablaSeriesLotesTransfer([])
            console.log(tablaSeriesLotesTransfer)
        });
        return unsubscribe; */
    }

    useEffect(() => {
        setPage(0);
        setSerieLoteTransfer(null)
    }, [itemsPerPage]);

    /* useEffect(() => {
        
        if (docEntry && route.params != 'verEnviados') {
            cargarTablaSeriesLotesTransfer();
            if (route.params != 'sinEscaner') {
                ubicacionOrigen(gestionItem, itemCode, fromWhsCode, toWhsCode)
            } else {
                console.log('obtener ubicacion destino...')
                obtenerUbicacionDes();
            }
        } else {
            console.log('no se logroooo')
            cargarTablaSeriesLotesTransfer()
        }

    }, [itemTraslado]) */

    const obtenerUbicacionDes = () => {
        almacenes.map((item) => {
            if (item.key == toWhsCode) {
                if (item.ubicacion == null) {
                    setUbicacionDes([])
                } else {
                    let arrayUbicacion = item.ubicacion.map((item) => {
                        return { key: item.absEntry, value: item.sL1Code }
                    })
                    setUbicacionDes(arrayUbicacion)
                }
            }
        })
    }

    const comprobarUbicacionOrigen = (metodo) => {
        switch (metodo) {
            case 'conEscaner':
                navigation.navigate('Scanner');
                setModuloScan(5)
                break;
            case 'sinEscaner':
                if (serieLoteTransfer == null) {
                    Alert.alert('Info', '¡No puede quedar el campo vacio!', [
                        { text: 'OK', onPress: () => { } },
                    ]);
                } else {
                    ubicacionOrigen(gestionItem, itemCode, fromWhsCode, toWhsCode)
                    console.log('a ver que hay aqui', gestionItem + itemCode + fromWhsCode + toWhsCode)
                }
                break;
            default:
                break;
        }
    }

    const handleSubmit = () => {
        console.log('enter...', docEntry + '   :  ' + serieLoteTransfer)
        setIsLoading(true)
        splitCadenaEscaner(serieLoteTransfer, docEntry, 'EnterSolicitudTransferenciaSeriesLotes')
    }

    useEffect(() => {
        if (idCodeSL.length > 4) {
            console.log('partes de series...', idCodeSL)
            //navigation.navigate('TransferenciaSerieLote', 'sinEscaner')
            ComprobarSerieLoteTransfer(idCodeSL[4], idCodeSL[0], idCodeSL[2], idCodeSL[3], idCodeSL[1], 'Enter')
            setSerieLoteTransfer(null)
        }

    }, [idCodeSL])

    const eliminarSerieLoteTransfer = (id) => {
        setIsLoading(true)
        const newArray = tablaSeriesLotesTransfer.filter((elemento, index) => index !== id);

        // Set headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        axios
            .put(`${url}/api/SolTransferStock/Update`, {
                "docEntry": docEntry,
                "items": [
                    {
                        "docEntry": docEntry,
                        "lineNum": lineNum,
                        "itemCode": itemCode,
                        "barCode": barCode,
                        "itemDesc": itemDesc,
                        "gestionItem": gestionItem,
                        "fromWhsCode": fromWhsCode,
                        "fromBinEntry": selectedUbicacionOri,
                        "fromBinCode": "",
                        "toWhsCode": toWhsCode,
                        "toBinEntry": 0,
                        "toBinCode": "",
                        "inWhsQty": 0,
                        "quantityCounted": 1,
                        "serialandManbach": newArray
                    }
                ]
            }, { headers })
            .then((response) => {
                setIsLoading(false)
                Alert.alert('Info', '¡Elemento Eliminado!', [
                    {
                        text: 'OK', onPress: () => {
                            cargarTablaSeriesLotesTransfer()
                            getItemsTraslados(docEntry)
                        }
                    },
                ]);
            })
            .catch(error => {
                console.log(error)
                setIsLoading(false)
            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10 }}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <View style={{ margin: windowsWidth > 500 ? 20 : 0 }}>
                {/* <Input
                    leftIcon={
                        <Icon
                            name='barcode'
                            size={windowsWidth > 500 ? 40 : 30}
                            type='font-awesome'
                            containerStyle={{ paddingHorizontal: 5 }}
                            onPress={() => {
                                setSerieLoteTransfer(null)
                                navigation.navigate('Scanner', docEntry);
                                setModuloScan(4)
                            }} />}
                    rightIcon={
                        <Icon
                            name='search'
                            disabled={serieLoteTransfer == '' ? true : false}
                            disabledStyle={{ backgroundColor: '#ffff' }}
                            iconStyle={{ color: serieLoteTransfer == '' ? '#f3f3f3' : '#000' }}
                            size={windowsWidth > 500 ? 30 : 20}
                            type='font-awesome'
                            containerStyle={{ paddingHorizontal: 5 }}
                            onPress={() => {
                                comprobarUbicacionOrigen('sinEscaner')
                            }} />}
                    placeholder={gestionItem == 'S' ? 'Escanea o captura la serie' : 'Escanea o captura el lote'}
                    value={serieLoteTransfer}
                    onChangeText={(text) => { text == '' ? setSerieLoteTransfer(null) : setSerieLoteTransfer(text.toLocaleUpperCase()) }}
                    onSubmitEditing={handleSubmit}
                    onClear={(text) => setSerieLoteTransfer(null)}
                    style={{ margin: 0, fontSize: windowsWidth > 500 ? 22 : 16, color: '#000', fontWeight: 'bold' }}
                    containerStyle={{ padding: 10 }}
                /> */}
                <SearchBar
                    platform="default"
                    onChangeText={(text) => { console.log(text) }}
                    onClearText={(text) => { console.log(text) }}
                    placeholder="Buscar aqui..."
                    placeholderTextColor="#888"
                    cancelButtonTitle="Cancel"
                    cancelButtonProps={{}}
                    onCancel={() => console.log('cancelando...')}
                    //value={barcodeItemTraslados}
                    //onSubmitEditing={handleSubmit}
                    inputStyle={{ backgroundColor: '#f4f4f4', borderRadius: 10, color: '#000' }}
                    containerStyle={{ backgroundColor: '#f4f4f4', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4' }}
                    theme
                />
                <View style={{ flexDirection: 'row', height: 'auto', flexWrap: 'wrap' }}>
                    <ScrollView>
                        <DataTable>
                            <DataTable.Header style={{ backgroundColor: '#00913f' }}>
                                <DataTable.Title textStyle={styles.cellTitle} style={styles.cellContent}>{gestionItem == 'S' ? 'N° Serie' : 'N° Lote'}</DataTable.Title>
                                <DataTable.Title textStyle={styles.cellTitle} style={[styles.cellContent, styles.numericCell]}>A. origen</DataTable.Title>
                                <DataTable.Title textStyle={styles.cellTitle} style={[styles.cellContent, styles.numericCell]}>A. destino</DataTable.Title>
                                <DataTable.Title textStyle={styles.cellTitle} style={[styles.cellContent, styles.numericCell]}>Cantidad</DataTable.Title>
                                <DataTable.Title textStyle={styles.cellTitle} style={[styles.cellContent, styles.numericCell]}>Accion</DataTable.Title>
                            </DataTable.Header>

                            {tablaSeriesLotesTransfer.slice(from, to).map((item, index) => (
                                <DataTable.Row key={index}>
                                    <DataTable.Cell textStyle={{ fontSize: 22, flex: 1, flexWrap: 'wrap', minHeight: 60 }} style={styles.cellContent}><View><Text style={styles.cellContent}>{item.idCode}</Text></View></DataTable.Cell>
                                    <DataTable.Cell textStyle={{ fontSize: 22, flex: 1, flexWrap: 'wrap', minHeight: 60 }} style={{ maxWidth: 120, justifyContent: 'flex-start', alignItems: 'center' }}><View><Text style={styles.cellContent}>{item.FromWhsCode}</Text></View></DataTable.Cell>
                                    <DataTable.Cell textStyle={{ fontSize: 22, flex: 1, flexWrap: 'wrap', minHeight: 60 }} style={{ maxWidth: 120, justifyContent: 'flex-start', alignItems: 'center' }}><View><Text style={styles.cellContent}>{item.ToWhsCode}</Text></View></DataTable.Cell>
                                    <DataTable.Cell textStyle={{ fontSize: 22, flex: 1, flexWrap: 'wrap', minHeight: 60 }} style={{ maxWidth: 120, justifyContent: 'flex-start', alignItems: 'center' }}><View><Text style={styles.cellContent}>{item.quantityCounted}</Text></View></DataTable.Cell>
                                    <DataTable.Cell textStyle={{ fontSize: 22, flex: 1, flexWrap: 'wrap', minHeight: 60 }} style={{ maxWidth: 120, justifyContent: 'flex-start', alignItems: 'center' }}><View><Text style={styles.cellContent}><Icon
                                        name='trash'
                                        disabledStyle={{ backgroundColor: '#ffff' }}
                                        iconStyle={{ color: '#FF0000' }}
                                        size={windowsWidth > 500 ? 35 : 20}
                                        type='font-awesome'
                                        containerStyle={{ paddingHorizontal: 5 }}
                                        onPress={() => {
                                            Alert.alert('Advertencia', '¿Estas seguro de eliminar el elemento seleccionado?', [
                                                {
                                                    text: 'Cancelar',
                                                    onPress: () => console.log('Cancel Pressed'),
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: 'Eliminar', onPress: () => {
                                                        eliminarSerieLoteTransfer(index)
                                                    }
                                                },
                                            ]);
                                        }} /></Text></View>

                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}

                            <DataTable.Pagination
                                page={page}
                                numberOfPages={Math.ceil(tablaSeriesLotesTransfer.length / itemsPerPage)}
                                onPageChange={(page) => setPage(page)}
                                label={`${from + 1}-${to} of ${tablaSeriesLotesTransfer.length}`}
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

            <Modal isVisible={isModalUbicacion} style={{}} animationInTiming={1000}>
                <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 30 }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Ubicacion Origen</Text>
                    <View style={windowsWidth > 500 ? { flexDirection: 'row', margin: 30, rowGap: 20 } : { flexDirection: 'col', rowGap: 20 }}>
                        <View style={windowsWidth > 500 ? { flexDirection: 'column', flex: 6, rowGap: 30 } : { flexDirection: 'column', rowGap: 30 }}>
                            <SelectList
                                setSelected={(val) => { setSelectedUbicacionOri(val) }}
                                data={ubicacionOri}
                                save="key"
                                inputStyles={{ fontSize: 18, color: '#000' }}
                                boxStyles={{ width: '100%' }}
                                onSelect={() => { }}
                                placeholder='Ubicacion origen'
                                searchPlaceholder='buscar...'
                                dropdownTextStyles={{ color: '#808080' }}
                            />
                            <Button
                                title="Consultar"
                                onPress={() => {
                                    if (selectedUbicacionOri == undefined) {
                                        Alert.alert('Advertencia!', '¡Es necesario seleccionar ubicacion origen!', [
                                            { text: 'OK', onPress: () => { } },
                                        ]);
                                    } else {
                                        ComprobarSerieLoteTransfer(gestionItem, itemCode, fromWhsCode, selectedUbicacionOri, serieLoteTransfer, 'sinEscaner')
                                    }
                                }}
                                buttonStyle={{ backgroundColor: '#3B5998' }}
                            />
                            <Button
                                title="Cancelar"
                                onPress={() => {
                                    setIsModalUbicacion(!isModalUbicacion);
                                    setSelectedUbicacionOri(null)
                                }}
                                buttonStyle={{ backgroundColor: '#DC3545' }}
                            />
                        </View>


                    </View>
                </View>
            </Modal>

            {/* VENTANA DONDE EL USUARIO SELECCIONA UBICACION DESTINO E INVOCA AL METODO PUT PARA ACTUALIZA LA API */}
            <Modal isVisible={isModalTransferirSerieLote} style={{}} animationInTiming={1000}>
                <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 30 }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Transferencia</Text>
                    <View style={windowsWidth > 500 ? { flexDirection: 'row', margin: 30, columnGap: 30 } : { flexDirection: 'col' }}>
                        <View style={windowsWidth > 500 ? { flexDirection: 'column', flex: 6 } : { flexDirection: 'column' }}>
                            <ScrollView>
                                <Card containerStyle={{ backgroundColor: '#f5f8fa', borderRadius: 20, flexDirection: 'column', height: 'auto' }}>
                                    <Card.Title style={{ fontSize: windowsWidth > 500 ? 30 : 24, color: '#000', fontWeight: 'bold' }}>{gestionItem == 'S' ? 'Informacion serie' : 'Informacion lote'}</Card.Title>
                                    <Card.Divider width={1} color='#808080' />
                                    <View style={{ flexDirection: 'column', width: '100%', gap: 15 }}>
                                        <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 14 }}>
                                            <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 14 }}>{gestionItem == 'S' ? 'N° Serie:' : 'N° Lote:'}     </Text> {dataSerieLoteTransfer.idCode}
                                        </Text>
                                        <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 14 }}>
                                            <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 14 }}>Ubicacion Origen:     </Text> {dataSerieLoteTransfer.binEntry}, {dataSerieLoteTransfer.binCode}
                                        </Text>
                                        {ubicacionDes.length > 0 ?
                                            <SelectList
                                                setSelected={(val) => setSelectedUbicacionDes(val)}
                                                data={ubicacionDes}
                                                save="key"
                                                inputStyles={{ fontSize: 18, color: '#000' }}
                                                boxStyles={{ width: '100%' }}
                                                onSelect={() => { }}
                                                placeholder='Selecciona ubicacion destino'
                                                searchPlaceholder='buscar...'
                                                dropdownTextStyles={{ color: '#808080' }}
                                            /> :
                                            <Text style={{ ...styles.textTitleCard, backgroundColor: '#FF0000', fontSize: windowsWidth > 500 ? 26 : 14 }}>No hay ubicacion de destino para este almacen</Text>
                                        }
                                        {gestionItem == 'L' ?
                                            <View style={{ flexDirection: 'row', marginTop: 10, width: '100%', justifyContent: 'center' }}>
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
                                                        const nuevaCadena = text.replace(/[^0-9]/g, '');
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
                                            </View> : ''
                                        }
                                    </View>
                                </Card>
                            </ScrollView>
                            <Button
                                title="Realizar transferencia"
                                onPress={() => {
                                    Alert.alert('Advertencia', '¿Estas seguro de continuar con la asignación?', [,
                                        {
                                            text: 'Si', onPress: () => {
                                                setIsModalTransferirSerieLote(!isModalTransferirSerieLote);
                                                ActualizarSerieLoteTransfer(cantidad);
                                                setIsLoading(true)
                                                setCantidad('0')
                                            }
                                        },
                                        {
                                            text: 'Cancelar',
                                            onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel',
                                        }
                                    ])
                                }}
                                buttonStyle={{ backgroundColor: '#3B5998', marginTop: 20, width: windowsWidth > 500 ? '70%' : '100%', alignSelf: 'center' }}
                            />
                            <Button
                                title="Cancelar"
                                onPress={() => {
                                    setIsModalTransferirSerieLote(!isModalTransferirSerieLote);
                                }}
                                buttonStyle={{ backgroundColor: '#DC3545', marginTop: 20, width: windowsWidth > 500 ? '70%' : '100%', alignSelf: 'center' }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    titleTable: {
        color: '#ffff',
        fontWeight: 'bold',
        fontFamily: 'roboto'
    },
    textTitleCard: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#f5f8fa'
    },
    textCardValue: {
        color: '#008F39',
        fontSize: 14,
        marginVertical: 10,
        fontFamily: 'Georgia',
        textDecorationColor: '#3b5998',
    }, cellContent: {
        flex: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: 5,
        fontSize: 22,
        color: '#000',
        minHeight: 60
    },
    cellTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold'
    },
    numericTitle: {
        maxWidth: 120,
    },
    numericCell: {
        maxWidth: 120,
        justifyContent: 'flex-start',
    }
});