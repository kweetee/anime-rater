import type { AnimeKind, Tag } from '../types'
import { SORT_OPTIONS } from '../lib/filterAnime'
import type { SortMode } from '../lib/filterAnime'
import { VIEW_OPTIONS } from '../lib/useViewMode'
import type { ViewMode } from '../lib/useViewMode'
import { KIND_LABELS } from '../lib/animeKinds'
import { TagChip } from './TagChip'
import { Toggle } from './Toggle'
import { INPUT_CLASSES } from '../lib/formStyles'

interface HomeToolbarProps {
  query: string
  onQueryChange: (query: string) => void
  kinds: AnimeKind[] // какие типы есть среди аниме
  selectedKinds: AnimeKind[]
  onToggleKind: (kind: AnimeKind) => void
  tags: Tag[]
  selectedTagIds: number[]
  onToggleTag: (id: number) => void
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
  onlyReferences: boolean
  onToggleReferences: () => void
  ratingFilter: number | null // фильтр «оценка = N» (из адреса /?rating=N)
  onClearRating: () => void
  view: ViewMode
  onViewChange: (mode: ViewMode) => void
  foundCount: number
  totalCount: number
  hasFilters: boolean // включён ли поиск или фильтр
  onReset: () => void
}

const CAPTION = 'mb-1.5 text-xs text-slate-500 dark:text-slate-400'

// Панель над списком: поиск, сортировка, фильтры, вид списка, счётчик
export function HomeToolbar({
  query,
  onQueryChange,
  kinds,
  selectedKinds,
  onToggleKind,
  tags,
  selectedTagIds,
  onToggleTag,
  sortMode,
  onSortChange,
  onlyReferences,
  onToggleReferences,
  ratingFilter,
  onClearRating,
  view,
  onViewChange,
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

      {/* Быстрые фильтры и вид списка */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <Toggle label="Только эталоны" checked={onlyReferences} onChange={onToggleReferences} />
        {ratingFilter !== null && (
          <button
            type="button"
            title="Убрать фильтр по оценке"
            className="min-h-10 text-sm underline"
            onClick={onClearRating}
          >
            Оценка {ratingFilter}: сбросить
          </button>
        )}

        <div role="group" aria-label="Вид списка" className="ml-auto flex gap-4">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={view === option.value}
              className={`min-h-10 border-b-2 text-sm ${
                view === option.value
                  ? 'border-slate-900 font-semibold text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              onClick={() => onViewChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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
          {selectedTagIds.length > 1 && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Показаны аниме, у которых есть все выбранные метки.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {hasFilters
            ? `Найдено: ${foundCount} из ${totalCount}`
            : `Всего: ${totalCount}`}
        </span>
        {hasFilters && (
          <button
            type="button"
            className="min-h-9 px-1 underline hover:text-slate-900 dark:hover:text-white"
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
