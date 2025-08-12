import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useServer } from '../provider/server-provider';
import { router } from 'expo-router';
import { useAlert } from '../provider/alert-provider';
import { Playlist } from '../api/playlist';
import ThemedButton from './ThemedButton';

type Props = { playlist: Playlist; onDelete?: () => void }; // TODO: typed song

export default function PlaylistComponent({ playlist, onDelete }: Props) {
  // const [imageData, setImageData] = useState<string>();
  const alert = useAlert();

  // useEffect(() => {
  //   if (!artist.cover_url) return;
  //   api
  //     ?.fetchImageBase64(artist.cover_url)
  //     .then(img => {
  //       if (img) {
  //         setImageData(img);
  //       }
  //     })
  //     .catch(err => {
  //       console.log(
  //         'Image failed to load: ' + artist.cover_url + ', error: ' + err
  //       );
  //     });
  // }, [api, artist.cover_url]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        router.navigate({
          pathname: '/filter-songs',
          params: {
            allowedSongs: playlist.songs.map(s => s.id).join(',')
          }
        });
      }}
      onLongPress={() => {
        alert.show(
          'Remove Playlist',
          'Are you sure you want to remove this playlist?',
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
        key={playlist.id}
        style={{
          backgroundColor: '#0d0d0dff',
          borderRadius: 4,
          flexDirection: 'row',
          padding: 10,
          gap: 10
        }}
      >
        <Image
          // source={{
          //   uri: imageData
          // }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 100
          }}
        />
        <View
          style={{
            gap: 10
          }}
        >
          <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>
            {playlist.name}
          </ThemedText>
          <ThemedButton
            title="Add Song"
            style={{
              backgroundColor: '#351e9cff'
            }}
            rippleColor="#210b85ff"
            onPress={() => {
              router.navigate({
                pathname: '/playlist-add-song',
                params: {
                  playlistId: playlist.id,
                  hideIds: playlist.songs.map(s => s.id).join(',')
                }
              });
            }}
          />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
