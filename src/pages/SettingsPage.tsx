import { useEffect, type FormEvent } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { QUALITY_OPTIONS, LANGUAGE_OPTIONS } from '../lib/constants';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Loader } from '../components/UI/Loader';
import { clsx } from '../lib/utils';

export function SettingsPage() {
  const {
    settings,
    loading,
    saving,
    jackettStatus,
    error,
    loadSettings,
    saveSettings,
    checkJackett,
    updateField,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
  };

  if (loading) {
    return <Loader className="py-40" size="lg" />;
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Настройки</h1>

      {error && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* TMDB */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">TMDB</h2>
          <Input
            label="TMDB API ключ"
            type="password"
            value={settings.tmdb_api_key}
            onChange={(e) => updateField('tmdb_api_key', e.target.value)}
            placeholder="Введите API ключ TMDB"
          />
        </section>

        {/* Jackett */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Jackett</h2>
          <div className="flex flex-col gap-4">
            <Input
              label="URL Jackett"
              value={settings.jackett_url}
              onChange={(e) => updateField('jackett_url', e.target.value)}
              placeholder="http://localhost:9117"
            />
            <Input
              label="API ключ Jackett"
              type="password"
              value={settings.jackett_api_key}
              onChange={(e) => updateField('jackett_api_key', e.target.value)}
              placeholder="Введите API ключ Jackett"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={checkJackett}
                disabled={jackettStatus === 'checking'}
              >
                {jackettStatus === 'checking' ? 'Проверка...' : 'Проверить'}
              </Button>
              {jackettStatus === 'connected' && (
                <span className="text-sm text-success">Подключено</span>
              )}
              {jackettStatus === 'failed' && (
                <span className="text-sm text-accent">Не удалось подключиться</span>
              )}
            </div>
          </div>
        </section>

        {/* Download */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Загрузка</h2>
          <Input
            label="Путь загрузки"
            value={settings.download_path}
            onChange={(e) => updateField('download_path', e.target.value)}
            placeholder="/path/to/downloads"
          />
        </section>

        {/* Quality & Language */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Предпочтения</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">
                Качество
              </label>
              <select
                value={settings.preferred_quality}
                onChange={(e) => updateField('preferred_quality', e.target.value)}
                className="w-full px-4 py-2.5 rounded-md text-sm bg-tertiary border border-border text-white focus:outline-none focus:border-accent transition-colors duration-200"
              >
                {QUALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">
                Язык
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateField('language', e.target.value)}
                className="w-full px-4 py-2.5 rounded-md text-sm bg-tertiary border border-border text-white focus:outline-none focus:border-accent transition-colors duration-200"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Stream port */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Стриминг</h2>
          <Input
            label="Порт стриминга"
            type="number"
            value={settings.stream_port.toString()}
            onChange={(e) => updateField('stream_port', parseInt(e.target.value, 10) || 8888)}
            placeholder="8888"
          />
        </section>

        {/* Toggles */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Прочее</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">Автовоспроизведение</span>
              <button
                type="button"
                onClick={() => updateField('autoplay', !settings.autoplay)}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors duration-200',
                  settings.autoplay ? 'bg-accent' : 'bg-border'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                    settings.autoplay ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">Торренты включены</span>
              <button
                type="button"
                onClick={() => updateField('torrent_enabled', !settings.torrent_enabled)}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors duration-200',
                  settings.torrent_enabled ? 'bg-accent' : 'bg-border'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                    settings.torrent_enabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </label>
          </div>
        </section>

        {/* Save */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={saving}
          className="mt-4"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </form>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-neutral-500 leading-relaxed">
        StreamZona предназначена исключительно для образовательных целей.
        Пользователь несёт полную ответственность за соблюдение авторских прав
        и законодательства своей страны. Разработчики не несут ответственности
        за использование приложения в противоправных целях.
      </p>
    </div>
  );
}
