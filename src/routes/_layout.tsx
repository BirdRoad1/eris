import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/useColorScheme';
import { ServerProvider } from '../provider/server-provider';
import { MusicProvider } from '../provider/music-provider';
import { AlertProvider } from '../provider/alert-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf')
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AlertProvider>
      <ServerProvider>
        <MusicProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="music-player"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="create-song"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="create-artist"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="create-album"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="filter-songs"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="create-playlist"
                options={{ presentation: 'modal' }}
              />
               <Stack.Screen
                name="playlist-add-song"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </MusicProvider>
      </ServerProvider>
    </AlertProvider>
  );
}
