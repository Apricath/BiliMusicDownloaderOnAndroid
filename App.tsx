import React, { useCallback, useEffect, useContext, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Appearance } from 'react-native';

import Search from './src/pages/Search';
import Options from './src/pages/Options';
import { downloadHistory_OpenDB, downloadHistory_createTable } from './src/db/downloadHistoryDB';
import DownloadHistory from './src/pages/DownloadHistory';

const Tab = createBottomTabNavigator();

const App = () => {

  const db_Init = useCallback(async () => {
    const db = await downloadHistory_OpenDB();
    if (db === undefined) {
      return;
    }
    await downloadHistory_createTable(db);
  }, []);

  useEffect(() => {
    db_Init();
  }, [db_Init]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Search"
        screenOptions={{
          tabBarActiveTintColor: Appearance.getColorScheme() === 'light' ? '#2196F3' : '#f2f2f2',
          tabBarInactiveTintColor: '#999999',
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Search"
          component={Search}
          options={{
            tabBarStyle: {
              backgroundColor: Appearance.getColorScheme() === 'light' ? 'white' : '#333333'
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="magnify" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="DownloadHistory"
          component={DownloadHistory}
          options={{
            tabBarStyle: {
              backgroundColor: Appearance.getColorScheme() === 'light' ? 'white' : '#333333'
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="history" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Options"
          component={Options}
          options={{
            tabBarStyle: {
              backgroundColor: Appearance.getColorScheme() === 'light' ? 'white' : '#333333'
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
