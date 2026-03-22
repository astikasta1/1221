import { create } from 'zustand';
import type { StreamStatus } from '../types/torrent';
import * as api from '../lib/api';

interface PlayerState {
  streamUrl: string | null;
  fileName: string | null;
  status: StreamStatus | null;
  isPlaying: boolean;
  loading: boolean;
  error: string | null;

  startStream: (magnetUri: string) => Promise<void>;
  stopStream: () => Promise<void>;
  updateStatus: () => Promise<void>;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  streamUrl: null,
  fileName: null,
  status: null,
  isPlaying: false,
  loading: false,
  error: null,

  startStream: async (magnetUri: string) => {
    set({ loading: true, error: null });
    try {
      const info = await api.startStream(magnetUri);
      set({
        streamUrl: info.url,
        fileName: info.file_name,
        isPlaying: true,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  stopStream: async () => {
    try {
      await api.stopStream();
    } catch {
      // ignore stop errors
    }
    set({
      streamUrl: null,
      fileName: null,
      status: null,
      isPlaying: false,
    });
  },

  updateStatus: async () => {
    try {
      const status = await api.getStreamStatus();
      set({ status });
    } catch {
      // ignore status poll errors
    }
  },

  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  reset: () => {
    set({
      streamUrl: null,
      fileName: null,
      status: null,
      isPlaying: false,
      loading: false,
      error: null,
    });
  },
}));
