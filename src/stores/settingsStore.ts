import { create } from 'zustand';
import type { AppSettings } from '../types/settings';
import * as api from '../lib/api';

const defaultSettings: AppSettings = {
  jackett_url: 'http://localhost:9117',
  jackett_api_key: '',
  tmdb_api_key: '',
  download_path: '',
  preferred_quality: 'any',
  language: 'ru',
  stream_port: 8888,
  autoplay: true,
  torrent_enabled: true,
};

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  jackettStatus: 'idle' | 'checking' | 'connected' | 'failed';
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  checkJackett: () => Promise<void>;
  updateField: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  saving: false,
  jackettStatus: 'idle',
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await api.loadSettings();
      set({ settings, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  saveSettings: async (settings: AppSettings) => {
    set({ saving: true, error: null });
    try {
      await api.saveSettings(settings);
      set({ settings, saving: false });
    } catch (err) {
      set({
        saving: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  checkJackett: async () => {
    const { settings } = get();
    set({ jackettStatus: 'checking' });
    try {
      const ok = await api.checkJackettConnection(
        settings.jackett_url,
        settings.jackett_api_key
      );
      set({ jackettStatus: ok ? 'connected' : 'failed' });
    } catch {
      set({ jackettStatus: 'failed' });
    }
  },

  updateField: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));
