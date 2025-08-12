import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { MusicContext } from '../provider/music-provider';
import { Song } from '../api/song';
import { useAlert } from '../provider/alert-provider';
import { useServer } from '../provider/server-provider';

type Props = { song: Song; onDelete?: () => void }; // TODO: typed song

export default function SongComponent({ song, onDelete }: Props) {
  const music = useContext(MusicContext);
  const api = useServer().getAPI();

  const [imageData, setImageData] = useState<string>();
  const alert = useAlert();

  useEffect(() => {
    if (!song.cover_url) return;
    api
      ?.fetchImageBase64(song.cover_url)
      .then(img => {
        if (img) {
          setImageData(img);
        }
      })
      .catch(err => {
        console.log(
          'Image failed to load: ' + song.cover_url + ', error: ' + err
        );
      });
  }, [api, song.cover_url]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        music?.setCurrentSong?.(song);
        router.navigate('/music-player');
      }}
      onLongPress={() => {
        alert.show(
          'Remove Song',
          'Are you sure you want to remove this song?',
          true,
          sure => {
            if (sure) {
              onDelete?.();
            }
          }
        );
      }}
    >
      <ThemedView
        key={song.id}
        style={{
          backgroundColor: '#0d0d0dff',
          borderRadius: 4,
          flexDirection: 'row',
          padding: 10,
          gap: 10
        }}
      >
        <Image
          source={{
            uri: imageData
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 4
          }}
        />
        <View>
          <ThemedText style={{ fontSize: 15, fontWeight: 'bold' }}>
            {song.title} {song.release_year ? `(${song.release_year})` : ''}
          </ThemedText>
          {song.artist_name !== null && (
            <ThemedText>{song.artist_name}</ThemedText>
          )}
          {song.album_name && (
            <ThemedText style={{ fontSize: 15 }}>{song.album_name}</ThemedText>
          )}
          {song.release_year !== null && (
            <ThemedText>Released {song.release_year}</ThemedText>
          )}
          {song.duration_seconds !== null && (
            <ThemedText>Duration: {song.duration_seconds}s</ThemedText>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
