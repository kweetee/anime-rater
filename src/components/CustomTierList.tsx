import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { moveAnimeToTier, createTier } from '../db/tierActions'
import { fillTiersFromRatings, resetPlacements } from '../db/layoutActions'
import type { Anime, Tier } from '../types'
import { TierRow } from './TierRow'
import { TierTile, TierTileView } from './TierTile'
import { TierEditDialog } from './TierEditDialog'
import { LayoutsDialog } from './LayoutsDialog'
import { ConfirmDialog } from './ConfirmDialog'
import { BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

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

interface CustomTierListProps {
  tiers: Tier[]
  allAnime: Anime[] // все аниме (нужны, чтобы правильно понять, откуда и куда перетащили)
  visibleAnime: Anime[] // аниме после фильтра по типам и меткам
}

type ConfirmKind = 'reset' | 'fill' | null

// Свой тир-лист: тиры можно добавлять и менять, аниме перетаскиваются мышью или пальцем
export function CustomTierList({ tiers, allAnime, visibleAnime }: CustomTierListProps) {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [editingTierId, setEditingTierId] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<ConfirmKind>(null)
  const [layoutsOpen, setLayoutsOpen] = useState(false)
  // true во время перетаскивания и миг после: защита от случайного «клика» по плитке
  const justDragged = useRef(false)

  // Мышь: перетаскивание после сдвига на 6px.
  // Палец: после удержания 200 мс (быстрый свайп — это прокрутка страницы).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  // Раскладываем аниме по тирам. Ключ null — «Без тира» (туда же попадает аниме с несуществующим tierId).
  const groups = useMemo(() => {
    const map = new Map<number | null, Anime[]>()
    const validIds = new Set(tiers.map((tier) => tier.id))
    for (const anime of visibleAnime) {
      const key = anime.tierId !== null && validIds.has(anime.tierId) ? anime.tierId : null
      const list = map.get(key) ?? []
      list.push(anime)
      map.set(key, list)
    }
    for (const list of map.values()) list.sort(compareTiles)
    return map
  }, [tiers, visibleAnime])

  const activeAnime = allAnime.find((anime) => anime.id === activeId) ?? null
  const editingIndex = tiers.findIndex((tier) => tier.id === editingTierId)
  const editingTier = editingIndex >= 0 ? tiers[editingIndex] : null

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
    const anime = allAnime.find((item) => item.id === animeId)
    if (!anime) return
    // Тот же тир (с учётом «битого» tierId) — ничего не пишем в базу
    const currentKey =
      anime.tierId !== null && tiers.some((tier) => tier.id === anime.tierId)
        ? anime.tierId
        : null
    if (currentKey === targetTierId) return
    await moveAnimeToTier(animeId, targetTierId)
  }

  async function handleAddTier() {
    const id = await createTier()
    setEditingTierId(id)
  }

  async function handleConfirm() {
    const kind = confirm
    setConfirm(null)
    if (kind === 'reset') await resetPlacements()
    if (kind === 'fill') await fillTiersFromRatings()
  }

  function renderTiles(list: Anime[] | undefined) {
    return (list ?? []).map((anime) => (
      <TierTile key={anime.id} anime={anime} onOpen={handleOpen} />
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={BUTTON_SECONDARY_CLASSES} onClick={() => setConfirm('fill')}>
          Заполнить по оценкам
        </button>
        <button type="button" className={BUTTON_SECONDARY_CLASSES} onClick={() => setConfirm('reset')}>
          Сбросить
        </button>
        <button type="button" className={BUTTON_SECONDARY_CLASSES} onClick={() => setLayoutsOpen(true)}>
          Раскладки
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={finishDrag}
      >
        <div className="space-y-3">
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
            <div className="rotate-3">
              <TierTileView anime={activeAnime} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        type="button"
        className="min-h-10 border border-dashed border-slate-400 px-5 py-2 text-sm hover:border-slate-900 dark:border-slate-600 dark:hover:border-white"
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

      {layoutsOpen && <LayoutsDialog onClose={() => setLayoutsOpen(false)} />}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'fill' ? 'Заполнить по оценкам?' : 'Сбросить тир-лист?'}
        message={
          confirm === 'fill'
            ? 'Текущие тиры будут заменены на 10, 9 … 1, аниме встанут по оценкам. Если тир-лист нужен, сначала сохраните его в «Раскладках».'
            : 'Все аниме вернутся в «Без тира». Сами тиры останутся.'
        }
        confirmText={confirm === 'fill' ? 'Заполнить' : 'Сбросить'}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

export default CustomTierList
