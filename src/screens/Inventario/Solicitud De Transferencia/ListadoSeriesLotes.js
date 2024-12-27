import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../../contex/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { View, Text, Alert, FlatList, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import { Input, Card, lightColors } from '@rneui/themed';
import { Button, SearchBar, Icon } from 'react-native-elements'
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'

export const ListadoSeriesLotes = ({ navigation, route }) => {

    const { url, tokenInfo, isLoading, setSerieLoteTransfer, listaSeriesLotes, ComprobarSerieLoteTransfer, barcodeItemTraslados, setBarcodeItemTraslados,
        filterListaSeriesLotes, setFilterListaSeriesLotes, getAlmacenes, almacenes, getItemsTraslados, setItemTraslado, itemTraslado, ActualizarSerieLoteTransfer,
        setDataSerieLoteTransfer, dataSerieLoteTransfer, setTablaSeriesLotesTransfer, isModalSerieLote, setIsModalSerieLote, ubicacionOri, setUbicacionOri, ubicacionDesOri,
        ubicacionDes, setUbicacionDes, selectedUbicacionOri, setSelectedUbicacionOri, selectedUbicacionDes, setSelectedUbicacionDes, setIsEnter, isEnter, cargarTablaSeriesLotesTransfer,
        enviarTransferencia } = useContext(AuthContext);

    const { docEntry, lineNum, itemCode, barCode, itemDesc, pendiente, gestionItem, fromWhsCode, fromBinCode, fromBinEntry, toWhsCode, totalQty, countQty, counted, toBinEntry, binCode } = itemTraslado

    const [cantidad, setCantidad] = useState('1');
    const windowsWidth = useWindowDimensions().width;
    const [selectedAlmacenOri, setSelectedAlmacenOri] = useState();
    const [selectedAlmacenDes, setSelectedAlmacenDes] = useState();
    const [enableButton, setEnableButton] = useState(false);

    const limpiarVariables = () => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setItemTraslado([])
            setFilterListaSeriesLotes([])
            setFilterListaSeriesLotes([])
            setDataSerieLoteTransfer([])
            console.log('Limpiando al salir')
            console.log()
        });
        return unsubscribe;
    }

    useEffect(() => {
    }, [listaSeriesLotes])

    useEffect(() => {
        cargarTablaSeriesLotesTransfer();
        limpiarVariables()
    }, []);

    const searchFilterSeriesLotes = (text) => {
        // Check if searched text is not blank
        if (text) {
            setFilterListaSeriesLotes(
                listaSeriesLotes.filter((item) =>
                    item.idCode.toUpperCase().includes(text.toUpperCase())
                )
            );
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with tablaSolicitudTransfer
            setFilterListaSeriesLotes(listaSeriesLotes);
        }
    };

    const handleSubmit = () => {
        //setIsLoading(true)
        //splitCadenaEscaner(barcodeItemTraslados, route.params.docEntry, 'EnterSolicitudTransferencia')
        //setItemsTraslados(tablaItemsTraslados)
    }

    // Componente de tarjeta reutilizable
    const CardSeriesLotes = ({ item }) => (
        <View style={{ ...styles.card, width: windowsWidth > 500 ? 350 : 300 }}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.idCode}</Text>
            </View>
            <View style={styles.ContainerContent}>
                <Text style={styles.content}>{'Almacen ' + item.whsCode}</Text>
                <Text style={styles.content}>{item.binEntry == 0 ? 'Sin Ubicacion' : item.binEntry + ' || ' + item.binCode}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    {/* <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Contados</Text>
                        <Text style={styles.content}>{item.quantityDisp}</Text>
                    </View> */}
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, color: '#9b9b9b', fontWeight: 'bold' }}>Total</Text>
                        <Text style={styles.content}>{item.quantityTotal}</Text>
                    </View>
                </View>
            </View>
            <View style={{ margin: 20 }}>
                {item.gestionItem == 'S' ?
                    <Button
                        buttonStyle={{ backgroundColor: '#3b5958', width: '80%' }}
                        titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10 }}
                        containerStyle={{ alignItems: 'center' }}
                        onPress={() => {
                            ubicacionDesOri(fromWhsCode, toWhsCode); setDataSerieLoteTransfer(item)
                        }}
                        icon={
                            <Icon
                                name="exchange"
                                type='font-awesome'
                                size={windowsWidth > 500 ? 25 : 18}
                                color="#fff"
                                iconStyle={{ paddingHorizontal: 10 }}
                            />
                        }
                        title="Seleccionar Serie"
                    /> :
                    <Button
                        buttonStyle={{ backgroundColor: '#3b5958', width: '80%' }}
                        titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10, color: '#fff' }}
                        containerStyle={{ alignItems: 'center' }}
                        onPress={() => {
                            ubicacionDesOri(fromWhsCode, toWhsCode); setDataSerieLoteTransfer(item)
                            console.log('Selecciona Lote...', item)
                        }}
                        icon={
                            <Icon
                                name="exchange"
                                type='font-awesome'
                                size={windowsWidth > 500 ? 25 : 18}
                                color="#fff"
                                iconStyle={{ paddingHorizontal: 10 }}
                            />
                        }
                        title="Seleccionar Lote"
                    />
                }
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', height: 'auto', overflow: 'hidden' }}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <SearchBar
                platform="default"
                onChangeText={(text) => { searchFilterSeriesLotes(text); text == '' ? setBarcodeItemTraslados(null) : setBarcodeItemTraslados(text.toLocaleUpperCase()) }}
                onClearText={(text) => searchFilterSeriesLotes(text)}
                placeholder="Buscar aqui..."
                placeholderTextColor="#888"
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                onCancel={() => console.log('cancelando...')}
                value={barcodeItemTraslados}
                onSubmitEditing={handleSubmit}
                inputStyle={{ backgroundColor: '#f4f4f4', borderRadius: 10, color: '#000' }}
                containerStyle={{ backgroundColor: '#f4f4f4', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4' }}
                theme
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button
                    buttonStyle={{ ...styles.ButtonTransferir }}
                    titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10 }}
                    onPress={() => {
                        Alert.alert('Info', '¿Estas seguro de continuar con la transferencia?', [
                            {
                                text: 'Cancelar',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            {
                                text: 'Enviar', onPress: () => {
                                    enviarTransferencia(docEntry);
                                    navigation.navigate('ListadoItemsTransfer')
                                }
                            },
                        ]);
                    }}
                    icon={
                        <Icon
                            name="exchange"
                            type='font-awesome'
                            size={windowsWidth > 500 ? 25 : 18}
                            color="#fff"
                            iconStyle={{ paddingHorizontal: 10 }}
                        />
                    }
                    title="Transferir"
                />
                <Button
                    buttonStyle={{ backgroundColor: '#3b5958', width: 'auto' }}
                    titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10 }}
                    containerStyle={{ alignItems: 'flex-end', marginHorizontal: 40 }}
                    onPress={() => {
                        navigation.navigate('TransferenciaSerieLote')
                        //cargarTablaSeriesLotesTransfer();
                        //setTablaSeriesLotesTransfer([]);
                    }}
                    icon={
                        <Icon
                            name="eye"
                            type='font-awesome'
                            size={windowsWidth > 500 ? 25 : 18}
                            color="#fff"
                            iconStyle={{ paddingHorizontal: 10 }}
                        />
                    }
                    title="Ver Enviados"
                />
            </View>
            <FlatList
                data={filterListaSeriesLotes}
                renderItem={({ item }) =>
                    <CardSeriesLotes item={item} />}
                keyExtractor={(item, index) => index.toString()}
                numColumns={windowsWidth > 500 ? 2 : 1}
                contentContainerStyle={styles.flatListContent}
            />

            <Modal isVisible={isModalSerieLote} style={{}} animationInTiming={1000}>
                <ScrollView style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: windowsWidth > 500 ? 30 : 15, height: '100%' }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Confirmar ubicacion y cantidad</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.content}>
                            {dataSerieLoteTransfer.idCode}
                        </Text>
                    </View>

                    <View style={windowsWidth > 500 ? { flexDirection: 'row', margin: 30, columnGap: 30 } : { flexDirection: 'col' }}>
                        <View style={windowsWidth > 500 ? { flexDirection: 'column', flex: 6 } : { flexDirection: 'column' }}>
                            {ubicacionOri == undefined || ubicacionOri.length == 0 ?
                                <Text style={styles.content}>Sin ubicacion de origen</Text> :
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
                            }
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
                            {ubicacionDes == undefined || ubicacionDes.length == 0 ?
                                <Text style={styles.content}>Sin ubicacion de destino</Text> :
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
                            }
                        </View>
                    </View>
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
                        </View> : ''

                    }

                    <View style={{ width: '50%', rowGap: 20, alignSelf: 'center', marginTop: 30 }}>
                        <Button
                            title="Confirmar y enviar"
                            onPress={() => {
                                Alert.alert('Advertencia', '¿Estas seguro de continuar con la asignación?', [,
                                    {
                                        text: 'Si', onPress: () => {
                                            let suma = Number(cantidad) + countQty;

                                            if (suma <= pendiente) {
                                                console.log('Es menor o igual', pendiente + ' : ' + suma)
                                                ActualizarSerieLoteTransfer(cantidad);
                                                setCantidad('1')
                                            } else {
                                                Alert.alert('Advertencia', '¡La cantidad sobrepasa el total de elementos a asignar!', [
                                                    { text: 'OK', onPress: () => { } },
                                                ]);
                                            }
                                            setIsModalSerieLote(!isModalSerieLote);
                                            //setIsLoading(true)
                                            if (isEnter == true) {
                                                setIsEnter(false)
                                            }
                                        }
                                    },
                                    {
                                        text: 'Cancelar',
                                        onPress: () => setCantidad('1'),
                                        style: 'cancel',
                                    }
                                ])
                            }}
                            disabled={cantidad > 0 ? false : true}
                        />
                        <Button
                            title="Cancelar"
                            onPress={() => {
                                setIsModalSerieLote(!isModalSerieLote);
                                setItemTraslado([]);
                                if (isEnter == true) {
                                    setIsEnter(false)
                                }
                            }}
                            buttonStyle={{ backgroundColor: '#F80000' }}
                            disabled={enableButton}
                        />
                    </View>
                </ScrollView>
            </Modal>
        </View>
    )
}


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
    ButtonTransferir: {
        backgroundColor: '#3b5958',
        width: 'auto'
    }
});