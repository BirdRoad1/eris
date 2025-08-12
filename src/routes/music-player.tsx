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
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MusicContext } from '../provider/music-provider';
import { router, Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import ProgressBar from '../components/ProgressBar';
import { IconSymbol } from '../components/ui/IconSymbol';
import { AudioStatus, createAudioPlayer } from 'expo-audio';
import { useAlert } from '../provider/alert-provider';
import { useServer } from '../provider/server-provider';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { Song } from '../api/song';
import * as Audio from 'expo-audio';
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
  const serverCtx = useServer();
  const music = useContext(MusicContext);
  const songId = music?.currentSong?.id;
  const api = serverCtx?.getAPI();
  const params = useLocalSearchParams();

  const [cover, setCover] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const alert = useAlert();
  const song = useRef(
    'song' in params && typeof params['song'] === 'string'
      ? (JSON.parse(params['song']) as Song)
      : null
  ).current;

  const playbackStatusListener = useCallback((status: AudioStatus) => {
    setDuration(status.duration);
    setProgress(status.currentTime);
  }, []);

  // On initial render, subscribe to music player events
  useEffect(() => {
    if (
      !music?.player?.current ||
      (music.currentSong && song && music.currentSong.id !== song.id)
    )
      return;
    music.player?.current?.addListener(
      'playbackStatusUpdate',
      playbackStatusListener
    );
    return () => {
      music.player?.current?.removeListener(
        'playbackStatusUpdate',
        playbackStatusListener
      );
    };
  }, [music?.currentSong, song, music?.player, playbackStatusListener]);

  // On initial render, load song media and create a player
  // if no player exists yet.
  useEffect(() => {
    console.log('init?', song?.id);
    if (
      !song ||
      !api ||
      (music?.currentSong !== undefined && song.id === music.currentSong.id)
    )
      return;

    api.getSongMedia(song.id).then(async media => {
      if (media.length === 0) {
        alert.show('No media', 'This song has no media available');
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

      await Audio.setAudioModeAsync({
        // staysActiveInBackground: true, // keep playing in background
        playsInSilentMode: true, // iOS silent switch
        // shouldDuckAndroid: true // optional: duck other audio on Android
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers'
      });
      
      console.log('player created?');

      music?.player.current?.removeAllListeners('playbackStatusUpdate');
      music?.player.current?.release();
      if (music?.player) music.player.current = newPlayer;
      music?.setCurrentSong?.(song);

      newPlayer.addListener('playbackStatusUpdate', playbackStatusListener);
      newPlayer.seekTo(0);
    });
  }, [
    api,
    songId,
    music?.player,
    alert,
    playbackStatusListener,
    music?.currentSong,
    song,
    music
  ]);

  // Fetch song cover on initial render
  useEffect(() => {
    const coverUrl = song?.cover_url;
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
  }, [music, cover, serverCtx, song?.cover_url]);

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
        <ThemedText style={styles.title}>{song?.title}</ThemedText>
        <ThemedText style={styles.artist}>
          {song?.artist_name ?? 'Artist Unknown'}
        </ThemedText>
        <ThemedText style={styles.artist}>{song?.album_name}</ThemedText>
        <View style={styles.spacing} />
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
              gap: 15,
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
              <IconSymbol
                color="#ffffff"
                name="arrow-left"
                size={32}
                style={{ fontSize: 38, marginLeft: 9 }}
              />
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
              <IconSymbol
                color="#ffffff"
                name="arrow-right"
                size={32}
                style={{ fontSize: 38, marginLeft: -15 }}
              />
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
    fontSize: 13
  },
  spacing: {
    marginBottom: 50
  }
});
