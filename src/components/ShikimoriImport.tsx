import { useState } from 'react'
import type { FormEvent } from 'react'
import { importFromShikimori } from '../db/shikimoriImport'
import type { ImportProgress, ShikimoriImportResult } from '../db/shikimoriImport'
import { HAS_IMAGE_PROXY, ShikimoriError } from '../lib/shikimori'
import { BUTTON_PRIMARY_CLASSES, INPUT_CLASSES } from '../lib/formStyles'
import { Toggle } from './Toggle'

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
  if (progress.stage === 'genres') {
    return `Загружаю тип и жанры: ${progress.done} из ${progress.total}`
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
  if (result.updated > 0) {
    lines.push(`Тип и жанры дописаны у ${result.updated} аниме, которые уже были в списке.`)
  }
  if (result.withoutRating > 0) {
    lines.push(`Без оценки: ${result.withoutRating}. Поставьте им оценки вручную.`)
  }
  if (result.covers > 0 || result.coverErrors > 0) {
    lines.push(`Обложек загружено: ${result.covers}, не загрузилось: ${result.coverErrors}.`)
  }
  if (result.coversStopped) {
    lines.push('Обложки остановлены: посредник не отвечает. Остальные аниме добавлены без обложек.')
  }
  if (result.detailsStopped) {
    lines.push('Жанры остановлены: Шикимори не отвечает. Запустите импорт позже, недостающее дозагрузится.')
  } else if (result.detailErrors > 0) {
    lines.push(`Жанры не загрузились у ${result.detailErrors} аниме. Запустите импорт ещё раз.`)
  }
  return lines
}

export function ShikimoriImport() {
  const [nick, setNick] = useState(loadNick)
  const [withCovers, setWithCovers] = useState(HAS_IMAGE_PROXY)
  const [withGenres, setWithGenres] = useState(true)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [result, setResult] = useState<ShikimoriImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const coversOn = withCovers && HAS_IMAGE_PROXY

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanNick = nick.trim()
    if (cleanNick === '' || busy) return

    saveNick(cleanNick)
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const importResult = await importFromShikimori(cleanNick, coversOn, withGenres, setProgress)
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

  const percent =
    progress && (progress.stage === 'covers' || progress.stage === 'genres') && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0

  return (
    <section
      aria-label="Импорт из Шикимори"
      className="hub-block dark space-y-3 px-7 py-5"
    >
      <h2 className="text-base font-semibold text-white">Импорт из Шикимори</h2>

      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row">
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
            className={`${BUTTON_PRIMARY_CLASSES} shrink-0`}
          >
            {busy ? 'Импортирую…' : 'Импортировать'}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-5 text-slate-200">
          <Toggle
            label="Обложки"
            checked={coversOn}
            disabled={busy || !HAS_IMAGE_PROXY}
            title={HAS_IMAGE_PROXY ? undefined : 'Не подключён посредник (IMAGE_PROXY_URL в src/lib/shikimori.ts)'}
            onChange={() => setWithCovers((value) => !value)}
          />
          <Toggle
            label="Жанры"
            checked={withGenres}
            disabled={busy}
            onChange={() => setWithGenres((value) => !value)}
          />
        </div>
      </form>

      {busy && progress && (
        <div className="space-y-1" role="status">
          <p className="text-sm text-slate-200">{progressText(progress)}</p>
          {(progress.stage === 'covers' || progress.stage === 'genres') && (
            <div className="h-1.5 bg-slate-700">
              <div className="h-1.5 bg-white" style={{ width: `${percent}%` }} />
            </div>
          )}
          <p className="text-xs text-slate-400">Не закрывайте вкладку, пока идёт импорт.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {result && (
        <div role="status" className="space-y-1 text-sm text-slate-200">
          {resultLines(result).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export default ShikimoriImport
