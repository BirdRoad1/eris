export type Song = {
  id: number;
  title: string;
  album_id: number | null;
  release_year: number | null;
  duration_seconds: number | null;
  lyrics_url: string | null;
  genre: string | null;
  track_number: number | null;
  media_count: number;
  album_name: number | null;
  album_cover_path: number | null;
  artist_name: string | null;
  cover_url: string | null;
};
