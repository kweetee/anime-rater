import { db } from './db'
import type { Tier } from '../types'
import { TIER_COLORS } from '../lib/tierColors'

// Переносит аниме в тир. tierId = null — в «Без тира».
// updatedAt не меняем: перенос между тирами не считается правкой аниме.
export async function moveAnimeToTier(
  animeId: number,
  tierId: number | null,
): Promise<void> {
  await db.anime.update(animeId, { tierId })
}

// Создаёт новый тир в конце списка. Возвращает его id.
export async function createTier(): Promise<number> {
  const last = await db.tiers.orderBy('order').last()
  const count = await db.tiers.count()
  return db.tiers.add({
    name: 'Новый',
    color: TIER_COLORS[count % TIER_COLORS.length],
    order: last ? last.order + 1 : 0,
  })
}

// Меняет название и цвет тира
export async function updateTier(
  id: number,
  changes: Pick<Tier, 'name' | 'color'>,
): Promise<void> {
  await db.tiers.update(id, { name: changes.name.trim(), color: changes.color })
}

// Удаляет тир; аниме из него уходят в «Без тира» (одной транзакцией)
export async function deleteTier(id: number): Promise<void> {
  await db.transaction('rw', db.anime, db.tiers, async () => {
    await db.anime.where('tierId').equals(id).modify({ tierId: null })
    await db.tiers.delete(id)
  })
}

// Сдвигает тир выше (-1) или ниже (+1). Порядок перенумеровывается 0, 1, 2...
export async function moveTier(id: number, direction: -1 | 1): Promise<void> {
  await db.transaction('rw', db.tiers, async () => {
    const all = await db.tiers.orderBy('order').toArray()
    const index = all.findIndex((tier) => tier.id === id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= all.length) return
    ;[all[index], all[target]] = [all[target], all[index]]
    for (let i = 0; i < all.length; i++) {
      await db.tiers.update(all[i].id, { order: i })
    }
  })
}
