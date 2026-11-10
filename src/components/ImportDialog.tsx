import { useEffect, useState } from 'react'
import type { BackupFile, ImportMode } from '../db/backup'
import { BUTTON_PRIMARY_CLASSES, BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

interface ImportDialogProps {
  backup: BackupFile
  busy: boolean
  onConfirm: (mode: ImportMode) => void
  onCancel: () => void
}

// Окно импорта: показывает, что внутри файла, и просит выбрать режим
export function ImportDialog({ backup, busy, onConfirm, onCancel }: ImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>('merge')

  // Escape закрывает окно (пока идёт импорт — нельзя)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel])

  const withImages = backup.anime.filter((item) => item.image).length
  const optionClass = (active: boolean) =>
    `flex min-h-11 cursor-pointer items-start gap-3 border p-3 text-sm ${
      active
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
        : 'border-slate-300 dark:border-slate-700'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Импорт данных"
        className="frame max-h-full w-full max-w-md space-y-4 overflow-y-auto bg-white p-5 [--fw:3px] dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Импорт данных
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          В файле: аниме — {backup.anime.length} (с картинками — {withImages}), меток —{' '}
          {backup.tags.length}, тиров — {backup.tiers.length}.
        </p>

        <div className="space-y-2">
          <label className={optionClass(mode === 'merge')}>
            <input
              type="radio"
              name="import-mode"
              className="mt-1"
              checked={mode === 'merge'}
              onChange={() => setMode('merge')}
            />
            <span>
              <b>Добавить к текущим</b>
              <br />
              Ничего не удаляется. Аниме с тем же названием пропускаются, метки и тиры с тем же
              названием объединяются.
            </span>
          </label>
          <label className={optionClass(mode === 'replace')}>
            <input
              type="radio"
              name="import-mode"
              className="mt-1"
              checked={mode === 'replace'}
              onChange={() => setMode('replace')}
            />
            <span>
              <b>Заменить всё</b>
              <br />
              Текущие данные будут удалены и заменены содержимым файла.
            </span>
          </label>
        </div>

        {mode === 'replace' && (
          <p className="border border-slate-900 dark:border-white p-2 text-sm text-slate-900 dark:text-slate-100">
            Внимание: это нельзя отменить. Если сомневаетесь, сначала сохраните текущие данные
            кнопкой «Скачать резервную копию».
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={BUTTON_SECONDARY_CLASSES}
            disabled={busy}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className={BUTTON_PRIMARY_CLASSES}
            disabled={busy}
            onClick={() => onConfirm(mode)}
          >
            {busy ? 'Импорт…' : 'Импортировать'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportDialog
