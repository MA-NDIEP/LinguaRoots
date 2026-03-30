import 'react-native-reanimated';
import { Slot, SplashScreen } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { ThemeProvider } from '@/theme/global';
import { StatusBar } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CinzelBold: require('../assets/fonts/CinzelDecorative-Bold.ttf'),
    CinzelRegular: require('../assets/fonts/CinzelDecorative-Regular.ttf'),
    CorRegular: require('../assets/fonts/CormorantGaramond-Regular.ttf'),
    CorBold: require('../assets/fonts/CormorantGaramond-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar />
        <Slot />  
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
