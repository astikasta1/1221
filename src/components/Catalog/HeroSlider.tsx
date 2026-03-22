import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl, truncateText } from '../../lib/utils';
import { HERO_ROTATION_INTERVAL } from '../../lib/constants';
import { Button } from '../UI/Button';
import type { Movie } from '../../types/movie';

interface HeroSliderProps {
  movies: Movie[];
}

export function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const slides = movies.slice(0, 5);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goToNext, HERO_ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [goToNext, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentIndex];
  const backdropUrl = getBackdropUrl(current.backdrop_path);

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-end pb-16 px-12 max-w-2xl">
        <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
          {current.title}
        </h2>
        {current.overview && (
          <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {truncateText(current.overview, 200)}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/movie/${current.id}`)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Смотреть
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(`/movie/${current.id}`)}
          >
            Подробнее
          </Button>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-12 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-accent w-6'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
