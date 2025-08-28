import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Dimensions, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Button, Dialog, Divider } from '@rneui/themed';
import { RNCamera } from 'react-native-camera';
import { AuthContext } from '../contex/AuthContext';

export const Scanner = ({ navigation, route }) => {

    const [barValue, setBarValue] = useState('')
    const [barType, setBarType] = useState('')
    const [flash, setFlash] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const { setSearchBarcode, setInputScannerTI, filtrarArticulo, setIsLoadingItems, setModuloScan, moduloScan, verificarEscaneoSerie, setTextSerie, guardarConteoLote,
        verificarLote, setIsLoading, FiltrarItemsTraslados, setBarcodeItemTraslados, barcodeItemTraslados, serieLoteTransfer, setSerieLoteTransfer, isModalUbicacion,
        setIsModalUbicacion, ubicacionOrigen, itemTraslado, datosScan, setDatosScan, dataComplete, fetchData, paramsDetalleInvSL, setParamsDetalleInvSL, setSearchDetalleInvSL, handleSearchDetalleInvSL,
        handleSearchDetalleInv, splitCadenaEscaner } = useContext(AuthContext);
    const { docEntry, lineNum, itemCode, barCode, itemDesc, gestionItem, fromWhsCode, fromBinCode, fromBinEntry, toWhsCode, totalQty, countQty, counted, toBinEntry, binCode } = itemTraslado
    let codigoBarras = 0;
    const [animatedValue] = useState(new Animated.Value(0));

    useEffect(() => {
        startAnimation();
    }, []);

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const interpolateTranslation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
    });

    return (
        <View style={styles.container}>
            {/* <Divider style={{ backgroundColor: 'red', height: 2, width: '100%', top: '40%', zIndex: 1 }} /> */}
            <RNCamera
                ref={ref => { this.camera = ref; }}
                captureAudio={false}
                autoFocus={RNCamera.Constants.AutoFocus.on}
                zoom={.1}
                defaultTouchToFocus
                flashMode={flash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                mirrorImage={false}
                // onBarCodeRead={readBarcode}
                onGoogleVisionBarcodesDetected={({ barcodes }) => {
                    codigoBarras = 1;
                    if (barcodes.length > 0) {
                        setTextSerie(barcodes[0].data);

                        const cadenaOriginal = barcodes[0].data;
                        const partes = cadenaOriginal.split("||");
                        const codigoArticulo = partes[0];
                        const idCodeSerieLote = partes[1];
                        const almacen = partes[2];
                        const ubicacion = partes[3];
                        const gestionArticulo = [];

                        setIsLoading(true)
                        switch (moduloScan) {
                            case 1:
                                //setIsLoadingItems(true)
                                setSearchBarcode(barcodes[0].data)
                                filtrarArticulo(route.params, barcodes[0].data)
                                break;
                            case 2:
                                verificarEscaneoSerie(route.params.docEntry, route.params.lineNum, route.params.itemCode, route.params.gestionItem, barcodes[0].data)
                                break;
                            case 3:
                                //guardarConteoLote(1, barcodes[0].data, route.params.docEntry, route.params.lineNum, route.params.itemCode, route.params.gestionItem)
                                verificarLote(barcodes[0].data, 'escaner')
                                break;
                            case 4:
                                /* if (idCodeSerieLote != undefined) {
                                    setSerieLoteTransfer(idCodeSerieLote)
                                    FiltrarItemsTraslados(route.params, codigoArticulo)
                                    //ubicacionOrigen(gestionItem, itemCode, fromWhsCode, toWhsCode)
                                } else {
                                    setBarcodeItemTraslados(barcodes[0].data)
                                    FiltrarItemsTraslados(route.params, barcodes[0].data)
                                } */
                                splitCadenaEscaner(barcodes[0].data.toUpperCase(), route.params, 'EscanerSolicitudTransferencia')
                                setIsLoading(false)
                                break;
                            case 5:
                                setSerieLoteTransfer(idCodeSerieLote)
                                setIsLoading(false)
                                ubicacionOrigen(gestionItem, itemCode, fromWhsCode, toWhsCode)
                                break;
                            case 6:
                                if (partes.length > 1) {
                                    console.log("Escaner if.....")
                                    route.params.map((item) => {
                                        if (item.ItemCode == codigoArticulo) {
                                            gestionArticulo.push(item.GestionItem);
                                        }
                                    })
                                    const gestionA = gestionArticulo[0];
                                    //fetchData(codigoArticulo, almacen, gestionA, 'conEscaner')
                                    //paramsDetalleInvSL.push(codigoArticulo, almacen, gestionA, idCodeSerieLote)
                                    setParamsDetalleInvSL([{
                                        "ItemCode": codigoArticulo,
                                        "WhsCode": almacen,
                                        "GestionItem": gestionA,
                                        "IdCode": idCodeSerieLote,
                                        "conEscaner": true
                                    }])
                                } else {
                                    handleSearchDetalleInv(barcodes[0].data, 'conScan')
                                    console.log("Escaneandoooooo.....")
                                    setIsLoading(false);
                                }

                                break;

                            case 7:
                                handleSearchDetalleInvSL(idCodeSerieLote, 'conScan')
                                setIsLoading(false);
                                break;

                            default:
                                break;
                        }
                        /* if (moduloScan == 1) {
                            if (codigoBarras == 1) {
                                setIsLoadingItems(true)
                                setSearchBarcode(barcodes[0].data)
                                filtrarArticulo(route.params, barcodes[0].data)
                                codigoBarras = 0;
                            }
                        } else {
                            verificarEscaneoSerie(route.params.docEntry, route.params.lineNum, route.params.itemCode, route.params.gestionItem, barcodes[0].data)
                        } */
                        navigation.goBack();
                    }
                }}
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    height: Dimensions.get('window').height,
                    width: Dimensions.get('window').width,
                }}
                type={RNCamera.Constants.Type.back}
                androidCameraPermissionOptions={{
                    title: 'Permiso para utilizar su camara',
                    message: 'Necesitamos su permiso para utilizar su camara',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancelar',
                }}
                androidRecordAudioPermissionOptions={{
                    title: 'Permiso para utilizar la grabacion de audio',
                    message: 'Necesitamos su permiso para utilizar su audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancelar',
                }}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%' }}>
                <Animated.View
                    style={{
                        width: '90%',
                        height: 2,
                        backgroundColor: 'red',
                        transform: [{ translateY: interpolateTranslation }],
                        bottom: '22%'
                    }}
                />
            </View>
            <Button
                title={`Flash ${flash ? 'OFF' : 'ON'}`}
                onPress={() => setFlash(!flash)}
                icon={{ ...styles.iconButtonHome, size: 25, name: 'flash' }}
                iconContainerStyle={styles.iconButtonHomeContainer}
                titleStyle={{ ...styles.titleButtonHome, fontSize: 20 }}
                buttonStyle={{ ...styles.buttonHome, height: 50 }}
                containerStyle={{ ...styles.buttonHomeContainer, marginTop: 20, marginBottom: 10 }}
            />
            {/* <Dialog
                isVisible={showDialog}
                onBackdropPress={() => setShowDialog(!showDialog)}>
                <Dialog.Title titleStyle={{ color: '#000', fontSize: 25 }} title="Scanned Barcode:" />
                <Text style={{ color: '#000', fontSize: 20 }}>
                    {`Data: ${barValue}\nFormat: ${barType}`}
                </Text>
                <Dialog.Actions>
                    <Dialog.Button title="Scan Again" onPress={() => {
                        setShowDialog(false)
                    }} />
                </Dialog.Actions>
            </Dialog> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 30,
    },
    iconButtonHomeContainer: { marginRight: 10 },
    iconButtonHome: {
        type: 'material-community',
        size: 50,
        color: 'white',
    },
    titleButtonHome: {
        fontWeight: '700',
        fontSize: 25
    },
    buttonHome: {
        backgroundColor: '#0C8E4E',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
        height: 100,
    },
    buttonHomeContainer: {
        width: 200,
        marginHorizontal: 50,
        marginVertical: 20,
    },
});