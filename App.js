import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, ActivityIndicator, View } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import MoonDataScreen from './src/screens/MoonDataScreen';
import MarajeScreen from './src/screens/MarajeScreen';
import MapScreen from './src/screens/MapScreen';
import SettingsScreen from './src/screens/SettingsScreen';

var LP = require('./src/i18n/LanguageContext');
var LanguageProvider = LP.LanguageProvider;
var useLanguage = LP.useLanguage;

var Tab = createBottomTabNavigator();

function MainApp() {
  var LCtx = useLanguage();
  var t = LCtx.t;
  var lang = LCtx.lang;
  var loaded = LCtx.loaded;

  var s1 = useState(true);
  var showSplash = s1[0];
  var setShowSplash = s1[1];

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1120' }}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  if (showSplash) {
    return (
      <SplashScreen onFinish={function () { setShowSplash(false); }} />
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0B1120' },
          headerTintColor: '#C9A84C',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          tabBarStyle: {
            backgroundColor: '#0B1120',
            borderTopColor: '#1a2a4a',
            height: 70,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarActiveTintColor: '#C9A84C',
          tabBarInactiveTintColor: '#4a5a7a',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen}
          options={{
            headerTitle: t('headerHome'),
            tabBarLabel: t('tabHome'),
            tabBarIcon: function () { return <Text style={{ fontSize: 24 }}>🌙</Text>; },
          }}
        />
        <Tab.Screen name="MoonData" component={MoonDataScreen}
          options={{
            headerTitle: t('headerMoonData'),
            tabBarLabel: t('tabMoonData'),
            tabBarIcon: function () { return <Text style={{ fontSize: 24 }}>📊</Text>; },
          }}
        />
        <Tab.Screen name="Map" component={MapScreen}
          options={{
            headerTitle: t('headerMap'),
            tabBarLabel: t('tabMap'),
            tabBarIcon: function () { return <Text style={{ fontSize: 24 }}>🗺️</Text>; },
          }}
        />
        <Tab.Screen name="Maraje" component={MarajeScreen}
          options={{
            headerTitle: t('headerMaraje'),
            tabBarLabel: t('tabMaraje'),
            tabBarIcon: function () { return <Text style={{ fontSize: 24 }}>📖</Text>; },
          }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen}
          options={{
            headerTitle: t('headerSettings'),
            tabBarLabel: t('tabSettings'),
            tabBarIcon: function () { return <Text style={{ fontSize: 24 }}>⚙️</Text>; },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}