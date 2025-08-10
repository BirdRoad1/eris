import { createContext, ReactNode, useEffect, useState } from 'react';
import API from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

type ContextType = {
  getAPI: () => API | null;
  createAPI: (url: string, token: string) => API | null;
  loaded: boolean;
};

export const ServerContext = createContext<ContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const ServerProvider = ({ children }: Props) => {
  const [api, setAPI] = useState<API>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const url = await SecureStore.getItemAsync('server_url');
        const token = await SecureStore.getItemAsync('server_token');

        if (url !== null && token !== null) {
          setAPI(new API(url, token));
        }

        setLoaded(true);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        Alert.alert('Data error', `Failed to load app data: ${errMsg}`);
      }
    })();
  }, []);

  return (
    <ServerContext.Provider
      value={{
        loaded,
        createAPI: (url: string, token: string) => {
          SecureStore.setItemAsync('server_url', url);
          SecureStore.setItemAsync('server_token', token);

          const api = new API(url, token);
          setAPI(api);

          return api;
        },
        getAPI: () => {
          return api ?? null;
        }
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
