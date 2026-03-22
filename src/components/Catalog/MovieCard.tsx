import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../../lib/utils';
import { Rating } from '../UI/Rating';
import type { Movie } from '../../types/movie';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const posterUrl = getPosterUrl(movie.poster_path, 'medium');

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="relative w-[180px] h-[270px] rounded-lg overflow-hidden cursor-pointer group flex-shrink-0"
    >
      {posterUrl && !imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-tertiary animate-pulse" />
          )}
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full bg-tertiary flex items-center justify-center">
          <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
          </svg>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-400">{movie.year}</span>
          <Rating value={movie.vote_average} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
          className="mt-2 w-full py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors duration-200"
        >
          Смотреть
        </button>
      </div>
    </div>
  );
}
