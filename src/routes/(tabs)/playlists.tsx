import { Stack, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid } from 'react-native';

import { useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../../api/api';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import ThemedButton from '@/src/components/ThemedButton';
import ArtistComponent from '@/src/components/ArtistComponent';
import { useServer } from '@/src/provider/server-provider';
import { useIsFocused } from '@react-navigation/native';
import { Playlist } from '@/src/api/playlist';
import PlaylistComponent from '@/src/components/PlaylistComponent';
//TODO: this screen
export default function PlaylistsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const alert = useAlert();
  const isFocused = useIsFocused();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    api
      ?.getPlaylists()
      .then(res => {
        setPlaylists(res);
      })
      .catch(err => {
        if (err instanceof APIUnauthorizedError) {
          serverCtx?.logout();
          router.replace('/');
          ToastAndroid.show('Logged out', ToastAndroid.SHORT);
        } else {
          alert.show('Error', 'Failed to get playlists: ' + err);
        }
      });
  }, [api, router, serverCtx, isFocused, alert]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Playlists',
          headerRight: () => {
            return (
              <ThemedButton
                title="Create"
                style={{ backgroundColor: '#50328dff', marginRight: 15 }}
                rippleColor="#33078bff"
                onPress={() => {
                  router.navigate('/create-playlist');
                }}
              />
            );
          }
        }}
      />
      <ThemedScrollView style={styles.songs}>
        {playlists.map(playlist => (
          <PlaylistComponent
            key={playlist.id}
            playlist={playlist}
            onDelete={() => {
              api
                ?.deletePlaylist(playlist.id)
                .then(() => {
                  setPlaylists(old => old.filter(s => s.id !== playlist.id));
                })
                .catch(err => {
                  alert.show(
                    'Delete',
                    'Failed to delete playlist: ' +
                      (err instanceof Error ? err.message : String(err))
                  );
                });
            }}
          />
        ))}
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
