export interface Movie {
  id: number;
  title: string;
  original_title: string;
  year: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
  media_type: 'Movie' | 'Tv';
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: { id: number; name: string }[];
  tagline: string | null;
}
