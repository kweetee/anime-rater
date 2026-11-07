import type { Tag } from '../types'
import { TagChip } from './TagChip'

interface TierFilterProps {
  tags: Tag[]
  selectedTagIds: number[]
  onToggleTag: (id: number) => void
  onReset: () => void
  shownCount: number
  totalCount: number
}

// Фильтр по меткам для тир-листа (режим «И», как на главной)
export function TierFilter({
  tags,
  selectedTagIds,
  onToggleTag,
  onReset,
  shownCount,
  totalCount,
}: TierFilterProps) {
  if (tags.length === 0) return null
  const hasFilter = selectedTagIds.length > 0

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.name}
            selected={selectedTagIds.includes(tag.id)}
            onClick={() => onToggleTag(tag.id)}
          />
        ))}
      </div>
      {hasFilter && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Показано: {shownCount} из {totalCount}
            {selectedTagIds.length > 1 && ' (нужны все выбранные метки)'}
          </span>
          <button
            type="button"
            className="underline hover:text-slate-700 dark:hover:text-slate-200"
            onClick={onReset}
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  )
}

export default TierFilter
