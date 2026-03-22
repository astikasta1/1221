export interface AppSettings {
  jackett_url: string;
  jackett_api_key: string;
  tmdb_api_key: string;
  download_path: string;
  preferred_quality: string;
  language: string;
  stream_port: number;
  autoplay: boolean;
  torrent_enabled: boolean;
}
