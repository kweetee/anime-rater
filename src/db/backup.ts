import { db, DEFAULT_HINTS } from './db'
import type { Anime, Layout, RatingHint, Tag, Tier } from '../types'
import { parseKind } from '../lib/animeKinds'

// Экспорт, импорт и очистка данных.
// Версия файла 2: у аниме появилось поле kind (тип). Версия 3: добавлены сохранённые раскладки тир-листа.
// Файлы старых версий читаются: kind = null, раскладок нет.

const BACKUP_APP_ID = 'anime-rater'
const BACKUP_VERSION = 3

// «Заменить всё» стирает текущие данные, «Добавить» дописывает к существующим
export type ImportMode = 'replace' | 'merge'

// Аниме в файле: картинка лежит строкой base64 (data:image/jpeg;base64,...)
export interface BackupAnime extends Omit<Anime, 'image'> {
  image: string | null
}

// Содержимое JSON-файла
export interface BackupFile {
  app: string
  version: number
  exportedAt: number
  anime: BackupAnime[]
  tags: Tag[]
  tiers: Tier[]
  ratingHints: RatingHint[]
  layouts: Layout[]
}

export interface ImportResult {
  added: number // сколько аниме добавлено
  skipped: number // сколько пропущено как дубликаты (только режим «добавить»)
}

// Стандартные тиры (такие же, как при первом создании базы в db.ts)
const DEFAULT_TIERS: Omit<Tier, 'id'>[] = [
  { name: 'S', color: '#f4f4f4', order: 0 },
  { name: 'A', color: '#cfcfcf', order: 1 },
  { name: 'B', color: '#9a9a9a', order: 2 },
  { name: 'C', color: '#5e5e5e', order: 3 },
  { name: 'D', color: '#2b2b2b', order: 4 },
]

// ---------- Картинки: Blob <-> base64 ----------

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не удалось прочитать картинку'))
    reader.readAsDataURL(blob)
  })
}

// Возвращает null, если строка не похожа на картинку или не расшифровалась
async function dataUrlToBlob(value: string | null): Promise<Blob | null> {
  if (!value || !value.startsWith('data:image/')) return null
  try {
    const response = await fetch(value)
    return await response.blob()
  } catch {
    return null
  }
}

// ---------- Экспорт ----------

export async function createBackup(): Promise<BackupFile> {
  const [anime, tags, tiers, ratingHints, layouts] = await Promise.all([
    db.anime.toArray(),
    db.tags.toArray(),
    db.tiers.toArray(),
    db.ratingHints.toArray(),
    db.layouts.toArray(),
  ])
  const animeOut = await Promise.all(
    anime.map(async (item): Promise<BackupAnime> => ({
      ...item,
      image: item.image ? await blobToDataUrl(item.image) : null,
    })),
  )
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    anime: animeOut,
    tags,
    tiers,
    ratingHints,
    layouts,
  }
}

// ---------- Чтение и проверка файла ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

// Разбирает текст JSON. Лишнее и битое отбрасывает, при серьёзной ошибке бросает понятное сообщение.
export function parseBackup(text: string): BackupFile {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Файл не похож на JSON. Выберите файл, сохранённый этим приложением.')
  }
  if (!isRecord(raw) || raw.app !== BACKUP_APP_ID) {
    throw new Error('Это не резервная копия Anime Rater.')
  }
  if (typeof raw.version === 'number' && raw.version > BACKUP_VERSION) {
    throw new Error('Файл создан в более новой версии приложения. Обновите приложение.')
  }

  const tags: Tag[] = []
  for (const item of asArray(raw.tags)) {
    if (!isRecord(item) || typeof item.id !== 'number' || typeof item.name !== 'string') continue
    const tag: Tag = { id: item.id, name: item.name }
    if (typeof item.color === 'string') tag.color = item.color
    tags.push(tag)
  }

  const tiers: Tier[] = []
  for (const item of asArray(raw.tiers)) {
    if (!isRecord(item) || typeof item.id !== 'number' || typeof item.name !== 'string') continue
    tiers.push({
      id: item.id,
      name: item.name,
      color: typeof item.color === 'string' ? item.color : '#8a8a8a',
      order: typeof item.order === 'number' ? item.order : tiers.length,
    })
  }

  const ratingHints: RatingHint[] = []
  for (const item of asArray(raw.ratingHints)) {
    if (!isRecord(item) || typeof item.score !== 'number') continue
    if (!Number.isInteger(item.score) || item.score < 1 || item.score > 10) continue
    ratingHints.push({
      score: item.score,
      description: typeof item.description === 'string' ? item.description : '',
    })
  }

  const layouts: Layout[] = []
  for (const item of asArray(raw.layouts)) {
    if (!isRecord(item) || typeof item.id !== 'number') continue
    if (typeof item.name !== 'string' || item.name.trim() === '') continue
    const layoutTiers: { name: string; color: string }[] = []
    for (const tier of asArray(item.tiers)) {
      if (!isRecord(tier) || typeof tier.name !== 'string') continue
      layoutTiers.push({ name: tier.name, color: typeof tier.color === 'string' ? tier.color : '#8a8a8a' })
    }
    const assignments: [number, number][] = []
    for (const pair of asArray(item.assignments)) {
      if (!Array.isArray(pair) || pair.length !== 2) continue
      const [animeId, tierIndex] = pair
      if (typeof animeId !== 'number' || typeof tierIndex !== 'number') continue
      if (!Number.isInteger(tierIndex) || tierIndex < 0 || tierIndex >= layoutTiers.length) continue
      assignments.push([animeId, tierIndex])
    }
    layouts.push({
      id: item.id,
      name: item.name.trim(),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      tiers: layoutTiers,
      assignments,
    })
  }

  const tagIdSet = new Set(tags.map((tag) => tag.id))
  const tierIdSet = new Set(tiers.map((tier) => tier.id))
  const now = Date.now()
  const anime: BackupAnime[] = []
  for (const item of asArray(raw.anime)) {
    if (!isRecord(item) || typeof item.id !== 'number') continue
    if (typeof item.title !== 'string' || item.title.trim() === '') continue
    const rating = typeof item.rating === 'number' ? item.rating : null
    anime.push({
      id: item.id,
      title: item.title.trim(),
      image: typeof item.image === 'string' ? item.image : null,
      rating,
      kind: parseKind(item.kind), // в файлах версии 1 поля нет: будет null
      comment: typeof item.comment === 'string' ? item.comment : '',
      // Ссылки на несуществующие метки и тиры убираем, чтобы не было «битых» связей
      tagIds: asArray(item.tagIds).filter(
        (id): id is number => typeof id === 'number' && tagIdSet.has(id),
      ),
      isReference: item.isReference === true && rating !== null,
      tierId:
        typeof item.tierId === 'number' && tierIdSet.has(item.tierId) ? item.tierId : null,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : now,
    })
  }

  return { app: BACKUP_APP_ID, version: BACKUP_VERSION, exportedAt: Number(raw.exportedAt) || now, anime, tags, tiers, ratingHints, layouts }
}

// ---------- Импорт ----------

// Дополняет список описаний до всех 10 оценок (недостающие берём по умолчанию)
function fillHints(hints: RatingHint[]): RatingHint[] {
  const map = new Map(hints.map((hint) => [hint.score, hint]))
  return Array.from({ length: 10 }, (_, i) => {
    const score = i + 1
    const found = map.get(score)
    if (found && found.description.trim() !== '') return found
    return { score, description: found?.description || DEFAULT_HINTS[score] || '' }
  })
}

export async function importBackup(backup: BackupFile, mode: ImportMode): Promise<ImportResult> {
  // Картинки переводим в Blob ДО транзакции: внутри транзакции Dexie нельзя ждать «чужие» промисы
  const blobs = await Promise.all(backup.anime.map((item) => dataUrlToBlob(item.image)))

  if (mode === 'replace') {
    await db.transaction('rw', db.anime, db.tags, db.tiers, db.ratingHints, db.layouts, async () => {
      await db.anime.clear()
      await db.tags.clear()
      await db.tiers.clear()
      await db.ratingHints.clear()
      await db.layouts.clear()
      // id сохраняем как в файле: так связи аниме → метки и тиры остаются верными
      await db.tags.bulkAdd(backup.tags)
      if (backup.tiers.length > 0) await db.tiers.bulkAdd(backup.tiers)
      else await db.tiers.bulkAdd(DEFAULT_TIERS as Tier[])
      await db.ratingHints.bulkAdd(fillHints(backup.ratingHints))
      if (backup.layouts.length > 0) await db.layouts.bulkAdd(backup.layouts)
      await db.anime.bulkAdd(backup.anime.map((item, i): Anime => ({ ...item, image: blobs[i] })))
    })
    return { added: backup.anime.length, skipped: 0 }
  }

  // Режим «добавить»: ничего не стираем, id в файле и в базе не совпадают, поэтому пересчитываем связи
  let added = 0
  let skipped = 0
  await db.transaction('rw', db.anime, db.tags, db.tiers, db.ratingHints, db.layouts, async () => {
    // Метки: совпавшие по названию объединяем, остальные создаём
    const existingTags = await db.tags.toArray()
    const tagIdMap = new Map<number, number>() // id в файле → id в базе
    for (const tag of backup.tags) {
      const found = existingTags.find(
        (item) => item.name.toLowerCase() === tag.name.toLowerCase(),
      )
      if (found) {
        tagIdMap.set(tag.id, found.id)
        continue
      }
      const newTag: Omit<Tag, 'id'> = tag.color ? { name: tag.name, color: tag.color } : { name: tag.name }
      const newId = await db.tags.add(newTag as Tag)
      existingTags.push({ ...newTag, id: newId })
      tagIdMap.set(tag.id, newId)
    }

    // Тиры: так же, по названию; новые ставим в конец
    const existingTiers = await db.tiers.toArray()
    let nextOrder = existingTiers.reduce((max, tier) => Math.max(max, tier.order), -1) + 1
    const tierIdMap = new Map<number, number>()
    for (const tier of [...backup.tiers].sort((a, b) => a.order - b.order)) {
      const found = existingTiers.find(
        (item) => item.name.toLowerCase() === tier.name.toLowerCase(),
      )
      if (found) {
        tierIdMap.set(tier.id, found.id)
        continue
      }
      const newTier = { name: tier.name, color: tier.color, order: nextOrder }
      nextOrder += 1
      const newId = await db.tiers.add(newTier as Tier)
      existingTiers.push({ ...newTier, id: newId })
      tierIdMap.set(tier.id, newId)
    }

    // Описания оценок: свои не трогаем, заполняем только пустые
    const existingHints = new Map((await db.ratingHints.toArray()).map((h) => [h.score, h]))
    for (const hint of backup.ratingHints) {
      if (hint.description.trim() === '') continue
      if (existingHints.get(hint.score)?.description.trim()) continue
      await db.ratingHints.put(hint)
    }

    // Аниме: дубликаты по названию пропускаем
    const titleToId = new Map<string, number>(
      (await db.anime.toArray()).map((item) => [item.title.trim().toLowerCase(), item.id]),
    )
    const animeIdMap = new Map<number, number>() // id в файле → id в базе (нужно для раскладок)
    for (const [i, item] of backup.anime.entries()) {
      const key = item.title.trim().toLowerCase()
      const knownId = titleToId.get(key)
      if (knownId !== undefined) {
        animeIdMap.set(item.id, knownId)
        skipped += 1
        continue
      }
      const tagIds = new Set<number>()
      for (const oldId of item.tagIds) {
        const newId = tagIdMap.get(oldId)
        if (newId !== undefined) tagIds.add(newId)
      }
      const newAnimeId = await db.anime.add({
        title: item.title,
        image: blobs[i],
        rating: item.rating,
        kind: item.kind,
        comment: item.comment,
        tagIds: Array.from(tagIds),
        isReference: item.isReference,
        tierId: item.tierId === null ? null : (tierIdMap.get(item.tierId) ?? null),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as Anime)
      titleToId.set(key, newAnimeId)
      animeIdMap.set(item.id, newAnimeId)
      added += 1
    }

    // Раскладки: с тем же названием пропускаем, в остальных пересчитываем id аниме
    const layoutNames = new Set((await db.layouts.toArray()).map((item) => item.name.trim().toLowerCase()))
    for (const layout of backup.layouts) {
      const key = layout.name.trim().toLowerCase()
      if (layoutNames.has(key)) continue
      layoutNames.add(key)
      const assignments: [number, number][] = []
      for (const [oldId, tierIndex] of layout.assignments) {
        const newId = animeIdMap.get(oldId)
        if (newId !== undefined) assignments.push([newId, tierIndex])
      }
      await db.layouts.add({
        name: layout.name,
        createdAt: layout.createdAt,
        tiers: layout.tiers,
        assignments,
      } as Layout)
    }
  })
  return { added, skipped }
}

// ---------- Очистка ----------

// Стирает всё (и сохранённые раскладки) и возвращает стартовые тиры и описания оценок (как у новой базы)
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.anime, db.tags, db.tiers, db.ratingHints, db.layouts, async () => {
    await db.anime.clear()
    await db.tags.clear()
    await db.tiers.clear()
    await db.ratingHints.clear()
    await db.layouts.clear()
    await db.tiers.bulkAdd(DEFAULT_TIERS as Tier[])
    await db.ratingHints.bulkAdd(fillHints([]))
  })
}
