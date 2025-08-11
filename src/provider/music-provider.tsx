import { createContext, ReactNode, useState } from 'react';
import { Song } from '../api/song';

type ContextType = {
  currentSong: Song | undefined;
  setCurrentSong:
    | React.Dispatch<React.SetStateAction<Song | undefined>>
    | undefined;
  currentSongTime: number;
  setCurrentSongTime: React.Dispatch<React.SetStateAction<number>> | undefined;
};

export const MusicContext = createContext<ContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const MusicProvider = ({ children }: Props) => {
  const [currentSong, setCurrentSong] = useState<Song | undefined>();
  const [currentSongTime, setCurrentSongTime] = useState<number>(0);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        currentSongTime,
        setCurrentSongTime
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
