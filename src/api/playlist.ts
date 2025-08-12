export type Playlist = {
  id: number;
  name: string;
  songs: {
    id: number;
    name: string;
    cover_url: string | null;
  }[];
};
