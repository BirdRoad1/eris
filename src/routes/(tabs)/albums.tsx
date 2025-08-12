import { Stack, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid, View } from 'react-native';

import { useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../../api/api';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import ThemedButton from '@/src/components/ThemedButton';
import { useServer } from '@/src/provider/server-provider';
import { useIsFocused } from '@react-navigation/native';
import { Album } from '@/src/api/album';
import AlbumComponent from '@/src/components/AlbumComponent';

export default function AlbumsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const alert = useAlert();
  const isFocused = useIsFocused();

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    api
      ?.getAlbums()
      .then(res => {
        setAlbums(res);
      })
      .catch(err => {
        if (err instanceof APIUnauthorizedError) {
          serverCtx?.logout();
          router.replace('/');
          ToastAndroid.show('Logged out', ToastAndroid.SHORT);
        } else {
          alert.show('Error', 'Failed to get albums: ' + err);
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
                  router.navigate('/create-album');
                }}
              />
            );
          }
        }}
      />
      <ThemedScrollView style={styles.songs}>
        <View style={{ gap: 10 }}>
          {albums.map(album => (
            <AlbumComponent
              key={album.id}
              album={album}
              onDelete={() => {
                api
                  ?.deleteAlbum(album.id)
                  .then(() => {
                    setAlbums(old => old.filter(a => a.id !== album.id));
                  })
                  .catch(err => {
                    alert.show(
                      'Delete',
                      'Failed to delete album: ' +
                        (err instanceof Error ? err.message : String(err))
                    );
                  });
              }}
            />
          ))}
        </View>
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
