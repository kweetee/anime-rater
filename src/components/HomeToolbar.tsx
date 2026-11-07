import type { Tag } from '../types'
import { SORT_OPTIONS } from '../lib/filterAnime'
import type { SortMode } from '../lib/filterAnime'
import { TagChip } from './TagChip'
import { INPUT_CLASSES } from '../lib/formStyles'
import {
  REFERENCE_TOGGLE_OFF_CLASSES,
  REFERENCE_TOGGLE_ON_CLASSES,
} from '../lib/styles'

interface HomeToolbarProps {
  query: string
  onQueryChange: (query: string) => void
  tags: Tag[]
  selectedTagIds: number[]
  onToggleTag: (id: number) => void
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
  onlyReferences: boolean
  onToggleReferences: () => void
  ratingFilter: number | null // фильтр «оценка = N» (из адреса /?rating=N)
  onClearRating: () => void
  foundCount: number
  totalCount: number
  hasFilters: boolean // включён ли поиск или фильтр
  onReset: () => void
}

const CHIP_BASE = 'rounded-full border px-3 py-1 text-sm transition'

// Панель над списком: поиск, сортировка, быстрые фильтры, метки, счётчик
export function HomeToolbar({
  query,
  onQueryChange,
  tags,
  selectedTagIds,
  onToggleTag,
  sortMode,
  onSortChange,
  onlyReferences,
  onToggleReferences,
  ratingFilter,
  onClearRating,
  foundCount,
  totalCount,
  hasFilters,
  onReset,
}: HomeToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          placeholder="Поиск по названию и комментарию"
          aria-label="Поиск"
          className={INPUT_CLASSES}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          value={sortMode}
          aria-label="Сортировка"
          className={`${INPUT_CLASSES} sm:w-64 sm:shrink-0`}
          onChange={(event) => onSortChange(event.target.value as SortMode)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Быстрые фильтры */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={onlyReferences}
          className={`${CHIP_BASE} ${
            onlyReferences
              ? REFERENCE_TOGGLE_ON_CLASSES
              : REFERENCE_TOGGLE_OFF_CLASSES
          }`}
          onClick={onToggleReferences}
        >
          ★ Только эталоны
        </button>
        {ratingFilter !== null && (
          <button
            type="button"
            title="Убрать фильтр по оценке"
            className={`${CHIP_BASE} border-indigo-600 bg-indigo-600 text-white`}
            onClick={onClearRating}
          >
            Оценка: {ratingFilter} ✕
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="space-y-1">
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
          {selectedTagIds.length > 1 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Показаны аниме, у которых есть все выбранные метки.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          {hasFilters
            ? `Найдено: ${foundCount} из ${totalCount}`
            : `Всего: ${totalCount}`}
        </span>
        {hasFilters && (
          <button
            type="button"
            className="underline hover:text-slate-700 dark:hover:text-slate-200"
            onClick={onReset}
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  )
}

export default HomeToolbar
