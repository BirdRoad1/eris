import { Stack, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid } from 'react-native';

import { useContext, useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../../api/api';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import ThemedButton from '@/src/components/ThemedButton';
import ArtistComponent from '@/src/components/ArtistComponent';
import { Artist } from '@/src/api/artist';
import { useServer } from '@/src/provider/server-provider';
import { useIsFocused } from '@react-navigation/native';
import { ThemedText } from '@/src/components/ThemedText';
//TODO: this screen
export default function SettingsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const alert = useAlert();

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ThemedScrollView style={styles.songs}>
        <ThemedButton
          style={{
            backgroundColor: '#3619a8ff',
            height: 45
          }}
		  rippleColor='#1e0580ff'
          title="Log Out"
          onPress={() => {
            serverCtx.logout();
          }}
        />
      </ThemedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  songs: {
    flex: 1,
    padding: 20
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  }
});
