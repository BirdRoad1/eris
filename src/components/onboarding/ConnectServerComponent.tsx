import { Alert, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import ThemedButton from '../ThemedButton';
import ThemedInput from '../ThemedInput';
import { useContext, useEffect, useState } from 'react';
import { ServerContext } from '@/src/provider/server-provider';

type Props = {
  onValidationChange(value: boolean): void;
};

export default function ConnectServerComponent({ onValidationChange }: Props) {
  const serverCtx = useContext(ServerContext);

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    setUrl('http://192.168.1.92:8000');
    setToken(
      '61224c7fd41c60a786474cd88c2b72d238b494b734d774e748a8b2e9079a09c1'
    );
  }, []);

  function connect() {
    const testUrl = `${url}${!url.endsWith('/') ? '/' : ''}api/v1/`;
    const abortController = new AbortController();
    setTimeout(() => {
      abortController.abort('Timed out');
    }, 5000);
    fetch(testUrl, {
      signal: abortController.signal
    })
      .then(res => res.json() as Promise<unknown>)
      .then(json => {
        if (
          typeof json !== 'object' ||
          json === null ||
          !('server' in json) ||
          typeof json['server'] !== 'string' ||
          json.server !== 'eris-sync' ||
          !('version' in json) ||
          typeof json['version'] !== 'string'
        ) {
          Alert.alert(
            'Error',
            'The server does not seem to be a valid eris-sync server. Response: ' +
              JSON.stringify(json)
          );
          return;
        }

        const { server, version } = json;
        Alert.alert(
          'Connection succeeded',
          `Successfully connected to server running ${server}@${version}`
        );

        serverCtx?.createAPI(url, token);

        onValidationChange(true);
      })
      .catch(err => {
        if (err instanceof DOMException) {
          Alert.alert(
            'Connection failed',
            'Timed out. Please check the server and your internet connection and try again.'
          );
          return;
        }

        Alert.alert('Connection failed', err.message);
      });
    console.log(testUrl);
  }

  return (
    <View style={{ alignItems: 'center', gap: 15 }}>
      <ThemedText style={{ textAlign: 'center' }}>
        Sync server configuration
      </ThemedText>
      <View style={{ gap: 5 }}>
        <ThemedText>Server URL</ThemedText>
        <ThemedInput
          placeholder="http://localhost:3000/"
          autoCapitalize="none"
          value={url}
          onChangeText={text => setUrl(text)}
        />
      </View>
      <View style={{ gap: 5 }}>
        <ThemedText>Client Token</ThemedText>
        <ThemedInput
          secureTextEntry={true}
          placeholder="Enter your token here"
          value={token}
          onChangeText={text => setToken(text)}
        />
      </View>
      <ThemedButton
        title="Connect"
        style={{ backgroundColor: '#50328dff' }}
        rippleColor="#411e86ff"
        onPress={connect}
      />
    </View>
  );
}
