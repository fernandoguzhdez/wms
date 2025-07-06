import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import { WebView } from 'react-native-webview';

export const ImpresionEtiquetas = () => {
  const { tokenInfo, url } = useContext(AuthContext);
  const [selected, setSelected] = useState('');
  const [docEntry, setDocEntry] = useState('');
  const [result, setResult] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animaciones
  const animation = useState(new Animated.Value(1))[0];
  const arrowRotation = useState(new Animated.Value(1))[0];

  const options = [{ key: '22', value: 'Entrada de mercancías' }];

  const toggleSearch = () => {
    if (showSearch) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    } else {
      setIsVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    Animated.timing(arrowRotation, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setShowSearch(!showSearch);
  };

  const rotate = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleSearch = async () => {
    if (selected !== '22') return;

    setIsLoading(true);

    try {
      const response = await axios.get(
        `${url}/api/Purchase/Get_PurchaseDeliveryNotes?DocEntryPurchase=${docEntry}`,
        {
          headers: { Authorization: `Bearer ${tokenInfo.token}` },
        }
      );

      setResult(response.data.OPDN || []);
      setFilterText('');
      toggleSearch();
    } catch (error) {
      console.error('Error al obtener datos:', error);
      Alert.alert('Error', 'No se pudieron obtener los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (docEntry) => {
    Alert.alert(
      'Impresión',
      '¿Deseas imprimir esta entrada y ver el PDF?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver PDF',
          onPress: async () => {
            setIsPrinting(true);
            try {
              const response = await axios.get(
                `${url}/api/Purchase/Get_PrintDeliveryNotes?DocEntryDelivery=${docEntry}`,
                {
                  headers: { Authorization: `Bearer ${tokenInfo.token}` },
                }
              );

              // Ajusta aquí según cómo venga el PDF en la respuesta:
              const urlPDF = response.data.pdfUrl || response.data.url || null;

              if (urlPDF) {
                setPdfUrl(urlPDF);
                setModalVisible(true);
              } else {
                Alert.alert('Aviso', 'No se encontró URL del PDF.');
              }

              Alert.alert('✅ Impresión', 'La entrada se ha enviado a imprimir.');
            } catch (error) {
              console.error('Error al imprimir:', error);
              Alert.alert('❌ Error', 'No se pudo imprimir la entrada.');
            } finally {
              setIsPrinting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredResults = result?.filter(
    (item) =>
      item.CardName.toLowerCase().includes(filterText.toLowerCase()) ||
      item.DocNum.toString().includes(filterText)
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconToggle}>
        <TouchableOpacity onPress={toggleSearch}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="chevron-up" size={28} color="#333" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isVisible && (
        <Animated.View style={[styles.searchBox, { opacity: animation }]}>
          <SelectList
            setSelected={setSelected}
            data={options}
            placeholder="Selecciona una opción"
            boxStyles={styles.selectBox}
            dropdownStyles={styles.selectDropdown}
            search={true}
            searchPlaceholder="Buscar..."
            notFoundText="No se encontraron resultados"
            inputStyles={styles.selectInputText}
            dropdownTextStyles={styles.selectDropdownText}
          />

          {selected === '22' && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el pedido"
                keyboardType="numeric"
                value={docEntry}
                onChangeText={setDocEntry}
              />
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  disabled={isLoading}
                >
                  <Text style={styles.searchButtonText}>Buscar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      )}

      {result && result.length > 0 && (
        <TextInput
          style={styles.filterInput}
          placeholder="Filtrar por proveedor o folio..."
          value={filterText}
          onChangeText={setFilterText}
        />
      )}

      {filteredResults && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.DocEntry.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item.DocEntry)}>
              <View style={styles.card}>
                <Text style={styles.title}>{item.CardName}</Text>
                <Text style={styles.text}>Folio: {item.DocNum}</Text>
                <Text style={styles.text}>
                  Fecha: {new Date(item.DocDate).toLocaleDateString()}
                </Text>
                <Text style={styles.text}>Comentarios: {item.Comments}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {filteredResults && filteredResults.length === 0 && (
        <Text style={styles.noResultsText}>🔍 No se encontraron coincidencias.</Text>
      )}

      {/* Modal para visualizar PDF */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: '#007bff',
              alignItems: 'center',
            }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar PDF</Text>
          </TouchableOpacity>

          {pdfUrl ? (
            <WebView
              source={{ uri: pdfUrl }}
              style={{ flex: 1 }}
              startInLoadingState={true}
              renderLoading={() => (
                <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
              )}
            />
          ) : (
            <Text style={{ padding: 20 }}>No hay PDF para mostrar</Text>
          )}
        </View>
      </Modal>

      {(isPrinting) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{isLoading ? 'Cargando...' : 'Imprimiendo...'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  iconToggle: { alignItems: 'center', marginBottom: 12 },
  searchBox: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectBox: { borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  selectDropdown: { borderColor: '#ccc', borderRadius: 8, maxHeight: 200 },
  selectInputText: { fontSize: 18, fontWeight: '600', color: '#333' },
  selectDropdownText: { fontSize: 18, fontWeight: '600', color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontWeight: 'bold', fontSize: 22, marginBottom: 4, color: '#000' },
  text: { fontSize: 20, marginBottom: 2, color: '#000' },
  noResultsText: { textAlign: 'center', marginTop: 16, fontSize: 16, color: '#888' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
});
