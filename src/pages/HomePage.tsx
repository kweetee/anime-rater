import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Tag } from '../types'
import { AnimeCard } from '../components/AnimeCard'
import { HomeToolbar } from '../components/HomeToolbar'
import { ShikimoriImport } from '../components/ShikimoriImport'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { filterAnime } from '../lib/filterAnime'
import type { SortMode } from '../lib/filterAnime'
import { BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

// Главная страница: список аниме с поиском, фильтрами и сортировкой.
export function HomePage() {
  const [query, setQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [sortMode, setSortMode] = useState<SortMode>('date-desc')
  const [onlyReferences, setOnlyReferences] = useState(false)

  // Фильтр по оценке хранится в адресе: /?rating=7 (работает кнопка «Назад»)
  const [searchParams, setSearchParams] = useSearchParams()
  const ratingParam = Number(searchParams.get('rating'))
  const ratingFilter =
    Number.isInteger(ratingParam) && ratingParam >= 1 && ratingParam <= 10
      ? ratingParam
      : null

  // useLiveQuery сам обновляет данные при любых изменениях в базе.
  // Пока данные грузятся, возвращает undefined.
  const animeList = useLiveQuery(() => db.anime.toArray())
  const tags = useLiveQuery(() => db.tags.toArray())

  // Метки по алфавиту
  const sortedTags = useMemo(
    () => [...(tags ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [tags],
  )

  // Словарь «id метки → метка»
  const tagMap = useMemo(() => {
    const map = new Map<number, Tag>()
    for (const tag of tags ?? []) map.set(tag.id, tag)
    return map
  }, [tags])

  // Выбранные метки без удалённых (если метку удалили в форме)
  const activeTagIds = useMemo(
    () => selectedTagIds.filter((id) => tagMap.has(id)),
    [selectedTagIds, tagMap],
  )

  const visibleAnime = useMemo(
    () =>
      filterAnime(animeList ?? [], {
        query,
        tagIds: activeTagIds,
        sortMode,
        onlyReferences,
        rating: ratingFilter,
      }),
    [animeList, query, activeTagIds, sortMode, onlyReferences, ratingFilter],
  )

  const hasFilters =
    query.trim() !== '' ||
    activeTagIds.length > 0 ||
    onlyReferences ||
    ratingFilter !== null

  function toggleTag(id: number) {
    setSelectedTagIds((current) =>
      current.includes(id)
        ? current.filter((tagId) => tagId !== id)
        : [...current, id],
    )
  }

  // Убирает из адреса только параметр rating
  function clearRating() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('rating')
        return next
      },
      { replace: true },
    )
  }

  function resetFilters() {
    setQuery('')
    setSelectedTagIds([])
    setOnlyReferences(false)
    clearRating()
  }

  const totalCount = animeList?.length ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Моё аниме
        </h1>
        <Link
          to="/anime/new"
          className="inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          + Добавить аниме
        </Link>
      </div>

      {/* Импорт списка «просмотрено» с Шикимори (всегда виден) */}
      <ShikimoriImport />

      {animeList === undefined && <Spinner />}

      {animeList !== undefined && totalCount > 0 && (
        <HomeToolbar
          query={query}
          onQueryChange={setQuery}
          tags={sortedTags}
          selectedTagIds={activeTagIds}
          onToggleTag={toggleTag}
          sortMode={sortMode}
          onSortChange={setSortMode}
          onlyReferences={onlyReferences}
          onToggleReferences={() => setOnlyReferences((value) => !value)}
          ratingFilter={ratingFilter}
          onClearRating={clearRating}
          foundCount={visibleAnime.length}
          totalCount={totalCount}
          hasFilters={hasFilters}
          onReset={resetFilters}
        />
      )}

      {/* Пустое состояние 1: в базе вообще ничего нет */}
      {animeList !== undefined && totalCount === 0 && (
        <EmptyState message="Список пуст. Добавьте первое аниме, чтобы начать калибровку оценок.">
          <Link
            to="/anime/new"
            className="inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            + Добавить аниме
          </Link>
        </EmptyState>
      )}

      {/* Пустое состояние 2: аниме есть, но поиск/фильтр ничего не нашёл */}
      {totalCount > 0 && visibleAnime.length === 0 && (
        <EmptyState message="Ничего не найдено. Измените запрос или снимите фильтры.">
          <button
            type="button"
            className={`${BUTTON_SECONDARY_CLASSES} min-h-11`}
            onClick={resetFilters}
          >
            Сбросить поиск и фильтры
          </button>
        </EmptyState>
      )}

      <div className="space-y-2">
        {visibleAnime.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            tags={anime.tagIds.flatMap((id) => {
              const tag = tagMap.get(id)
              return tag ? [tag] : []
            })}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage
