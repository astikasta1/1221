import { MovieCard } from './MovieCard';
import type { Movie } from '../../types/movie';

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-secondary text-lg">Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,180px)] gap-5 justify-center">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
