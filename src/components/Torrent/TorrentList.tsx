import { TorrentItem } from './TorrentItem';
import type { TorrentResult } from '../../types/torrent';

interface TorrentListProps {
  torrents: TorrentResult[];
  loading: boolean;
  onPlay: (magnetUri: string) => void;
}

function TorrentSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-tertiary rounded w-3/4 mb-2" />
        <div className="flex gap-2">
          <div className="h-5 bg-tertiary rounded w-16" />
          <div className="h-5 bg-tertiary rounded w-12" />
        </div>
      </div>
      <div className="h-4 bg-tertiary rounded w-16" />
      <div className="h-4 bg-tertiary rounded w-10" />
      <div className="h-8 bg-tertiary rounded w-20" />
    </div>
  );
}

export function TorrentList({ torrents, loading, onPlay }: TorrentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TorrentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (torrents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Раздачи не найдены</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {torrents.map((torrent, index) => (
        <TorrentItem key={index} torrent={torrent} onPlay={onPlay} />
      ))}
    </div>
  );
}
