import { Alert, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import ThemedButton from '../ThemedButton';
import ThemedInput from '../ThemedInput';
import { useContext, useEffect, useState } from 'react';
import API from '@/src/api/api';
import { useAlert } from '@/src/provider/alert-provider';
import { useServer } from '@/src/provider/server-provider';

type Props = {
  onValidationChange(value: boolean): void;
};

export default function ConnectServerComponent({ onValidationChange }: Props) {
  const serverCtx = useServer();
  const alert = useAlert();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  async function connect() {
    const testUrl = `${url}${!url.endsWith('/') ? '/' : ''}api/v1/`;
    const abortController = new AbortController();
    setTimeout(() => {
      abortController.abort('Timed out');
    }, 5000);
    try {
      const json = await (
        await fetch(testUrl, {
          signal: abortController.signal
        })
      ).json();

      if (
        typeof json !== 'object' ||
        json === null ||
        !('server' in json) ||
        typeof json['server'] !== 'string' ||
        json.server !== 'eris-sync' ||
        !('version' in json) ||
        typeof json['version'] !== 'string'
      ) {
        alert.show(
          'Error',
          'The server does not seem to be a valid eris-sync server. Response: ' +
            JSON.stringify(json)
        );
        return;
      }

      const { server, version } = json;

      const api = new API(url, token);
      if (!(await api.verifySession())) {
        alert.show('Failed to activate', 'Invalid token');
        return;
      }

      alert.show(
        'Connection succeeded',
        `Successfully connected to server running ${server}@${version}`
      );

      serverCtx?.createAPI(api, token);

      onValidationChange(true);
    } catch (err) {
      if (err instanceof DOMException) {
        alert.show(
          'Connection failed',
          'Timed out. Please check the server and your internet connection and try again.'
        );
        return;
      }

      const msg = err instanceof Error ? err.message : String(err);

      alert.show('Connection failed', msg);
    }
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
