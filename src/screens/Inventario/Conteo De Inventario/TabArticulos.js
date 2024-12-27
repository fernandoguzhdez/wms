import React, { useContext, useState } from 'react';
import { Tab, Text, TabView } from '@rneui/themed';
import { TomaInventario } from './TomaInventario'
import { Articulos } from './Articulos';
import { SeriesLotes } from './SeriesLotes';
import { AuthContext } from '../../../contex/AuthContext';

export function TabArticulos({ route, navigation }) {

    const { getArticulos, setIconoBuscarArticulos, setActivarBuscadorArticulos, setIndexTab, indexTab } = useContext(AuthContext);



    return (
        <>
            <TabView value={indexTab} onChange={setIndexTab} animationType="spring" disableSwipe={true} >
                <TabView.Item style={{ backgroundColor: '#fff', width: '100%' }}>
                    <TomaInventario props={route.params.docEntry} />
                </TabView.Item>
                <TabView.Item style={{ backgroundColor: '#fff', width: '100%' }}>
                    <SeriesLotes />
                </TabView.Item>
                <TabView.Item style={{ backgroundColor: '#fff', width: '100%' }}>
                    <Articulos />
                </TabView.Item>
            </TabView>

            <Tab
                value={indexTab}
                onChange={(e) => { setIndexTab(e) }}
                indicatorStyle={{
                    backgroundColor: '#fff',
                    height: 3,
                }}
                variant="primary"
            >
                <Tab.Item
                    title="StockTaking"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'inventory', type: 'material-icons', color: '#fff' }}
                    onPressIn={() => { setIconoBuscarArticulos(false); setActivarBuscadorArticulos(false) }}
                />
                <Tab.Item
                    title="Series/Lotes"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'list', type: 'material-icons', color: '#fff' }}
                    onPressIn={() => { }}
                />
                <Tab.Item
                    title="Stock"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'list', type: 'material-icons', color: '#fff' }}
                    onPressIn={() => { getArticulos(route.params.docEntry); setIconoBuscarArticulos(true) }}
                />
            </Tab>
        </>
    );
};