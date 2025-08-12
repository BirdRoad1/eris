export type Playlist = {
  id: number;
  name: string;
  songs: {
    id: string;
    name: string;
  }[];
};
