import { useDraggable } from '@dnd-kit/core'
import type { Anime } from '../types'
import { AnimeImage } from './AnimeImage'
import { cardStateClasses, REFERENCE_STAR_CLASSES } from '../lib/styles'

// Внешний вид плитки (без логики перетаскивания).
// Используется и в списке, и в DragOverlay (то, что «летит» за пальцем).
export function TierTileView({ anime }: { anime: Anime }) {
  return (
    <div
      className={`relative w-20 select-none overflow-hidden rounded-md border-2 sm:w-24 ${cardStateClasses(anime.isReference)}`}
    >
      {/* pointer-events-none: чтобы картинку нельзя было «схватить» отдельно */}
      <div className="pointer-events-none">
        <AnimeImage
          blob={anime.image}
          alt={anime.title}
          className="h-24 w-full sm:h-28"
        />
      </div>
      {anime.isReference && (
        <span className={REFERENCE_STAR_CLASSES} title="Эталон">
          ★
        </span>
      )}
      {anime.rating !== null && (
        <span className="absolute right-0.5 top-0.5 rounded bg-black/70 px-1 text-[10px] font-semibold text-white">
          {anime.rating}
        </span>
      )}
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
      className={`cursor-grab rounded-md ${isDragging ? 'opacity-30' : ''}`}
      onClick={() => onOpen(anime.id)}
    >
      <TierTileView anime={anime} />
    </div>
  )
}

export default TierTile
