import { useDraggable } from '@dnd-kit/core'
import type { Anime } from '../types'
import { AnimeImage } from './AnimeImage'
import { RatingMark } from './RatingMark'
import { cardStateClasses } from '../lib/styles'

// Внешний вид плитки (без логики перетаскивания).
// Используется и в списке, и в DragOverlay (то, что «летит» за пальцем).
export function TierTileView({ anime }: { anime: Anime }) {
  return (
    <div
      className={`relative w-20 select-none overflow-hidden [--fw:2px] sm:w-24 ${cardStateClasses(anime.isReference)}`}
    >
      {/* pointer-events-none: чтобы картинку нельзя было «схватить» отдельно */}
      <div className="pointer-events-none">
        <AnimeImage
          blob={anime.image}
          alt={anime.title}
          className="h-24 w-full sm:h-28"
        />
      </div>
      <RatingMark
        rating={anime.rating}
        isReference={anime.isReference}
        className="absolute bottom-7 right-0 bg-black/85 px-1.5 py-1 text-xs text-white"
      />
      <p className="line-clamp-2 min-h-8 break-words px-1 py-0.5 text-[11px] leading-tight">
        {anime.title}
      </p>
    </div>
  )
}

interface TierTileProps {
  anime: Anime
  onOpen: (id: number) => void
}

// Плитка, которую можно перетаскивать. Короткий тап открывает форму.
export function TierTile({ anime, onOpen }: TierTileProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `anime-${anime.id}`,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // manipulation: обычная прокрутка пальцем работает, пока не сработает удержание
      style={{ touchAction: 'manipulation', WebkitTouchCallout: 'none' }}
      className={`cursor-grab ${isDragging ? 'opacity-30' : ''}`}
      onClick={() => onOpen(anime.id)}
    >
      <TierTileView anime={anime} />
    </div>
  )
}

// Плитка без перетаскивания (режим «по оценкам»): тап открывает форму
export function StaticTierTile({ anime, onOpen }: TierTileProps) {
  return (
    <button
      type="button"
      className="block text-left"
      aria-label={anime.title}
      onClick={() => onOpen(anime.id)}
    >
      <TierTileView anime={anime} />
    </button>
  )
}

export default TierTile
