import { useRouter } from 'expo-router';

import { useContext, useEffect } from 'react';
import { ServerContext } from '../provider/server-provider';
import { ThemedView } from '../components/ThemedView';

export default function HomeScreen() {
  const serverCtx = useContext(ServerContext);
  const api = serverCtx?.getAPI();
  const router = useRouter();

  useEffect(() => {
    if (serverCtx?.loaded && api === null) {
      router.replace('/onboarding');
    } else {
      router.replace('/songs');
    }
  }, [api, router, serverCtx]);

  return <ThemedView style={{ flex: 1, height: '100%', width: '100%' }} />;
}
