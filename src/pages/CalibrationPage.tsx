import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_HINTS } from '../db/db'
import type { Anime } from '../types'
import { RatingBlock } from '../components/RatingBlock'
import { Spinner } from '../components/Spinner'

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1)

// Калибровка: для каждого балла 1–10 описание, эталоны и ссылка на все аниме
export default function CalibrationPage() {
  const hints = useLiveQuery(() => db.ratingHints.toArray())
  const animeList = useLiveQuery(() => db.anime.toArray())

  // Группируем аниме по целой оценке: «оценка → сколько всего», «оценка → эталоны»
  const { all, refs, halfRefs } = useMemo(() => {
    const all = new Map<number, number>()
    const refs = new Map<number, Anime[]>()
    let halfRefs = 0
    for (const anime of animeList ?? []) {
      if (anime.rating === null) continue
      all.set(anime.rating, (all.get(anime.rating) ?? 0) + 1)
      if (!anime.isReference) continue
      if (!Number.isInteger(anime.rating)) {
        halfRefs += 1 // эталон с дробной оценкой в блоки не попадает
        continue
      }
      const list = refs.get(anime.rating) ?? []
      list.push(anime)
      refs.set(anime.rating, list)
    }
    return { all, refs, halfRefs }
  }, [animeList])

  if (hints === undefined || animeList === undefined) {
    return <Spinner />
  }

  const hintMap = new Map(hints.map((hint) => [hint.score, hint.description]))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Калибровка
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Я оцениваю аниме целиком, по общему ощущению (вайбу). Описания можно
          переписать под себя, они сохраняются сами.
        </p>
      </div>

      {halfRefs > 0 && (
        <p className="rounded-lg border border-yellow-500 p-2 text-sm text-slate-700 dark:text-slate-300">
          Эталонов с дробной оценкой: {halfRefs}. Они не показаны в блоках,
          откройте их в форме и поставьте целую оценку.
        </p>
      )}

      {SCORES.map((score) => (
        <RatingBlock
          key={score}
          score={score}
          savedDescription={hintMap.get(score) ?? DEFAULT_HINTS[score] ?? ''}
          references={refs.get(score) ?? []}
          totalCount={all.get(score) ?? 0}
        />
      ))}
    </div>
  )
}
