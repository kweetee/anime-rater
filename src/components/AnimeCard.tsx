import { Link } from 'react-router-dom'
import type { Anime, Tag } from '../types'
import { AnimeImage } from './AnimeImage'
import { ReferenceBadge } from './ReferenceBadge'
import { cardStateClasses } from '../lib/styles'

interface AnimeCardProps {
  anime: Anime
  tags: Tag[] // уже найденные метки этого аниме
}

// Карточка в списке: картинка слева, название и метки по центру, оценка справа.
// Клик открывает форму редактирования.
export function AnimeCard({ anime, tags }: AnimeCardProps) {
  return (
    <Link
      to={`/anime/${anime.id}`}
      className={`flex items-center gap-3 rounded-xl border-2 p-2 text-slate-900 transition hover:brightness-105 dark:text-slate-100 ${cardStateClasses(anime.isReference)}`}
    >
      <AnimeImage
        blob={anime.image}
        alt={anime.title}
        className="h-24 w-16 shrink-0 rounded-lg"
      />

      {/* min-w-0 нужен, чтобы длинное название обрезалось, а не растягивало карточку */}
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate font-semibold">{anime.title}</h3>

        {anime.isReference && <ReferenceBadge />}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pr-2 text-2xl font-bold">
        {anime.rating ?? '—'}
      </div>
    </Link>
  )
}

export default AnimeCard
