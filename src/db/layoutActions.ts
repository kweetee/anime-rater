import { db } from './db'
import { RATING_SCORES, RATING_TIER_COLORS, ratingBucket } from '../lib/ratingTiers'

// Действия со своим тир-листом: сброс, заполнение по оценкам, сохранённые раскладки.

// Все аниме возвращаются в «Без тира» (сами тиры остаются)
export async function resetPlacements(): Promise<void> {
  await db.anime.toCollection().modify({ tierId: null })
}

// Заменяет тиры на 10, 9 ... 1 (серые) и ставит аниме по оценкам
export async function fillTiersFromRatings(): Promise<void> {
  await db.transaction('rw', db.anime, db.tiers, async () => {
    await db.tiers.clear()
    const rows = RATING_SCORES.map((score, index) => ({
      name: String(score),
      color: RATING_TIER_COLORS[score],
      order: index,
    }))
    const ids = (await db.tiers.bulkAdd(rows, { allKeys: true })) as number[]
    const idByScore = new Map<number, number>()
    RATING_SCORES.forEach((score, index) => idByScore.set(score, ids[index]))
    await db.anime.toCollection().modify((anime) => {
      const bucket = ratingBucket(anime.rating)
      anime.tierId = bucket === null ? null : (idByScore.get(bucket) ?? null)
    })
  })
}

// Сохраняет текущий тир-лист под названием. Возвращает id раскладки.
export async function saveLayout(name: string): Promise<number> {
  const [tiers, anime] = await Promise.all([db.tiers.orderBy('order').toArray(), db.anime.toArray()])
  const indexById = new Map<number, number>(tiers.map((tier, index) => [tier.id, index]))
  const assignments: [number, number][] = []
  for (const item of anime) {
    if (item.tierId === null) continue
    const index = indexById.get(item.tierId)
    if (index !== undefined) assignments.push([item.id, index])
  }
  return db.layouts.add({
    name: name.trim() || 'Без названия',
    createdAt: Date.now(),
    tiers: tiers.map((tier) => ({ name: tier.name, color: tier.color })),
    assignments,
  })
}

// Загружает раскладку: текущие тиры заменяются, аниме встают по сохранённым местам.
// Аниме, которых в раскладке нет (добавлены позже), попадают в «Без тира».
export async function loadLayout(id: number): Promise<void> {
  await db.transaction('rw', db.anime, db.tiers, db.layouts, async () => {
    const layout = await db.layouts.get(id)
    if (!layout) return
    await db.tiers.clear()
    const rows = layout.tiers.map((tier, index) => ({
      name: tier.name,
      color: tier.color,
      order: index,
    }))
    const ids = (await db.tiers.bulkAdd(rows, { allKeys: true })) as number[]
    const tierByAnime = new Map<number, number>()
    for (const [animeId, tierIndex] of layout.assignments) {
      const tierId = ids[tierIndex]
      if (tierId !== undefined) tierByAnime.set(animeId, tierId)
    }
    await db.anime.toCollection().modify((anime) => {
      anime.tierId = tierByAnime.get(anime.id) ?? null
    })
  })
}

export async function deleteLayout(id: number): Promise<void> {
  await db.layouts.delete(id)
}
