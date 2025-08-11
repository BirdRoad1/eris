import { createContext, ReactNode, useRef, useState } from 'react';
import { Song } from '../api/song';
import { AudioPlayer } from 'expo-audio';

type ContextType = {
  currentSong: Song | undefined;
  setCurrentSong:
    | React.Dispatch<React.SetStateAction<Song | undefined>>
    | undefined;
  currentSongTime: number;
  setCurrentSongTime: React.Dispatch<React.SetStateAction<number>> | undefined;
  // setPlayer: React.Dispatch<React.SetStateAction<AudioPlayer | undefined>>;
  player: React.RefObject<AudioPlayer | null>; //AudioPlayer | undefined;
};

export const MusicContext = createContext<ContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const MusicProvider = ({ children }: Props) => {
  const [currentSong, setCurrentSong] = useState<Song | undefined>();
  const [currentSongTime, setCurrentSongTime] = useState<number>(0);
  const player = useRef<AudioPlayer>(null);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        currentSongTime,
        setCurrentSongTime,
        player
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
