import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import API from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { useAlert } from './alert-provider';

type ContextType = {
  getAPI: () => API | null;
  logout: () => void;
  createAPI: (api: API, token: string) => API | null;
  loaded: boolean;
};

const ServerContext = createContext<ContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function useServer() {
  const ctx = useContext(ServerContext);
  if (!ctx) {
    throw new Error('Please wrap this component in AlertProvider');
  }

  return ctx;
}

export const ServerProvider = ({ children }: Props) => {
  const [api, setAPI] = useState<API>();
  const [loaded, setLoaded] = useState(false);
  const alert = useAlert();

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
        alert.show('Data error', `Failed to load app data: ${errMsg}`);
      }
    })();
  }, [alert]);

  return (
    <ServerContext.Provider
      value={{
        loaded,
        createAPI: (api: API, token: string) => {
          SecureStore.setItemAsync('server_url', api.getURL());
          SecureStore.setItemAsync('server_token', token);

          setAPI(api);

          return api;
        },
        getAPI: () => {
          return api ?? null;
        },
        logout: () => {
          SecureStore.deleteItemAsync('server_url');
          SecureStore.deleteItemAsync('server_token');
          setAPI(undefined);
        }
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
