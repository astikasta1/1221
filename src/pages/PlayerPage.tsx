import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import { Loader } from '../components/UI/Loader';
import { Button } from '../components/UI/Button';
import { formatBytes, formatSpeed } from '../lib/utils';
import { STATUS_POLL_INTERVAL } from '../lib/constants';

export function PlayerPage() {
  const navigate = useNavigate();
  const { streamUrl, fileName, status, loading, error, updateStatus, stopStream } =
    usePlayerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (streamUrl) {
      intervalRef.current = setInterval(updateStatus, STATUS_POLL_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamUrl, updateStatus]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <Loader size="lg" />
        <p className="text-neutral-400 mt-4">Подготовка потока...</p>
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-text-secondary text-lg">
          {error || 'Нет активного потока'}
        </p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Back button */}
      <div className="px-6 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopStream();
            navigate(-1);
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Назад
        </Button>
        {fileName && (
          <span className="text-sm text-neutral-400 truncate">
            {fileName}
          </span>
        )}
      </div>

      {/* Video */}
      <div className="flex-1 bg-black">
        <VideoPlayer src={streamUrl} />
      </div>

      {/* Status bar */}
      {status && (
        <div className="px-6 py-3 bg-secondary border-t border-border flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Статус:</span>
            <span className="text-xs text-white">{status.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Прогресс:</span>
            <div className="w-32 h-1.5 bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.min(status.progress * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-white">
              {(status.progress * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Скорость:</span>
            <span className="text-xs text-success">
              {formatSpeed(status.download_speed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Пиры:</span>
            <span className="text-xs text-white">{status.peers}</span>
          </div>
        </div>
      )}
    </div>
  );
}
