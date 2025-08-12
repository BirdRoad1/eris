import { Image, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useServer } from '../provider/server-provider';
import { router } from 'expo-router';
import { useAlert } from '../provider/alert-provider';
import { Playlist } from '../api/playlist';
import ThemedButton from './ThemedButton';
import { useEffect, useState } from 'react';

type Props = { playlist: Playlist; onDelete?: () => void }; // TODO: typed song

export default function PlaylistComponent({ playlist, onDelete }: Props) {
  const [imageData, setImageData] = useState<string>();
  const alert = useAlert();
  const api = useServer()?.getAPI();

  useEffect(() => {
    if (playlist.songs.length === 0) {
      setImageData(undefined);
      return;
    }
    const song = playlist.songs[0];
    if (!song.cover_url) return;

    api
      ?.fetchImageBase64(song.cover_url)
      .then(img => {
        if (img) {
          setImageData(img);
        }
      })
      .catch(err => {
        console.log(
          'Image failed to load: ' + song.cover_url + ', error: ' + err
        );
      });
  }, [api, playlist]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        router.navigate({
          pathname: '/filter-songs',
          params: {
            playlist: JSON.stringify(playlist)
            // allowedSongs: playlist.songs.map(s => s.id).join(','),
          }
        });
      }}
      onLongPress={() => {
        alert.show(
          'Remove Playlist',
          'Are you sure you want to remove this playlist?',
          true,
          sure => {
            if (sure) {
              onDelete?.();
            }
          }
        );
      }}
    >
      <ThemedView
        key={playlist.id}
        style={{
          backgroundColor: '#0d0d0dff',
          borderRadius: 4,
          flexDirection: 'row',
          padding: 10,
          gap: 10
        }}
      >
        <Image
          source={{
            uri: imageData
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 4,
            backgroundColor: '#151515ff'
          }}
        />
        <View
          style={{
            paddingVertical: 2
          }}
        >
          <View style={{ marginBottom: 'auto' }}>
            <ThemedText
              style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 18 }}
            >
              {playlist.name}
            </ThemedText>
            <ThemedText style={{ lineHeight: 18 }}>
              {playlist.songs.length}{' '}
              {playlist.songs.length === 1 ? 'song' : 'songs'}
            </ThemedText>
          </View>
          <ThemedButton
            title="Add Song"
            style={{
              backgroundColor: '#351e9cff'
            }}
            rippleColor="#210b85ff"
            onPress={() => {
              router.navigate({
                pathname: '/playlist-add-song',
                params: {
                  playlistId: playlist.id,
                  hideIds: playlist.songs.map(s => s.id).join(',')
                }
              });
            }}
          />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
