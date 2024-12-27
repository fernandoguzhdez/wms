import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import { DataTable } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import { Button } from 'react-native-elements'
import { Icon } from 'react-native-elements'
import Modal from "react-native-modal";
import { SelectList } from 'react-native-dropdown-select-list'
import { Input, Card } from '@rneui/themed';

export function TransferenciaStock({ navigation }) {

    const { url, tokenInfo, setIsLoading, isLoading, getAlmacenes, almacenes, obtenerUbicacionAlmacen, ubicacionItem,
        ubicacionItem2, setSelectedAlmacen, setSelectedAlmacen2, setSelectedUbicacion2, setSelectedUbicacion,
        selectedAlmacen, selectedAlmacen2, selectedUbicacion, selectedUbicacion2, setModuloScan, setContadorClic, contadorClic, setSearchBarcode, searchBarcode } = useContext(AuthContext);
    const [tablaTransfer, setTablaTransfer] = useState([]);
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([10, 20, 30, 40, 50]);
    const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, tablaTransfer.length);
    const [isModalVisible, setModalVisible] = useState(false);
    const [bins, setBins] = useState(null);
    const [bins2, setBins2] = useState(null);
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const [number, onChangeNumber] = React.useState(null);
    const [selectedSocio, setSelectedSocio] = useState([]);
    const [sociosDeNegocio, setSociosDeNegocio] = useState();
    const [cantidad, setCantidad] = useState('0');

    const validarUbicacion = (ubicacionProveniente) => {
        almacenes.map((item) => {
            if (ubicacionProveniente == 'origen') {
                if (item.key == selectedAlmacen) {
                    if (item.ubicacion == null) {
                        setBins(null);
                    } else {
                        setBins(item.ubicacion)
                        obtenerUbicacionAlmacen(item.ubicacion);
                    }
                }
            } else {
                if (item.key == selectedAlmacen2) {
                    if (item.ubicacion == null) {
                        setBins2(null);
                    } else {
                        setBins2(item.ubicacion)
                        obtenerUbicacionAlmacen(item.ubicacion);
                    }
                }
            }

        })
    }

    const getSociosDeNegocio = async () => {
        // Set headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        // Make GET request
        await axios.get(`${url}/api/MasterDetails/Get_BusinessPartners`, { headers })
            .then(response => {
                let arraySociosDeNegocio = response.data.OCRD.map((item) => {
                    return { key: item.CardCode, value: item.CardName }
                })
                //Set Data Variable
                setSociosDeNegocio(arraySociosDeNegocio);
            })
            .catch(error => {
                console.error('No hay almacenes aqui', error);
            });
    }

    useEffect(() => {
        getAlmacenes();
        getSociosDeNegocio();
        setIsLoading(true)
        // Set headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenInfo.token}`
        };
        // Make GET request
        axios.get(`${url}/api/TransferStock/Get_DocumentsTransfer`, { headers })
            .then(response => {
                setIsLoading(false)
                setTablaTransfer(response.data.owtr)
                console.log(response.data)
            })
            .catch(error => {
                setIsLoading(false)
                console.error('No hay transferencias', error);
            });
    }, []);

    return (
        <View style={styles.container}>
            <Spinner visible={isLoading} size={60} color='#ffff' />
            <ScrollView>
                <Button
                    buttonStyle={{ backgroundColor: '#3b5998', marginBottom: 10, width: 150 }}
                    onPress={toggleModal}
                    icon={
                        <Icon
                            name="add"
                            type='material-icons'
                            size={30}
                            color="white"
                        />
                    }
                    title="Crear nueva"
                />
                <DataTable>
                    <DataTable.Header style={{ backgroundColor: '#000' }}>
                        <DataTable.Title textStyle={styles.titleTable}>docEntry</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>docNum</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>Fecha Creacion</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>Series</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>seriesTxt</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>Referencia</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>yearEndDt</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>Estado</DataTable.Title>
                        <DataTable.Title textStyle={styles.titleTable}>Items</DataTable.Title>
                    </DataTable.Header>
                    {tablaTransfer.slice(from, to).map((item) => (
                        <DataTable.Row key={item.docNum}>
                            <DataTable.Cell>{item.docEntry}</DataTable.Cell>
                            <DataTable.Cell>{item.docNum}</DataTable.Cell>
                            <DataTable.Cell>{item.createDate}</DataTable.Cell>
                            <DataTable.Cell>{item.series}</DataTable.Cell>
                            <DataTable.Cell>{item.seriesTxt}</DataTable.Cell>
                            <DataTable.Cell>{item.referencia}</DataTable.Cell>
                            <DataTable.Cell>{item.yearEndDt}</DataTable.Cell>
                            <DataTable.Cell>{item.statusTexto}</DataTable.Cell>
                            <DataTable.Cell>{item.items}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                    <DataTable.Pagination
                        page={page}
                        numberOfPages={Math.ceil(tablaTransfer.length / itemsPerPage)}
                        onPageChange={(page) => setPage(page)}
                        label={`${from + 1}-${to} of ${tablaTransfer.length}`}
                        numberOfItemsPerPageList={numberOfItemsPerPageList}
                        numberOfItemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        showFastPaginationControls
                        selectPageDropdownLabel={'Filas por pagina'}
                    />
                </DataTable>
            </ScrollView>
            <Modal isVisible={isModalVisible}>
                <View style={{ flex: 1, backgroundColor: '#ffff', padding: 30 }}>
                    <ScrollView>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Nueva Transferencia</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 50 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'calibri', fontWeight: 'bold', paddingHorizontal: 30 }}>Origen</Text>
                            <Text>
                                <Icon
                                    name='arrow-right'
                                    size={25}
                                    type='font-awesome'
                                    iconStyle={{}} />
                            </Text>
                            <Text style={{ fontSize: 18, fontFamily: 'calibri', fontWeight: 'bold', paddingHorizontal: 30 }}>Destino</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 6, padding: 20 }}>
                                <SelectList
                                    setSelected={(val) => setSelectedAlmacen(val)}
                                    data={almacenes}
                                    save="key"
                                    boxStyles={{ width: '100%' }}
                                    inputStyles={{ fontSize: 18, color: '#000' }}
                                    onSelect={() => { validarUbicacion('origen') }}
                                    placeholder='Selecciona el almacen'
                                    searchPlaceholder='buscar...'
                                    dropdownTextStyles={{ color: '#808080' }}
                                />
                                {
                                    bins == null ?
                                        ''
                                        :
                                        <SelectList
                                            setSelected={(val) => setSelectedUbicacion(val)}
                                            data={ubicacionItem}
                                            save="key"
                                            inputStyles={{ fontSize: 18, color: '#000' }}
                                            boxStyles={{ width: '100%', marginTop: 20 }}
                                            onSelect={() => console.log(selectedAlmacen, selectedUbicacion)}
                                            placeholder='Selecciona la ubicacion'
                                            searchPlaceholder='buscar...'
                                            dropdownTextStyles={{ color: '#808080' }}
                                        />
                                }
                            </View>

                            <View style={{ flex: 6, padding: 20 }}>
                                <SelectList
                                    setSelected={(val) => setSelectedAlmacen2(val)}
                                    data={almacenes}
                                    save="key"
                                    boxStyles={{ width: '100%' }}
                                    inputStyles={{ fontSize: 18, color: '#000' }}
                                    onSelect={() => { validarUbicacion('destino') }}
                                    placeholder='Selecciona el almacen'
                                    searchPlaceholder='buscar...'
                                    dropdownTextStyles={{ color: '#808080' }}
                                />
                                {
                                    bins2 == null ?
                                        ''
                                        :
                                        <SelectList
                                            setSelected={(val) => setSelectedUbicacion2(val)}
                                            data={ubicacionItem2}
                                            save="key"
                                            inputStyles={{ fontSize: 18, color: '#000' }}
                                            boxStyles={{ width: '100%', marginTop: 20 }}
                                            onSelect={() => console.log(selectedAlmacen2, selectedUbicacion2)}
                                            placeholder='Selecciona la ubicacion'
                                            searchPlaceholder='buscar...'
                                            dropdownTextStyles={{ color: '#808080' }}
                                        />
                                }
                            </View>
                        </View>
                        <View style={{ flexDirection: 'col', paddingHorizontal: 20 }}>
                            <SelectList
                                setSelected={(val) => setSelectedSocio(val)}
                                data={sociosDeNegocio}
                                save="key"
                                inputStyles={{ fontSize: 18, color: '#000' }}
                                boxStyles={{ marginVertical: 20 }}
                                onSelect={() => console.log(selectedSocio)}
                                placeholder='Selecciona el socio de negocio'
                                searchPlaceholder='buscar...'
                                dropdownTextStyles={{ color: '#808080' }}
                            />
                            <Input
                                leftIcon={
                                    <Icon
                                        name='barcode'
                                        size={30}
                                        type='font-awesome'
                                        onPress={() => { navigation.navigate('Scanner', props); setModuloScan(4) }} />}
                                rightIcon={
                                    <Icon
                                        name='search'
                                        size={25}
                                        type='font-awesome'
                                        iconStyle={{}}
                                        disabled={contadorClic}
                                        onPress={() => {
                                            setContadorClic(true)
                                            filtrarArticulo(props, searchBarcode);
                                            setIsLoading(true)
                                        }} />}
                                placeholder='Escanea o ingresa el Codigo'
                                value={searchBarcode}
                                onChangeText={text => setSearchBarcode(text)}
                                style={{ margin: 5, fontSize: 18, color: '#000' }}
                            />
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <Input
                                        value={cantidad.toString()}
                                        onChangeText={text => {
                                            const nuevaCadena = text.replace(/[^0-9]/g, '');
                                            setCantidad(nuevaCadena)
                                        }}
                                        style={{ fontWeight: 'bold', fontSize: 25 }}
                                        keyboardType='numeric'
                                    />
                                </View>
                                <View>
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
                                    <Icon
                                        raised
                                        name='remove'
                                        size={18}
                                        type='material-icons'
                                        onPress={() => {
                                            if (cantidad <= 0) {
                                                setCantidad('0')
                                            } else {
                                                setCantidad(parseInt(cantidad) - 1)
                                            }
                                        }} />
                                </View>
                            </View>
                            <TextInput
                                multiline
                                numberOfLines={5}
                                style={styles.input}
                                onChangeText={onChangeNumber}
                                value={number}
                                placeholder="Agregar comentarios..."
                            />
                        </View>

                        <Button title="Guardar Cambios" onPress={toggleModal} />
                    </ScrollView>
                </View>

            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5
    }, titleTable: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'roboto',
    }, input: {
        borderWidth: 1,
        fontSize: 20,
        marginVertical: 40
    }
});