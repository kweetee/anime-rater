import { Link } from 'react-router-dom'
import type { Anime } from '../types'
import { AnimeImage } from './AnimeImage'
import { cardStateClasses } from '../lib/styles'

// Компактная строка эталона для экрана калибровки.
// Стиль берётся из lib/styles.ts — такой же, как на главной.
export function ReferenceMiniCard({ anime }: { anime: Anime }) {
  return (
    <Link
      to={`/anime/${anime.id}`}
      className={`flex items-center gap-2 rounded-lg border-2 p-1.5 text-slate-900 transition hover:brightness-105 dark:text-slate-100 ${cardStateClasses(true)}`}
    >
      <AnimeImage
        blob={anime.image}
        alt={anime.title}
        className="h-14 w-10 shrink-0 rounded"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {anime.title}
      </span>
      <span className="shrink-0 pr-1 font-bold">{anime.rating}</span>
    </Link>
  )
}

export default ReferenceMiniCard
