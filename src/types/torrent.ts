export interface TorrentResult {
  title: string;
  magnet_uri: string;
  size_bytes: number;
  seeders: number;
  leechers: number;
  quality: string | null;
  source: string;
  audio: string | null;
}

export interface StreamInfo {
  url: string;
  file_name: string;
}

export interface StreamStatus {
  progress: number;
  download_speed: number;
  peers: number;
  state: string;
}
