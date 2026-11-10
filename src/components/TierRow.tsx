import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { readableTextColor } from '../lib/tierColors'

interface TierRowViewProps {
  name: string
  color: string | null // null — нейтральная строка («Без тира», «Без оценки»)
  isEmpty: boolean
  emptyText?: string
  compact?: boolean // низкая строка (для пустых строк в режиме «по оценкам»)
  onEdit?: () => void // нет кнопки — нельзя редактировать
  dropRef?: (element: HTMLElement | null) => void // зона, куда можно бросать плитки
  isOver?: boolean // над зоной сейчас перетаскивают плитку
  children: ReactNode
}

// Внешний вид строки: слева цветная подпись, справа плитки
export function TierRowView({
  name,
  color,
  isEmpty,
  emptyText = 'Перетащи сюда аниме',
  compact = false,
  onEdit,
  dropRef,
  isOver = false,
  children,
}: TierRowViewProps) {
  return (
    <div className="frame flex [--fw:2px]">
      <div
        className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1.5 p-1 text-center sm:w-24 ${
          color ? '' : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
        }`}
        style={color ? { backgroundColor: color, color: readableTextColor(color) } : undefined}
      >
        <span className="break-words text-base font-bold leading-tight">{name}</span>
        {onEdit && (
          <button
            type="button"
            aria-label={`Изменить тир ${name}`}
            className="min-h-8 bg-current/15 px-2.5 py-1.5 text-xs hover:bg-current/25"
            onClick={onEdit}
          >
            Правка
          </button>
        )}
      </div>
      <div
        ref={dropRef}
        className={`flex flex-1 flex-wrap content-start gap-2 p-2 transition-colors ${
          compact && isEmpty ? 'min-h-14' : 'min-h-28'
        } ${isOver ? 'bg-slate-200 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/60'}`}
      >
        {children}
        {isEmpty && (
          <p className="self-center text-xs text-slate-400 dark:text-slate-500">{emptyText}</p>
        )}
      </div>
    </div>
  )
}

interface TierRowProps extends Omit<TierRowViewProps, 'dropRef' | 'isOver'> {
  dropId: string // 'tier-<id>' или 'tier-none'
}

// Строка тира со своей зоной для перетаскивания
export function TierRow({ dropId, ...rest }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId })
  return <TierRowView {...rest} dropRef={setNodeRef} isOver={isOver} />
}

export default TierRow
