import { Stack, useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, ToastAndroid, View } from 'react-native';

import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useContext, useEffect, useState } from 'react';
import { ServerContext } from '../../provider/server-provider';
import API, { APIUnauthorizedError } from '../../api/api';
import SongComponent from '../../components/SongComponent';
import { Song } from '@/src/api/song';

export default function SongsScreen() {
  const serverCtx = useContext(ServerContext);
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    api
      ?.getSongs()
      .then(res => {
        setSongs(res);
      })
      .catch(err => {
        if (err instanceof APIUnauthorizedError) {
          serverCtx?.logout();
          router.replace('/');
          ToastAndroid.show('Logged out', ToastAndroid.SHORT);
        } else {
          Alert.alert('Error', 'Failed to get songs: ' + err);
        }
      });
  }, [api, router, serverCtx]);

  return (
    <>
      <Stack.Screen options={{ title: 'Songs' }} />
      <ThemedView style={styles.songs}>
        {songs.map(song => (
          <SongComponent key={song.id} song={song} />
        ))}
      </ThemedView>
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
