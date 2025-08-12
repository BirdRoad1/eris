import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid, View } from 'react-native';

import { useEffect, useState } from 'react';
import API, { APIUnauthorizedError } from '../api/api';
import SongComponent from '../components/SongComponent';
import { Song } from '@/src/api/song';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import { useIsFocused } from '@react-navigation/native';
import { useServer } from '@/src/provider/server-provider';

// TODO: reuse code from SongsScreen
export default function PlaylistAddSongScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const alert = useAlert();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams();

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
          alert.show('Error', 'Failed to get songs', true);
        }
      });
  }, [api, router, serverCtx, isFocused, alert, params]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Songs'
        }}
      />
      <ThemedScrollView style={styles.songs}>
        <View
          style={{
            gap: 10
          }}
        >
          {songs
            .filter(s => {
              if (
                !('hideIds' in params) ||
                typeof params['hideIds'] !== 'string'
              ) {
                return true;
              }

              const ids = params['hideIds'].split(',').map(i => Number(i));

              return !ids.includes(s.id);
            })
            .map(song => (
              <SongComponent
                key={song.id}
                song={song}
                showPlayerOnClick={false}
                canDelete={false}
                onClick={async () => {
                  // Add it here
                  if (
                    !('playlistId' in params) ||
                    typeof params['playlistId'] !== 'string'
                  )
                    return;

                  console.log(1);
                  const playlistId = Number(params['playlistId']);
                  if (!Number.isFinite(playlistId)) {
                    return;
                  }

                  api
                    ?.addSongToPlaylist(song.id, playlistId)
                    .then(() => {
                      ToastAndroid.show(
                        'Added song to playlist!',
                        ToastAndroid.SHORT
                      );
                    })
                    .catch(err => {
                      alert.show(
                        'Error',
                        'Failed to add song to playlist: ' +
                          (err instanceof Error ? err.message : String(err))
                      );
                    })
                    .finally(() => {
                      if (router.canGoBack()) {
                        router.back();
                      } else {
                        router.replace('/playlists');
                      }
                    });
                }}
              />
            ))}
          {/** TODO: disable song component deletion in this scenario */}
        </View>
      </ThemedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  songs: {
    // flex: 1,
    flexDirection: 'column',
    padding: 20,
    gap: 10
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  }
});
