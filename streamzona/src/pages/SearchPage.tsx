import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalogStore } from '../stores/catalogStore';
import { useDebounce } from '../hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';
import { MovieGrid } from '../components/Catalog/MovieGrid';
import { Loader } from '../components/UI/Loader';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const { searchResults, loadingSearch, searchCatalog, clearSearch } =
    useCatalogStore();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchCatalog(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchCatalog, clearSearch]);

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        {query
          ? `Результаты поиска: "${query}"`
          : 'Поиск фильмов и сериалов'}
      </h1>

      {loadingSearch ? (
        <Loader className="py-20" size="lg" />
      ) : query ? (
        <MovieGrid movies={searchResults} />
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-secondary text-lg">
            Введите запрос для поиска
          </p>
        </div>
      )}
    </div>
  );
}
