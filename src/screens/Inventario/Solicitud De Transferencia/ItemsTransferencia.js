import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../../contex/AuthContext';
import axios from 'axios';
import { View, StyleSheet, Text, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Input, Card, lightColors } from '@rneui/themed';
import { Button } from 'react-native-elements'
import { Icon } from 'react-native-elements'
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'
import Spinner from 'react-native-loading-spinner-overlay';

export const ItemsTransferencia = ({ navigation, route }) => {

    const { url, tokenInfo, setModuloScan, setIsLoading, isLoading, FiltrarItemsTraslados, barcodeItemTraslados, setBarcodeItemTraslados, setItemsTraslados, itemsTraslados, setItemTraslado,
        itemTraslado, getAlmacenes, almacenes, getItemsTraslados, setSerieLoteTransfer, serieLoteTransfer, ubicacionOrigen, splitCadenaEscaner, idCodeSL, setIdCodeSL, ComprobarSerieLoteTransfer } = useContext(AuthContext);
    const { docEntry, lineNum, itemCode, barCode, itemDesc, gestionItem, fromWhsCode, fromBinCode, fromBinEntry, toWhsCode, totalQty, countQty, counted, toBinEntry, binCode } = itemTraslado
    const [cantidad, setCantidad] = useState('1');
    const windowsWidth = useWindowDimensions().width;
    const windowsHeight = useWindowDimensions().height;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalSeriesLotes, setIsModalSeriesLotes] = useState(false);
    const [selectedAlmacenOri, setSelectedAlmacenOri] = useState();
    const [selectedUbicacionOri, setSelectedUbicacionOri] = useState();
    const [selectedAlmacenDes, setSelectedAlmacenDes] = useState();
    const [selectedUbicacionDes, setSelectedUbicacionDes] = useState();
    const [ubicacionOri, setUbicacionOri] = useState();
    const [ubicacionDes, setUbicacionDes] = useState();
    const [enableButton, setEnableButton] = useState(false);


    useEffect(() => {
        getAlmacenes()
        getItemsTraslados(route.params.docEntry)
        setItemTraslado([])
        setIdCodeSL([])
        setBarcodeItemTraslados(null)
    }, []);

    /* useEffect(() => {
        if (serieLoteTransfer != null) {
            navigation.navigate('TransferenciaSerieLote')
        }
    }, [serieLoteTransfer]) */

    const obtenerUbicacionOri = () => {
        almacenes.map((item) => {
            if (item.key == fromWhsCode) {
                if (item.ubicacion == null) {
                    setUbicacionOri([])
                } else {
                    let arrayUbicacion = item.ubicacion.map((item) => {
                        return { key: item.absEntry, value: item.sL1Code }
                    })
                    setUbicacionOri(arrayUbicacion)
                }
            }

        })
    }

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

    const ubicacionDestino = () => {
        setIsModalVisible(!isModalVisible);
        obtenerUbicacionOri();
        obtenerUbicacionDes();
    };

    const transferirItem = () => {
        setIsLoading(true);
        // Set headers
        const headers = {
            Accept: "application/json",
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
                        "fromBinCode": fromBinCode,
                        "toWhsCode": toWhsCode,
                        "toBinEntry": selectedUbicacionDes,
                        "toBinCode": "PENDIENTE",
                        "inWhsQty": 0,
                        "quantityCounted": cantidad,
                        "serialandManbach": []
                    }
                ]
            }, { headers })
            .then((response) => {
                setIsLoading(false);
                Alert.alert('Info', '¡Transferencia realizada con exito!', [
                    { text: 'OK', onPress: () => { getItemsTraslados(docEntry); FiltrarItemsTraslados(docEntry, barcodeItemTraslados); setIsModalVisible(!isModalVisible); } },
                ]);
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.status);
                }
                else if (error.request) {
                    console.log(error.request);
                }
                else {
                    console.log(error.message);
                }
            });

    }

    const cargarSeriesLotes = () => {
        setIsModalSeriesLotes(!isModalSeriesLotes);
    };

    const handleSubmit = () => {
        console.log('enter...')
        //setIsLoading(true)
        splitCadenaEscaner(barcodeItemTraslados, route.params.docEntry, 'EnterSolicitudTransferencia')
    }

    useEffect(() => {
        if (idCodeSL.length > 4) {
            console.log('partes...', idCodeSL)
            navigation.navigate('TransferenciaSerieLote', 'sinEscaner')
            ComprobarSerieLoteTransfer(idCodeSL[4], idCodeSL[0], idCodeSL[2], idCodeSL[3], idCodeSL[1], 'Enter')
        }

    }, [idCodeSL])



    return (
        <View style={{ flex: 1, backgroundColor: '#fff', height: 'auto' }}>
            <ScrollView>
                <Spinner visible={isLoading} size={60} color='#ffff' />
                <View style={{ margin: 10, flexDirection: 'row', alignSelf: 'flex-end' }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#3b5998' }}
                        onPress={() => navigation.navigate('ListadoItemsTransfer')}
                        icon={
                            <Icon
                                name="list"
                                type='material-icons'
                                size={windowsWidth > 500 ? 30 : 16}
                                color="white"
                                iconStyle={{ paddingHorizontal: 10 }}
                            />
                        }
                        title="Ver Articulos"
                    />
                </View>
                <View>
                    <Input
                        leftIcon={
                            <Icon
                                name='barcode'
                                size={windowsWidth > 500 ? 40 : 30}
                                type='font-awesome'
                                containerStyle={{ paddingHorizontal: 10 }}
                                onPress={() => {
                                    setSerieLoteTransfer(null)
                                    navigation.navigate('Scanner', route.params.docEntry);
                                    setModuloScan(4)
                                }} />}
                        rightIcon={
                            <Icon
                                name='search'
                                size={windowsWidth > 500 ? 30 : 20}
                                type='font-awesome'
                                disabled={enableButton}
                                containerStyle={{ paddingHorizontal: 5 }}
                                onPress={() => {
                                    setEnableButton(true)
                                    if (barcodeItemTraslados == null) {
                                        Alert.alert('Info', '¡No puede quedar el campo vacio!', [
                                            { text: 'OK', onPress: () => setEnableButton(false) },
                                        ]);
                                    } else {
                                        setTimeout(() => {
                                            FiltrarItemsTraslados(route.params.docEntry, barcodeItemTraslados)
                                            setEnableButton(false)
                                        }, 1000);
                                    }
                                }} />}
                        placeholder='Escanea o captura el codigo'
                        value={barcodeItemTraslados}
                        onSubmitEditing={handleSubmit}
                        onChangeText={(text) => {
                            text == '' ? setBarcodeItemTraslados(null) : setBarcodeItemTraslados(text.toLocaleUpperCase())
                        }}
                        style={{ margin: 0, fontSize: windowsWidth > 500 ? 26 : 20, color: '#000000', fontWeight: 'bold' }}
                        containerStyle={{ padding: 10 }}
                    />
                    <View style={{ margin: windowsWidth > 500 ? 30 : 0, flexDirection: 'column' }}>
                        <ScrollView>
                            <Card containerStyle={{ backgroundColor: '#f5f8fa', borderRadius: 20, flexDirection: 'column', height: 'auto' }}>
                                <Card.Title style={{ fontSize: windowsWidth > 500 ? 34 : 24, color: '#000', fontWeight: 'bold' }}>{gestionItem == 'I' ? 'Detalle Articulo' : gestionItem == 'S' ? 'Detalle Serie' : gestionItem == 'L' ? 'Detalle Lote' : 'No hay informacion'}</Card.Title>
                                <Card.Divider width={1} color='#808080' />
                                <View style={{ flexDirection: 'column', width: '100%' }}>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 18 }}>
                                        <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>N° Documento:     </Text> {docEntry}
                                    </Text>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 18 }}>
                                        <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Codigo de barras:     </Text> {barCode}
                                    </Text>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 18 }}>
                                        <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Descripcion:     </Text> {itemDesc}
                                    </Text>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 18 }}>
                                        <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Gestion item:     </Text> {gestionItem == 'S' ? 'Serie' : gestionItem == 'L' ? 'Lote' : gestionItem == 'I' ? 'Articulo' : ''}
                                    </Text>
                                    <View style={{ borderWidth: 1, borderColor: 'lightgray', marginVertical: 10 }}>
                                        <View style={{ flexDirection: 'row', width: 'auto', justifyContent: 'center' }}>
                                            <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 24 : 18 }}>
                                                <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Alm. origen:     </Text> {fromWhsCode}
                                            </Text>
                                            <Icon
                                                name="arrow-right"
                                                type='font-awesome'
                                                size={windowsWidth > 500 ? 20 : 10}
                                                color="#000"
                                                iconStyle={{ paddingHorizontal: 10 }}
                                                containerStyle={{ alignSelf: 'center' }}
                                            />
                                            <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 24 : 18 }}>
                                                <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Alm. destino:     </Text> {toWhsCode}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', width: 'auto', justifyContent: 'center' }}>
                                            <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 24 : 18 }}>
                                                <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Ubi. origen:     </Text> {fromBinEntry}
                                            </Text>
                                            <Icon
                                                name="arrow-right"
                                                type='font-awesome'
                                                size={windowsWidth > 500 ? 20 : 10}
                                                color="#000"
                                                iconStyle={{ paddingHorizontal: 10 }}
                                                containerStyle={{ alignSelf: 'center' }}
                                            />
                                            <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 24 : 18 }}>
                                                <Text style={{ ...styles.textTitleCard, fontSize: windowsWidth > 500 ? 26 : 18 }}>Ubi. destino:     </Text> {toBinEntry}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center', marginVertical: 30 }}>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 22 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#3b5998' }}>Cantidad contada:</Text> {countQty} Pz.
                                    </Text>
                                    <Text style={{ ...styles.textCardValue, fontSize: windowsWidth > 500 ? 26 : 22 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#3b5998' }}>Cantidad total:</Text> {totalQty} Pz.
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center', margin: 10 }}>
                                    {gestionItem == 'I' ?
                                        <Button
                                            buttonStyle={{ backgroundColor: '#3b5998' }}
                                            titleStyle={{ fontSize: 20, padding: 20 }}
                                            onPress={ubicacionDestino}
                                            icon={
                                                <Icon
                                                    name="exchange"
                                                    type='font-awesome'
                                                    size={25}
                                                    color="white"
                                                    iconStyle={{ paddingHorizontal: 10 }}
                                                />
                                            }
                                            title="Transferir Item"
                                        /> :
                                        <Button
                                            buttonStyle={{ backgroundColor: '#3b5998' }}
                                            disabled={itemTraslado == 0 ? true : false}
                                            titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10 }}
                                            containerStyle={{}}
                                            onPress={() => navigation.navigate('TransferenciaSerieLote', 'sinEscaner')}
                                            icon={
                                                <Icon
                                                    name="barcode"
                                                    type='font-awesome'
                                                    size={windowsWidth > 500 ? 25 : 18}
                                                    color="white"
                                                    iconStyle={{ paddingHorizontal: 10 }}
                                                />
                                            }
                                            title="Empezar conteo"
                                        />

                                    }
                                </View>
                            </Card>
                        </ScrollView>

                    </View>
                </View>

                <Modal isVisible={isModalVisible} style={{}} animationInTiming={1000}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 30 }}>
                        <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Confirmar ubicacion y cantidad</Text>
                        <View style={windowsWidth > 500 ? { flexDirection: 'row', margin: 30, columnGap: 30 } : { flexDirection: 'col' }}>
                            <View style={windowsWidth > 500 ? { flexDirection: 'column', flex: 6 } : { flexDirection: 'column' }}>
                                <SelectList
                                    setSelected={(val) => setSelectedUbicacionOri(val)}
                                    data={ubicacionOri}
                                    save="key"
                                    inputStyles={{ fontSize: 18, color: '#000' }}
                                    boxStyles={{ width: '100%' }}
                                    onSelect={() => console.log(selectedAlmacenOri, selectedUbicacionOri)}
                                    placeholder='Ubicacion origen'
                                    searchPlaceholder='buscar...'
                                    dropdownTextStyles={{ color: '#808080' }}
                                />
                            </View>
                            <Icon
                                name={windowsWidth > 500 ? "arrow-right" : 'arrow-down'}
                                type='font-awesome'
                                size={windowsWidth > 500 ? 25 : 16}
                                color="#000"
                                iconStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                                containerStyle={{ justifyContent: 'center' }}
                            />
                            <View style={windowsWidth > 500 ? { flexDirection: 'column', flex: 6 } : { flexDirection: 'column' }}>
                                <SelectList
                                    setSelected={(val) => setSelectedUbicacionDes(val)}
                                    data={ubicacionDes}
                                    save="key"
                                    inputStyles={{ fontSize: 18, color: '#000' }}
                                    boxStyles={{ width: '100%' }}
                                    onSelect={() => console.log(selectedAlmacenDes, selectedUbicacionDes)}
                                    placeholder='Ubicacion destino'
                                    searchPlaceholder='buscar...'
                                    dropdownTextStyles={{ color: '#808080' }}
                                />
                            </View>
                        </View>
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
                                    setCantidad(text)
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
                                title="Confirmar y transferir"
                                onPress={() => {
                                    let suma = cantidad + countQty;
                                    setEnableButton(true)
                                    if (suma <= totalQty) {
                                        transferirItem();
                                        setEnableButton(false)
                                    } else {
                                        Alert.alert('Advertencia', '¡La cantidad sobrepasa el total de articulos a transferir!', [
                                            { text: 'OK', onPress: () => setEnableButton(false) },
                                        ]);
                                    }
                                }}
                                disabled={cantidad > 0 ? false : true}
                            />
                            <Button
                                title="Cancelar"
                                onPress={() => setIsModalVisible(!isModalVisible)}
                                buttonStyle={{ backgroundColor: '#F80000' }}
                                disabled={enableButton}
                            />
                        </View>

                    </View>
                </Modal>

                <Modal isVisible={isModalSeriesLotes} style={{ flex: 1 }} animationInTiming={1000}>
                    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10 }}>
                        <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Capturar Series/Lotes</Text>
                        <View style={{ margin: 50 }}>
                            <Input
                                leftIcon={
                                    <Icon
                                        name='barcode'
                                        size={40}
                                        type='font-awesome'
                                        containerStyle={{ paddingHorizontal: 10 }}
                                        onPress={() => { navigation.navigate('Scanner', route.params.docEntry); setModuloScan(4) }} />}
                                rightIcon={
                                    <Icon
                                        name='search'
                                        size={30}
                                        type='font-awesome'
                                        containerStyle={{ paddingHorizontal: 10 }}
                                        onPress={() => { setIsLoading(true); FiltrarItemsTraslados(route.params.docEntry, barcodeItemTraslados) }} />}
                                placeholder='Escanea o ingresa el Codigo'
                                value={barcodeItemTraslados}
                                onChangeText={text => setBarcodeItemTraslados(text.toLocaleUpperCase())}
                                style={{ margin: 10, fontSize: 20, color: '#000', fontWeight: 'bold' }}
                            />
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
                            </View>
                            <Button
                                title="Confirmar"
                                onPress={() => setIsModalSeriesLotes(!isModalSeriesLotes)}
                            />
                        </View>

                    </View>
                </Modal>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    textTitleCard: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#f5f8fa'
    },
    textCardValue: {
        color: '#9b9b9b',
        fontSize: 24,
        marginVertical: 10,
        fontFamily: 'Georgia',
        textDecorationColor: '#3b5998',
    }
});