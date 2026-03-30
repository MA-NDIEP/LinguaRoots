import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import NavBar from '@/components/navigation/NavBar';

SplashScreen.preventAutoHideAsync();

export default function Layout() {


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          marginBottom:50,
          position: 'absolute',
          elevation: 0,
          borderTopWidth: 0,
        },
      }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="lessons" options={{ title: 'Lessons' }} />
      <Tabs.Screen name="glossary" options={{ title: 'Glossary' }} />
      <Tabs.Screen name="dictionary" options={{ title: 'Glossary' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
