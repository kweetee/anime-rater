import { db } from './db'
import type { Anime } from '../types'

// Данные формы: всё, кроме полей, которые заполняются автоматически
export type AnimeInput = Omit<Anime, 'id' | 'createdAt' | 'updatedAt'>

// Сохраняет аниме. id = null — создаём новое, иначе обновляем существующее.
// Возвращает id записи.
export async function saveAnime(
  id: number | null,
  input: AnimeInput,
): Promise<number> {
  const now = Date.now()
  if (id === null) {
    return db.anime.add({ ...input, createdAt: now, updatedAt: now })
  }
  await db.anime.update(id, { ...input, updatedAt: now })
  return id
}

// Удаляет аниме
export async function deleteAnime(id: number): Promise<void> {
  await db.anime.delete(id)
}

// Создаёт метку. Если метка с таким именем уже есть (без учёта регистра),
// вернёт id существующей, дубликат не создаётся.
export async function createTag(name: string): Promise<number> {
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  const existing = await db.tags
    .filter((tag) => tag.name.toLowerCase() === lower)
    .first()
  if (existing) return existing.id
  return db.tags.add({ name: trimmed })
}

// Удаляет метку и убирает её у всех аниме (одной транзакцией)
export async function deleteTag(id: number): Promise<void> {
  await db.transaction('rw', db.anime, db.tags, async () => {
    // Индекс *tagIds позволяет быстро найти все аниме с этой меткой
    await db.anime
      .where('tagIds')
      .equals(id)
      .modify((anime) => {
        anime.tagIds = anime.tagIds.filter((tagId) => tagId !== id)
      })
    await db.tags.delete(id)
  })
}

// Сохраняет описание оценки (put: создаст запись или заменит существующую)
export async function saveRatingHint(
  score: number,
  description: string,
): Promise<void> {
  await db.ratingHints.put({ score, description })
}
