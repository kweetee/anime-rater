import { useState } from 'react'
import type { Tier } from '../types'
import { TIER_COLORS } from '../lib/tierColors'
import { updateTier, deleteTier, moveTier } from '../db/tierActions'
import {
  BUTTON_DANGER_CLASSES,
  BUTTON_PRIMARY_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
} from '../lib/formStyles'

interface TierEditDialogProps {
  tier: Tier
  isFirst: boolean
  isLast: boolean
  onClose: () => void
}

const BUTTON =
  'min-h-10 border border-slate-400 bg-transparent px-3 py-2 text-xs text-slate-900 hover:border-indigo-500 disabled:opacity-40 dark:border-slate-600 dark:text-slate-100'

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Редактирование тира"
        className="frame w-full max-w-sm space-y-4 bg-white p-5 text-slate-900 [--fw:3px] dark:bg-slate-900 dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Редактирование тира</h2>

        <label className="block">
          <span className={LABEL_CLASSES}>Название</span>
          <input
            type="text"
            value={name}
            maxLength={20}
            className={INPUT_CLASSES}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div>
          <span className={LABEL_CLASSES}>Цвет</span>
          <div className="flex flex-wrap gap-2">
            {TIER_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                aria-label={`Цвет ${item}`}
                aria-pressed={color === item}
                className={`h-9 w-9 border-2 ${
                  color === item
                    ? 'border-slate-900 outline outline-2 outline-offset-1 outline-indigo-500 dark:border-white'
                    : 'border-slate-400/50'
                }`}
                style={{ backgroundColor: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className={BUTTON} disabled={isFirst} onClick={() => moveTier(tier.id, -1)}>
            Выше
          </button>
          <button type="button" className={BUTTON} disabled={isLast} onClick={() => moveTier(tier.id, 1)}>
            Ниже
          </button>
        </div>

        {confirmDelete ? (
          <div className="space-y-2 border border-slate-900 p-3 text-sm dark:border-white">
            <p>Удалить тир? Аниме из него перейдут в «Без тира».</p>
            <div className="flex gap-2">
              <button
                type="button"
                className={BUTTON_DANGER_CLASSES}
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
            className="text-sm text-slate-700 underline hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            onClick={() => setConfirmDelete(true)}
          >
            Удалить тир
          </button>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-300 pt-3 dark:border-slate-700">
          <button type="button" className={BUTTON} onClick={onClose}>
            Закрыть
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            className={BUTTON_PRIMARY_CLASSES}
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
