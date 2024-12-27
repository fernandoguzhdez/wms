import { View, Text, ImageBackground, Image, TouchableOpacity } from 'react-native'
import { React, useContext } from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { AuthContext } from '../contex/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { Avatar } from '@rneui/themed';
import { Icon } from 'react-native-elements'

export default function CustomDrawer(props) {

    const { user, logOut } = useContext(AuthContext);



    return (
        <View style={{ flex: 1, marginTop: -4 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: 'white' }} >
                <View style={{ alignItems: 'flex-start', backgroundColor: '#3b5998', width: '100%', flexDirection: 'column', padding: 15 }}>
                    <Avatar
                        size={64}
                        rounded
                        source={{ uri: 'https://randomuser.me/api/portraits/men/36.jpg' }}
                        title="Bj"
                        containerStyle={{ backgroundColor: 'grey' }}
                    >
                        <Avatar.Accessory size={23} onPress={() => { console.log('Click en el avatar....') }} />
                    </Avatar>
                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 800 }}>
                        {user}
                    </Text>
                </View>
                <View style={{ flex: 1, paddingTop: 10 }}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View>
                <TouchableOpacity onPress={async () => { logOut() }}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'red',
                        height: 50,
                        flexDirection: 'row'
                    }}>
                    <Icon
                        raised
                        name='logout'
                        size={18}
                        type='material-icons'
                        onPress={() => console.log('hello')} />
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 20 }}>Cerrar Sesion</Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}