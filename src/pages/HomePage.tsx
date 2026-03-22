import { useEffect } from 'react';
import { useCatalogStore } from '../stores/catalogStore';
import { HeroSlider } from '../components/Catalog/HeroSlider';
import { CategoryRow } from '../components/Catalog/CategoryRow';
import { Loader } from '../components/UI/Loader';

export function HomePage() {
  const {
    trending,
    popularMovies,
    popularTv,
    loadingTrending,
    loadingPopular,
    fetchTrending,
    fetchPopular,
  } = useCatalogStore();

  useEffect(() => {
    if (trending.length === 0) fetchTrending();
    if (popularMovies.length === 0) fetchPopular();
  }, [trending.length, popularMovies.length, fetchTrending, fetchPopular]);

  if (loadingTrending && trending.length === 0) {
    return <Loader className="py-40" size="lg" />;
  }

  return (
    <div className="pb-12">
      <HeroSlider movies={trending} />

      <div className="mt-4">
        <CategoryRow
          title="Сейчас в тренде"
          movies={trending}
          loading={loadingTrending}
        />
        <CategoryRow
          title="Популярные фильмы"
          movies={popularMovies}
          loading={loadingPopular}
        />
        <CategoryRow
          title="Популярные сериалы"
          movies={popularTv}
          loading={loadingPopular}
        />
      </div>
    </div>
  );
}
