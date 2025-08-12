export type Album = {
  id: number;
  name: string;
  cover_url: string | null;
  genre: string | null;
  release_year: number | null;
  song_count: number;
  artists: string[];
};
