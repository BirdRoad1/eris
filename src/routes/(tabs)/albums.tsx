import { Stack, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid } from 'react-native';

import { useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../../api/api';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import ThemedButton from '@/src/components/ThemedButton';
import ArtistComponent from '@/src/components/ArtistComponent';
import { Artist } from '@/src/api/artist';
import { useServer } from '@/src/provider/server-provider';
import { useIsFocused } from '@react-navigation/native';
//TODO: this screen
export default function AlbumsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const alert = useAlert();
  const isFocused = useIsFocused();

  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/create-album');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    api
      ?.getArtists()
      .then(res => {
        setArtists(res);
      })
      .catch(err => {
        if (err instanceof APIUnauthorizedError) {
          serverCtx?.logout();
          router.replace('/');
          ToastAndroid.show('Logged out', ToastAndroid.SHORT);
        } else {
          alert.show('Error', 'Failed to get artists: ' + err);
        }
      });
  }, [api, router, serverCtx, isFocused, alert]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Albums',
          headerRight: () => {
            return (
              <ThemedButton
                title="Create"
                style={{ backgroundColor: '#50328dff', marginRight: 15 }}
                rippleColor="#33078bff"
                onPress={() => {
                  router.navigate('/create-artist');
                }}
              />
            );
          }
        }}
      />
      <ThemedScrollView style={styles.songs}>
        {artists.map(artist => (
          <ArtistComponent
            key={artist.id}
            artist={artist}
            onDelete={() => {
              api
                ?.deleteArtist(artist.id)
                .then(() => {
                  setArtists(old => old.filter(s => s.id !== artist.id));
                })
                .catch(err => {
                  alert.show(
                    'Delete',
                    'Failed to delete artist: ' +
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
