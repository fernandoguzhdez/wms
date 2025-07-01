import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
} from 'react-native';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list';
import { AuthContext } from '../../contex/AuthContext';
import Icon from 'react-native-vector-icons/Feather';

export const SeriesLotesCompras = ({ route }) => {
    const { detalle } = route.params;
    const { tokenInfo, url } = useContext(AuthContext);

    const [modalVisible, setModalVisible] = useState(true);
    const [nombreSerieLote, setNombreSerieLote] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
    const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);
    const [listaSeriesLotes, setListaSeriesLotes] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(true);
    const [searchText, setSearchText] = useState('');


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const esSerie = detalle.GestionItem === 'S';
    const esLote = detalle.GestionItem === 'L';

    useEffect(() => {
        cargarSeriesYLotes();
    }, []);

    const cargarSeriesYLotes = async () => {
        try {
            const response = await axios.get(
                `${url}/api/Purchase/Get_SerAndBatchs?IdDocumentCnt=${detalle.DocEntry}&LineNum=${detalle.LineNum}&ItemCode=${detalle.ItemCode}&GestionItem=${detalle.GestionItem}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                }
            );

            if (response.data?.SerialxManbach) {
                setListaSeriesLotes(response.data.SerialxManbach);
            } else {
                setListaSeriesLotes([]);
            }
        } catch (error) {
            console.error('Error al cargar la lista de series/lotes:', error);
            setListaSeriesLotes([]);
        } finally {
            setCargandoLista(false);
        }
    };

    useEffect(() => {
        const obtenerUbicaciones = async () => {
            try {
                const response = await axios.get(`${url}/api/MasterDetails/Get_Bins`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                });

                const opciones = response.data.OBIN.map((bin) => ({
                    key: bin.AbsEntry.toString(),
                    value: bin.BinCode,
                }));

                setUbicaciones(opciones);
            } catch (error) {
                console.error('Error al obtener ubicaciones:', error);
                setUbicaciones([]);
            } finally {
                setCargandoUbicaciones(false);
            }
        };

        obtenerUbicaciones();
    }, []);


    const listaFiltrada = listaSeriesLotes.filter(item =>
        item.idCode.toLowerCase().includes(searchText.toLowerCase())
    );

    const totalPages = Math.ceil(listaFiltrada.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const datosPaginados = listaFiltrada.slice(indexOfFirstItem, indexOfLastItem);


    const eliminarRegistro = async (item) => {
        Alert.alert(
            'Eliminar',
            `¿Seguro que quieres eliminar ${esSerie ? 'la serie' : esLote ? 'el lote' : 'el registro'} ${item.idCode}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const body = {
                                docEntry: detalle.DocEntry,
                                baseLineNum: item.baseLineNum,
                                serManLineNum: item.serManLineNum,
                                snbIndex: item.snbIndex ?? 0,
                                itemCode: item.itemCode,
                                quantityCounted: item.quantityCounted,
                                idCode: item.idCode,
                                binEntry: item.binEntry,
                                binCode: item.binCode,
                                whsCode: item.whsCode,
                                gestionItem: item.gestionItem,
                            };

                            const response = await axios.put(
                                `${url}/api/Purchase/Delete_PurchaseSerLte`,
                                body,
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${tokenInfo.token}`,
                                    },
                                }
                            );

                            if (response.status === 200) {
                                const nuevaLista = listaSeriesLotes.filter(
                                    (x) =>
                                        !(
                                            x.baseLineNum === item.baseLineNum &&
                                            x.idCode === item.idCode &&
                                            x.binCode === item.binCode
                                        )
                                );
                                setListaSeriesLotes(nuevaLista);
                            } else {
                                setCargandoLista(true);
                                await cargarSeriesYLotes();
                            }
                        } catch (error) {
                            console.error('Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar el registro.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.textContainer}>
                <Text style={styles.line}>
                    <Text style={styles.label}>Artículo:</Text> {item.idCode}
                </Text>
                {esLote && (
                    <Text style={styles.line}>
                        <Text style={styles.label}>Cantidad:</Text> {item.quantityCounted}
                    </Text>
                )}
                <Text style={styles.line}>
                    <Text style={styles.label}>Ubicación:</Text> {item.binCode}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarRegistro(item)}
            >
                <Icon name="trash-2" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );






    const handleGuardar = async () => {
        if (!nombreSerieLote.trim()) {
            Alert.alert('Campo requerido', 'Por favor ingresa un nombre de serie o lote.');
            return;
        }

        if (esLote && (!cantidad.trim() || isNaN(cantidad))) {
            Alert.alert('Campo requerido', 'Por favor ingresa una cantidad válida.');
            return;
        }

        if (esLote && Number(cantidad) <= 0) {
            Alert.alert('Cantidad inválida', 'La cantidad debe ser mayor a 0.');
            return;
        }


        if (!ubicacionSeleccionada) {
            Alert.alert('Campo requerido', 'Por favor selecciona una ubicación.');
            return;
        }

        const ubicacionObj = ubicaciones.find((u) => u.key === ubicacionSeleccionada);
        if (!ubicacionObj) {
            Alert.alert('Error', 'No se pudo encontrar el código de ubicación.');
            return;
        }
        const binCode = ubicacionObj.value;

        const nuevaCantidad = esSerie ? 1 : Number(cantidad);

        // Validar que la suma de todas las cantidades + nuevaCantidad no exceda totalQty
        const sumaCantidadExistente = listaSeriesLotes.reduce((acc, curr) => acc + (curr.quantityCounted || 0), 0);
        const sumaTotal = sumaCantidadExistente + nuevaCantidad;

        if (sumaTotal > detalle.TotalQty) {
            Alert.alert(
                'Cantidad excedida',
                `La cantidad total no puede superar ${detalle.TotalQty}`
            );
            return;
        }

        // Validación de serie duplicada (solo si es serie)
        if (esSerie) {
            const existeSerie = listaSeriesLotes.find(x => x.idCode === nombreSerieLote);
            if (existeSerie) {
                Alert.alert('Serie duplicada', 'Esta serie ya fue ingresada previamente.');
                return;
            }
        }

        // Aquí puedes continuar con la lógica normal para serManLineNum, acumulados, etc.

        let serManLineNum = 0;
        let existente = listaSeriesLotes.find((x) =>
            x.idCode === nombreSerieLote &&
            x.whsCode === detalle.WhsCode &&
            x.binCode === binCode &&
            x.binEntry === Number(ubicacionSeleccionada)
        );

        if (existente) {
            serManLineNum = existente.serManLineNum;
        } else if (listaSeriesLotes.length > 0) {
            const max = Math.max(...listaSeriesLotes.map(x => x.serManLineNum));
            serManLineNum = max + 1;
        }

        const body = {
            docEntry: detalle.DocEntry ?? 0,
            baseLineNum: detalle.LineNum ?? 0,
            serManLineNum: serManLineNum,
            snbIndex: 0,
            itemCode: detalle.ItemCode ?? '',
            quantityCounted: nuevaCantidad,
            idCode: nombreSerieLote,
            binEntry: Number(ubicacionSeleccionada),
            binCode: binCode,
            whsCode: detalle.WhsCode ?? '',
            gestionItem: detalle.GestionItem ?? ''
        };

        try {
            await axios.put(
                `${url}/api/Purchase/Update_PurchaseSerLt`,
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                }
            );

            Alert.alert('Éxito', `${esSerie ? 'Serie' : 'Lote'} guardado correctamente.`);
            setModalVisible(false);

            // Limpiar campos
            setNombreSerieLote('');
            setCantidad('');
            setUbicacionSeleccionada(null);

            setCargandoLista(true);
            await cargarSeriesYLotes();
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'No se pudo guardar. Intenta nuevamente.');
        }
    };


    return (
        <View style={styles.container}>
            {/* <Text style={styles.subTitle}>Series/Lotes ingresados</Text> */}
            <TextInput
                style={styles.searchInput}
                placeholder={`Buscar ${esSerie ? 'serie' : esLote ? 'lote' : 'serie o lote'}...`}
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={text => {
                    setSearchText(text);
                    setCurrentPage(1); // resetear paginado al cambiar búsqueda
                }}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>
                    {`+ Agregar ${esSerie ? 'serie' : esLote ? 'lote' : 'serie/lote'}`}
                </Text>

            </TouchableOpacity>


            {cargandoLista ? (
                <ActivityIndicator color="#007bff" />
            ) : listaSeriesLotes.length === 0 ? (
                <Text>No hay registros aún.</Text>
            ) : listaFiltrada.length === 0 ? (
                <Text>No hay resultados que coincidan con la búsqueda.</Text>
            ) : (
                <>
                    <FlatList
                        data={datosPaginados}
                        keyExtractor={(item, index) => `${item.idCode}-${index}`}
                        renderItem={renderItem}
                    />
                    <View style={styles.paginationContainer}>
                        <Text style={styles.paginationText}>
                            Página {currentPage} de {totalPages}
                        </Text>
                        <View style={styles.paginationButtons}>
                            <TouchableOpacity
                                style={[styles.iconButton, currentPage === 1 && styles.disabled]}
                                onPress={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <Icon name="chevrons-left" size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, currentPage === 1 && styles.disabled]}
                                onPress={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <Icon name="chevron-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, currentPage === totalPages && styles.disabled]}
                                onPress={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <Icon name="chevron-right" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, currentPage === totalPages && styles.disabled]}
                                onPress={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <Icon name="chevrons-right" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}


            {/* MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="x" size={24} color="#000" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>
                            Ingresar {esSerie ? 'Serie' : 'Lote'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder={`Nombre del ${esSerie ? 'serie' : 'lote'}`}
                            placeholderTextColor="#666"
                            value={nombreSerieLote}
                            onChangeText={setNombreSerieLote}
                        />

                        {esLote && (
                            <TextInput
                                style={styles.input}
                                placeholder="Cantidad"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={cantidad}
                                onChangeText={setCantidad}
                            />
                        )}

                        {cargandoUbicaciones ? (
                            <ActivityIndicator color="#007bff" />
                        ) : (
                            <SelectList
                                setSelected={setUbicacionSeleccionada}
                                data={ubicaciones}
                                placeholder="Selecciona una ubicación"
                                searchPlaceholder="Buscar ubicación..."
                                search={true} // 🔍 activa búsqueda local
                                save="key"
                                boxStyles={styles.selectBox}
                                dropdownStyles={styles.selectDropdown}
                                inputStyles={{ color: '#000' }}
                                dropdownTextStyles={{ color: '#000' }}
                            />

                        )}

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleGuardar}
                        >
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SeriesLotesCompras;

// Estilos (sin cambios adicionales)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    subTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 20, color: '#000' },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', padding: 10, marginBottom: 8, borderRadius: 8 },
    itemText: { fontSize: 20, color: '#000' },
    deleteButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 6, marginLeft: 10 },
    paginationContainer: { marginTop: 10, alignItems: 'center' },
    paginationText: { marginBottom: 6 },
    paginationButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
    iconButton: { padding: 10, backgroundColor: '#007bff', borderRadius: 8, marginHorizontal: 4 },
    disabled: { backgroundColor: '#aaa' },
    modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#000' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 12, color: '#000' },
    selectBox: { borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
    selectDropdown: { borderColor: '#ccc', borderRadius: 8, maxHeight: 200 },
    saveButton: { backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 6, zIndex: 1 },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 18,
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        color: '#000',
    }, addButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Esto alinea verticalmente
        backgroundColor: '#e0e0e0',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    line: {
        fontSize: 24,
        color: '#000',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    label: {
        fontWeight: 'bold',
        color: '#000',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
