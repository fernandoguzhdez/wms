import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../contex/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { BackHandler } from 'react-native';
import { RNCamera } from 'react-native-camera';

export const DocumentosCompras = () => {
    const { tokenInfo, url } = useContext(AuthContext);
    const navigation = useNavigation();
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [enviando, setEnviando] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    const handleBarCodeRead = ({ data }) => {
        setShowScanner(false);
        setBarcode(data);
        filtrarDocumento(data); // llama tu función de búsqueda aquí
    };



    useEffect(() => {
        if (enviando) {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
            return () => backHandler.remove(); // limpia cuando deja de enviar
        }
    }, [enviando]);

    useEffect(() => {
        cargarDocumentos();
    }, []);

    const cargarDocumentos = async () => {
        try {
            const response = await axios.get(
                `${url}/api/Purchase/Get_Documents`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenInfo.token}`,
                    },
                }
            );

            if (response.data && response.data.OPOR) {
                setDocumentos(response.data.OPOR);
            } else {
                console.warn('No se encontraron documentos');
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const enviarDocumento = (item) => {
        Alert.alert(
            'Confirmar envío',
            `¿Estás seguro de que deseas enviar el documento #${item.DocEntry}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        setEnviando(true); // 🚫 Bloquea la pantalla
                        try {
                            await axios.post(
                                `${url}/api/Purchase/Close?IdCounted=${item.DocEntry}`,
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${tokenInfo.token}`,
                                    },
                                }
                            );
                            Alert.alert('Éxito', `Documento #${item.DocEntry} enviado correctamente`);
                            cargarDocumentos(); // 🔄 refresca
                        } catch (error) {
                            console.error('Error al enviar documento:', error);
                            Alert.alert('Error', 'No se pudo enviar el documento');
                        } finally {
                            setEnviando(false); // ✅ Desbloquea la pantalla
                        }
                    },
                },
            ]
        );
    };




    // Filtro por búsqueda
    const documentosFiltrados = documentos.filter((item) => {
        const search = searchText.toLowerCase();
        const cardName = item.CardName.toLowerCase();
        const docNum = item.DocNum.toString();
        const docDate = new Date(item.DocDate).toLocaleDateString('es-MX'); // formato dd/mm/yyyy

        return (
            cardName.includes(search) ||
            docNum.includes(search) ||
            docDate.includes(search)
        );
    });


    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const documentosPaginados = documentosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('DetalleCompras', { documento: item })}
        >
            <Text style={styles.itemTitle}>#{item.DocNum} - {item.CardName}</Text>
            <Text style={styles.itemDetail}>Fecha: {new Date(item.DocDate).toLocaleDateString()}</Text>
            <Text style={styles.itemDetail}>Total: ${item.DocTotal.toFixed(2)}</Text>
            <Text style={styles.itemDetail}>Comentario: {item.Comments}</Text>
        </TouchableOpacity>
    );



    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Cargando documentos...</Text>
            </View>
        );
    }

    const renderHiddenItem = ({ item }) => (
        <View style={styles.hiddenRow}>
            <TouchableOpacity
                style={styles.enviarButton}
                onPress={() => enviarDocumento(item)}
            >
                <Icon name="send" size={20} color="#fff" />
                <Text style={styles.enviarText}>Enviar</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por proveedor..."
                        placeholderTextColor="#666"
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            setCurrentPage(1);
                        }}
                    />
                    <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.cameraIcon}>
                        <Icon name="camera" size={20} color="#007bff" />
                    </TouchableOpacity>
                </View>

            </View>

            <SwipeListView
                data={documentosPaginados}
                keyExtractor={(item) => item.DocEntry.toString()}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-120}
                disableRightSwipe
                ListEmptyComponent={<Text>No hay documentos disponibles</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

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


            <View style={styles.paginationContainer}>
                <Text style={styles.paginationText}>
                    Página {currentPage} de {totalPages}
                </Text>

                <View style={styles.paginationButtons}>
                    {/* Primera página */}
                    <TouchableOpacity
                        style={[styles.iconButton, currentPage === 1 && styles.disabled]}
                        onPress={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <Icon name="chevrons-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* Página anterior */}
                    <TouchableOpacity
                        style={[styles.iconButton, currentPage === 1 && styles.disabled]}
                        onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <Icon name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Página siguiente */}
                    <TouchableOpacity
                        style={[styles.iconButton, currentPage === totalPages && styles.disabled]}
                        onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <Icon name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Última página */}
                    <TouchableOpacity
                        style={[styles.iconButton, currentPage === totalPages && styles.disabled]}
                        onPress={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <Icon name="chevrons-right" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            {enviando && (
                <View style={styles.blockingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.blockingText}>Enviando documento...</Text>
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
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
    item: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
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
    pageButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#007bff',
        borderRadius: 6,
    },
    pageButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#aaa',
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        marginHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 6,
    },
    itemDetail: {
        fontSize: 20,
        color: '#000',
        marginBottom: 2,
    }, hiddenRow: {
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    enviarButton: {
        backgroundColor: '#28a745',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    enviarText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    blockingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 10, // para Android
    },
    blockingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
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

export default DocumentosCompras;
