import { create } from 'zustand';
import type { Movie } from '../types/movie';
import * as api from '../lib/api';

interface CatalogState {
  trending: Movie[];
  popularMovies: Movie[];
  popularTv: Movie[];
  searchResults: Movie[];
  loadingTrending: boolean;
  loadingPopular: boolean;
  loadingSearch: boolean;
  error: string | null;

  fetchTrending: () => Promise<void>;
  fetchPopular: () => Promise<void>;
  searchCatalog: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  trending: [],
  popularMovies: [],
  popularTv: [],
  searchResults: [],
  loadingTrending: false,
  loadingPopular: false,
  loadingSearch: false,
  error: null,

  fetchTrending: async () => {
    set({ loadingTrending: true, error: null });
    try {
      const results = await api.getTrending('movie', 1);
      set({ trending: results, loadingTrending: false });
    } catch (err) {
      set({
        loadingTrending: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  fetchPopular: async () => {
    set({ loadingPopular: true, error: null });
    try {
      const [movies, tv] = await Promise.all([
        api.getPopular('movie', 1),
        api.getPopular('tv', 1),
      ]);
      set({ popularMovies: movies, popularTv: tv, loadingPopular: false });
    } catch (err) {
      set({
        loadingPopular: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  searchCatalog: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], loadingSearch: false });
      return;
    }
    set({ loadingSearch: true, error: null });
    try {
      const results = await api.searchMovies(query, 1);
      set({ searchResults: results, loadingSearch: false });
    } catch (err) {
      set({
        loadingSearch: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  clearSearch: () => {
    set({ searchResults: [] });
  },
}));
