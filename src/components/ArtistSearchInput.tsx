import { TextInputProps, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedInput from './ThemedInput';
import { useContext, useRef, useState } from 'react';
import { useServer } from '../provider/server-provider';
import { useAlert } from '../provider/alert-provider';
import { Artist } from '../api/artist';

type Props = {
  // value: string;
  // onChangeText?: TextInputProps['onChangeText'];
  onSelectArtist?: (artist: Artist) => void;
};

export function ArtistSearchInput({
  // value,
  // onChangeText,
  onSelectArtist
}: Props) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);

  const api = useServer().getAPI();
  const alert = useAlert();
  const searchTimeout = useRef<number>(null);

  async function search(text: string) {
    console.log('Try search!');
    try {
      const artists = await api?.searchArtist(text);
      setArtists(artists);
      // console.log(artists);
    } catch (err) {
      alert.show('Error', err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <ThemedInput
        placeholder="Search for an artist"
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
          {artists.length > 0 ? (
            artists.map(artist => (
              <TouchableOpacity
                key={artist.id}
                onPress={() => {
                  onSelectArtist?.(artist);
                  setText(artist.name);
                  setFocused(false);
                }}
              >
                <ThemedText
                  style={{
                    padding: 10,
                    backgroundColor: '#090909ff'
                  }}
                >
                  {artist.name}
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
              No artists found
            </ThemedText>
          )}
        </View>
      )}
    </>
  );
}
