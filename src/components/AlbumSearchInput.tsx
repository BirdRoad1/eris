import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedInput from './ThemedInput';
import { useRef, useState } from 'react';
import { useServer } from '../provider/server-provider';
import { useAlert } from '../provider/alert-provider';
import { Album } from '../api/album';

type Props = {
  onSelectAlbum?: (album: Album) => void;
};

export function AlbumSearchInput({ onSelectAlbum }: Props) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);

  const api = useServer().getAPI();
  const alert = useAlert();
  const searchTimeout = useRef<number>(null);

  async function search(text: string) {
    console.log('Try search!');
    try {
      const albums = await api?.searchAlbums(text);
      setAlbums(albums);
    } catch (err) {
      alert.show('Error', err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <ThemedInput
        placeholder="Search for an album"
        value={text}
        onChangeText={text => {
          if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
          }

          searchTimeout.current = setTimeout(() => {
            search(text);
            searchTimeout.current = null;
          }, 200);

          setText(text);
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        onPress={() => {
          setFocused(true);
        }}
      ></ThemedInput>
      {focused && (
        <View
          style={{
            position: 'absolute',
            marginTop: 65,
            zIndex: 2,
            width: 200
          }}
        >
          {albums.length > 0 ? (
            albums.map(album => (
              <TouchableOpacity
                key={album.id}
                onPress={() => {
                  onSelectAlbum?.(album);
                  setText(album.name);
                  setFocused(false);
                }}
              >
                <ThemedText
                  style={{
                    padding: 10,
                    backgroundColor: '#090909ff'
                  }}
                >
                  {album.name}
                </ThemedText>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText
              style={{
                padding: 10,
                backgroundColor: '#090909ff'
              }}
            >
              No albums found
            </ThemedText>
          )}
        </View>
      )}
    </>
  );
}
