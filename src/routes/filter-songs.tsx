import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ToastAndroid, View } from 'react-native';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { APIUnauthorizedError } from '../api/api';
import SongComponent from '../components/SongComponent';
import { Song } from '@/src/api/song';
import { ThemedScrollView } from '@/src/components/ThemedScrollView';
import { useAlert } from '@/src/provider/alert-provider';
import { useIsFocused } from '@react-navigation/native';
import { useServer } from '@/src/provider/server-provider';
import { MusicContext } from '@/src/provider/music-provider';
import { Playlist } from '../api/playlist';

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
  const [playlist, setPlaylist] = useState<Playlist>(() =>
    'playlist' in params && typeof params['playlist'] === 'string'
      ? JSON.parse(params['playlist'])
      : undefined
  );
  const filterArtistId: number | undefined = useRef(
    'filterArtistId' in params && typeof params['filterArtistId'] === 'string'
      ? Number(params['filterArtistId'])
      : undefined
  ).current;

  const filterAlbumId: number | undefined = useRef(
    'filterAlbumId' in params && typeof params['filterAlbumId'] === 'string'
      ? Number(params['filterAlbumId'])
      : undefined
  ).current;

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    }
  }, [api, router, serverCtx]);

  useEffect(() => {
    function filterSongs(songs: Song[]) {
      if (filterArtistId !== undefined) {
        songs = songs.filter(s => s.artist_id === filterArtistId);
      }

      if (filterAlbumId !== undefined) {
        songs = songs.filter(s => s.album_id === filterAlbumId);
      }

      if (playlist) {
        return songs.filter(s => playlist.songs.some(p => p.id === s.id));
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
  }, [
    api,
    router,
    serverCtx,
    isFocused,
    alert,
    playlist,
    filterAlbumId,
    filterArtistId
  ]);

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
                if (playlist !== undefined) {
                  // remove from playlist
                  api
                    ?.removeSongFromPlaylist(song.id, playlist.id)
                    .then(() => {
                      setPlaylist({
                        ...playlist,
                        songs: playlist.songs.filter(s => s.id !== song.id)
                      });
                    })
                    .catch(err => {
                      alert.show(
                        'Error',
                        'Failed to remove song from playlist: ' +
                          (err instanceof Error ? err.message : String(err))
                      );
                    });
                  return;
                }

                // delete song
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
                      'Error',
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
