import {
  StatusBar,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { router, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import ThemedInput from '../components/ThemedInput';
import ThemedButton from '../components/ThemedButton';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { useAlert } from '../provider/alert-provider';
import { ArtistSearchInput } from '../components/ArtistSearchInput';
import { useServer } from '../provider/server-provider';
import { Artist } from '../api/artist';

export default function CreateAlbum() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState<Artist[]>();
  const [year, setYear] = useState<number>();
  const [genre, setGenre] = useState('');
  const [cover, setCover] = useState<
    DocumentPicker.DocumentPickerAsset | undefined
  >(undefined);

  const serverCtx = useServer();
  const alert = useAlert();

  async function createSong() {
    const api = serverCtx?.getAPI();
    if (!api) return;

    if (!name) {
      alert.show('Error', 'Please enter a valid name');
      return;
    }

    try {
      const { id } = await api.createAlbum(
        name,
        artists?.map(a => a.id) ?? [],
        genre,
        year
      );

      if (cover) {
        ToastAndroid.show('Uploading...', ToastAndroid.SHORT);
        await api.uploadAsset(id, cover.uri, 'albums', cover.name, 'cover');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/albums');
      }

      ToastAndroid.show('Album created', ToastAndroid.SHORT);
    } catch (err) {
      alert.show('Error', err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Create Album' }} />

      <ThemedView style={styles.background}>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Name*</ThemedText>
          <ThemedInput
            placeholder="Enter the album's name"
            autoCapitalize="words"
            value={name}
            onChangeText={value => setName(value)}
          />
        </View>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Artist</ThemedText>
          <ArtistSearchInput
            onSelectArtist={artist => {
              if (artists?.some(a => a.id === artist.id)) return;
              setArtists([...(artists || []), artist]);
            }}
          />
        </View>
        {artists && artists.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ThemedText>Artists</ThemedText>
            {artists.map(artist => (
              <TouchableOpacity
                key={artist.id}
                onPress={() => {
                  setArtists(old => old?.filter(o => o.id !== artist.id));
                }}
              >
                <ThemedText
                  style={{
                    backgroundColor: '#080808ff',
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: 4
                  }}
                >
                  {artist.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Release Year</ThemedText>
          <ThemedInput
            placeholder="Enter a year"
            keyboardType="numeric"
            value={year?.toString() ?? ''}
            onChangeText={value => {
              if (value.length === 0) {
                setYear(undefined);
                return;
              }
              if (!/^\d*$/.test(value)) return;
              let num = Number(value);
              if (!Number.isFinite(num)) return;

              setYear(num);
            }}
          />
        </View>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Genre</ThemedText>
          <ThemedInput
            placeholder="Enter the album's genre"
            value={genre}
            onChangeText={value => setGenre(value)}
          />
        </View>
        <ThemedButton
          title={'Upload cover image'}
          style={{ backgroundColor: '#272727ff' }}
          rippleColor="#1d1d1dff"
          onPress={() => {
            DocumentPicker.getDocumentAsync({
              type: ['image/*']
            }).then(result => {
              if (result.canceled) return;
              if (result.assets.length === 0) return;

              const asset = result.assets[0];
              if (
                cover !== undefined &&
                asset.name === cover.name &&
                asset.lastModified === cover?.lastModified &&
                asset.size === cover.size
              )
                return;

              setCover(asset);
              console.log('File pick result:', result);
            });
          }}
        />
        <ThemedButton
          title="Create"
          style={{ backgroundColor: '#0c3f78ff' }}
          onPress={createSong}
          rippleColor="#092d57ff"
        />
        {cover && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ThemedText>Cover</ThemedText>
            <TouchableOpacity
              onPress={() => {
                setCover(undefined);
              }}
            >
              <ThemedText
                style={{
                  backgroundColor: '#080808ff',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 4
                }}
              >
                {cover.name}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    alignItems: 'center',
    gap: 20
  },
  input: {
    flexDirection: 'column',
    gap: 5
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  artist: {
    fontSize: 13,
    marginBottom: 50
  }
});
