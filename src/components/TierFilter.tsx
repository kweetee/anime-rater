import type { AnimeKind, Tag } from '../types'
import { KIND_LABELS } from '../lib/animeKinds'
import { TagChip } from './TagChip'

interface TierFilterProps {
  kinds: AnimeKind[] // какие типы есть среди аниме
  selectedKinds: AnimeKind[]
  onToggleKind: (kind: AnimeKind) => void
  tags: Tag[]
  selectedTagIds: number[]
  onToggleTag: (id: number) => void
  onReset: () => void
  shownCount: number
  totalCount: number
}

const CAPTION = 'mb-1.5 text-xs text-slate-500 dark:text-slate-400'

// Фильтр для тир-листа: типы (любой из выбранных) и метки (нужны все выбранные)
export function TierFilter({
  kinds,
  selectedKinds,
  onToggleKind,
  tags,
  selectedTagIds,
  onToggleTag,
  onReset,
  shownCount,
  totalCount,
}: TierFilterProps) {
  if (tags.length === 0 && kinds.length === 0) return null
  const hasFilter = selectedTagIds.length > 0 || selectedKinds.length > 0

  return (
    <div className="space-y-3">
      {kinds.length > 0 && (
        <div>
          <p className={CAPTION}>Тип</p>
          <div className="flex flex-wrap gap-2">
            {kinds.map((kind) => (
              <TagChip
                key={kind}
                label={KIND_LABELS[kind]}
                selected={selectedKinds.includes(kind)}
                onClick={() => onToggleKind(kind)}
              />
            ))}
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <div>
          <p className={CAPTION}>Метки</p>
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
        </div>
      )}
      {hasFilter && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Показано: {shownCount} из {totalCount}
            {selectedTagIds.length > 1 && ' (нужны все выбранные метки)'}
          </span>
          <button
            type="button"
            className="min-h-9 px-1 underline hover:text-slate-900 dark:hover:text-white"
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
