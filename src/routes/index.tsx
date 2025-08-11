import { useNavigation, useRouter } from 'expo-router';

import {  useEffect } from 'react';
import { ThemedView } from '../components/ThemedView';
import { useServer } from '../provider/server-provider';

export default function HomeScreen() {
  const serverCtx = useServer();
  const api = serverCtx?.getAPI();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const listener = () => {
      if (serverCtx?.loaded && api === null) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/songs');
      }
    };
    navigation.addListener('state', listener);
    return () => navigation.removeListener('state', listener);
  }, [api, navigation, router, serverCtx?.loaded]);

  return <ThemedView style={{ flex: 1, height: '100%', width: '100%' }} />;
}
