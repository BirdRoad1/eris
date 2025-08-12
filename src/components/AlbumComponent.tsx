import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useEffect, useState } from 'react';
import { useServer } from '../provider/server-provider';
import { useAlert } from '../provider/alert-provider';
import { Album } from '../api/album';
import { router } from 'expo-router';

type Props = { album: Album; onDelete?: () => void }; // TODO: typed song

export default function AlbumComponent({ album, onDelete }: Props) {
  const server = useServer();
  const api = server.getAPI();

  const [imageData, setImageData] = useState<string>();
  const alert = useAlert();

  useEffect(() => {
    if (!album.cover_url) return;
    api
      ?.fetchImageBase64(album.cover_url)
      .then(img => {
        if (img) {
          setImageData(img);
        }
      })
      .catch(err => {
        console.log(
          'Image failed to load: ' + album.cover_url + ', error: ' + err
        );
      });
  }, [api, album.cover_url]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        router.navigate({
          pathname: '/filter-songs',
          params: {
            filterAlbumId: album.id
          }
        });
      }}
      onLongPress={() => {
        alert.show(
          'Remove Album',
          'Are you sure you want to remove this album?',
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
        key={album.id}
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
            {album.name}
          </ThemedText>
          <ThemedText style={{ fontSize: 16 }}>
            {album.artists.join(', ')}
          </ThemedText>
          <ThemedText style={{ fontSize: 16 }}>
            {album.song_count} songs
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
