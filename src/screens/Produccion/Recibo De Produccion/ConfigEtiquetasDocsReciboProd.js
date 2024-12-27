import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, SafeAreaView, Text, StyleSheet, View, TouchableHighlight, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Icon from 'react-native-vector-icons/FontAwesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import moment from "moment";
import { Badge, SearchBar, Button } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view';
import Spinner from 'react-native-loading-spinner-overlay';
import ComponenteCantidad from '../../../componentes/componenteCantidad';
import Modal from "react-native-modal";
import { Overlay } from '@rneui/themed';

export function ConfigEtiquetasDocsReciboProd({ navigation }) {
    const { setIsLoading, isModalSLReciboProd, setIsModalSLReciboProd, visibleFormCantidad, enviarDatosReciboProd, artSelectRecProd } = useContext(AuthContext);
    const [swipe, setSwipe] = useState(-150);

    const filteredDocsReciboProd = [
        {
            "docEntry": 1,
            "docNum": 1,
            "createDate": "2024-04-16T00:00:00",
            "series": 33,
            "seriesTxt": "PRIMARIO",
            "referencia": null,
            "comentarios": "test",
            "fecha_fabricacion": "2024-04-16T00:00:00",
            "status": "A",
            "statusTexto": "Abierto",
            "itemCode": "CG00013",
            "barCode": "CG00013",
            "prodName": "Bolsa De Plastico 06X10 Calibre 150",
            "warehouse": "01",
            "plannedQty": 1.0,
            "countedQty": 0.0,
            "binEntry": 0,
            "binCode": "",
            "gestionItem": "I",
            "items": null
        }
    ]

    const ItemView = ({ item }) => {
        return (
            // Flat List Item
            <TouchableHighlight disabled={item.status == 'C' ? true : false} style={{ marginVertical: 2 }} key={item.docEntry}
                onPress={() => {

                }} >
                <View style={{ backgroundColor: '#3b5998', opacity: item.status == 'C' ? 0.4 : 1, justifyContent: 'space-around', flexDirection: 'row' }}  >
                    <View style={styles.itemTexto}>
                        <Text style={{ ...styles.texto, fontSize: 20 }}>
                            No. {item.docNum}  |  Almacen {item.warehouse}  |  Recibidos {item.countedQty}  |  Cantidad Planificada {item.plannedQty}
                        </Text>
                        <Text style={styles.texto}>
                            {item.itemCode}  |  {item.prodName}
                        </Text>
                    </View>

                    <View style={{ height: 90, width: '20%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
                        {/* <Text style={styles.texto}>
                            {item.gestionItem == 'S' ? 'Serie' : item.gestionItem == 'L' ? 'Lote' : ''}
                        </Text> */}
                        <Text style={styles.texto}>
                            {moment(item.fecha_fabricacion).utc().format('DD/MM/YYYY')}
                        </Text>
                        {
                            item.status == 'O' ?
                                <Badge status="success" value='Abierto' style={styles.badge} />
                                : item.status == 'C' ?
                                    <Badge status="error" value='Cerrado' style={styles.badge} />
                                    :
                                    <Badge status="warning" value='En Proceso' style={styles.badge} />
                        }
                    </View>
                    <View style={{ height: 90, width: '10%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                        <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', left: 20 }} size={50} color='#d3d3d3' />
                        <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', right: 10 }} size={50} color='#808080' />
                    </View>
                </View>
            </TouchableHighlight>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <SearchBar
                    searchIcon={{ size: 24 }}
                    onChangeText={(text) => { }}
                    onClear={(text) => { }}
                    placeholder="Buscar..."
                    inputStyle={{ backgroundColor: '#fff', borderRadius: 10, color: '#000' }}
                    containerStyle={{ backgroundColor: '#fff', borderRadius: 50, margin: 20, padding: 0, borderColor: '#fff' }}
                    theme
                />

                <SwipeListView
                    data={filteredDocsReciboProd}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={ItemView}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            <Button
                                buttonStyle={{ ...styles.rowBackButtonEliminar, display: data.item.status == 'C' ? 'none' : 'flex' }}
                                onPress={() => {
                                    Alert.alert('Info', '¿Estas seguro de continuar?', [
                                        {
                                            text: 'Cancelar',
                                            onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Enviar', onPress: () => {
                                                enviarDatosReciboProd(data.item.docEntry);
                                                setIsLoading(true);
                                            }
                                        },
                                    ]);
                                }}
                                /* icon={
                                    <Icon
                                        reverse
                                        name="trash"
                                        size={20}
                                        color="#fff"
                                    />
                                } */
                                iconTop
                                title="Cerrar"
                            />
                        </View>
                    )}
                    rightOpenValue={swipe}
                    stopLeftSwipe={-1}
                />

                <Modal isVisible={isModalSLReciboProd} style={{ width: 200 }} animationInTiming={1000} >
                    <ScrollView style={{ backgroundColor: '#ffffff', borderRadius: 10, width: 200 }}>
                        <Text style={{ fontSize: 26, textAlign: 'center', margin: 20 }}>Confirmar cantidad</Text>
                        <ComponenteCantidad articulo={artSelectRecProd} />
                        <Button
                            title="Cancelar"
                            onPress={() => {
                                setIsModalSLReciboProd(!isModalSLReciboProd);
                            }}
                            buttonStyle={{ backgroundColor: '#F80000' }}
                        />
                    </ScrollView>
                </Modal>

                

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    itemStyle: {
        padding: 10,
    },
    container: {
        flex: 1,
        marginTop: 10
    },
    itemTexto: {
        height: 90,
        width: '70%',
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    texto: {
        padding: 10,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    badge: {
        color: '#fff',
        fontSize: 24,
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