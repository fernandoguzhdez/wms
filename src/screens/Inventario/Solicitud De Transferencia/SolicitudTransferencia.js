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

export function SolicitudTransferencia({ navigation }) {

    const { url, tokenInfo, setIsLoading, isLoading, getAlmacenes, setIdCodeSL, setSerieLoteTransfer, enviarTransferencia } = useContext(AuthContext);
    const [tablaSolicitudTransfer, setTablaSolicitudTransfer] = useState([]);
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const [activarBuscadorSolicitudT, setActivarBuscadorSolicitudT] = useState(true);
    const [searchSolicitudT, setSearchSolicitudT] = useState(null);
    const [swipe, setSwipe] = useState(-150);

    useEffect(() => {
        getAlmacenes();
        getDocuments()
    }, []);

    const getDocuments = () => {
        setIsLoading(true)
        // Set headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        // Make GET request
        axios.get(`${url}/api/SolTransferStock/Get_Documents`, { headers })
            .then(response => {
                setIsLoading(false)
                setTablaSolicitudTransfer(response.data.owtr)
                setFilteredDataSource(response.data.owtr)
            })
            .catch(error => {
                setIsLoading(false)
                console.error('No hay solicitudes de transferencia', error);
            });
    }

    const searchFilterFunctionSolicitudT = (text) => {
        // Check if searched text is not blank
        if (text) {
            // Inserted text is not blank
            // Filter the tablaSolicitudTransfer
            // Update FilteredDataSource
            setFilteredDataSource(
                filteredDataSource.filter((item) =>
                    item.referencia.toUpperCase().includes(text.toUpperCase()) || item.docNum.toString().includes(text.toString())
                )
            );
            setSearchSolicitudT(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with tablaSolicitudTransfer
            setFilteredDataSource(tablaSolicitudTransfer);
            setSearchSolicitudT(text);
        }
    };

    const ItemView = ({ item }) => {
        return (
            // Flat List Item
            <TouchableHighlight disabled={item.status == 'C' ? true : false} style={{ marginVertical: 2 }} key={item.docEntry}
                onPress={() => {
                    navigation.navigate('ListadoItemsTransfer', item);
                    setIdCodeSL([]);
                    setSerieLoteTransfer(null);
                    setIsLoading(true)
                }} >
                <View style={{ backgroundColor: '#3b5998', opacity: item.status == 'C' ? 0.4 : 1, justifyContent: 'space-around', flexDirection: 'row' }}  >
                    <View style={styles.itemTexto}>
                        <Text style={{ ...styles.texto, fontSize: 20 }}>
                            N°. {item.docNum}
                        </Text>
                        <Text style={styles.texto}>
                            {item.referencia}
                        </Text>
                    </View>
                    <View style={{ height: 90, width: '35%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
                        <Text style={styles.texto}>
                            {moment(item.createDate).utc().format('DD/MM/YYYY')}
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
                    <View style={{ height: 90, width: '15%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                        <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', left: 20 }} size={50} color='#d3d3d3' />
                        <FontAwesomeIcon icon={faChevronRight} style={{ color: '#fff', right: 10 }} size={50} color='#808080' />
                    </View>
                </View>
            </TouchableHighlight>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <View style={styles.container}>
                {activarBuscadorSolicitudT != false ?
                    <SearchBar
                        searchIcon={{ size: 24 }}
                        onChangeText={(text) => searchFilterFunctionSolicitudT(text)}
                        onClear={(text) => searchFilterFunctionSolicitudT('')}
                        placeholder="Buscar..."
                        value={searchSolicitudT}
                        inputStyle={{ backgroundColor: '#fff', borderRadius: 10, color:'#000' }}
                        containerStyle={{ backgroundColor: '#fff', borderRadius: 50, margin: 20, padding: 0, borderColor: '#fff' }}
                        theme
                    /> :
                    <View></View>
                }

                <SwipeListView
                    data={filteredDataSource}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={ItemView}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            <Button
                                buttonStyle={{ ...styles.rowBackButtonEliminar, display: data.item.status == 'C' ? 'none' : 'flex' }}
                                onPress={() => {
                                    Alert.alert('Info', '¿Estas seguro de continuar con la transferencia?', [
                                        {
                                            text: 'Cancelar',
                                            onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Enviar', onPress: () => {
                                                enviarTransferencia(data.item.docEntry);
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
                                title="Transferir"
                            />
                        </View>
                    )}
                    rightOpenValue={swipe}
                    stopLeftSwipe={-1}
                />

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
        width: '50%',
        paddingHorizontal: 10,
        justifyContent: 'center',

    },
    texto: {
        padding: 10,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
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