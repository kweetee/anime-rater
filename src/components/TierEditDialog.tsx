import { useState } from 'react'
import type { Tier } from '../types'
import { TIER_COLORS } from '../lib/tierColors'
import { updateTier, deleteTier, moveTier } from '../db/tierActions'
import { INPUT_CLASSES } from '../lib/formStyles'

interface TierEditDialogProps {
  tier: Tier
  isFirst: boolean
  isLast: boolean
  onClose: () => void
}

const BUTTON =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800'

// Окно редактирования тира: название, цвет, порядок, удаление.
// Название и цвет сохраняются кнопкой «Сохранить», порядок меняется сразу.
export function TierEditDialog({ tier, isFirst, isLast, onClose }: TierEditDialogProps) {
  const [name, setName] = useState(tier.name)
  const [color, setColor] = useState(tier.color)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    await updateTier(tier.id, { name, color })
    onClose()
  }

  async function handleDelete() {
    await deleteTier(tier.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Редактирование тира"
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-4 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold">Редактирование тира</h2>

        <label className="block space-y-1 text-sm">
          <span>Название</span>
          <input
            type="text"
            value={name}
            maxLength={20}
            className={INPUT_CLASSES}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="space-y-1 text-sm">
          <span>Цвет</span>
          <div className="flex flex-wrap gap-2">
            {TIER_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                aria-label={`Цвет ${item}`}
                aria-pressed={color === item}
                className={`h-9 w-9 rounded-full border-2 ${
                  color === item ? 'border-slate-900 dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className={BUTTON} disabled={isFirst} onClick={() => moveTier(tier.id, -1)}>
            ↑ Выше
          </button>
          <button type="button" className={BUTTON} disabled={isLast} onClick={() => moveTier(tier.id, 1)}>
            ↓ Ниже
          </button>
        </div>

        {confirmDelete ? (
          <div className="space-y-2 rounded-lg border border-red-500 p-3 text-sm">
            <p>Удалить тир? Аниме из него перейдут в «Без тира».</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                onClick={handleDelete}
              >
                Да, удалить
              </button>
              <button type="button" className={BUTTON} onClick={() => setConfirmDelete(false)}>
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-sm text-red-500 underline"
            onClick={() => setConfirmDelete(true)}
          >
            Удалить тир
          </button>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <button type="button" className={BUTTON} onClick={onClose}>
            Закрыть
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-40"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}

export default TierEditDialog
