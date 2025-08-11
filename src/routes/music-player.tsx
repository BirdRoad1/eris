import {
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { useContext, useEffect, useRef, useState } from 'react';
import { MusicContext } from '../provider/music-provider';
import { router, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ServerContext } from '../provider/server-provider';
import ProgressBar from '../components/ProgressBar';
import ThemedButton from '../components/ThemedButton';
import { IconSymbol } from '../components/ui/IconSymbol';

function formatSeconds(seconds: number): string {
  seconds = Math.floor(seconds);
  const sections: string[] = [];

  const minutes = Math.floor((seconds / 60) % 60);
  const hours = Math.floor(seconds / 60 / 60);

  if (hours > 0) {
    sections.push(hours.toString());
  }

  sections.push(
    hours > 0 ? minutes.toString().padStart(2, '0') : minutes.toString()
  );

  sections.push((seconds % 60).toString().padStart(2, '0'));

  return sections.join(':');
}

export default function MusicPlayer() {
  const serverCtx = useContext(ServerContext);
  const music = useContext(MusicContext);
  const [cover, setCover] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const coverUrl = music?.currentSong?.cover_url;
    if (!coverUrl) {
      setCover(undefined);
      return;
    }

    serverCtx
      ?.getAPI()
      ?.fetchImageBase64(coverUrl)
      .then(url => {
        if (url) {
          setCover(url);
        }
      })
      .catch(err => {
        console.log('Failed to load cover:', err);
      });
  }, [music, cover, serverCtx]);

  if (music === null) {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
    return <></>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Player' }} />

      <ThemedView style={styles.background}>
        <ThemedText style={styles.title}>{music.currentSong?.title}</ThemedText>
        <ThemedText style={styles.artist}>
          {music.currentSong?.artist_name ?? 'Artist Unknown'}
        </ThemedText>
        <Image
          source={{ uri: cover }}
          style={{
            backgroundColor: '#0b0b0bff',
            width: 256,
            height: 256,
            borderRadius: 4,
            marginBottom: 20
          }}
        ></Image>
        <View
          style={{
            gap: 10
          }}
        >
          <ThemedText style={{ textAlign: 'center' }}>
            {formatSeconds(progress)} / {formatSeconds(duration)}
          </ThemedText>
          <ProgressBar
            min={0}
            max={duration}
            value={progress}
            onValueChange={value => {
              setProgress(value);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'center'
            }}
          >
            <TouchableOpacity
              style={{
                width: 32,
                margin: 0,
                padding: 0
              }}
            >
              <IconSymbol color="#ffffff" name="arrow-back" size={32} />
            </TouchableOpacity>

            <TouchableOpacity>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#050505ff',
                  borderRadius: '50%',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <IconSymbol color="#ffffff" name="play-arrow" size={32} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 32
              }}
            >
              <IconSymbol color="#ffffff" name="arrow-forward" size={32} />
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    alignItems: 'center'
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
