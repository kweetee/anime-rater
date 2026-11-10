import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { AnimeKind } from '../types'
import { KIND_ORDER } from '../lib/animeKinds'
import { useTierMode } from '../lib/useTierMode'
import type { TierMode } from '../lib/useTierMode'
import { RatingTierList } from '../components/RatingTierList'
import { CustomTierList } from '../components/CustomTierList'
import { TierFilter } from '../components/TierFilter'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { PageTitle } from '../components/PageTitle'
import { BUTTON_PRIMARY_CLASSES } from '../lib/formStyles'

const MODE_OPTIONS: { value: TierMode; label: string }[] = [
  { value: 'ratings', label: 'По оценкам' },
  { value: 'custom', label: 'Свой тир-лист' },
]

// Тир-лист: автоматически по оценкам или свой (с перетаскиванием и сохранёнными раскладками)
export default function TierListPage() {
  const navigate = useNavigate()
  const tiers = useLiveQuery(() => db.tiers.orderBy('order').toArray())
  const animeList = useLiveQuery(() => db.anime.toArray())
  const tags = useLiveQuery(() => db.tags.toArray())

  const [mode, setMode] = useTierMode()
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [selectedKinds, setSelectedKinds] = useState<AnimeKind[]>([])

  // Какие типы есть среди аниме (в фильтре показываем только их)
  const availableKinds = useMemo(() => {
    const present = new Set<AnimeKind>()
    for (const anime of animeList ?? []) {
      if (anime.kind) present.add(anime.kind)
    }
    return KIND_ORDER.filter((kind) => present.has(kind))
  }, [animeList])

  // Аниме после фильтра: метки (нужны все выбранные) и типы (подходит любой из выбранных)
  const visibleAnime = useMemo(
    () =>
      (animeList ?? []).filter((anime) => {
        if (!selectedTagIds.every((id) => anime.tagIds.includes(id))) return false
        const kind = anime.kind ?? null
        if (selectedKinds.length > 0 && (kind === null || !selectedKinds.includes(kind))) return false
        return true
      }),
    [animeList, selectedTagIds, selectedKinds],
  )

  if (!tiers || !animeList || !tags) {
    return <Spinner />
  }

  function toggleTag(id: number) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id],
    )
  }

  function toggleKind(kind: AnimeKind) {
    setSelectedKinds((prev) =>
      prev.includes(kind) ? prev.filter((item) => item !== kind) : [...prev, kind],
    )
  }

  return (
    <div className="space-y-4">
      <PageTitle>Тир-лист</PageTitle>

      {animeList.length === 0 && (
        <EmptyState message="Пока нечего раскладывать по тирам. Сначала добавьте аниме.">
          <Link
            to="/anime/new"
            className={`${BUTTON_PRIMARY_CLASSES} inline-flex items-center`}
          >
            + Добавить аниме
          </Link>
        </EmptyState>
      )}

      {/* Режим: по оценкам / свой */}
      <div role="group" aria-label="Режим тир-листа" className="flex gap-5">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={mode === option.value}
            className={`min-h-10 border-b-2 text-sm ${
              mode === option.value
                ? 'border-slate-900 font-semibold text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            onClick={() => setMode(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <TierFilter
        kinds={availableKinds}
        selectedKinds={selectedKinds}
        onToggleKind={toggleKind}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        onReset={() => {
          setSelectedTagIds([])
          setSelectedKinds([])
        }}
        shownCount={visibleAnime.length}
        totalCount={animeList.length}
      />

      {mode === 'ratings' ? (
        <RatingTierList anime={visibleAnime} onOpen={(id) => navigate(`/anime/${id}`)} />
      ) : (
        <CustomTierList tiers={tiers} allAnime={animeList} visibleAnime={visibleAnime} />
      )}
    </div>
  )
}
