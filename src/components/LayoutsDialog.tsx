import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { deleteLayout, loadLayout, saveLayout } from '../db/layoutActions'
import { ConfirmDialog } from './ConfirmDialog'
import {
  BUTTON_DANGER_CLASSES,
  BUTTON_PRIMARY_CLASSES,
  BUTTON_SECONDARY_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
} from '../lib/formStyles'

interface LayoutsDialogProps {
  onClose: () => void
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU')
}

// Окно «Раскладки»: сохранить текущий тир-лист, загрузить или удалить сохранённый
export function LayoutsDialog({ onClose }: LayoutsDialogProps) {
  const layouts = useLiveQuery(() => db.layouts.orderBy('createdAt').reverse().toArray())
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ kind: 'load' | 'delete'; id: number } | null>(null)

  // Escape закрывает окно
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, pending])

  async function handleSave() {
    setBusy(true)
    setError('')
    try {
      await saveLayout(name)
      setName('')
    } catch {
      setError('Не удалось сохранить раскладку.')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm() {
    if (!pending) return
    const { kind, id } = pending
    setPending(null)
    setBusy(true)
    setError('')
    try {
      if (kind === 'load') {
        await loadLayout(id)
        onClose()
      } else {
        await deleteLayout(id)
      }
    } catch {
      setError('Не удалось выполнить действие.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Раскладки"
        className="frame max-h-full w-full max-w-md space-y-4 overflow-y-auto bg-white p-5 text-slate-900 [--fw:3px] dark:bg-slate-900 dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Раскладки</h2>

        <div>
          <label htmlFor="layout-name" className={LABEL_CLASSES}>
            Сохранить текущий тир-лист
          </label>
          <div className="flex gap-2">
            <input
              id="layout-name"
              type="text"
              value={name}
              maxLength={40}
              placeholder="Название"
              className={INPUT_CLASSES}
              onChange={(event) => setName(event.target.value)}
            />
            <button
              type="button"
              disabled={busy}
              className={`${BUTTON_PRIMARY_CLASSES} shrink-0`}
              onClick={() => void handleSave()}
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className={LABEL_CLASSES}>Сохранённые</p>
          {layouts === undefined && <p className="text-sm text-slate-500">Загрузка…</p>}
          {layouts !== undefined && layouts.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Пока ничего нет.</p>
          )}
          {layouts?.map((layout) => (
            <div
              key={layout.id}
              className="flex items-center gap-2 border border-slate-300 p-2 dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{layout.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(layout.createdAt)}, тиров: {layout.tiers.length}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                className={BUTTON_SECONDARY_CLASSES}
                onClick={() => setPending({ kind: 'load', id: layout.id })}
              >
                Загрузить
              </button>
              <button
                type="button"
                disabled={busy}
                className={BUTTON_DANGER_CLASSES}
                onClick={() => setPending({ kind: 'delete', id: layout.id })}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium">
            {error}
          </p>
        )}

        <div className="flex justify-end border-t border-slate-300 pt-3 dark:border-slate-700">
          <button type="button" className={BUTTON_SECONDARY_CLASSES} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'load' ? 'Загрузить раскладку?' : 'Удалить раскладку?'}
        message={
          pending?.kind === 'load'
            ? 'Текущий тир-лист будет заменён. Если он нужен, сначала сохраните его.'
            : 'Раскладка будет удалена. Аниме и текущий тир-лист не изменятся.'
        }
        confirmText={pending?.kind === 'load' ? 'Загрузить' : 'Удалить'}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

export default LayoutsDialog
