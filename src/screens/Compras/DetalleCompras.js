import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TextInput,
    Modal,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../contex/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { SelectList } from 'react-native-dropdown-select-list';
import { LinearProgress } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { RNCamera } from 'react-native-camera';


export const DetalleCompras = ({ route }) => {
    const { tokenInfo, url } = useContext(AuthContext);
    const { documento } = route.params;
    const navigation = useNavigation();
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [modalVisible, setModalVisible] = useState(false);
    const [articuloNombre, setArticuloNombre] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
    const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
    const [showScanner, setShowScanner] = useState(false);



    useEffect(() => {
        if (enviando) {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
            return () => backHandler.remove(); // limpia cuando deja de enviar
        }
    }, [enviando]);

    useFocusEffect(
        useCallback(() => {
            cargarDetalles(); // <- esta es tu función para refrescar los datos

            // Opcionalmente limpia algo al salir:
            return () => {
                // cleanup si es necesario
            };
        }, [])
    );

    const handleBarCodeRead = ({ data }) => {
        setShowScanner(false);
        setSearchText(data); // esto es lo importante: llena el campo de búsqueda
        setCurrentPage(1);   // opcional: reinicia la paginación
    };


    const handleGuardarArticulo = async () => {
        if (!articuloSeleccionado) {
            Alert.alert('Error', 'No hay artículo seleccionado.');
            return; // 👈 evita continuar
        }

        if (!cantidad.trim() || isNaN(cantidad) || Number(cantidad) <= 0) {
            Alert.alert('Campo requerido', 'Por favor ingresa una cantidad válida.');
            return; // 👈 evita continuar
        }

        if (!ubicacionSeleccionada) {
            Alert.alert('Campo requerido', 'Por favor selecciona una ubicación.');
            return; // 👈 evita continuar
        }

        const ubicacionObj = ubicaciones.find((u) => u.key === ubicacionSeleccionada);
        if (!ubicacionObj) {
            Alert.alert('Error', 'No se pudo encontrar el código de ubicación.');
            return; // 👈 evita continuar
        }

        const body = {
            baseLineNum: articuloSeleccionado.LineNum ?? 0,
            binCode: ubicacionObj.value,
            binEntry: Number(ubicacionSeleccionada),
            docEntry: articuloSeleccionado.DocEntry ?? 0,
            gestionItem: articuloSeleccionado.GestionItem ?? 'I',
            idCode: '',
            itemCode: articuloSeleccionado.ItemCode ?? '',
            quantityCounted: Number(cantidad),
            serManLineNum: 0,
            snbIndex: 0,
            whsCode: articuloSeleccionado.WhsCode ?? '',
        };

        try {
            await axios.put(`${url}/api/Purchase/Update_PurchaseSerLt`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenInfo.token}`,
                },
            });

            Alert.alert('Éxito', 'Artículo agregado correctamente.');
            setModalVisible(false); // ✅ solo se cierra si todo salió bien
            setCantidad('');
            setUbicacionSeleccionada(null);
            setArticuloSeleccionado(null);
            cargarDetalles();
        } catch (error) {
            console.error('Error al guardar artículo:', error);
            Alert.alert('Error', 'No se pudo guardar el artículo. Intenta nuevamente.');
        }
    };

    const abrirFormulario = async (item) => {
        setArticuloSeleccionado(item);
        setArticuloNombre(item.ItemName || '');
        setCantidad('');
        setUbicacionSeleccionada(null);
        setModalVisible(true);
        setCargandoUbicaciones(true);

        try {
            const response = await axios.get(
                `${url}/api/MasterDetails/Get_Bins`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                }
            );

            const opciones = response.data.OBIN.map((bin) => ({
                key: bin.AbsEntry.toString(),
                value: bin.BinCode,
            }));

            setUbicaciones(opciones);
        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
            setUbicaciones([]);
        } finally {
            setCargandoUbicaciones(false);
        }
    };



    const cargarDetalles = async () => {
        try {
            const response = await axios.get(
                `${url}/api/Purchase/Get_Details?IdDocumentCnt=${documento.DocEntry}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                }
            );

            if (response.data && response.data.POR1) {
                setDetalles(response.data.POR1);
            } else {
                console.warn('No se encontraron detalles');
            }
        } catch (error) {
            console.error('Error al cargar detalles:', error);
        } finally {
            setLoading(false);
        }
    };

    const enviarArticulos = () => {
        Alert.alert(
            'Confirmar envío',
            '¿Estás seguro de que deseas enviar este documento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        setEnviando(true);
                        try {
                            await axios.post(
                                `${url}/api/Purchase/Close?IdCounted=${documento.DocEntry}`,
                                {},
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${tokenInfo.token}`,
                                    },
                                }
                            );
                            Alert.alert('Éxito', 'Documento enviado correctamente');
                        } catch (error) {
                            console.error('Error al enviar documento:', error);
                            Alert.alert('Error', 'No se pudo enviar el documento');
                        } finally {
                            setEnviando(false);
                            cargarDetalles()
                        }
                    },
                },
            ]
        );
    };




    // Filtrado
    const detallesFiltrados = detalles.filter((item) => {
        const search = searchText.toLowerCase();
        const itemCode = item.ItemCode?.toLowerCase() || '';
        const itemName = item.ItemName?.toLowerCase() || '';
        return itemCode.includes(search) || itemName.includes(search);
    });


    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const detallesPaginados = detallesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(detallesFiltrados.length / itemsPerPage);

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    onPress={() => {
                        if (item.GestionItem === 'S' || item.GestionItem === 'L') {
                            navigation.navigate('SeriesLotesCompras', { detalle: item });
                        }
                    }}
                >
                    <Text style={styles.itemTitle}>
                        {item.ItemCode} - {item.ItemName}
                    </Text>
                    <Text style={styles.itemDetail}>
                        <Text style={{ fontWeight: 'bold' }}>Código de articulo:</Text> {item.BarCode}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Cantidad pendiente:</Text> {item.Quantity}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Cantidad en almacén:</Text> {item.InWhsQty}
                    </Text>
                    <Text style={styles.itemDetail}>
                        <Text style={{ fontWeight: 'bold' }}>Cantidad contada: </Text> {item.CountQty}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Cantidad total: </Text> {item.TotalQty}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Unidad de medida: </Text> {item.UomCode}
                    </Text>
                    <Text style={styles.itemDetail}>
                        <Text style={{ fontWeight: 'bold' }}>Almacén: </Text>Almacén: {item.WhsCode}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Gestión: </Text> {item.GestionItem === 'I' ? 'Articulo' : item.GestionItem === 'L' ? 'Lote' : 'Serie'}{" || "}
                        <Text style={{ fontWeight: 'bold' }}>Ubicación destino: </Text> {item.ToBinCode || 'N/A'}
                    </Text>
                </TouchableOpacity>
            </View>

            {item.GestionItem === 'I' && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => abrirFormulario(item)}
                >
                    <Icon name="plus-circle" size={35} color="#007bff" />
                </TouchableOpacity>
            )}
        </View>


    );


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Cargando detalles...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>
                    Detalles de la compra #{documento.DocNum}
                </Text>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={enviarArticulos}
                >
                    <Icon name="send" size={18} color="#fff" />
                    <Text style={styles.sendButtonText}> Enviar</Text>
                </TouchableOpacity>
            </View>
            {enviando && (
                <Modal transparent visible animationType="none">
                    <View style={styles.blockingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.blockingText}>Enviando documento...</Text>
                    </View>
                </Modal>
            )}



            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar artículo..."
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        setCurrentPage(1);
                    }}
                />
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => setShowScanner(true)}
                    activeOpacity={0.6}
                >
                    <Icon name="camera" size={22} color="#007bff" />
                </TouchableOpacity>
            </View>

            {showScanner && (
                <View style={styles.scannerContainer}>
                    <RNCamera
                        style={styles.camera}
                        captureAudio={false}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        onBarCodeRead={({ data }) => {
                            setShowScanner(false);
                            setSearchText(data);
                            setCurrentPage(1);
                        }}
                        androidCameraPermissionOptions={{
                            title: 'Permiso para usar la cámara',
                            message: 'La app necesita acceso a tu cámara para escanear',
                            buttonPositive: 'OK',
                            buttonNegative: 'Cancelar',
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => setShowScanner(false)}
                        style={styles.closeScannerButton}
                    >
                        <Text style={{ color: '#fff', fontSize: 18 }}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={detallesPaginados}
                keyExtractor={(item) => `${item.DocEntry}-${item.LineNum}`}
                renderItem={renderItem}
                ListEmptyComponent={<Text>No hay artículos para mostrar</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
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
                        onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <Icon name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconButton, currentPage === totalPages && styles.disabled]}
                        onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
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

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="x" size={24} color="#000" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Agregar artículo</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del artículo"
                            placeholderTextColor="#666"
                            value={articuloNombre}
                            onChangeText={setArticuloNombre}
                            editable={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Cantidad"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={cantidad}
                            onChangeText={setCantidad}
                        />

                        {cargandoUbicaciones ? (
                            <ActivityIndicator color="#007bff" />
                        ) : (
                            <SelectList
                                setSelected={setUbicacionSeleccionada}
                                data={ubicaciones}
                                placeholder="Selecciona una ubicación"
                                searchPlaceholder="Buscar ubicación..."
                                save="key"
                                search={true}
                                boxStyles={styles.selectBox}
                                dropdownStyles={styles.selectDropdown}
                                inputStyles={{ color: '#000' }}
                                dropdownTextStyles={{ color: '#000' }}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => {
                                handleGuardarArticulo()
                            }}
                        >
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 10,
    },

    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 20,
        paddingRight: 10,
        color: '#000',
    },
    scanButton: {
        padding: 6,
        paddingRight: 2, // o 4, para alinear visualmente
    },
    item: {
        position: 'relative',
        padding: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 12,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    paginationText: {
        marginBottom: 6,
    },
    paginationButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        marginHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#aaa',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginRight: 30, // espacio para que no lo pise el ícono
    },
    itemDetail: {
        fontSize: 24,
        color: '#000',
        marginBottom: 2,
    }, modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        color: '#000',
    },
    selectBox: {
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 12,
    },
    selectDropdown: {
        borderColor: '#ccc',
        borderRadius: 8,
        maxHeight: 200
    },
    saveButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 6,
        zIndex: 1,
    },
    addButton: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }, headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 8,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#17a2b8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    progressBar: {
        marginVertical: 10,
        height: 6,
        borderRadius: 4,
    },
    blockingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    blockingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 18,
        fontWeight: 'bold',
    },
    scannerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 10,
    },
    camera: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    closeScannerButton: {
        marginTop: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
    },



});
