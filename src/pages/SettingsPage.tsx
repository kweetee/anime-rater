import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import {
  clearAllData,
  createBackup,
  importBackup,
  parseBackup,
  type BackupFile,
  type ImportMode,
} from '../db/backup'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ImportDialog } from '../components/ImportDialog'
import { ErrorBanner } from '../components/ErrorBanner'
import { ThemeToggle } from '../components/ThemeToggle'
import { BUTTON_DANGER_CLASSES, BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

interface Message {
  kind: 'error' | 'success'
  text: string
}

// Страница «Данные»: экспорт, импорт и очистка
export default function SettingsPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [pending, setPending] = useState<BackupFile | null>(null) // прочитанный файл, ждёт выбора режима
  const [busy, setBusy] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  // Сколько сейчас данных в приложении
  const counts = useLiveQuery(async () => ({
    anime: await db.anime.count(),
    tags: await db.tags.count(),
  }))

  async function handleExport() {
    setBusy(true)
    setMessage(null)
    try {
      const backup = await createBackup()
      const json = JSON.stringify(backup)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `anime-rater-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setMessage({
        kind: 'success',
        text: `Файл сохранён: аниме — ${backup.anime.length}, меток — ${backup.tags.length}.`,
      })
    } catch (error) {
      setMessage({ kind: 'error', text: `Не удалось сохранить: ${errorText(error)}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // чтобы тот же файл можно было выбрать повторно
    if (!file) return
    setMessage(null)
    try {
      const backup = parseBackup(await file.text())
      if (backup.anime.length === 0 && backup.tags.length === 0) {
        setMessage({ kind: 'error', text: 'В файле нет данных для импорта.' })
        return
      }
      setPending(backup)
    } catch (error) {
      setMessage({ kind: 'error', text: errorText(error) })
    }
  }

  async function handleImport(mode: ImportMode) {
    if (!pending) return
    setBusy(true)
    try {
      const result = await importBackup(pending, mode)
      setPending(null)
      setMessage({
        kind: 'success',
        text:
          mode === 'replace'
            ? `Данные заменены. Аниме в базе: ${result.added}.`
            : `Добавлено аниме: ${result.added}, пропущено дубликатов: ${result.skipped}.`,
      })
    } catch (error) {
      setPending(null)
      setMessage({ kind: 'error', text: `Импорт не удался: ${errorText(error)}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleClear() {
    setConfirmClear(false)
    setBusy(true)
    try {
      await clearAllData()
      setMessage({ kind: 'success', text: 'Все данные удалены.' })
    } catch (error) {
      setMessage({ kind: 'error', text: `Не удалось очистить: ${errorText(error)}` })
    } finally {
      setBusy(false)
    }
  }

  const sectionClass =
    'space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Данные</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {counts
            ? `Сейчас в приложении: аниме — ${counts.anime}, меток — ${counts.tags}.`
            : 'Загрузка…'}
        </p>
      </div>

      {message && (
        <ErrorBanner kind={message.kind} onClose={() => setMessage(null)}>
          {message.text}
        </ErrorBanner>
      )}

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">Оформление</h2>
        <ThemeToggle />
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">Резервная копия</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Данные хранятся только в этом браузере на этом устройстве. Телефон и компьютер не
          синхронизируются сами: чтобы перенести данные, сохраните файл здесь и загрузите его на
          другом устройстве через «Импорт». Делайте копию время от времени: если очистить данные
          браузера, всё пропадёт.
        </p>
        <button
          type="button"
          className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={busy}
          onClick={handleExport}
        >
          Скачать резервную копию (JSON)
        </button>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">Импорт</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Выберите JSON-файл, сохранённый этим приложением. Перед импортом вы выберете: добавить к
          текущим данным или заменить всё.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChosen}
        />
        <button
          type="button"
          className={`${BUTTON_SECONDARY_CLASSES} min-h-11`}
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          Выбрать файл…
        </button>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold">Очистка</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Удаляет все аниме, метки и ваши описания оценок. Тиры и описания вернутся к стандартным.
          Сначала сохраните резервную копию.
        </p>
        <button
          type="button"
          className={`${BUTTON_DANGER_CLASSES} min-h-11`}
          disabled={busy}
          onClick={() => setConfirmClear(true)}
        >
          Удалить все данные
        </button>
      </section>

      {pending && (
        <ImportDialog
          backup={pending}
          busy={busy}
          onConfirm={handleImport}
          onCancel={() => setPending(null)}
        />
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Удалить все данные?"
        message="Все аниме, метки, картинки и ваши описания оценок будут удалены безвозвратно."
        confirmText="Удалить всё"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}

// Достаёт текст из любой ошибки
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'неизвестная ошибка'
}
