import { Link } from 'react-router-dom'
import type { Anime, Tag } from '../types'
import { AnimeImage } from './AnimeImage'
import { RatingMark } from './RatingMark'
import { cardStateClasses } from '../lib/styles'
import { KIND_LABELS } from '../lib/animeKinds'
import type { ViewMode } from '../lib/useViewMode'

interface AnimeCardProps {
  anime: Anime
  tags: Tag[] // уже найденные метки этого аниме
  view: ViewMode
}

// Метки в строке списка: до 6, остальные сворачиваются в «+N»
function TagList({ tags, limit }: { tags: Tag[]; limit: number }) {
  if (tags.length === 0) return null
  const shown = tags.slice(0, limit)
  const hidden = tags.length - shown.length
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((tag) => (
        <span
          key={tag.id}
          className="border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          {tag.name}
        </span>
      ))}
      {hidden > 0 && (
        <span className="px-1 py-0.5 text-xs text-slate-500 dark:text-slate-400">+{hidden}</span>
      )}
    </div>
  )
}

// Карточка аниме. Два вида: «мелко» (постер в рамке с подписью) и «список» (строка).
// Клик открывает форму редактирования. Эталон отмечен звёздочкой рядом с оценкой.
export function AnimeCard({ anime, tags, view }: AnimeCardProps) {
  if (view === 'list') {
    return (
      <Link
        to={`/anime/${anime.id}`}
        className={`flex items-center gap-3 p-2 text-slate-900 transition-colors [--fw:2px] hover:[--fr:var(--color-indigo-500)] dark:text-slate-100 ${cardStateClasses(anime.isReference)}`}
      >
        <AnimeImage blob={anime.image} alt={anime.title} className="h-20 w-14 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-sm font-semibold">{anime.title}</h3>
          {anime.kind && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{KIND_LABELS[anime.kind]}</p>
          )}
          <TagList tags={tags} limit={6} />
        </div>
        <div className="shrink-0 pr-2">
          {anime.rating !== null || anime.isReference ? (
            <RatingMark rating={anime.rating} isReference={anime.isReference} className="text-xl" />
          ) : (
            <span className="text-xl text-slate-400">—</span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/anime/${anime.id}`}
      className={`flex flex-col text-slate-900 transition-colors [--fw:3px] hover:[--fr:var(--color-indigo-500)] dark:text-slate-100 ${cardStateClasses(anime.isReference)}`}
    >
      {/* Картинка с небольшим полем внутри рамки */}
      <div className="p-1">
        <div className="relative">
          <AnimeImage blob={anime.image} alt={anime.title} className="aspect-[2/3] w-full" />
          <RatingMark
            rating={anime.rating}
            isReference={anime.isReference}
            className="absolute bottom-0 right-0 bg-black/85 px-1.5 py-1 text-xs text-white"
          />
        </div>
      </div>

      {/* Подпись внутри рамки, под картинкой */}
      <div className="px-1.5 pb-1.5 pt-0.5">
        <h3 className="line-clamp-2 min-h-8 text-xs font-medium leading-snug">{anime.title}</h3>
      </div>
    </Link>
  )
}

export default AnimeCard
