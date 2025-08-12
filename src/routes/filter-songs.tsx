import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid, View } from 'react-native';

import { useContext, useEffect, useState } from 'react';
import { APIUnauthorizedError } from '../api/api';
import SongComponent from '../components/SongComponent';
import { Song } from '@/src/api/song';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import { useIsFocused } from '@react-navigation/native';
import { useServer } from '@/src/provider/server-provider';
import { MusicContext } from '@/src/provider/music-provider';

// TODO: reuse code from SongsScreen
export default function FilterSongsScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const alert = useAlert();
  const isFocused = useIsFocused();
  const music = useContext(MusicContext);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    function filterSongs(songs: Song[]) {
      if ('filterArtistId' in params) {
        songs = songs.filter(
          s => s.artist_id === Number(params['filterArtistId'])
        );
      }

      if ('filterAlbumId' in params) {
        songs = songs.filter(
          s => s.album_id === Number(params['filterAlbumId'])
        );
      }

      if (
        'allowedSongs' in params &&
        typeof params['allowedSongs'] === 'string'
      ) {
        const ids = params['allowedSongs'].split(',').map(id => Number(id));
        songs = songs.filter(s => ids.includes(s.id));
      }

      return songs;
    }

    api
      ?.getSongs()
      .then(res => {
        setSongs(filterSongs(res));
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
          title: 'Filter Songs'
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
