import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { readableTextColor } from '../lib/tierColors'

interface TierRowProps {
  dropId: string // 'tier-<id>' или 'tier-none'
  name: string
  color: string | null // null — строка «Без тира» (нейтральный цвет)
  isEmpty: boolean
  onEdit?: () => void // нет кнопки — нельзя редактировать («Без тира»)
  children: ReactNode
}

// Строка тира: слева цветная подпись, справа зона, куда можно бросать плитки
export function TierRow({
  dropId,
  name,
  color,
  isEmpty,
  onEdit,
  children,
}: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <div
        className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 p-1 text-center sm:w-24 ${
          color ? '' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
        }`}
        style={color ? { backgroundColor: color, color: readableTextColor(color) } : undefined}
      >
        <span className="break-words text-sm font-bold leading-tight">{name}</span>
        {onEdit && (
          <button
            type="button"
            aria-label={`Изменить тир ${name}`}
            className="rounded px-1.5 py-0.5 text-sm opacity-80 hover:bg-black/20 hover:opacity-100"
            onClick={onEdit}
          >
            ✎
          </button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-28 flex-1 flex-wrap content-start gap-2 p-2 transition-colors ${
          isOver
            ? 'bg-sky-100 dark:bg-sky-950'
            : 'bg-slate-50 dark:bg-slate-900/60'
        }`}
      >
        {children}
        {isEmpty && (
          <p className="self-center text-xs text-slate-400 dark:text-slate-500">
            Перетащи сюда аниме
          </p>
        )}
      </div>
    </div>
  )
}

export default TierRow
