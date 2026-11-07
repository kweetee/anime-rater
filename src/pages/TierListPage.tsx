import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { db } from '../db/db'
import { moveAnimeToTier, createTier } from '../db/tierActions'
import type { Anime } from '../types'
import { TierRow } from '../components/TierRow'
import { TierTile, TierTileView } from '../components/TierTile'
import { TierFilter } from '../components/TierFilter'
import { TierEditDialog } from '../components/TierEditDialog'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'

const NONE_DROP_ID = 'tier-none'

// Внутри тира: сначала высокая оценка, без оценки в конце, дальше по названию
function compareTiles(a: Anime, b: Anime): number {
  if (a.rating !== b.rating) {
    if (a.rating === null) return 1
    if (b.rating === null) return -1
    return b.rating - a.rating
  }
  return a.title.localeCompare(b.title, 'ru')
}

export default function TierListPage() {
  const navigate = useNavigate()
  const tiers = useLiveQuery(() => db.tiers.orderBy('order').toArray())
  const animeList = useLiveQuery(() => db.anime.toArray())
  const tags = useLiveQuery(() => db.tags.toArray())

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [editingTierId, setEditingTierId] = useState<number | null>(null)
  // true во время перетаскивания и миг после: защита от случайного «клика» по плитке
  const justDragged = useRef(false)

  // Мышь: перетаскивание после сдвига на 6px.
  // Палец: после удержания 200 мс (быстрый свайп — это прокрутка страницы).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  // Раскладываем аниме по тирам с учётом фильтра по меткам.
  // Ключ null — «Без тира» (туда же попадает аниме с несуществующим tierId).
  const groups = useMemo(() => {
    const map = new Map<number | null, Anime[]>()
    if (!tiers || !animeList) return map
    const validIds = new Set(tiers.map((tier) => tier.id))
    for (const anime of animeList) {
      if (!selectedTagIds.every((id) => anime.tagIds.includes(id))) continue
      const key =
        anime.tierId !== null && validIds.has(anime.tierId) ? anime.tierId : null
      const list = map.get(key) ?? []
      list.push(anime)
      map.set(key, list)
    }
    for (const list of map.values()) list.sort(compareTiles)
    return map
  }, [tiers, animeList, selectedTagIds])

  if (!tiers || !animeList || !tags) {
    return <Spinner />
  }

  const shownCount = Array.from(groups.values()).reduce((sum, list) => sum + list.length, 0)
  const activeAnime = animeList.find((anime) => anime.id === activeId) ?? null
  const editingIndex = tiers.findIndex((tier) => tier.id === editingTierId)
  const editingTier = editingIndex >= 0 ? tiers[editingIndex] : null

  function toggleTag(id: number) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id],
    )
  }

  function handleOpen(id: number) {
    if (justDragged.current) return
    navigate(`/anime/${id}`)
  }

  function handleDragStart(event: DragStartEvent) {
    justDragged.current = true
    setActiveId(Number(String(event.active.id).replace('anime-', '')))
  }

  function finishDrag() {
    setActiveId(null)
    // Снимаем защиту от клика чуть позже, когда событие клика уже прошло
    setTimeout(() => {
      justDragged.current = false
    }, 150)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const animeId = Number(String(event.active.id).replace('anime-', ''))
    const overId = event.over ? String(event.over.id) : null
    finishDrag()
    if (!overId) return // бросили мимо строк — ничего не меняем

    const targetTierId = overId === NONE_DROP_ID ? null : Number(overId.replace('tier-', ''))
    const anime = animeList?.find((item) => item.id === animeId)
    if (!anime) return
    // Тот же тир (с учётом «битого» tierId) — ничего не пишем в базу
    const currentKey =
      anime.tierId !== null && tiers?.some((tier) => tier.id === anime.tierId)
        ? anime.tierId
        : null
    if (currentKey === targetTierId) return
    await moveAnimeToTier(animeId, targetTierId)
  }

  async function handleAddTier() {
    const id = await createTier()
    setEditingTierId(id)
  }

  function renderTiles(list: Anime[] | undefined) {
    return (list ?? []).map((anime) => (
      <TierTile key={anime.id} anime={anime} onOpen={handleOpen} />
    ))
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Тир-лист</h1>

      {animeList.length === 0 && (
        <EmptyState message="Пока нечего раскладывать по тирам. Сначала добавьте аниме.">
          <Link
            to="/anime/new"
            className="inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            + Добавить аниме
          </Link>
        </EmptyState>
      )}

      <TierFilter
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        onReset={() => setSelectedTagIds([])}
        shownCount={shownCount}
        totalCount={animeList.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={finishDrag}
      >
        <div className="space-y-2">
          {tiers.map((tier) => (
            <TierRow
              key={tier.id}
              dropId={`tier-${tier.id}`}
              name={tier.name}
              color={tier.color}
              isEmpty={!groups.get(tier.id)?.length}
              onEdit={() => setEditingTierId(tier.id)}
            >
              {renderTiles(groups.get(tier.id))}
            </TierRow>
          ))}

          <TierRow
            dropId={NONE_DROP_ID}
            name="Без тира"
            color={null}
            isEmpty={!groups.get(null)?.length}
          >
            {renderTiles(groups.get(null))}
          </TierRow>
        </div>

        {/* Копия плитки, которая «летит» за пальцем (не обрезается контейнерами) */}
        <DragOverlay>
          {activeAnime ? (
            <div className="rotate-3 shadow-xl">
              <TierTileView anime={activeAnime} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        type="button"
        className="min-h-11 rounded-lg border border-dashed border-slate-400 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        onClick={handleAddTier}
      >
        + Добавить тир
      </button>

      {editingTier && (
        <TierEditDialog
          key={editingTier.id}
          tier={editingTier}
          isFirst={editingIndex === 0}
          isLast={editingIndex === tiers.length - 1}
          onClose={() => setEditingTierId(null)}
        />
      )}
    </div>
  )
}
