import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useContext, useEffect } from 'react';
import { ServerContext } from '../provider/server-provider';

export default function SongsScreen() {
  const serverCtx = useContext(ServerContext);
  const api = serverCtx?.getAPI();
  const router = useRouter();

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
      console.log('redir onboard:', serverCtx, api);
    }
  }, [api, router, serverCtx]);

  return (
    <>
      <Stack.Screen options={{ title: 'Songs' }} />
      <ThemedView style={styles.songs}>
        <ThemedView
          style={{
            backgroundColor: 'green',
            borderRadius: 4,
            flexDirection: 'row'
          }}
        >
          <Image
            source={{ uri: 'https://placehold.co/100x100/png' }}
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'red'
            }}
          />
          <View
            style={{
              padding: 10
            }}
          >
            <ThemedText>Hello, world!</ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  songs: {
    flex: 1,
    padding: 20
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  }
});
