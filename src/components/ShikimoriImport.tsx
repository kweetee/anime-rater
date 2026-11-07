import { useState } from 'react'
import type { FormEvent } from 'react'
import { importFromShikimori } from '../db/shikimoriImport'
import type { ImportProgress, ShikimoriImportResult } from '../db/shikimoriImport'
import { HAS_IMAGE_PROXY, ShikimoriError } from '../lib/shikimori'
import { INPUT_CLASSES } from '../lib/formStyles'

// Постоянный блок на главной: ввод ника на Шикимори и импорт списка «просмотрено».

const NICK_STORAGE_KEY = 'anime-rater-shikimori-nick'

function loadNick(): string {
  try {
    return localStorage.getItem(NICK_STORAGE_KEY) ?? ''
  } catch {
    return '' // localStorage недоступен: не страшно
  }
}

function saveNick(nick: string) {
  try {
    localStorage.setItem(NICK_STORAGE_KEY, nick)
  } catch {
    // не сохранилось: не страшно
  }
}

// Текст под полем ввода во время импорта
function progressText(progress: ImportProgress): string {
  if (progress.stage === 'list') return `Загружаю список… найдено: ${progress.loaded}`
  if (progress.stage === 'covers') {
    return `Загружаю обложки: ${progress.done} из ${progress.total}`
  }
  return 'Сохраняю в базу…'
}

// Итог импорта строками
function resultLines(result: ShikimoriImportResult): string[] {
  const lines: string[] = []
  if (result.found === 0) {
    return ['В списке «просмотрено» ничего нет. Возможно, список скрыт в настройках приватности Шикимори.']
  }
  lines.push(
    `Готово. Добавлено: ${result.added}, пропущено (уже есть в списке): ${result.skipped}.`,
  )
  if (result.withoutRating > 0) {
    lines.push(`Без оценки: ${result.withoutRating}. Поставьте им оценки вручную.`)
  }
  if (result.covers > 0 || result.coverErrors > 0) {
    lines.push(`Обложек загружено: ${result.covers}, не загрузилось: ${result.coverErrors}.`)
  }
  if (result.coversStopped) {
    lines.push('Обложки остановлены: посредник не отвечает. Остальные аниме добавлены без обложек.')
  }
  return lines
}

export function ShikimoriImport() {
  const [nick, setNick] = useState(loadNick)
  const [withCovers, setWithCovers] = useState(HAS_IMAGE_PROXY)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [result, setResult] = useState<ShikimoriImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanNick = nick.trim()
    if (cleanNick === '' || busy) return

    saveNick(cleanNick)
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const importResult = await importFromShikimori(cleanNick, withCovers, setProgress)
      setResult(importResult)
    } catch (err) {
      setError(
        err instanceof ShikimoriError
          ? err.message
          : `Не удалось выполнить импорт: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`,
      )
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const coversPercent =
    progress?.stage === 'covers' && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0

  return (
    <section
      aria-label="Импорт из Шикимори"
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">Импорт из Шикимори</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Добавит аниме со статусом «просмотрено» и вашими оценками. Названия, которые уже есть в
        списке, пропускаются. Список на Шикимори должен быть открыт для всех.
      </p>

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={nick}
          placeholder="Ник на Шикимори"
          aria-label="Ник на Шикимори"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={busy}
          className={INPUT_CLASSES}
          onChange={(event) => setNick(event.target.value)}
        />
        <button
          type="submit"
          disabled={busy || nick.trim() === ''}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? 'Импортирую…' : 'Импортировать'}
        </button>
      </form>

      <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={withCovers && HAS_IMAGE_PROXY}
          disabled={busy || !HAS_IMAGE_PROXY}
          onChange={(event) => setWithCovers(event.target.checked)}
        />
        Загружать обложки (долго: около секунды на 3 аниме)
      </label>
      {!HAS_IMAGE_PROXY && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Обложки выключены: не подключён посредник Cloudflare. Адрес вписывается в
          src/lib/shikimori.ts (IMAGE_PROXY_URL).
        </p>
      )}

      {busy && progress && (
        <div className="space-y-1" role="status">
          <p className="text-sm text-slate-700 dark:text-slate-300">{progressText(progress)}</p>
          {progress.stage === 'covers' && (
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded bg-indigo-600"
                style={{ width: `${coversPercent}%` }}
              />
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Не закрывайте вкладку, пока идёт импорт.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {result && (
        <div role="status" className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
          {resultLines(result).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export default ShikimoriImport
