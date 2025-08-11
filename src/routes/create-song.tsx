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

export default function CreateSong() {
  const [cover, setCover] = useState<
    DocumentPicker.DocumentPickerAsset | undefined
  >(undefined);
  const [title, setTitle] = useState('');
  const [medias, setMedias] = useState<DocumentPicker.DocumentPickerAsset[]>(
    []
  );
  const [artist, setArtist] = useState<Artist>();
  const [year, setYear] = useState<number>();
  const serverCtx = useServer();
  const alert = useAlert();

  async function createSong() {
    const api = serverCtx?.getAPI();
    if (!api) return;

    if (!title) {
      alert.show('Error', 'Please enter a valid title');
      return;
    }

    try {
      const { id } = await api.createSong(title, artist?.id);

      if (cover || medias.length > 0) {
        ToastAndroid.show('Uploading...', ToastAndroid.SHORT);
      }

      if (cover) {
        await api.uploadAsset(id, cover.uri, 'songs', cover.name, 'cover');
      }

      for (const media of medias) {
        await api.uploadAsset(id, media.uri, 'songs', media.name, 'media');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/songs');
      }

      ToastAndroid.show('Song created', ToastAndroid.SHORT);
    } catch (err) {
      alert.show('Error', err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Create Song' }} />

      <ThemedView style={styles.background}>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Title</ThemedText>
          <ThemedInput
            placeholder="Enter the song's title"
            autoCapitalize="words"
            value={title}
            onChangeText={value => setTitle(value)}
          />
        </View>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Artist</ThemedText>
          <ArtistSearchInput onSelectArtist={artist => setArtist(artist)} />
        </View>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Year</ThemedText>
          <ThemedInput
            placeholder="Enter the song's year"
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
          title={'Upload media'}
          style={{ backgroundColor: '#272727ff' }}
          rippleColor="#1d1d1dff"
          onPress={() => {
            DocumentPicker.getDocumentAsync({
              type: ['audio/*']
            }).then(result => {
              if (result.canceled) return;
              if (result.assets.length === 0) return;
              const newMedias = result.assets.filter(
                a =>
                  !medias.some(
                    m =>
                      m.name === a.name &&
                      m.size === a.size &&
                      m.lastModified === a.lastModified
                  )
              );

              setMedias([...medias, ...newMedias]);
              console.log('File pick result:', newMedias);
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
        {medias.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ThemedText>Media</ThemedText>
            {medias.map(media => (
              <TouchableOpacity
                key={JSON.stringify({ n: media.name, s: media.size })}
                onPress={() => {
                  setMedias(old =>
                    old.filter(
                      o =>
                        o.name !== media.name &&
                        o.lastModified !== media.lastModified &&
                        o.size !== media.size
                    )
                  );
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
                  {media.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
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
