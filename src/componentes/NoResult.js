import React from 'react';
import { Icon } from 'react-native-elements'
import { StyleSheet, View, Text } from 'react-native';

const NoResult = ({ texto }) => {
    return (
        <View>
            <Icon
                name='frown-o'
                size={60}
                iconStyle={{ fontWeight: 'bold', color: '#808080' }}
                type='font-awesome'
                onPress={() => { }} />
            <Text style={styles.noResultsText}>{texto}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    noResults: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultsText: {
        marginTop: 10,
        fontSize: 20
    }
})

export default NoResult;