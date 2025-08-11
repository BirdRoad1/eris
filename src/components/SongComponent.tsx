import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useContext, useEffect, useState } from 'react';
import { ServerContext } from '../provider/server-provider';
import ThemedButton from './ThemedButton';
import { router } from 'expo-router';
import { MusicContext } from '../provider/music-provider';
import { Song } from '../api/song';

type Props = { song: Song }; // TODO: typed song

export default function SongComponent({ song }: Props) {
  const server = useContext(ServerContext);
  const music = useContext(MusicContext);
  const api = server?.getAPI();

  const [imageData, setImageData] = useState<string>();

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
          <ThemedText style={{ fontSize: 15 }}>{song.title}</ThemedText>
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
