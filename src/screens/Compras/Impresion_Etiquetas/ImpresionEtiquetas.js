import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  Dimensions
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { AuthContext } from '../../../contex/AuthContext';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Pdf from 'react-native-pdf';
import { useNavigation } from '@react-navigation/native';

export const ImpresionEtiquetas = () => {
  const { tokenInfo, url } = useContext(AuthContext);
  const [selected, setSelected] = useState('');
  const [docEntry, setDocEntry] = useState('');
  const [result, setResult] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // controla si se muestra el card
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigation = useNavigation();


  // Animaciones
  const animation = useState(new Animated.Value(1))[0]; // opacidad
  const arrowRotation = useState(new Animated.Value(1))[0]; // rotación ícono

  const options = [{ key: '22', value: 'Entrada de mercancías' }];

  const handleSearch = async () => {
    if (selected !== '22') return;

    setIsLoading(true); // comienza loading

    try {
      const response = await axios.get(
        `${url}/api/Purchase/Get_PurchaseDeliveryNotes?DocEntryPurchase=${docEntry}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.token}`,
          },
        }
      );

      setResult(response.data.OPDN || []);
      setFilterText('');
      toggleSearch();
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setIsLoading(false); // termina loading
    }
  };

  const handleItemPress = async (docEntry) => {
    setIsPrinting(true);
    try {
      const response = await axios.get(
        `${url}/api/Purchase/Get_PrintDeliveryNotes?DocEntryDelivery=${docEntry}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.token}`,
          },
        }
      );

      const pdfUrl = response.data.url;
      if (!pdfUrl) {
        Alert.alert('Error', 'No se recibió la URL del PDF.');
        setIsPrinting(false);
        return;
      }

      const fileName = pdfUrl.split('/').pop();
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: path,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Navegar directamente al visor PDF
        navigation.navigate('VisorPDF', { path });
      } else {
        throw new Error('Error al descargar PDF');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'No se pudo descargar o abrir el PDF.');
    } finally {
      setIsPrinting(false);
    }
  };


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

  const filteredResults = result?.filter(
    (item) =>
      item.CardName.toLowerCase().includes(filterText.toLowerCase()) ||
      item.DocNum.toString().includes(filterText)
  );

  return (
    <View style={styles.container}>
      {/* Ícono animado para mostrar/ocultar búsqueda */}
      <View style={styles.iconToggle}>
        <TouchableOpacity onPress={toggleSearch}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="chevron-up" size={28} color="#333" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Card de búsqueda con animación suave */}
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

      {/* Filtro sobre los resultados */}
      {result && result.length > 0 && (
        <TextInput
          style={styles.filterInput}
          placeholder="Filtrar por proveedor o folio..."
          value={filterText}
          onChangeText={setFilterText}
        />
      )}

      {/* Lista de resultados */}
      {filteredResults && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.DocEntry.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item.DocEntry)}>
              <View style={styles.card}>
                <Text style={styles.title}>{item.CardName}</Text>
                <Text style={styles.text}>Folio: {item.DocNum}</Text>
                <Text style={styles.text}>Fecha: {new Date(item.DocDate).toLocaleDateString()}</Text>
                <Text style={styles.text}>Comentarios: {item.Comments}</Text>
              </View>
            </TouchableOpacity>
          )}

        />
      )}

      {isPrinting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Imprimiendo...</Text>
        </View>
      )}

      {filteredResults && filteredResults.length === 0 && (
        <Text style={styles.noResultsText}>
          🔍 No se encontraron coincidencias.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputBase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'System', // o la fuente que uses en tu app
  },
  container: {
    padding: 16,
  },
  iconToggle: {
    alignItems: 'center',
    marginBottom: 12,
  },
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
  selectBox: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...this.inputBase, // si usas StyleSheet.create no puedes usar this, aquí mejor lo unimos manualmente
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
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
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
    color: '#000',
  },
  text: {
    fontSize: 20,
    marginBottom: 2,
    color: '#000',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
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
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48, // igual alto que el TextInput
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  selectInputText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectDropdownText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },




});
