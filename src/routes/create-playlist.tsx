import {
  StatusBar,
  StyleSheet,
  ToastAndroid,
  View
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { router, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import ThemedInput from '../components/ThemedInput';
import ThemedButton from '../components/ThemedButton';
import { useState } from 'react';
import { useAlert } from '../provider/alert-provider';
import { useServer } from '../provider/server-provider';

export default function CreatePlaylist() {
  const [name, setName] = useState('');

  const serverCtx = useServer();
  const alert = useAlert();

  async function createPlaylist() {
    const api = serverCtx?.getAPI();
    if (!api) return;

    if (!name) {
      alert.show('Error', 'Please enter a valid name');
      return;
    }

    try {
      console.log('created:',await api.createPlaylist(name));

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/albums');
      }

      ToastAndroid.show('Playlist created', ToastAndroid.SHORT);
    } catch (err) {
      alert.show('Error', err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Create Playlist' }} />

      <ThemedView style={styles.background}>
        <View style={styles.input}>
          <ThemedText style={{ fontSize: 15 }}>Name*</ThemedText>
          <ThemedInput
            placeholder="Enter the playlist's name"
            autoCapitalize="words"
            value={name}
            onChangeText={value => setName(value)}
          />
        </View>

        <ThemedButton
          title="Create"
          style={{ backgroundColor: '#0c3f78ff' }}
          onPress={createPlaylist}
          rippleColor="#092d57ff"
        />
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
