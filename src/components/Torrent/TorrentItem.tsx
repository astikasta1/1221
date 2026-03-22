import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { formatBytes } from '../../lib/utils';
import type { TorrentResult } from '../../types/torrent';

interface TorrentItemProps {
  torrent: TorrentResult;
  onPlay: (magnetUri: string) => void;
}

export function TorrentItem({ torrent, onPlay }: TorrentItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border hover:border-accent/30 transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">
          {torrent.title}
        </h4>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="default">{torrent.source}</Badge>
          {torrent.quality && (
            <Badge variant="accent">{torrent.quality}</Badge>
          )}
          {torrent.audio && (
            <Badge variant="warning">{torrent.audio}</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm text-neutral-400">
            {formatBytes(torrent.size_bytes)}
          </p>
        </div>

        <div className="flex items-center gap-1 text-success">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5H7z" />
          </svg>
          <span className="text-sm font-medium">{torrent.seeders}</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onPlay(torrent.magnet_uri)}
        >
          Смотреть
        </Button>
      </div>
    </div>
  );
}
