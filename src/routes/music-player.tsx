import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { useContext, useEffect, useState } from 'react';
import { MusicContext } from '../provider/music-provider';
import { router, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ServerContext } from '../provider/server-provider';
import ProgressBar from '../components/ProgressBar';
import { IconSymbol } from '../components/ui/IconSymbol';
import { AudioStatus, createAudioPlayer } from 'expo-audio';

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
  const songId = music?.currentSong?.id;
  const api = serverCtx?.getAPI();

  const [cover, setCover] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // On initial render, subscribe to music player events
  useEffect(() => {
    if (!music?.player?.current) return;
    const listener = (status: AudioStatus) => {
      setDuration(status.duration);
      setProgress(status.currentTime);
    };
    music.player?.current?.addListener('playbackStatusUpdate', listener);
    return () => {
      music.player?.current?.removeListener('playbackStatusUpdate', listener);
    };

    // it's ok to ignore eslint here, i think
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On initial render, load song media and create a player
  // if no player exists yet.
  useEffect(() => {
    if (!songId || !api || music?.player.current) return;
    api.getSongMedia(songId).then(media => {
      if (media.length === 0) {
        Alert.alert('No media', 'This song has no media available');
        return;
      }

      const audio = media[0].url;
      // TODO: ensure that the media URL matches our backend before giving our token!
      const newPlayer = createAudioPlayer(
        {
          uri: audio,
          headers: {
            Authorization: 'Bearer ' + api.getToken()
          }
        },
        100
      );

      music.player.current?.release();
      music.player.current?.remove();
      music.player.current = newPlayer;
      newPlayer.seekTo(0);
    });
  }, [api, songId, music?.player]);

  // Fetch song cover on initial render
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
              console.log(music.player.current);
              music.player.current?.seekTo(value);
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

            <TouchableOpacity
              onPress={() => {
                if (!music.player.current) {
                  ToastAndroid.show('Player not ready', ToastAndroid.SHORT);
                  return;
                }

                if (!music.player.current.playing) {
                  if (music.player.current.currentStatus.didJustFinish) {
                    music.player.current.seekTo(0);
                  }
                  music.player.current.play();
                } else {
                  music.player.current.pause();
                }
              }}
            >
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
                <IconSymbol
                  color="#ffffff"
                  name={music.player.current?.playing ? 'pause' : 'play-arrow'}
                  size={32}
                />
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
