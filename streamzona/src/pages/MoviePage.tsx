import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getRecommendations, searchTorrents } from '../lib/api';
import { getBackdropUrl, getPosterUrl, getGenreNames, formatDuration } from '../lib/utils';
import { usePlayerStore } from '../stores/playerStore';
import { Rating } from '../components/UI/Rating';
import { Badge } from '../components/UI/Badge';
import { Loader } from '../components/UI/Loader';
import { TorrentList } from '../components/Torrent/TorrentList';
import { CategoryRow } from '../components/Catalog/CategoryRow';
import type { MovieDetails } from '../types/movie';
import type { Movie } from '../types/movie';
import type { TorrentResult } from '../types/torrent';

export function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const startStream = usePlayerStore((s) => s.startStream);

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [torrents, setTorrents] = useState<TorrentResult[]>([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingTorrents, setLoadingTorrents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) return;

    setLoadingMovie(true);
    setError(null);
    setMovie(null);
    setTorrents([]);

    getMovieDetails(movieId)
      .then((details) => {
        setMovie(details);
        setLoadingMovie(false);

        // Auto-search torrents
        setLoadingTorrents(true);
        searchTorrents(details.title)
          .then(setTorrents)
          .catch(() => setTorrents([]))
          .finally(() => setLoadingTorrents(false));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoadingMovie(false);
      });

    getRecommendations(movieId)
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [id]);

  const handlePlay = async (magnetUri: string) => {
    await startStream(magnetUri);
    navigate('/player');
  };

  if (loadingMovie) {
    return <Loader className="py-40" size="lg" />;
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <p className="text-text-secondary text-lg">
          {error || 'Фильм не найден'}
        </p>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path, 'large');
  const genreNames = movie.genres
    ? movie.genres.map((g) => g.name)
    : getGenreNames(movie.genre_ids);

  return (
    <div className="pb-12">
      {/* Backdrop */}
      <div className="relative w-full h-[400px]">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
      </div>

      {/* Movie info */}
      <div className="relative px-12 -mt-48">
        <div className="flex gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-[240px] h-[360px] rounded-lg object-cover shadow-2xl"
              />
            ) : (
              <div className="w-[240px] h-[360px] rounded-lg bg-tertiary flex items-center justify-center">
                <svg className="w-16 h-16 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pt-24">
            <h1 className="text-3xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-neutral-500 italic mb-3">{movie.tagline}</p>
            )}

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <Rating value={movie.vote_average} />
              <span className="text-neutral-400">{movie.year}</span>
              {movie.runtime && (
                <span className="text-neutral-400">
                  {formatDuration(movie.runtime)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {genreNames.map((genre) => (
                <Badge key={genre} variant="default">
                  {genre}
                </Badge>
              ))}
            </div>

            {movie.overview && (
              <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                {movie.overview}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Torrents */}
      <div className="px-12 mt-10">
        <h2 className="text-xl font-bold text-white mb-4">Доступные раздачи</h2>
        <TorrentList
          torrents={torrents}
          loading={loadingTorrents}
          onPlay={handlePlay}
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-10">
          <CategoryRow
            title="Рекомендации"
            movies={recommendations}
          />
        </div>
      )}
    </div>
  );
}
