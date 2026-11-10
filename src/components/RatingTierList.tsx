import { useMemo } from 'react'
import type { Anime } from '../types'
import { RATING_SCORES, RATING_TIER_COLORS, ratingBucket } from '../lib/ratingTiers'
import { TierRowView } from './TierRow'
import { StaticTierTile } from './TierTile'

interface RatingTierListProps {
  anime: Anime[] // уже отфильтрованные по типам и меткам
  onOpen: (id: number) => void
}

// Тир-лист «по оценкам»: строки 10 ... 1 и «Без оценки». Аниме встают сами, перетаскивать не нужно.
export function RatingTierList({ anime, onOpen }: RatingTierListProps) {
  const groups = useMemo(() => {
    const map = new Map<number | null, Anime[]>()
    for (const item of anime) {
      const key = ratingBucket(item.rating)
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
    return map
  }, [anime])

  function renderTiles(list: Anime[] | undefined) {
    return (list ?? []).map((item) => <StaticTierTile key={item.id} anime={item} onOpen={onOpen} />)
  }

  return (
    <div className="space-y-3">
      {RATING_SCORES.map((score) => (
        <TierRowView
          key={score}
          name={String(score)}
          color={RATING_TIER_COLORS[score]}
          isEmpty={!groups.get(score)?.length}
          emptyText="Пусто"
          compact
        >
          {renderTiles(groups.get(score))}
        </TierRowView>
      ))}
      <TierRowView
        name="Без оценки"
        color={null}
        isEmpty={!groups.get(null)?.length}
        emptyText="Пусто"
        compact
      >
        {renderTiles(groups.get(null))}
      </TierRowView>
    </div>
  )
}

export default RatingTierList
