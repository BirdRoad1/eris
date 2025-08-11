import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, ToastAndroid, View } from 'react-native';

import { useContext, useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../../api/api';
import SongComponent from '../../components/SongComponent';
import { Song } from '@/src/api/song';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import ThemedButton from '@/src/components/ThemedButton';
import { useAlert } from '@/src/provider/alert-provider';
import { useIsFocused } from '@react-navigation/native';
import { useServer } from '@/src/provider/server-provider';
import { MusicContext } from '@/src/provider/music-provider';

export default function SongsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const alert = useAlert();
  const isFocused = useIsFocused();
  const music = useContext(MusicContext);

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
  }, [api, router, serverCtx, isFocused, alert]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Songs',
          headerRight: () => {
            return (
              <ThemedButton
                title="Create"
                style={{ backgroundColor: '#50328dff', marginRight: 15 }}
                rippleColor="#33078bff"
                onPress={() => {
                  router.navigate('/create-song');
                }}
              />
            );
          }
        }}
      />
      <ThemedScrollView style={styles.songs}>
        <View
          style={{
            gap: 10
          }}
        >
          {songs.map(song => (
            <SongComponent
              key={song.id}
              song={song}
              onDelete={() => {
                api
                  ?.deleteSong(song.id)
                  .then(() => {
                    setSongs(old => old.filter(s => s.id !== song.id));

                    // If the song is currently playing, stop.
                    if (music?.currentSong?.id === song.id) {
                      music.player.current?.pause();
                      music.player.current?.release();
                      music.player.current = null;
                      music.setCurrentSong?.(undefined);
                      music.setCurrentSongTime?.(0);
                    }
                  })
                  .catch(err => {
                    alert.show(
                      'Delete',
                      'Failed to delete song: ' +
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
