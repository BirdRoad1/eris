import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useContext, useEffect, useState } from 'react';
import { useServer } from '../provider/server-provider';
import { router } from 'expo-router';
import { MusicContext } from '../provider/music-provider';
import { useAlert } from '../provider/alert-provider';
import { Artist } from '../api/artist';

type Props = { artist: Artist; onDelete?: () => void }; // TODO: typed song

export default function ArtistComponent({ artist, onDelete }: Props) {
  const server = useServer();
  const music = useContext(MusicContext);
  const api = server.getAPI();

  const [imageData, setImageData] = useState<string>();
  const alert = useAlert();

  useEffect(() => {
    if (!artist.cover_url) return;
    api
      ?.fetchImageBase64(artist.cover_url)
      .then(img => {
        if (img) {
          setImageData(img);
        }
      })
      .catch(err => {
        console.log(
          'Image failed to load: ' + artist.cover_url + ', error: ' + err
        );
      });
  }, [api, artist.cover_url]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {}}
      onLongPress={() => {
        alert.show(
          'Remove Artist',
          'Are you sure you want to remove this artist?',
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
        key={artist.id}
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
            borderRadius: 100
          }}
        />
        <View>
          <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>
            {artist.name}
          </ThemedText>
          <ThemedText style={{ fontSize: 16 }}>
            {artist.song_count} songs
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
