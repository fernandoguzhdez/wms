import { SelectList } from 'react-native-dropdown-select-list'
import React, { useMemo, useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Input, Card } from '@rneui/themed';
import { Button } from 'react-native-elements'
import { Icon } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../contex/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast, { BaseToast, ErrorToast, tomatoToast } from 'react-native-toast-message';
import axios from 'axios';

export function TomaInventario(props) {

  const { filtrarBarcode, setIsLoading, searchBarcode, getAlmacenes, almacenes, obtenerUbicacionAlmacen, ubicacionItem, articulo, isLoading, setIsLoadingItems,
    setSearchBarcode, setArticulo, url, tokenInfo, filtrarArticulo, selectedAlmacen, setSelectedAlmacen, setSelectedUbicacion, selectedUbicacion, setModuloScan,
    contadorClic, setContadorClic, guardarConteoArticulo, splitCadenaEscaner } = useContext(AuthContext);

  const windowsWidth = useWindowDimensions().width;
  const [code, setCode] = useState('');
  const [cantidad, setCantidad] = useState('0');
  const navigation = useNavigation();
  const [bins, setBins] = useState(null);
  const { docEntry, lineNum, itemCode, barCode, itemDesc, gestionItem, whsCode, totalQty, countQty, counted, binEntry, binCode } = articulo;

  useEffect(() => {
    getAlmacenes();
    setIsLoadingItems(false)
  }, []);

  const validarUbicacion = () => {
    almacenes.map((item) => {
      if (item.key == selectedAlmacen) {
        if (item.ubicacion == null) {
          setBins(null);
        } else {
          setBins(item.ubicacion)
          obtenerUbicacionAlmacen(item.ubicacion);
        }
      }
    })
  }

  const guardarConteo = () => {
    setIsLoadingItems(true)
    const bodyParams = {
      "docEntry": docEntry,
      "Items": [
        {
          "DocEntry": docEntry,
          "LineNum": lineNum,
          "ItemCode": itemCode,
          "BarCode": barCode,
          "ItemDesc": itemDesc,
          "GestionItem": gestionItem,
          "WhsCode": whsCode,
          "totalQty": totalQty,
          "QuantityCounted": cantidad,
          "BinEntry": binEntry,
          "BinCode": binCode,
          "SerialandManbach": []
        }
      ]
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenInfo.token}`
    }
    axios
      .put(`${url}/api/InventoryCount/Update_CountInventory`, bodyParams, { headers })
      .then(response => {
        console.log('Contando...', response.data);
        Toast.show({
          type: 'success',
          // And I can pass any custom props I want
          text1: 'Info',
          text2: 'Conteo agregado exitosamente!!!'
        });
        filtrarArticulo(props, searchBarcode)
        setCantidad('0')
      })
      .catch(error => {
        console.log('Error al actualizar item...', error)
      })
  }

  const toastConfig = {

    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'pink' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: '400'
        }}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17
        }}
        text2Style={{
          fontSize: 15
        }}
      />
    ),

    tomatoToast: ({ text1, props }) => (
      <View style={{ height: 60, width: '100%', backgroundColor: 'tomato' }}>
        <Text>{text1}</Text>
        <Text>{props.uuid}</Text>
      </View>
    )
  }

  const handeSubmit = () => {
    splitCadenaEscaner(searchBarcode, props, 'EnterConteoArticulo')
  }

  return (
    <ScrollView>
      <Spinner visible={isLoading} size={60} color='#ffff' />
      <View style={styles.container}>
        <Toast config={toastConfig} position='bottom' />
        <SelectList
          setSelected={(val) => setSelectedAlmacen(val)}
          data={almacenes}
          save="key"
          boxStyles={{ width: '100%' }}
          inputStyles={{ fontSize: 18, color: '#000' }}
          onSelect={() => { validarUbicacion() }}
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
        <View>
          <Input
            leftIcon={
              <Icon
                name='barcode'
                size={30}
                type='font-awesome'
                onPress={() => { navigation.navigate('Scanner', props); setModuloScan(1) }} />}
            rightIcon={
              <Icon
                name='search'
                size={25}
                type='font-awesome'
                iconStyle={{}}
                disabled={contadorClic}
                onPress={() => {
                  setContadorClic(true)
                  filtrarArticulo(props, searchBarcode, selectedAlmacen, selectedUbicacion);
                }} />}
            placeholder='Escanea o ingresa el Codigo'
            value={searchBarcode}
            onChangeText={text => text == '' ? setSearchBarcode(null) : setSearchBarcode(text.toLocaleUpperCase())}
            onSubmitEditing={handeSubmit}
            style={{ margin: 5, fontSize: 18, color: '#000' }}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Input
              value={cantidad.toString()}
              onChangeText={text => {
                const nuevaCadena = text.replace(/[^0-9.]/g, '');
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
        <View>
          {/* <Input
            placeholder='Comentarios'
            onChangeText={text => { }}
            style={{ fontWeight: 'bold', fontSize: 22 }}
            keyboardType='numeric'
          /> */}
          <Button
            disabled={gestionItem != 'I' ? true : false}
            buttonStyle={{ backgroundColor: '#008000' }}
            onPress={() => guardarConteoArticulo(cantidad, props)}
            icon={
              <Icon
                name="save"
                type='material-icons'
                size={30}
                color="#fff"
                iconStyle={{ paddingHorizontal: 10 }}
              />
            }
            title="Guardar Conteo"
          />
        </View>
        {articulo.length == undefined ?
          <View style={{ marginTop: 40, flexWrap: 'wrap', alignSelf: 'center' }}>
            <Card style={{ ...styles.card, width: windowsWidth > 500 ? 350 : 300 }}>
              <View style={styles.header}>
                <Text style={styles.title}>{itemCode}</Text>
              </View>
              <Card.Divider />
              <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'flex-start', alignSelf: 'center' }}>
                <Text style={styles.content}>
                  <Text style={styles.content}>DocEntry:</Text> {docEntry}
                </Text>
                <Text style={styles.content}>
                  <Text style={styles.content}>LineNum:</Text> {lineNum}
                </Text>
                {/* <Text style={styles.content}>
                  <Text style={styles.content}>Item Code:</Text> {itemCode}
                </Text>
                <Text style={styles.content}>
                  <Text style={styles.content}>BarCode:</Text> {barCode}
                </Text> */}
                <Text style={styles.content}>
                  <Text style={styles.content}>Description:</Text> {itemDesc}
                </Text>
                <Text style={styles.content}>
                  <Text style={styles.content}>Gestion Item:</Text> {gestionItem}
                </Text>
                <Text style={styles.content}>
                  <Text style={styles.content}>Stock:</Text> {whsCode}
                </Text>
                <Text style={styles.content}>
                  <Text style={styles.content}>Ubicacion:</Text> {binEntry}
                </Text>
              </View>
              <View style={{ alignItems: 'center', marginTop: 30 }}>
                <Text style={styles.content}>
                  <Text style={styles.content}>Qty.</Text> {countQty} Pz.
                </Text>
              </View>
            </Card>
          </View> : articulo.length == 2 ?
            Alert.alert('Advertencia', 'No se encontro el articulo', [,
              { text: 'OK', onPress: setArticulo([]) },
            ])
            :
            <View></View>
        }
        <Toast />
      </View>
    </ScrollView>

  )

};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
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
  content: {
    fontSize: 24,
    color: '#9b9b9b',
    margin: 5
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
  title: {
    color: '#fff',
    fontSize: 26
  }
});