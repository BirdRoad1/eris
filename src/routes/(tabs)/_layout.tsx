import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import TabBarBackground from '@/src/components/ui/TabBarBackground';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
//          <Stack.Screen name="songs" />

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute'
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name="songs"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="music-note" color={color} />
          )
        }}
      />
       <Tabs.Screen
        name="artists"
        options={{
          title: 'Artists',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="album" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="playlist-add-check" color={color} />
          )
        }}
      />
    </Tabs>
  );
}
