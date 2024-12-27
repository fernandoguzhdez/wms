import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../../contex/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { View, Text, Alert, FlatList, ScrollView, useWindowDimensions, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Input, Card, lightColors } from '@rneui/themed';
import { Button, SearchBar, Icon, Badge } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'

export const SeriesLotesProduccion = ({ navigation, route }) => {

    const { isLoading, setFilterDataSLProd, filterDataSLProd, setDataSLProd, tablaSLProd, valueSLProd, setValueSLProd, FilterSLProd, cargarTablaSLProdEnviado, isModalSLProd, setIsModalSLProd,
        setItemSeleccionadoProd, itemSeleccionadoProd, guardarOrdenProdSL, itemSLProd, setItemSLProd, setIsEnter, isEnter, setIsLoading, splitCadenaEscaner, dataSLProd, setDataSLProdEnviado } = useContext(AuthContext);

    const [cantidad, setCantidad] = useState('1');
    const [cantidadContados, setCantidadContados] = useState(0);
    const windowsWidth = useWindowDimensions().width;
    const [enableButton, setEnableButton] = useState(false)
    const [swipe, setSwipe] = useState(-150);

    const limpiarVariables = () => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setFilterDataSLProd([])
            setDataSLProd([])
            setValueSLProd(null)
            setItemSLProd([])
            setDataSLProdEnviado([])
        });
        return unsubscribe;
    }

    useEffect(() => {
        console.log('Resultado...', filterDataSLProd.length)
        tablaSLProd(route.params)
        cargarTablaSLProdEnviado(route.params)
        limpiarVariables()
        setCantidadContados(route.params.countQty)
    }, [])


    const handleSubmit = () => {
        //setIsLoading(true)
        splitCadenaEscaner(valueSLProd, route.params.docEntry, 'EnterSLProd')
        //setFilterDataSLProd(dataSLProd)
    }

    // Componente de tarjeta reutilizable
    /* const CardSeriesLotes = ({ item }) => (
        <View style={{ ...styles.card, width: windowsWidth > 500 ? 350 : 300 }}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.idCode}</Text>
            </View>
            <View style={styles.ContainerContent}>
                <Text style={styles.content}>{'Almacen ' + item.whsCode}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
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
                            setItemSLProd(item)
                            setIsModalSLProd(!isModalSLProd)
                        }}
                        icon={
                            <Icon
                                name="plus-square"
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
                            setItemSLProd(item)
                            setIsModalSLProd(!isModalSLProd)
                            console.log('Selecciona Lote...', item)
                        }}
                        icon={
                            <Icon
                                name="plus-square"
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
    ); */

    const ItemView = ({ item }) => {
        return (
            // Flat List Item
            <TouchableHighlight disabled={item.status == 'C' ? true : false} style={{ marginVertical: 2 }} key={item.docEntry}
                onPress={() => {
                    setItemSLProd(item)
                    setIsModalSLProd(!isModalSLProd)
                    //setIsLoading(true)
                }} >
                <View style={{ backgroundColor: '#f1f3f4', opacity: item.status == 'C' ? 0.4 : 1, justifyContent: 'flex-start', flexDirection: 'row' }}  >
                    <View style={styles.itemTexto}>
                        <Text style={styles.texto}>
                            {item.idCode}  |
                            Almacen: {item.whsCode}
                            {item.binEntry == 0 ? '' : `  |  Ubicacion:  ` + item.binEntry}
                            {route.params.gestionItem == 'L' ? '  |  Cantidad de lote: ' : '  |  Cantidad de serie: '}
                            {item.quantityDisp}
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
                onChangeText={(text) => { FilterSLProd(text); text == '' ? setValueSLProd(null) : setValueSLProd(text.toLocaleUpperCase()) }}
                onClearText={(text) => FilterSLProd(text)}
                placeholder="Buscar aqui..."
                placeholderTextColor="#888"
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                onCancel={() => console.log('cancelando...')}
                value={valueSLProd}
                onSubmitEditing={handleSubmit}
                inputStyle={{ backgroundColor: '#f4f4f4', borderRadius: 10, color: '#000' }}
                containerStyle={{ backgroundColor: '#f4f4f4', borderRadius: 50, margin: 20, padding: 0, borderColor: '#f4f4f4' }}
                theme
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                {/* <Button
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
                                    //enviarTransferencia(docEntry);
                                    navigation.navigate('ListadoItemsTransfer')
                                }
                            },
                        ]);
                    }}
                    icon={
                        <Icon
                            name="send"
                            type='font-awesome'
                            size={windowsWidth > 500 ? 25 : 18}
                            color="#fff"
                            iconStyle={{ paddingHorizontal: 10 }}
                        />
                    }
                    title="Enviar"
                /> */}
                <Button
                    buttonStyle={{ backgroundColor: '#3b5958', width: 'auto' }}
                    titleStyle={{ fontSize: windowsWidth > 500 ? 20 : 16, padding: 10 }}
                    containerStyle={{ alignItems: 'flex-end', marginHorizontal: 40 }}
                    onPress={() => {
                        navigation.navigate('SeriesLotesProdEnviados', route.params)
                        cargarTablaSLProdEnviado(route.params)
                        setDataSLProdEnviado([])
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
            {/* <FlatList
                data={filterDataSLProd}
                renderItem={({ item }) =>
                    <CardSeriesLotes item={item} />}
                keyExtractor={(item, index) => index.toString()}
                numColumns={windowsWidth > 500 ? 2 : 1}
                contentContainerStyle={styles.flatListContent}
            /> */}
            {filterDataSLProd === null ?
                <View style={{flex: .8, justifyContent: 'center', alignSelf: 'center'}}>
                    <Icon
                        name='exclamation-circle'
                        size={70}
                        iconStyle={{ fontWeight: 'bold', color: '#8888' }}
                        type='font-awesome' />
                    <Text style={{fontSize: 30}}>No se encontraron resultados</Text>
                </View> :
                <SwipeListView
                    data={filterDataSLProd}
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
            }

            <Modal isVisible={isModalSLProd} style={{}} animationInTiming={1000} >
                <ScrollView style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: windowsWidth > 500 ? 30 : 15 }}>
                    <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Confirmar cantidad</Text>
                    <View style={{ alignItems: 'center', marginVertical: 40 }}>
                        <Text style={styles.content}>
                            {itemSLProd.itemCode}
                        </Text>
                        <Text style={styles.content}>
                            {itemSLProd.idCode}
                        </Text>
                    </View>

                    {itemSLProd.gestionItem == 'L' ?
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
                                setIsEnter(false)
                                switch (route.params.gestionItem) {
                                    case 'S':
                                        if (cantidadContados < Number(route.params.totalQty)) {
                                            console.log('Cantidad serie contadas: ' + cantidadContados + 'Total: ' + route.params.totalQty)
                                            guardarOrdenProdSL(itemSLProd, route.params, 1);
                                            setCantidadContados(cantidadContados + 1)
                                            setIsModalSLProd(!isModalSLProd);
                                        } else {
                                            Alert.alert('Advertencia', '¡La cantidad sobrepasa el total de articulos!', [
                                                { text: 'OK', onPress: () => { } },
                                            ]);
                                        }
                                        break;
                                    case 'L':
                                        if (cantidadContados + Number(cantidad) <= Number(route.params.totalQty)) {
                                            console.log('Cantidad lotes contados: ' + cantidadContados + 'Total: ' + route.params.totalQty)
                                            guardarOrdenProdSL(itemSLProd, route.params, cantidad);
                                            setCantidadContados(cantidadContados + Number(cantidad))
                                            setIsModalSLProd(!isModalSLProd);
                                        } else {
                                            Alert.alert('Advertencia', '¡La cantidad sobrepasa el total de articulos!', [
                                                { text: 'OK', onPress: () => { } },
                                            ]);
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }}
                            disabled={cantidad > 0 ? false : true}
                        />
                        <Button
                            title="Salir"
                            onPress={() => {
                                setIsEnter(false)
                                setIsModalSLProd(!isModalSLProd);
                                setItemSLProd([]);
                                setCantidad('1')

                            }}
                            buttonStyle={{ backgroundColor: '#F80000' }}
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
    },
    itemTexto: {
        height: 80,
        width: 'auto',
        paddingHorizontal: 10,
        justifyContent: 'center'
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